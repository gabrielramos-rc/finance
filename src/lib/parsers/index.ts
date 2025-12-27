/**
 * Parsers Module
 * Public API for CSV and PDF parsing with auto-categorization
 */

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  // Raw types
  RawCSVRow,
  RawPDFLine,
  
  // Transaction types
  TransactionType,
  TransactionSource,
  InstallmentInfo,
  ParsedTransaction,
  
  // Metadata types
  CSVTransactionMetadata,
  PDFTransactionMetadata,
  
  // Invoice types
  CardType,
  InvoiceMetadata,
  
  // Result types
  ParseError,
  CSVParseResult,
  PDFParseResult,
  
  // Categorization types
  MatchSource,
  PatternMatchType,
  PatternDefinition,
  CategorizationResult,
  UserRule,
} from './types';

// =============================================================================
// CSV PARSER EXPORTS
// =============================================================================

export { parseCSV, parseCSVFile } from './csv-parser';

// =============================================================================
// PDF PARSER EXPORTS
// =============================================================================

export { parsePDF, parsePDFFile } from './pdf-parser';

// =============================================================================
// CATEGORIZER EXPORTS
// =============================================================================

export {
  categorize,
  categorizeTransaction,
  categorizeTransactions,
  getCategorizationStats,
  suggestCategory,
  shouldFlagForReview,
  loadUserRules,
  addUserRule,
  clearUserRulesCache,
} from './categorizer';

// =============================================================================
// PATTERNS EXPORTS
// =============================================================================

export {
  loadPatterns,
  clearPatternsCache,
  getFlattenedPatterns,
  getIncomePatterns,
  getNotIncomePatterns,
  getInternalTransferPatterns,
  getInstallmentPatterns,
  matchPattern,
  mapBBCategory,
  getSubscriptionDetectionConfig,
} from './patterns';

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

import { parseCSV } from './csv-parser';
import { parsePDF } from './pdf-parser';
import { categorizeTransactions, getCategorizationStats } from './categorizer';
import type { ParsedTransaction, CategorizationResult } from './types';

/**
 * Parse and categorize a CSV file in one step
 */
export async function parseAndCategorizeCSV(
  buffer: Buffer,
  userId?: string
): Promise<{
  transactions: Array<{
    transaction: ParsedTransaction;
    categorization: CategorizationResult;
  }>;
  stats: ReturnType<typeof getCategorizationStats>;
  errors: Array<{ line?: number; content: string; message: string; type: string }>;
}> {
  const result = parseCSV(buffer);
  const categorized = categorizeTransactions(result.transactions, userId);
  const stats = getCategorizationStats(categorized);

  return {
    transactions: categorized,
    stats,
    errors: result.errors,
  };
}

/**
 * Parse and categorize a PDF file in one step
 */
export async function parseAndCategorizePDF(
  buffer: Buffer,
  userId?: string,
  invoiceDate?: Date
): Promise<{
  transactions: Array<{
    transaction: ParsedTransaction;
    categorization: CategorizationResult;
  }>;
  stats: ReturnType<typeof getCategorizationStats>;
  invoiceMetadata: Awaited<ReturnType<typeof parsePDF>>['invoiceMetadata'];
  cardHolders: string[];
  errors: Array<{ line?: number; content: string; message: string; type: string }>;
}> {
  const result = await parsePDF(buffer, invoiceDate);
  const categorized = categorizeTransactions(result.transactions, userId);
  const stats = getCategorizationStats(categorized);

  return {
    transactions: categorized,
    stats,
    invoiceMetadata: result.invoiceMetadata,
    cardHolders: result.cardHolders,
    errors: result.errors,
  };
}

/**
 * Detect file type from buffer
 */
export function detectFileType(buffer: Buffer): 'csv' | 'pdf' | 'unknown' {
  // Check for PDF magic bytes
  if (buffer.length >= 4) {
    const header = buffer.slice(0, 4).toString('ascii');
    if (header === '%PDF') {
      return 'pdf';
    }
  }

  // Check for CSV-like content (starts with quote or has comma-separated values)
  const firstLine = buffer.slice(0, 200).toString('utf-8').split('\n')[0];
  if (firstLine.includes(',') && (firstLine.startsWith('"') || firstLine.includes('","'))) {
    return 'csv';
  }

  return 'unknown';
}

/**
 * Parse any supported file type
 */
export async function parseFile(
  buffer: Buffer,
  options: {
    userId?: string;
    invoiceDate?: Date;
    fileType?: 'csv' | 'pdf';
  } = {}
): Promise<{
  fileType: 'csv' | 'pdf';
  transactions: Array<{
    transaction: ParsedTransaction;
    categorization: CategorizationResult;
  }>;
  stats: ReturnType<typeof getCategorizationStats>;
  invoiceMetadata?: Awaited<ReturnType<typeof parsePDF>>['invoiceMetadata'];
  cardHolders?: string[];
  errors: Array<{ line?: number; content: string; message: string; type: string }>;
}> {
  const fileType = options.fileType || detectFileType(buffer);

  if (fileType === 'csv') {
    const result = await parseAndCategorizeCSV(buffer, options.userId);
    return {
      fileType: 'csv',
      ...result,
    };
  }

  if (fileType === 'pdf') {
    const result = await parseAndCategorizePDF(buffer, options.userId, options.invoiceDate);
    return {
      fileType: 'pdf',
      ...result,
    };
  }

  throw new Error('Unsupported file type. Only CSV and PDF files are supported.');
}


/**
 * Parser Types
 * Type definitions for CSV and PDF parsers
 */

// =============================================================================
// RAW DATA TYPES (from source files)
// =============================================================================

/**
 * Raw CSV row from Banco do Brasil bank statement
 */
export interface RawCSVRow {
  Data: string;
  Lançamento: string;
  Detalhes: string;
  'Nº documento': string;
  Valor: string;
  'Tipo Lançamento': string;
}

/**
 * Raw transaction line from PDF invoice
 */
export interface RawPDFLine {
  date: string;
  description: string;
  country: string;
  amount: string;
}

// =============================================================================
// PARSED DATA TYPES (normalized output)
// =============================================================================

/**
 * Transaction type classification
 */
export type TransactionType = 'income' | 'expense' | 'transfer';

/**
 * Source of the transaction data
 */
export type TransactionSource = 'csv' | 'pdf-visa' | 'pdf-elo';

/**
 * Installment information for parceled purchases
 */
export interface InstallmentInfo {
  /** Current installment number (1-based) */
  current: number;
  /** Total number of installments */
  total: number;
  /** Original description before parsing */
  originalDescription: string;
  /** Unique identifier for the installment group */
  groupId?: string;
}

/**
 * Metadata for CSV transactions
 */
export interface CSVTransactionMetadata {
  /** Original "Lançamento" field */
  lancamento: string;
  /** Original "Tipo Lançamento" field (Entrada/Saída) */
  tipoLancamento: string;
  /** Document number from bank */
  documentNumber: string;
}

/**
 * Metadata for PDF transactions
 */
export interface PDFTransactionMetadata {
  /** Original category from Banco do Brasil */
  bbCategory: string;
  /** Whether this is a credit (refund/cashback) */
  isCredit: boolean;
  /** Country code (BR, US, etc.) */
  country: string;
  /** Card holder name */
  cardHolder: string;
  /** Last 4 digits of the card */
  cardLastFour?: string;
  /** Whether this is from an additional card */
  isAdditionalCard: boolean;
  /** Whether this is an international purchase */
  isInternational: boolean;
  /** Related IOF amount if international */
  iofAmount?: number;
  /** Related IOF transaction ID */
  iofTransactionId?: string;
}

/**
 * Normalized parsed transaction
 */
export interface ParsedTransaction {
  /** Transaction date */
  date: Date;
  /** Cleaned/normalized description */
  description: string;
  /** Original description from source */
  originalDescription: string;
  /** Transaction amount (negative for expenses) */
  amount: number;
  /** Transaction type */
  type: TransactionType;
  /** Data source */
  source: TransactionSource;
  /** Installment info if applicable */
  installmentInfo?: InstallmentInfo;
  /** Source-specific metadata */
  metadata: CSVTransactionMetadata | PDFTransactionMetadata;
}

// =============================================================================
// INVOICE METADATA
// =============================================================================

/**
 * Card type
 */
export type CardType = 'visa' | 'elo';

/**
 * Invoice metadata extracted from PDF header
 */
export interface InvoiceMetadata {
  /** Card type (VISA or ELO) */
  cardType: CardType;
  /** Last 4 digits of main card */
  cardLastFour: string;
  /** Invoice month name in Portuguese */
  monthName: string;
  /** Invoice month (1-12) */
  month: number;
  /** Invoice year */
  year: number;
  /** Payment due date */
  dueDate: Date;
  /** Total invoice amount */
  totalAmount: number;
  /** Previous balance (if any) */
  previousBalance: number;
  /** Total payments/credits */
  payments: number;
  /** Total purchases */
  purchases: number;
  /** Future installments total */
  futureInstallments: number;
}

// =============================================================================
// PARSE RESULTS
// =============================================================================

/**
 * Parse error information
 */
export interface ParseError {
  /** Line number or index where error occurred */
  line?: number;
  /** Original content that failed to parse */
  content: string;
  /** Error message */
  message: string;
  /** Error type */
  type: 'date' | 'amount' | 'format' | 'encoding' | 'unknown';
}

/**
 * CSV parse result
 */
export interface CSVParseResult {
  /** Successfully parsed transactions */
  transactions: ParsedTransaction[];
  /** Parse errors encountered */
  errors: ParseError[];
  /** Original file info */
  fileInfo: {
    /** Detected encoding */
    encoding: string;
    /** Total rows in file */
    totalRows: number;
    /** Rows skipped (balance lines, etc.) */
    skippedRows: number;
  };
}

/**
 * PDF parse result
 */
export interface PDFParseResult {
  /** Successfully parsed transactions */
  transactions: ParsedTransaction[];
  /** Parse errors encountered */
  errors: ParseError[];
  /** Invoice metadata */
  invoiceMetadata: InvoiceMetadata | null;
  /** Card holders found in invoice */
  cardHolders: string[];
}

// =============================================================================
// CATEGORIZATION TYPES
// =============================================================================

/**
 * How the category was matched
 */
export type MatchSource = 'user-rule' | 'bb-category' | 'system-pattern' | 'none';

/**
 * Pattern match type from config
 */
export type PatternMatchType = 'contains' | 'regex' | 'equals';

/**
 * Single pattern definition
 */
export interface PatternDefinition {
  /** Pattern string or regex */
  pattern: string;
  /** How to match the pattern */
  matchType: PatternMatchType;
  /** Priority (higher = checked first) */
  priority: number;
  /** Optional description */
  description?: string;
  /** Optional note */
  note?: string;
  /** Patterns to exclude */
  exclude?: string[];
  /** Override category (for Amazon-like cases) */
  category?: string | null;
}

/**
 * Pattern group from config
 */
export interface PatternGroup {
  [key: string]: {
    patterns: PatternDefinition[];
  };
}

/**
 * Full patterns configuration
 */
export interface PatternsConfig {
  version: string;
  income_patterns: PatternGroup;
  internal_transfer_patterns: {
    patterns: PatternDefinition[];
  };
  fixed_patterns: PatternGroup;
  investment_patterns: PatternGroup;
  subscription_patterns: PatternGroup;
  food_patterns: PatternGroup;
  transport_patterns: PatternGroup;
  pet_patterns: PatternGroup;
  health_patterns: PatternGroup;
  online_patterns: PatternGroup;
  leisure_patterns: PatternGroup;
  beauty_fashion_patterns: PatternGroup;
  fee_patterns: PatternGroup;
  family_patterns?: PatternGroup;
  installment_patterns: {
    regex_patterns: string[];
  };
  subscription_detection: {
    min_occurrences: number;
    months_to_analyze: number;
    value_tolerance: number;
    typical_ranges: Record<string, { min: number; max: number }>;
  };
}

/**
 * Categorization result
 */
export interface CategorizationResult {
  /** Category slug (e.g., "alimentacao-restaurantes") */
  categorySlug: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** How the match was determined */
  matchedBy: MatchSource;
  /** Pattern that matched (if any) */
  matchedPattern?: string;
}

// =============================================================================
// USER RULES
// =============================================================================

/**
 * User-defined categorization rule
 */
export interface UserRule {
  /** Rule ID */
  id: string;
  /** User ID */
  userId: string;
  /** Pattern to match */
  pattern: string;
  /** Match type */
  matchType: PatternMatchType;
  /** Target category slug */
  categorySlug: string;
  /** Priority (higher = checked first) */
  priority: number;
  /** Whether rule is active */
  isActive: boolean;
  /** Creation date */
  createdAt: Date;
}


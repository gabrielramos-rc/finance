/**
 * PDF Parser
 * Parses Banco do Brasil credit card invoice PDFs (VISA and ELO)
 */

import { PDFParse } from 'pdf-parse';
import type {
  ParsedTransaction,
  PDFParseResult,
  PDFTransactionMetadata,
  TransactionType,
  ParseError,
  InvoiceMetadata,
  CardType,
  InstallmentInfo,
} from './types';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * BB category names that appear in PDF
 */
const BB_CATEGORIES = [
  'Pagamentos/Créditos',
  'Lazer',
  'Restaurantes',
  'Saúde',
  'Serviços',
  'Supermercados',
  'Vestuário',
  'Viagens',
  'Transporte',
  'Outros lançamentos',
  'Compras parceladas',
];

/**
 * Month names in Portuguese
 */
const MONTH_NAMES: Record<string, number> = {
  'janeiro': 1,
  'fevereiro': 2,
  'março': 3,
  'marco': 3,
  'abril': 4,
  'maio': 5,
  'junho': 6,
  'julho': 7,
  'agosto': 8,
  'setembro': 9,
  'outubro': 10,
  'novembro': 11,
  'dezembro': 12,
};

/**
 * Installment detection patterns
 */
const INSTALLMENT_PATTERNS = [
  /(.+?)\s+PARC\s+(\d{2})\/(\d{2})\s+(.+)/i,  // PARC 04/12
  /(.+?)\s+PARCELA\s+(\d+)\s+DE\s+(\d+)\s*(.*)$/i,  // Parcela 4 de 12
  /(.+?)\s+(\d+)\/(\d+)X\s+(.+)/i,  // 4/12X
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Detect card type from PDF text
 */
function detectCardType(text: string): CardType {
  const upperText = text.toUpperCase();
  if (upperText.includes('VISA')) {
    return 'visa';
  }
  if (upperText.includes('ELO')) {
    return 'elo';
  }
  // Default to VISA if can't detect
  return 'visa';
}

/**
 * Extract invoice metadata from PDF text
 */
function extractInvoiceMetadata(text: string, cardType: CardType): InvoiceMetadata | null {
  try {
    // Extract month from "esta é sua fatura de MONTH"
    const monthMatch = text.match(/(?:esta é sua fatura de|fatura de)\s+(\w+)/i);
    let month = 1;
    let monthName = '';
    if (monthMatch) {
      monthName = monthMatch[1].toLowerCase();
      month = MONTH_NAMES[monthName] || 1;
    }

    // Extract year from due date or context
    const yearMatch = text.match(/Vencimento\s+\d{2}\/\d{2}\/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

    // Extract due date
    const dueDateMatch = text.match(/Vencimento\s+(\d{2})\/(\d{2})\/(\d{4})/);
    let dueDate = new Date();
    if (dueDateMatch) {
      const [, day, dueMon, dueYear] = dueDateMatch;
      dueDate = new Date(parseInt(dueYear, 10), parseInt(dueMon, 10) - 1, parseInt(day, 10));
    }

    // Extract total amount
    const totalMatch = text.match(/(?:Total\s+da\s+fatura|Valor\s+total|Valor)\s+R\$\s*([\d.,]+)/i);
    const totalAmount = totalMatch ? parseAmount(totalMatch[1]) : 0;

    // Extract card last four digits
    const cardMatch = text.match(/(?:Cartão|Final)\s*(\d{4})/);
    const cardLastFour = cardMatch ? cardMatch[1] : '';

    return {
      cardType,
      cardLastFour,
      monthName,
      month,
      year,
      dueDate,
      totalAmount,
      previousBalance: 0, // TODO: Extract if needed
      payments: 0, // TODO: Extract if needed
      purchases: totalAmount,
      futureInstallments: 0, // TODO: Extract if needed
    };
  } catch (error) {
    console.error('Error extracting invoice metadata:', error);
    return null;
  }
}

/**
 * Detect category from line
 */
function detectCategory(line: string): string | null {
  const trimmed = line.trim();
  for (const cat of BB_CATEGORIES) {
    if (trimmed === cat || trimmed.startsWith(cat)) {
      return cat;
    }
  }
  return null;
}

/**
 * Detect card holder from line
 * Format: "Gabriel L Ramos (Cartão 4256)"
 */
function detectCardHolder(line: string): { name: string; lastFour: string } | null {
  const match = line.match(/^(.+?)\s+\(Cartão\s+(\d{4})\)$/i);
  if (match) {
    return {
      name: match[1].trim(),
      lastFour: match[2],
    };
  }
  return null;
}

/**
 * Parse Brazilian amount format
 */
function parseAmount(amountStr: string): number {
  if (!amountStr) return 0;

  // Handle negative amounts (credits)
  const isNegative = amountStr.includes('-');
  
  // Remove R$, spaces, and handle Brazilian format
  const normalized = amountStr
    .replace(/R\$\s*/g, '')
    .replace(/-/g, '')
    .trim()
    .replace(/\./g, '')
    .replace(',', '.');

  const value = parseFloat(normalized);
  return isNaN(value) ? 0 : (isNegative ? -value : value);
}

/**
 * Parse date from invoice (DD/MM format, year from context)
 */
function parseDateFromInvoice(dateStr: string, invoiceYear: number, invoiceMonth: number): Date {
  const parts = dateStr.split('/');
  if (parts.length !== 2) {
    return new Date();
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);

  // Handle year rollover (e.g., December invoice with November purchases)
  let year = invoiceYear;
  if (month > invoiceMonth) {
    // Purchase was in previous year
    year--;
  }

  return new Date(year, month - 1, day);
}

/**
 * Extract installment info from description
 */
function extractInstallmentInfo(description: string): {
  cleanDescription: string;
  installmentInfo: InstallmentInfo;
} | null {
  for (const pattern of INSTALLMENT_PATTERNS) {
    const match = description.match(pattern);
    if (match) {
      const [, name, current, total, rest] = match;
      const cleanDesc = rest ? `${name.trim()} - ${rest.trim()}` : name.trim();
      
      return {
        cleanDescription: cleanDesc,
        installmentInfo: {
          current: parseInt(current, 10),
          total: parseInt(total, 10),
          originalDescription: description,
        },
      };
    }
  }
  return null;
}

/**
 * Parse a transaction line from PDF
 * Format: DD/MM DESCRIPTION COUNTRY R$ AMOUNT
 */
function parseTransactionLine(
  line: string,
  currentCategory: string,
  currentCardHolder: string,
  currentCardLastFour: string,
  invoiceYear: number,
  invoiceMonth: number
): ParsedTransaction | null {
  // Multiple regex patterns to handle different line formats
  const patterns = [
    // Standard format: DD/MM DESCRIPTION BR R$ 1.234,56
    /^(\d{2}\/\d{2})\s+(.+?)\s+(BR|[A-Z]{2})\s+R\$\s*([\d.,-]+)$/,
    // Format without country: DD/MM DESCRIPTION R$ 1.234,56
    /^(\d{2}\/\d{2})\s+(.+?)\s+R\$\s*([\d.,-]+)$/,
    // Format with extra spaces
    /^(\d{2}\/\d{2})\s{2,}(.+?)\s{2,}(BR|[A-Z]{2})?\s*R\$\s*([\d.,-]+)$/,
  ];

  for (const regex of patterns) {
    const match = line.match(regex);
    if (match) {
      let dateStr: string;
      let description: string;
      let country: string;
      let amountStr: string;

      if (match.length === 5) {
        // Full format with country
        [, dateStr, description, country, amountStr] = match;
      } else if (match.length === 4) {
        // Format without country
        [, dateStr, description, amountStr] = match;
        country = 'BR';
      } else {
        continue;
      }

      // Parse date
      const date = parseDateFromInvoice(dateStr, invoiceYear, invoiceMonth);

      // Parse amount
      const rawAmount = parseAmount(amountStr);
      const isCredit = rawAmount < 0 || amountStr.includes('-');
      
      // In PDF, negative amounts are credits (refunds)
      // Positive amounts are expenses
      const amount = isCredit ? Math.abs(rawAmount) : -Math.abs(rawAmount);
      const type: TransactionType = isCredit ? 'income' : 'expense';

      // Check for installment
      const installmentResult = extractInstallmentInfo(description);
      const cleanDescription = installmentResult?.cleanDescription || description.trim();
      const installmentInfo = installmentResult?.installmentInfo;

      // Determine if international
      const isInternational = country !== 'BR';

      // Build metadata
      const metadata: PDFTransactionMetadata = {
        bbCategory: currentCategory,
        isCredit,
        country: country || 'BR',
        cardHolder: currentCardHolder,
        cardLastFour: currentCardLastFour,
        isAdditionalCard: currentCardHolder !== '', // Will be refined later
        isInternational,
      };

      return {
        date,
        description: cleanDescription,
        originalDescription: description.trim(),
        amount,
        type,
        source: 'pdf-visa', // Will be set correctly by caller
        installmentInfo,
        metadata,
      };
    }
  }

  return null;
}

/**
 * Link IOF transactions to their parent international purchases
 */
function linkIOFTransactions(transactions: ParsedTransaction[]): void {
  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    const meta = tx.metadata as PDFTransactionMetadata;
    
    // Check if this is an IOF transaction
    if (tx.description.toUpperCase().includes('IOF') && 
        tx.description.toUpperCase().includes('COMPRA NO EXTERIOR')) {
      // Find the previous international transaction
      for (let j = i - 1; j >= 0; j--) {
        const prevTx = transactions[j];
        const prevMeta = prevTx.metadata as PDFTransactionMetadata;
        
        if (prevMeta.isInternational) {
          // Link the IOF to this transaction
          prevMeta.iofAmount = Math.abs(tx.amount);
          prevMeta.iofTransactionId = `iof-${i}`;
          break;
        }
      }
    }
  }
}

// =============================================================================
// MAIN PARSER
// =============================================================================

/**
 * Parse a Banco do Brasil credit card invoice PDF
 * 
 * @param buffer - Raw PDF file buffer
 * @param invoiceDate - Optional invoice date for context (defaults to current date)
 * @returns Parsed transactions and invoice metadata
 */
export async function parsePDF(
  buffer: Buffer,
  invoiceDate?: Date
): Promise<PDFParseResult> {
  const transactions: ParsedTransaction[] = [];
  const errors: ParseError[] = [];
  const cardHolders: string[] = [];

  try {
    // Parse PDF using pdf-parse v2 API
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const text = textResult.text;

    // Detect card type
    const cardType = detectCardType(text);
    const source = cardType === 'visa' ? 'pdf-visa' : 'pdf-elo';

    // Extract invoice metadata
    const invoiceMetadata = extractInvoiceMetadata(text, cardType);
    
    // Use invoice metadata for date context, or provided date, or current date
    const invoiceYear = invoiceMetadata?.year || invoiceDate?.getFullYear() || new Date().getFullYear();
    const invoiceMonth = invoiceMetadata?.month || (invoiceDate ? invoiceDate.getMonth() + 1 : new Date().getMonth() + 1);

    // Parse line by line
    const lines = text.split('\n');
    let currentCategory = '';
    let currentCardHolder = '';
    let currentCardLastFour = invoiceMetadata?.cardLastFour || '';
    let isFirstCardHolder = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check for category change
      const category = detectCategory(line);
      if (category) {
        currentCategory = category;
        continue;
      }

      // Check for card holder change
      const holder = detectCardHolder(line);
      if (holder) {
        currentCardHolder = holder.name;
        currentCardLastFour = holder.lastFour;
        
        if (isFirstCardHolder) {
          isFirstCardHolder = false;
        }
        
        if (!cardHolders.includes(holder.name)) {
          cardHolders.push(holder.name);
        }
        continue;
      }

      // Try to parse as transaction
      const transaction = parseTransactionLine(
        line,
        currentCategory,
        currentCardHolder,
        currentCardLastFour,
        invoiceYear,
        invoiceMonth
      );

      if (transaction) {
        // Set correct source
        transaction.source = source;
        
        // Set isAdditionalCard based on whether we've seen card holder changes
        const meta = transaction.metadata as PDFTransactionMetadata;
        meta.isAdditionalCard = !isFirstCardHolder && currentCardHolder !== '';
        
        transactions.push(transaction);
      }
    }

    // Link IOF transactions to international purchases
    linkIOFTransactions(transactions);

    return {
      transactions,
      errors,
      invoiceMetadata,
      cardHolders,
    };
  } catch (error) {
    errors.push({
      content: '',
      message: error instanceof Error ? error.message : 'Unknown error parsing PDF',
      type: 'unknown',
    });

    return {
      transactions,
      errors,
      invoiceMetadata: null,
      cardHolders,
    };
  }
}

/**
 * Parse PDF from a file path (convenience function for testing)
 */
export async function parsePDFFile(
  filePath: string,
  invoiceDate?: Date
): Promise<PDFParseResult> {
  const { readFile } = await import('fs/promises');
  const buffer = await readFile(filePath);
  return parsePDF(buffer, invoiceDate);
}


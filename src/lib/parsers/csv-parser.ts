/**
 * CSV Parser
 * Parses Banco do Brasil bank statement CSV files
 */

import Papa from 'papaparse';
import iconv from 'iconv-lite';
import type {
  RawCSVRow,
  ParsedTransaction,
  CSVParseResult,
  CSVTransactionMetadata,
  TransactionType,
  ParseError,
} from './types';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Patterns to skip (balance lines, headers, etc.)
 */
const SKIP_PATTERNS = [
  'Saldo Anterior',
  'Saldo do dia',
  'S A L D O',
];

/**
 * Transaction type mapping based on "Lançamento" field
 */
const TRANSACTION_TYPE_MAP: Record<string, TransactionType> = {
  // Income
  'Pix - Recebido': 'income',
  'Transferência Recebida': 'income',
  'Depósito': 'income',
  'Crédito': 'income',
  'TED Recebida': 'income',
  'DOC Recebido': 'income',

  // Expenses
  'Pix - Enviado': 'expense',
  'Pix Agendado': 'expense',
  'Pagamento de Boleto': 'expense',
  'Pagto Energia Elétrica': 'expense',
  'Vivo Celular': 'expense',
  'BB Consórcio - Prestação': 'expense',
  'CASSI': 'expense',
  'Icatu Seguros': 'expense',
  'Tarifa MSG': 'expense',
  'Tarifa Bancária': 'expense',
  'Débito Automático': 'expense',
  'Compra no Débito': 'expense',

  // Internal transfers (to be filtered or marked)
  'Pix Open Finance Envio': 'transfer',
  'Pagto cartão crédito': 'transfer',
  'Pagto Cartão Crédito': 'transfer',
  'Transferência Entre Contas': 'transfer',
  'TED Enviada': 'transfer',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Parse Brazilian date format (DD/MM/YYYY)
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === '00/00/0000') {
    return null;
  }

  const parts = dateStr.split('/');
  if (parts.length !== 3) {
    return null;
  }

  const [day, month, year] = parts.map(Number);
  
  // Validate date parts
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }
  
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000) {
    return null;
  }

  return new Date(year, month - 1, day);
}

/**
 * Parse Brazilian currency format (1.234,56 or -1.234,56)
 */
function parseAmount(amountStr: string): number {
  if (!amountStr) return 0;

  // Remove thousand separators (.) and replace decimal separator (,) with (.)
  const normalized = amountStr
    .trim()
    .replace(/\./g, '')
    .replace(',', '.');

  const value = parseFloat(normalized);
  return isNaN(value) ? 0 : value;
}

/**
 * Determine if row should be skipped
 */
function shouldSkipRow(row: RawCSVRow): boolean {
  // Skip invalid date rows (balance lines)
  if (row.Data === '00/00/0000') {
    return true;
  }

  // Skip rows matching skip patterns
  const lancamento = row.Lançamento || '';
  return SKIP_PATTERNS.some(pattern => lancamento.includes(pattern));
}

/**
 * Determine transaction type from row data
 */
function determineType(
  lancamento: string,
  tipoLancamento: string,
  amount: number
): TransactionType {
  // Check explicit mapping first
  for (const [key, type] of Object.entries(TRANSACTION_TYPE_MAP)) {
    if (lancamento.includes(key)) {
      return type;
    }
  }

  // Fall back to Tipo Lançamento field
  if (tipoLancamento === 'Entrada') {
    return 'income';
  }
  if (tipoLancamento === 'Saída') {
    return 'expense';
  }

  // Fall back to amount sign
  return amount < 0 ? 'expense' : 'income';
}

/**
 * Build clean description from row data
 */
function buildDescription(row: RawCSVRow): string {
  const detalhes = row.Detalhes || '';
  const lancamento = row.Lançamento || '';

  // For PIX transactions, extract recipient/sender name
  if (lancamento.includes('Pix')) {
    // Pattern: "DD/MM HH:MM CPFCNPJ NAME" or "DD/MM HH:MM NAME"
    // Example: "04/11 08:13 04245590130 MATEUS GOMES P"
    // Example: "06/11 17:44 ISABELA SOARES FERREIRA R"
    
    // Try to match with CPF/CNPJ
    const matchWithDoc = detalhes.match(/\d{2}\/\d{2}\s+\d{2}:\d{2}\s+[\d./-]+\s+(.+)/);
    if (matchWithDoc) {
      return matchWithDoc[1].trim();
    }

    // Try to match without CPF/CNPJ (just name after time)
    const matchWithoutDoc = detalhes.match(/\d{2}\/\d{2}\s+\d{2}:\d{2}\s+(.+)/);
    if (matchWithoutDoc) {
      return matchWithoutDoc[1].trim();
    }
  }

  // For boleto payments, extract payee name
  if (lancamento.includes('Pagamento de Boleto')) {
    // Detalhes usually contains the payee name directly
    return detalhes.trim() || lancamento;
  }

  // For other transactions, use details if available, otherwise lancamento
  return detalhes.trim() || lancamento;
}

/**
 * Transform raw CSV row to parsed transaction
 */
function transformRow(row: RawCSVRow, lineNumber: number): ParsedTransaction | ParseError {
  // Parse date
  const date = parseDate(row.Data);
  if (!date) {
    return {
      line: lineNumber,
      content: JSON.stringify(row),
      message: `Invalid date: ${row.Data}`,
      type: 'date',
    };
  }

  // Parse amount
  const rawAmount = parseAmount(row.Valor);
  if (rawAmount === 0 && row.Valor) {
    return {
      line: lineNumber,
      content: JSON.stringify(row),
      message: `Invalid amount: ${row.Valor}`,
      type: 'amount',
    };
  }

  // Determine type
  const type = determineType(
    row.Lançamento || '',
    row['Tipo Lançamento'] || '',
    rawAmount
  );

  // Normalize amount (expenses should be negative)
  const amount = type === 'expense' 
    ? -Math.abs(rawAmount) 
    : Math.abs(rawAmount);

  // Build description
  const description = buildDescription(row);
  const originalDescription = `${row.Lançamento || ''} - ${row.Detalhes || ''}`.trim();

  // Build metadata
  const metadata: CSVTransactionMetadata = {
    lancamento: row.Lançamento || '',
    tipoLancamento: row['Tipo Lançamento'] || '',
    documentNumber: row['Nº documento'] || '',
  };

  return {
    date,
    description,
    originalDescription,
    amount,
    type,
    source: 'csv',
    metadata,
  };
}

// =============================================================================
// MAIN PARSER
// =============================================================================

/**
 * Parse a Banco do Brasil CSV bank statement
 * 
 * @param buffer - Raw file buffer (ISO-8859-1 encoded)
 * @returns Parsed transactions and any errors
 */
export function parseCSV(buffer: Buffer): CSVParseResult {
  const transactions: ParsedTransaction[] = [];
  const errors: ParseError[] = [];
  let skippedRows = 0;

  // Decode from ISO-8859-1 (Latin1) to UTF-8
  const content = iconv.decode(buffer, 'iso-8859-1');

  // Parse CSV
  const { data, errors: parseErrors } = Papa.parse<RawCSVRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  // Log any Papa parse errors
  if (parseErrors.length > 0) {
    for (const err of parseErrors) {
      errors.push({
        line: err.row,
        content: '',
        message: err.message,
        type: 'format',
      });
    }
  }

  // Process each row
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Skip balance and header rows
    if (shouldSkipRow(row)) {
      skippedRows++;
      continue;
    }

    // Transform row
    const result = transformRow(row, i + 2); // +2 for 1-based line + header row

    if ('message' in result) {
      // It's an error
      errors.push(result);
    } else {
      // It's a valid transaction
      transactions.push(result);
    }
  }

  return {
    transactions,
    errors,
    fileInfo: {
      encoding: 'iso-8859-1',
      totalRows: data.length,
      skippedRows,
    },
  };
}

/**
 * Parse CSV from a file path (convenience function for testing)
 */
export async function parseCSVFile(filePath: string): Promise<CSVParseResult> {
  const { readFile } = await import('fs/promises');
  const buffer = await readFile(filePath);
  return parseCSV(buffer);
}


/**
 * Test Script for Parsers
 * Run with: npx tsx scripts/test-parsers.ts
 */

import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import {
  parseCSV,
  parsePDF,
  categorizeTransactions,
  getCategorizationStats,
  detectFileType,
  clearPatternsCache,
} from '../src/lib/parsers';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

async function testCSVParser() {
  log('\n=== Testing CSV Parser ===', 'cyan');

  const samplesDir = join(process.cwd(), 'samples', 'account');
  const files = await readdir(samplesDir);
  const csvFiles = files.filter(f => f.endsWith('.csv'));

  log(`Found ${csvFiles.length} CSV files`, 'yellow');

  // Test with one file first
  const testFile = csvFiles.find(f => f.includes('112025')) || csvFiles[0];
  log(`\nTesting with: ${testFile}`, 'bright');

  const buffer = await readFile(join(samplesDir, testFile));
  
  // Test file type detection
  const fileType = detectFileType(buffer);
  log(`Detected file type: ${fileType}`, 'magenta');

  const result = parseCSV(buffer);

  log(`\nFile Info:`, 'yellow');
  log(`  Encoding: ${result.fileInfo.encoding}`);
  log(`  Total rows: ${result.fileInfo.totalRows}`);
  log(`  Skipped rows: ${result.fileInfo.skippedRows}`);
  log(`  Parsed transactions: ${result.transactions.length}`);
  log(`  Parse errors: ${result.errors.length}`);

  if (result.errors.length > 0) {
    log(`\nErrors:`, 'red');
    result.errors.slice(0, 5).forEach(err => {
      log(`  Line ${err.line}: ${err.message}`);
    });
  }

  // Show sample transactions
  log(`\nSample Transactions:`, 'yellow');
  result.transactions.slice(0, 5).forEach((tx, i) => {
    const sign = tx.amount < 0 ? '-' : '+';
    const color = tx.amount < 0 ? 'red' : 'green';
    log(`  ${i + 1}. ${tx.date.toLocaleDateString('pt-BR')} | ${tx.description.substring(0, 40).padEnd(40)} | ${sign}${formatCurrency(Math.abs(tx.amount))}`, color);
  });

  // Categorize and show stats
  const categorized = categorizeTransactions(result.transactions);
  const stats = getCategorizationStats(categorized);

  log(`\nCategorization Stats:`, 'yellow');
  log(`  Total: ${stats.total}`);
  log(`  Categorized: ${stats.categorized} (${stats.categorizedPercentage.toFixed(1)}%)`, 'green');
  log(`  Uncategorized: ${stats.uncategorized}`, stats.uncategorized > 0 ? 'red' : 'green');
  log(`  By source:`);
  log(`    - User rules: ${stats.bySource['user-rule']}`);
  log(`    - BB category: ${stats.bySource['bb-category']}`);
  log(`    - System patterns: ${stats.bySource['system-pattern']}`);
  log(`    - None: ${stats.bySource['none']}`);

  // Show uncategorized transactions
  const uncategorized = categorized.filter(c => c.categorization.categorySlug === 'a-classificar');
  if (uncategorized.length > 0) {
    log(`\nUncategorized Transactions (first 10):`, 'red');
    uncategorized.slice(0, 10).forEach((item, i) => {
      log(`  ${i + 1}. ${item.transaction.description} | ${formatCurrency(item.transaction.amount)}`);
    });
  }

  // Show categorized samples
  log(`\nCategorized Samples:`, 'green');
  categorized
    .filter(c => c.categorization.categorySlug !== 'a-classificar')
    .slice(0, 10)
    .forEach((item, i) => {
      log(`  ${i + 1}. ${item.transaction.description.substring(0, 30).padEnd(30)} -> ${item.categorization.categorySlug} (${item.categorization.matchedBy})`);
    });

  return {
    totalTransactions: result.transactions.length,
    categorizedPercentage: stats.categorizedPercentage,
  };
}

async function testPDFParser() {
  log('\n=== Testing PDF Parser ===', 'cyan');

  const samplesDir = join(process.cwd(), 'samples', 'cards');
  const files = await readdir(samplesDir);
  const pdfFiles = files.filter(f => f.endsWith('.pdf'));

  log(`Found ${pdfFiles.length} PDF files`, 'yellow');

  // Test VISA
  const visaFile = pdfFiles.find(f => f.includes('visa') && f.includes('112025')) || pdfFiles.find(f => f.includes('visa'));
  if (visaFile) {
    log(`\nTesting VISA with: ${visaFile}`, 'bright');
    await testSinglePDF(join(samplesDir, visaFile));
  }

  // Test ELO
  const eloFile = pdfFiles.find(f => f.includes('elo') && f.includes('112025')) || pdfFiles.find(f => f.includes('elo'));
  if (eloFile) {
    log(`\nTesting ELO with: ${eloFile}`, 'bright');
    await testSinglePDF(join(samplesDir, eloFile));
  }
}

async function testSinglePDF(filePath: string) {
  const buffer = await readFile(filePath);
  
  // Test file type detection
  const fileType = detectFileType(buffer);
  log(`Detected file type: ${fileType}`, 'magenta');

  const result = await parsePDF(buffer);

  if (result.invoiceMetadata) {
    log(`\nInvoice Metadata:`, 'yellow');
    log(`  Card Type: ${result.invoiceMetadata.cardType.toUpperCase()}`);
    log(`  Month: ${result.invoiceMetadata.monthName} ${result.invoiceMetadata.year}`);
    log(`  Due Date: ${result.invoiceMetadata.dueDate.toLocaleDateString('pt-BR')}`);
    log(`  Total: ${formatCurrency(result.invoiceMetadata.totalAmount)}`);
  }

  log(`\nParse Results:`, 'yellow');
  log(`  Transactions: ${result.transactions.length}`);
  log(`  Card Holders: ${result.cardHolders.join(', ') || 'None detected'}`);
  log(`  Parse errors: ${result.errors.length}`);

  if (result.errors.length > 0) {
    log(`\nErrors:`, 'red');
    result.errors.slice(0, 5).forEach(err => {
      log(`  ${err.message}`);
    });
  }

  // Show sample transactions
  if (result.transactions.length > 0) {
    log(`\nSample Transactions:`, 'yellow');
    result.transactions.slice(0, 10).forEach((tx, i) => {
      const sign = tx.amount < 0 ? '-' : '+';
      const color = tx.amount < 0 ? 'red' : 'green';
      const meta = tx.metadata as { bbCategory?: string; cardHolder?: string };
      log(`  ${i + 1}. ${tx.date.toLocaleDateString('pt-BR')} | ${tx.description.substring(0, 35).padEnd(35)} | ${sign}${formatCurrency(Math.abs(tx.amount))} | ${meta.bbCategory || 'N/A'}`, color);
    });

    // Check for installments
    const installments = result.transactions.filter(tx => tx.installmentInfo);
    if (installments.length > 0) {
      log(`\nInstallments Found: ${installments.length}`, 'magenta');
      installments.slice(0, 5).forEach((tx, i) => {
        log(`  ${i + 1}. ${tx.description} - Parcela ${tx.installmentInfo?.current}/${tx.installmentInfo?.total}`);
      });
    }

    // Check for international transactions
    const international = result.transactions.filter(tx => {
      const meta = tx.metadata as { isInternational?: boolean };
      return meta.isInternational;
    });
    if (international.length > 0) {
      log(`\nInternational Transactions: ${international.length}`, 'magenta');
      international.slice(0, 5).forEach((tx, i) => {
        const meta = tx.metadata as { country?: string; iofAmount?: number };
        log(`  ${i + 1}. ${tx.description} | ${meta.country} | IOF: ${meta.iofAmount ? formatCurrency(meta.iofAmount) : 'N/A'}`);
      });
    }

    // Categorize and show stats
    const categorized = categorizeTransactions(result.transactions);
    const stats = getCategorizationStats(categorized);

    log(`\nCategorization Stats:`, 'yellow');
    log(`  Total: ${stats.total}`);
    log(`  Categorized: ${stats.categorized} (${stats.categorizedPercentage.toFixed(1)}%)`, 'green');
    log(`  Uncategorized: ${stats.uncategorized}`, stats.uncategorized > 0 ? 'red' : 'green');
  }
}

async function main() {
  log('🔍 Finance Parser Test Suite', 'bright');
  log('=' .repeat(50));

  // Clear patterns cache to ensure fresh load
  clearPatternsCache();

  try {
    // Test CSV
    const csvResult = await testCSVParser();

    // Test PDF
    await testPDFParser();

    // Summary
    log('\n' + '='.repeat(50), 'cyan');
    log('📊 Test Summary', 'bright');
    log(`  CSV Transactions: ${csvResult.totalTransactions}`);
    log(`  CSV Categorization Rate: ${csvResult.categorizedPercentage.toFixed(1)}%`);
    
    if (csvResult.categorizedPercentage >= 80) {
      log('\n✅ Categorization target (80%) achieved!', 'green');
    } else {
      log(`\n⚠️ Categorization rate below target (80%). Current: ${csvResult.categorizedPercentage.toFixed(1)}%`, 'yellow');
    }

  } catch (error) {
    log(`\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();


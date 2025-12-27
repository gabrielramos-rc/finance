/**
 * Categorizer
 * Auto-categorization logic for transactions
 */

import type {
  CategorizationResult,
  UserRule,
  ParsedTransaction,
  PDFTransactionMetadata,
} from './types';
import {
  getFlattenedPatterns,
  getIncomePatterns,
  getNotIncomePatterns,
  getInternalTransferPatterns,
  matchPattern,
  mapBBCategory,
} from './patterns';

// =============================================================================
// USER RULES CACHE
// =============================================================================

/**
 * In-memory cache for user rules
 * In production, this would be loaded from the database
 */
let userRulesCache: Map<string, UserRule[]> = new Map();

/**
 * Load user rules for a specific user
 * This is a placeholder - in production, load from database
 */
export async function loadUserRules(userId: string): Promise<void> {
  // TODO: Load from database when Prisma is set up
  // const rules = await prisma.categorizeRule.findMany({
  //   where: { userId, isActive: true },
  //   orderBy: { priority: 'desc' },
  // });
  // userRulesCache.set(userId, rules);
  
  // For now, just initialize empty
  if (!userRulesCache.has(userId)) {
    userRulesCache.set(userId, []);
  }
}

/**
 * Add a user rule to the cache
 */
export function addUserRule(rule: UserRule): void {
  const rules = userRulesCache.get(rule.userId) || [];
  rules.push(rule);
  rules.sort((a, b) => b.priority - a.priority);
  userRulesCache.set(rule.userId, rules);
}

/**
 * Clear user rules cache
 */
export function clearUserRulesCache(userId?: string): void {
  if (userId) {
    userRulesCache.delete(userId);
  } else {
    userRulesCache.clear();
  }
}

// =============================================================================
// CATEGORIZATION LOGIC
// =============================================================================

/**
 * Check if description matches income patterns
 */
function isIncome(description: string): boolean {
  // Check exclusion patterns first
  const notIncomePatterns = getNotIncomePatterns();
  for (const pattern of notIncomePatterns) {
    if (matchPattern(description, pattern)) {
      return false;
    }
  }

  // Check income patterns
  const incomePatterns = getIncomePatterns();
  for (const { pattern } of incomePatterns) {
    if (matchPattern(description, pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if description matches internal transfer patterns
 */
function isInternalTransfer(description: string): boolean {
  const patterns = getInternalTransferPatterns();
  for (const pattern of patterns) {
    if (matchPattern(description, pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Categorize a transaction description
 * 
 * Priority order:
 * 1. User custom rules (highest priority)
 * 2. Internal transfers (ignore in calculations)
 * 3. Income patterns
 * 4. BB category mapping (for PDF transactions)
 * 5. System patterns from config
 * 6. Default to "a-classificar"
 */
export function categorize(
  description: string,
  options: {
    userId?: string;
    bbCategory?: string;
    originalDescription?: string;
    transactionType?: 'income' | 'expense' | 'transfer';
  } = {}
): CategorizationResult {
  const { userId, bbCategory, originalDescription, transactionType } = options;
  const searchDesc = originalDescription || description;

  // 1. Check user rules first (highest priority)
  if (userId) {
    const userRules = userRulesCache.get(userId) || [];
    for (const rule of userRules) {
      if (!rule.isActive) continue;
      
      const matches = matchPattern(searchDesc, {
        pattern: rule.pattern,
        matchType: rule.matchType,
        priority: rule.priority,
      });
      
      if (matches) {
        return {
          categorySlug: rule.categorySlug,
          confidence: 1.0,
          matchedBy: 'user-rule',
          matchedPattern: rule.pattern,
        };
      }
    }
  }

  // 2. Check for internal transfers
  if (isInternalTransfer(searchDesc)) {
    return {
      categorySlug: 'transferencia-interna',
      confidence: 0.95,
      matchedBy: 'system-pattern',
      matchedPattern: 'internal-transfer',
    };
  }

  // 3. Check income patterns (for income transactions)
  if (transactionType === 'income' || transactionType === undefined) {
    const incomePatterns = getIncomePatterns();
    for (const { categorySlug, pattern } of incomePatterns) {
      if (matchPattern(searchDesc, pattern)) {
        return {
          categorySlug,
          confidence: Math.min(0.95, pattern.priority / 100),
          matchedBy: 'system-pattern',
          matchedPattern: pattern.pattern,
        };
      }
    }
  }

  // 4. Map BB category if available (for PDFs)
  if (bbCategory) {
    const mappedCategory = mapBBCategory(bbCategory);
    if (mappedCategory) {
      return {
        categorySlug: mappedCategory,
        confidence: 0.9,
        matchedBy: 'bb-category',
        matchedPattern: bbCategory,
      };
    }
  }

  // 5. Check system patterns
  const patterns = getFlattenedPatterns();
  for (const { categorySlug, pattern } of patterns) {
    if (matchPattern(searchDesc, pattern)) {
      // Skip if category is null (ambiguous patterns like Amazon)
      if (!categorySlug || categorySlug === 'a-classificar') {
        continue;
      }
      
      return {
        categorySlug,
        confidence: Math.min(0.8, pattern.priority / 100),
        matchedBy: 'system-pattern',
        matchedPattern: pattern.pattern,
      };
    }
  }

  // 6. No match - needs manual classification
  return {
    categorySlug: 'a-classificar',
    confidence: 0,
    matchedBy: 'none',
  };
}

/**
 * Categorize a parsed transaction
 */
export function categorizeTransaction(
  transaction: ParsedTransaction,
  userId?: string
): CategorizationResult {
  // Get BB category if from PDF
  let bbCategory: string | undefined;
  if (transaction.source.startsWith('pdf-')) {
    const pdfMeta = transaction.metadata as PDFTransactionMetadata;
    bbCategory = pdfMeta.bbCategory;
  }

  return categorize(transaction.description, {
    userId,
    bbCategory,
    originalDescription: transaction.originalDescription,
    transactionType: transaction.type,
  });
}

/**
 * Batch categorize multiple transactions
 */
export function categorizeTransactions(
  transactions: ParsedTransaction[],
  userId?: string
): Array<{
  transaction: ParsedTransaction;
  categorization: CategorizationResult;
}> {
  return transactions.map(transaction => ({
    transaction,
    categorization: categorizeTransaction(transaction, userId),
  }));
}

/**
 * Get categorization statistics for a batch of transactions
 */
export function getCategorizationStats(
  results: Array<{ categorization: CategorizationResult }>
): {
  total: number;
  categorized: number;
  uncategorized: number;
  bySource: Record<string, number>;
  categorizedPercentage: number;
} {
  const total = results.length;
  const uncategorized = results.filter(
    r => r.categorization.categorySlug === 'a-classificar'
  ).length;
  const categorized = total - uncategorized;

  const bySource: Record<string, number> = {
    'user-rule': 0,
    'bb-category': 0,
    'system-pattern': 0,
    'none': 0,
  };

  for (const { categorization } of results) {
    bySource[categorization.matchedBy]++;
  }

  return {
    total,
    categorized,
    uncategorized,
    bySource,
    categorizedPercentage: total > 0 ? (categorized / total) * 100 : 0,
  };
}

/**
 * Suggest a category based on similar transactions
 * This is a simple implementation - could be enhanced with ML
 */
export function suggestCategory(
  description: string,
  recentTransactions: Array<{
    description: string;
    categorySlug: string;
  }>
): string[] {
  const suggestions: Map<string, number> = new Map();
  const upperDesc = description.toUpperCase();

  // Find similar descriptions
  for (const tx of recentTransactions) {
    const upperTxDesc = tx.description.toUpperCase();
    
    // Simple similarity: check for common words
    const descWords = upperDesc.split(/\s+/).filter(w => w.length > 2);
    const txWords = upperTxDesc.split(/\s+/).filter(w => w.length > 2);
    
    const commonWords = descWords.filter(w => txWords.includes(w));
    
    if (commonWords.length > 0) {
      const score = commonWords.length / Math.max(descWords.length, txWords.length);
      const current = suggestions.get(tx.categorySlug) || 0;
      suggestions.set(tx.categorySlug, current + score);
    }
  }

  // Sort by score and return top 3
  return Array.from(suggestions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([slug]) => slug);
}

/**
 * Check if a transaction should be flagged for review
 */
export function shouldFlagForReview(
  transaction: ParsedTransaction,
  categorization: CategorizationResult
): {
  shouldFlag: boolean;
  reason?: string;
} {
  // Flag uncategorized transactions
  if (categorization.categorySlug === 'a-classificar') {
    return {
      shouldFlag: true,
      reason: 'Transação não categorizada automaticamente',
    };
  }

  // Flag low confidence categorizations
  if (categorization.confidence < 0.5) {
    return {
      shouldFlag: true,
      reason: `Baixa confiança na categorização (${Math.round(categorization.confidence * 100)}%)`,
    };
  }

  // Flag high-value transactions
  if (Math.abs(transaction.amount) > 5000) {
    return {
      shouldFlag: true,
      reason: 'Transação de alto valor - verificar categoria',
    };
  }

  return { shouldFlag: false };
}


/**
 * Patterns Loader
 * Loads and parses categorization patterns from YAML config
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'yaml';
import type { PatternsConfig, PatternDefinition, PatternMatchType, PatternGroup } from './types';

// Cache for loaded patterns
let patternsCache: PatternsConfig | null = null;

/**
 * Convert snake_case keys to camelCase in pattern definitions
 */
function normalizePattern(pattern: Record<string, unknown>): PatternDefinition {
  return {
    pattern: pattern.pattern as string,
    matchType: (pattern.match_type || pattern.matchType || 'contains') as PatternMatchType,
    priority: (pattern.priority as number) || 50,
    description: pattern.description as string | undefined,
    note: pattern.note as string | undefined,
    exclude: pattern.exclude as string[] | undefined,
    category: pattern.category as string | null | undefined,
  };
}

/**
 * Normalize all patterns in a group
 */
function normalizePatternGroup(group: Record<string, { patterns: Record<string, unknown>[] }>): PatternGroup {
  const result: PatternGroup = {};
  
  for (const [key, value] of Object.entries(group)) {
    if (value.patterns) {
      result[key] = {
        patterns: value.patterns.map(normalizePattern),
      };
    }
  }
  
  return result;
}

/**
 * Load patterns from YAML configuration file
 */
export function loadPatterns(): PatternsConfig {
  if (patternsCache) {
    return patternsCache;
  }

  const configPath = join(process.cwd(), 'config', 'patterns.yaml');
  const content = readFileSync(configPath, 'utf-8');
  const rawConfig = yaml.parse(content);

  // Normalize all pattern groups to use camelCase
  const config: PatternsConfig = {
    version: rawConfig.version,
    income_patterns: normalizePatternGroup(rawConfig.income_patterns || {}),
    internal_transfer_patterns: {
      patterns: (rawConfig.internal_transfer_patterns?.patterns || []).map(normalizePattern),
    },
    fixed_patterns: normalizePatternGroup(rawConfig.fixed_patterns || {}),
    investment_patterns: normalizePatternGroup(rawConfig.investment_patterns || {}),
    subscription_patterns: normalizePatternGroup(rawConfig.subscription_patterns || {}),
    food_patterns: normalizePatternGroup(rawConfig.food_patterns || {}),
    transport_patterns: normalizePatternGroup(rawConfig.transport_patterns || {}),
    pet_patterns: normalizePatternGroup(rawConfig.pet_patterns || {}),
    health_patterns: normalizePatternGroup(rawConfig.health_patterns || {}),
    online_patterns: normalizePatternGroup(rawConfig.online_patterns || {}),
    leisure_patterns: normalizePatternGroup(rawConfig.leisure_patterns || {}),
    beauty_fashion_patterns: normalizePatternGroup(rawConfig.beauty_fashion_patterns || {}),
    fee_patterns: normalizePatternGroup(rawConfig.fee_patterns || {}),
    family_patterns: rawConfig.family_patterns ? normalizePatternGroup(rawConfig.family_patterns) : undefined,
    installment_patterns: rawConfig.installment_patterns || { regex_patterns: [] },
    subscription_detection: rawConfig.subscription_detection || {
      min_occurrences: 2,
      months_to_analyze: 3,
      value_tolerance: 0.10,
      typical_ranges: {},
    },
  };

  patternsCache = config;
  return config;
}

/**
 * Clear the patterns cache (useful for testing or reloading)
 */
export function clearPatternsCache(): void {
  patternsCache = null;
}

/**
 * Get all patterns flattened into a single array with category info
 */
export function getFlattenedPatterns(): Array<{
  categorySlug: string;
  pattern: PatternDefinition;
}> {
  const config = loadPatterns();
  const result: Array<{ categorySlug: string; pattern: PatternDefinition }> = [];

  // Helper to process pattern groups
  const processGroup = (group: Record<string, { patterns: PatternDefinition[] }>, prefix = '') => {
    for (const [key, value] of Object.entries(group)) {
      if (value.patterns) {
        for (const pattern of value.patterns) {
          // Use pattern.category if explicitly set, otherwise use the key
          const categorySlug = pattern.category !== undefined 
            ? (pattern.category || 'a-classificar')
            : (prefix ? `${prefix}-${key}` : key);
          
          result.push({
            categorySlug,
            pattern,
          });
        }
      }
    }
  };

  // Process all pattern groups
  processGroup(config.fixed_patterns, '');
  processGroup(config.investment_patterns, '');
  processGroup(config.subscription_patterns, 'assinaturas');
  processGroup(config.food_patterns, 'alimentacao');
  processGroup(config.transport_patterns, 'transporte');
  processGroup(config.pet_patterns, 'pets');
  processGroup(config.health_patterns, 'saude');
  processGroup(config.online_patterns, 'compras');
  processGroup(config.leisure_patterns, 'lazer');
  processGroup(config.beauty_fashion_patterns, 'beleza');
  processGroup(config.fee_patterns, 'taxas');
  
  // Family patterns
  if (config.family_patterns) {
    processGroup(config.family_patterns, 'familia');
  }

  // Sort by priority (descending)
  result.sort((a, b) => b.pattern.priority - a.pattern.priority);

  return result;
}

/**
 * Get income patterns
 */
export function getIncomePatterns(): Array<{
  categorySlug: string;
  pattern: PatternDefinition;
}> {
  const config = loadPatterns();
  const result: Array<{ categorySlug: string; pattern: PatternDefinition }> = [];

  for (const [key, value] of Object.entries(config.income_patterns)) {
    if (key === 'not_income') continue; // Skip exclusion patterns
    if (value.patterns) {
      for (const pattern of value.patterns) {
        result.push({
          categorySlug: `renda-${key}`,
          pattern,
        });
      }
    }
  }

  return result.sort((a, b) => b.pattern.priority - a.pattern.priority);
}

/**
 * Get patterns that indicate NOT income (refunds, etc.)
 */
export function getNotIncomePatterns(): PatternDefinition[] {
  const config = loadPatterns();
  return config.income_patterns.not_income?.patterns || [];
}

/**
 * Get internal transfer patterns
 */
export function getInternalTransferPatterns(): PatternDefinition[] {
  const config = loadPatterns();
  return config.internal_transfer_patterns?.patterns || [];
}

/**
 * Get installment detection regex patterns
 */
export function getInstallmentPatterns(): RegExp[] {
  const config = loadPatterns();
  const patterns = config.installment_patterns?.regex_patterns || [];
  return patterns.map(p => new RegExp(p, 'i'));
}

/**
 * Check if a pattern matches a description
 */
export function matchPattern(
  description: string,
  pattern: PatternDefinition
): boolean {
  const upperDesc = description.toUpperCase();
  const upperPattern = pattern.pattern.toUpperCase();

  // Check exclusions first
  if (pattern.exclude) {
    for (const exclude of pattern.exclude) {
      if (upperDesc.includes(exclude.toUpperCase())) {
        return false;
      }
    }
  }

  // Match based on type
  switch (pattern.matchType) {
    case 'contains':
      return upperDesc.includes(upperPattern);
    
    case 'equals':
      return upperDesc === upperPattern;
    
    case 'regex':
      try {
        const regex = new RegExp(pattern.pattern, 'i');
        return regex.test(description);
      } catch {
        console.warn(`Invalid regex pattern: ${pattern.pattern}`);
        return false;
      }
    
    default:
      // Default to contains if matchType not specified
      return upperDesc.includes(upperPattern);
  }
}

/**
 * BB Category to system category mapping
 */
const BB_CATEGORY_MAP: Record<string, string | null> = {
  'Restaurantes': 'alimentacao-restaurantes',
  'Supermercados': 'alimentacao-supermercado',
  'Serviços': null, // Too generic, let patterns decide
  'Saúde': 'saude-farmacia',
  'Transporte': 'transporte',
  'Vestuário': 'vestuario-roupas',
  'Viagens': 'lazer-viagens',
  'Lazer': 'lazer',
  'Pagamentos/Créditos': null, // Ignore
  'Outros lançamentos': null, // Too generic
  'Compras parceladas': null, // Process separately
};

/**
 * Map BB category to system category
 */
export function mapBBCategory(bbCategory: string): string | null {
  return BB_CATEGORY_MAP[bbCategory] ?? null;
}

/**
 * Get subscription detection config
 */
export function getSubscriptionDetectionConfig() {
  const config = loadPatterns();
  return config.subscription_detection;
}


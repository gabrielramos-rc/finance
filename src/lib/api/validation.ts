/**
 * Input validation utilities for API routes
 */

import { ApiError } from './auth';

/**
 * Validate month format (YYYY-MM)
 */
export function validateMonth(month: string): string {
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(month)) {
    throw new ApiError(
      'VALIDATION_ERROR',
      'Invalid month format',
      400,
      { field: 'month', expected: 'YYYY-MM' }
    );
  }

  // Validate month is between 01-12
  const [, monthPart] = month.split('-');
  const monthNum = parseInt(monthPart, 10);
  if (monthNum < 1 || monthNum > 12) {
    throw new ApiError(
      'VALIDATION_ERROR',
      'Invalid month value',
      400,
      { field: 'month', expected: '01-12' }
    );
  }

  return month;
}

/**
 * Validate UUID format
 */
export function validateUUID(id: string, fieldName: string = 'id'): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new ApiError(
      'VALIDATION_ERROR',
      `Invalid ${fieldName} format`,
      400,
      { field: fieldName, expected: 'UUID' }
    );
  }
  return id;
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  limit?: string | number,
  offset?: string | number
): { limit: number; offset: number } {
  const parsedLimit = limit ? parseInt(String(limit), 10) : 100;
  const parsedOffset = offset ? parseInt(String(offset), 10) : 0;

  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 1000) {
    throw new ApiError(
      'VALIDATION_ERROR',
      'Invalid limit value',
      400,
      { field: 'limit', expected: '1-1000' }
    );
  }

  if (isNaN(parsedOffset) || parsedOffset < 0) {
    throw new ApiError(
      'VALIDATION_ERROR',
      'Invalid offset value',
      400,
      { field: 'offset', expected: '>= 0' }
    );
  }

  return { limit: parsedLimit, offset: parsedOffset };
}

/**
 * Validate transaction type
 */
export function validateTransactionType(type: string): 'income' | 'expense' | 'transfer' {
  if (!['income', 'expense', 'transfer'].includes(type)) {
    throw new ApiError(
      'VALIDATION_ERROR',
      'Invalid transaction type',
      400,
      { field: 'type', expected: 'income | expense | transfer' }
    );
  }
  return type as 'income' | 'expense' | 'transfer';
}

/**
 * Validate boolean query parameter
 */
export function validateBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true' || value === '1';
}


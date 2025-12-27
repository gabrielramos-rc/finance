/**
 * Shared types for transactions
 */

import { TransactionType } from './database'

export interface TransactionCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  parent?: {
    name: string
    slug: string
  } | null
}

export interface Transaction {
  id: string
  date: string
  description: string
  originalDesc?: string
  amount: number
  type: TransactionType
  category?: TransactionCategory | null
  notes?: string | null
  metadata?: Record<string, unknown>
}

export interface TransactionFilters {
  month?: string
  categoryId?: string
  type?: TransactionType
  uncategorized?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface PaginatedTransactions {
  data: Transaction[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}


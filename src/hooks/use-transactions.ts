'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

interface Transaction {
  id: string
  date: string
  description: string
  originalDesc?: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  category?: {
    id: string
    name: string
    slug: string
    icon: string | null
    color: string | null
    parent?: {
      name: string
      slug: string
    } | null
  } | null
  notes?: string | null
  metadata?: Record<string, unknown>
}

interface TransactionFilters {
  month?: string
  categoryId?: string
  type?: 'income' | 'expense' | 'transfer'
  uncategorized?: boolean
  search?: string
  limit?: number
  offset?: number
}

interface PaginatedTransactions {
  data: Transaction[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

async function fetchTransactions(filters: TransactionFilters): Promise<PaginatedTransactions> {
  const params = new URLSearchParams()
  
  if (filters.month) params.append('month', filters.month)
  if (filters.categoryId) params.append('categoryId', filters.categoryId)
  if (filters.type) params.append('type', filters.type)
  if (filters.uncategorized) params.append('uncategorized', 'true')
  if (filters.search) params.append('search', filters.search)
  if (filters.limit) params.append('limit', String(filters.limit))
  if (filters.offset) params.append('offset', String(filters.offset))

  const response = await fetch(`/api/transactions?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch transactions')
  }
  return response.json()
}

async function updateTransaction(
  id: string,
  data: { categoryId?: string; notes?: string }
): Promise<Transaction> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update transaction')
  }
  return response.json()
}

async function categorizeTransaction(
  id: string,
  categoryId: string,
  createRule?: boolean
): Promise<Transaction> {
  const response = await fetch(`/api/transactions/${id}/categorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categoryId, createRule }),
  })
  if (!response.ok) {
    throw new Error('Failed to categorize transaction')
  }
  return response.json()
}

export function useTransactions(filters: TransactionFilters) {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactions(filters),
    staleTime: 30 * 1000, // 30 seconds
    onError: (error) => {
      console.error('Failed to fetch transactions:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar transações. Tente novamente.',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { categoryId?: string; notes?: string } }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      console.error('Failed to update transaction:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar transação. Tente novamente.',
        variant: 'destructive',
      })
    },
  })
}

export function useCategorizeTransaction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      id,
      categoryId,
      createRule,
    }: {
      id: string
      categoryId: string
      createRule?: boolean
    }) => categorizeTransaction(id, categoryId, createRule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      console.error('Failed to categorize transaction:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao categorizar transação. Tente novamente.',
        variant: 'destructive',
      })
    },
  })
}


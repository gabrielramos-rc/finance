'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

interface Budget {
  id: string
  categoryId: string
  limit: number
  month: string
  alertAt50: boolean
  alertAt80: boolean
  alertAt100: boolean
  category: {
    name: string
    slug: string
    icon: string | null
  }
  spent?: number
  remaining?: number
}

interface BudgetSummary {
  totalLimit: number
  totalSpent: number
  totalRemaining: number
}

interface BudgetsResponse {
  data: Budget[]
  summary: BudgetSummary
}

async function fetchBudgets(month: string): Promise<BudgetsResponse> {
  const response = await fetch(`/api/budgets?month=${encodeURIComponent(month)}`)
  if (!response.ok) {
    throw new Error('Failed to fetch budgets')
  }
  return response.json()
}

async function updateBudget(
  categoryId: string,
  month: string,
  data: {
    limit: number
    alertAt50?: boolean
    alertAt80?: boolean
    alertAt100?: boolean
  }
): Promise<Budget> {
  const response = await fetch(`/api/budgets/${categoryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month, ...data }),
  })
  if (!response.ok) {
    throw new Error('Failed to update budget')
  }
  return response.json()
}

export function useBudgets(month: string) {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['budgets', month],
    queryFn: () => fetchBudgets(month),
    staleTime: 60 * 1000, // 1 minute
    onError: (error) => {
      console.error('Failed to fetch budgets:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar orçamentos. Tente novamente.',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      categoryId,
      month,
      data,
    }: {
      categoryId: string
      month: string
      data: {
        limit: number
        alertAt50?: boolean
        alertAt80?: boolean
        alertAt100?: boolean
      }
    }) => updateBudget(categoryId, month, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      console.error('Failed to update budget:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar orçamento. Tente novamente.',
        variant: 'destructive',
      })
    },
  })
}


'use client'

import { useQuery } from '@tanstack/react-query'
import { useToast } from './use-toast'

interface DashboardData {
  period: {
    month: string
    startDate: string
    endDate: string
  }
  income: {
    received: number
    expected: number
    percentOfExpected: number
  }
  expenses: {
    fixed: number
    variable: number
    installments: number
    total: number
  }
  balance: {
    projected: number
    current: number
  }
  budgets: {
    total: number
    used: number
    remaining: number
    alerts: Array<{
      category: string
      percentage: number
      level: 'info' | 'warning' | 'critical'
    }>
  }
  topCategories: Array<{
    category: string
    amount: number
    percentage: number
  }>
  recentTransactions: Array<{
    id: string
    date: string
    description: string
    amount: number
    type: 'income' | 'expense' | 'transfer'
    category?: {
      id: string
      name: string
      icon: string | null
      color: string | null
    } | null
  }>
  alerts: Array<{
    type: string
    message: string
    isRead: boolean
  }>
  investmentSuggestion: {
    available: number
    reason: string
  }
}

async function fetchDashboard(month?: string): Promise<DashboardData> {
  const url = month
    ? `/api/dashboard?month=${encodeURIComponent(month)}`
    : '/api/dashboard'
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }
  return response.json()
}

export function useDashboard(month?: string) {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['dashboard', month],
    queryFn: () => fetchDashboard(month),
    staleTime: 60 * 1000, // 1 minute
    onError: (error) => {
      console.error('Failed to fetch dashboard data:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do dashboard. Tente novamente.',
        variant: 'destructive',
      })
    },
  })
}


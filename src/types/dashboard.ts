/**
 * Shared types for dashboard
 */

import { TransactionType } from './database'
import { Transaction } from './transactions'

export interface DashboardPeriod {
  month: string
  startDate: string
  endDate: string
}

export interface DashboardIncome {
  received: number
  expected: number
  percentOfExpected: number
}

export interface DashboardExpenses {
  fixed: number
  variable: number
  installments: number
  total: number
}

export interface DashboardBalance {
  projected: number
  current: number
}

export interface BudgetAlert {
  category: string
  percentage: number
  level: 'info' | 'warning' | 'critical'
}

export interface DashboardBudgets {
  total: number
  used: number
  remaining: number
  alerts: BudgetAlert[]
}

export interface TopCategory {
  category: string
  amount: number
  percentage: number
}

export interface DashboardAlert {
  type: string
  message: string
  isRead: boolean
}

export interface InvestmentSuggestion {
  available: number
  reason: string
}

export interface DashboardData {
  period: DashboardPeriod
  income: DashboardIncome
  expenses: DashboardExpenses
  balance: DashboardBalance
  budgets: DashboardBudgets
  topCategories: TopCategory[]
  recentTransactions: Array<{
    id: string
    date: string
    description: string
    amount: number
    type: TransactionType
    category?: {
      id: string
      name: string
      icon: string | null
      color: string | null
    } | null
  }>
  alerts: DashboardAlert[]
  investmentSuggestion: InvestmentSuggestion
}


'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrencyDisplay } from '@/components/common/currency-display'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

interface DashboardData {
  income: {
    received: number
    expected: number
    percentOfExpected: number
  }
  expenses: {
    total: number
    fixed: number
    variable: number
    installments: number
  }
  balance: {
    projected: number
    current: number
  }
  budgets: {
    total: number
    used: number
    remaining: number
  }
}

interface SummaryCardsProps {
  data: DashboardData
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const budgetPercentage =
    data.budgets.total > 0
      ? (data.budgets.used / data.budgets.total) * 100
      : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Income Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Renda
          </CardTitle>
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-100">
            <CurrencyDisplay value={data.income.received} type="income" />
          </div>
          <p className="text-xs text-emerald-500 flex items-center mt-1">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            {data.income.percentOfExpected.toFixed(0)}% recebido
          </p>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Gastos
          </CardTitle>
          <div className="p-2 bg-red-500/10 rounded-lg">
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-100">
            <CurrencyDisplay value={-data.expenses.total} type="expense" />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Fixos + Variáveis + Parcelas
          </p>
        </CardContent>
      </Card>

      {/* Balance Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Saldo
          </CardTitle>
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Wallet className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-100">
            <CurrencyDisplay
              value={data.balance.projected}
              type={data.balance.projected >= 0 ? 'income' : 'expense'}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">Projetado para o mês</p>
        </CardContent>
      </Card>

      {/* Budget Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Orçamento
          </CardTitle>
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <PiggyBank className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-100">
            {budgetPercentage.toFixed(0)}%
          </div>
          <div className="mt-2 h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`
                h-full rounded-full transition-all duration-500
                ${
                  budgetPercentage >= 100
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : budgetPercentage >= 80
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                }
              `}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


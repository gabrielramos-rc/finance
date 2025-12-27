'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/common/empty-state'
import { CurrencyDisplay } from '@/components/common/currency-display'
import { PiggyBank } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BudgetData {
  category: {
    name: string
    slug: string
    icon: string | null
  }
  limit: number
  spent?: number
  remaining?: number
}

interface BudgetProgressProps {
  budgets: BudgetData[]
}

export function BudgetProgress({ budgets }: BudgetProgressProps) {
  const router = useRouter()

  if (budgets.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<PiggyBank />}
            title="Nenhum orçamento configurado"
            description="Configure orçamentos para acompanhar seus gastos"
          />
        </CardContent>
      </Card>
    )
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getProgressVariant = (percentage: number): 'default' | 'destructive' => {
    if (percentage >= 100) return 'destructive'
    return 'default'
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Orçamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgets.map((budget) => {
            const spent = budget.spent || 0
            const limit = Number(budget.limit)
            const remaining = limit - spent
            const percentage = limit > 0 ? (spent / limit) * 100 : 0

            return (
              <div
                key={budget.category.slug}
                className="space-y-2 cursor-pointer hover:bg-zinc-800/50 p-3 rounded-lg transition-colors"
                onClick={() =>
                  router.push(
                    `/transactions?category=${encodeURIComponent(budget.category.name)}`
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {budget.category.icon && (
                      <span className="text-lg">{budget.category.icon}</span>
                    )}
                    <span className="font-medium text-zinc-100">
                      {budget.category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-zinc-100">
                      <CurrencyDisplay value={-spent} type="expense" /> /{' '}
                      <CurrencyDisplay value={-limit} type="expense" />
                    </div>
                    <div className="text-xs text-zinc-500">
                      {percentage.toFixed(0)}% usado
                    </div>
                  </div>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className="h-2"
                />
                {remaining > 0 && (
                  <div className="text-xs text-emerald-500">
                    Restam{' '}
                    <CurrencyDisplay value={-remaining} type="expense" />
                  </div>
                )}
                {remaining <= 0 && (
                  <div className="text-xs text-red-500">
                    Orçamento estourado em{' '}
                    <CurrencyDisplay value={Math.abs(remaining)} type="expense" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}


'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/empty-state'
import { CurrencyDisplay } from '@/components/common/currency-display'
import { DateDisplay } from '@/components/common/date-display'
import { Badge } from '@/components/ui/badge'
import { Receipt, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Transaction } from '@/types/transactions'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const router = useRouter()

  if (transactions.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Receipt />}
            title="Nenhuma transação importada"
            description="Importe dados para ver suas transações recentes"
            action={{
              label: 'Importar dados',
              onClick: () => router.push('/import'),
            }}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Últimas Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:bg-zinc-800/50 cursor-pointer transition-colors"
              onClick={() => router.push(`/transactions/${transaction.id}`)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {transaction.category?.icon ? (
                    <span className="text-lg">{transaction.category.icon}</span>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Receipt className="h-4 w-4 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-zinc-100 truncate">
                      {transaction.description}
                    </p>
                    {transaction.category && (
                      <Badge variant="secondary" className="text-xs">
                        {transaction.category.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    <DateDisplay date={transaction.date} formatType="relative" />
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CurrencyDisplay
                  value={transaction.amount}
                  type={transaction.type === 'income' ? 'income' : 'expense'}
                />
                <ArrowRight className="h-4 w-4 text-zinc-500" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/transactions')}
            className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            Ver todas as transações →
          </button>
        </div>
      </CardContent>
    </Card>
  )
}


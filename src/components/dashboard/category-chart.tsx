'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/empty-state'
import { CurrencyDisplay } from '@/components/common/currency-display'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useRouter } from 'next/navigation'
import { PieChart as PieChartIcon } from 'lucide-react'
import type { CategoryData } from '@/types/categories'

interface CategoryChartProps {
  topCategories: CategoryData[]
}

const COLORS = [
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
]

export function CategoryChart({ topCategories }: CategoryChartProps) {
  const router = useRouter()

  if (topCategories.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<PieChartIcon />}
            title="Nenhum dado disponível"
            description="Importe transações para ver os gastos por categoria"
          />
        </CardContent>
      </Card>
    )
  }

  const chartData = topCategories.map((cat) => ({
    name: cat.category,
    value: cat.amount,
    percentage: cat.percentage,
  }))

  const handleClick = (data: { name: string }) => {
    // Navigate to transactions filtered by category
    router.push(`/transactions?category=${encodeURIComponent(data.name)}`)
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onClick={handleClick}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) =>
                value !== undefined ? formatCurrency(-value) : ''
              }
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {topCategories.map((cat, index) => (
            <div
              key={cat.category}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-zinc-300">{cat.category}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-zinc-500">
                  {cat.percentage.toFixed(1)}%
                </span>
                <CurrencyDisplay value={-cat.amount} type="expense" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


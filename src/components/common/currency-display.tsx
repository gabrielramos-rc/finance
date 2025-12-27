'use client'

import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CurrencyDisplayProps {
  value: number
  type?: 'income' | 'expense' | 'neutral'
  showSign?: boolean
  className?: string
}

export function CurrencyDisplay({
  value,
  type = 'neutral',
  showSign = false,
  className,
}: CurrencyDisplayProps) {
  const isNegative = value < 0
  const absValue = Math.abs(value)

  const colorClass =
    type === 'income'
      ? 'text-emerald-500'
      : type === 'expense' || isNegative
        ? 'text-red-400'
        : 'text-zinc-100'

  const sign = showSign ? (value >= 0 ? '+' : '-') : ''

  return (
    <span className={cn('font-medium', colorClass, className)}>
      {sign}
      {formatCurrency(absValue)}
    </span>
  )
}


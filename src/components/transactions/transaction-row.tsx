'use client'

import { CurrencyDisplay } from '@/components/common/currency-display'
import { DateDisplay } from '@/components/common/date-display'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Transaction {
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
}

interface TransactionRowProps {
  transaction: Transaction
  isSelected?: boolean
  onSelect?: (id: string, selected: boolean) => void
  onEdit?: (id: string) => void
  showCheckbox?: boolean
}

export function TransactionRow({
  transaction,
  isSelected = false,
  onSelect,
  onEdit,
  showCheckbox = false,
}: TransactionRowProps) {
  const handleClick = () => {
    if (onEdit) {
      onEdit(transaction.id)
    }
  }

  const handleSelect = (checked: boolean) => {
    if (onSelect) {
      onSelect(transaction.id, checked)
    }
  }

  return (
    <tr
      className={cn(
        'border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors',
        isSelected && 'bg-zinc-800/30'
      )}
    >
      {showCheckbox && (
        <td className="px-4 py-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelect}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}
      <td
        className="px-4 py-3 cursor-pointer"
        onClick={handleClick}
      >
        <DateDisplay date={transaction.date} formatType="short" />
      </td>
      <td
        className="px-4 py-3 cursor-pointer min-w-0"
        onClick={handleClick}
      >
        <div className="flex items-center gap-2">
          {transaction.category?.icon ? (
            <span className="text-lg flex-shrink-0">
              {transaction.category.icon}
            </span>
          ) : (
            <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <Receipt className="h-3 w-3 text-zinc-500" />
            </div>
          )}
          <span className="text-sm font-medium text-zinc-100 truncate">
            {transaction.description}
          </span>
        </div>
      </td>
      <td
        className="px-4 py-3 cursor-pointer"
        onClick={handleClick}
      >
        {transaction.category ? (
          <Badge variant="secondary" className="text-xs">
            {transaction.category.name}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/50">
            A Classificar
          </Badge>
        )}
      </td>
      <td
        className="px-4 py-3 text-right cursor-pointer"
        onClick={handleClick}
      >
        <CurrencyDisplay
          value={transaction.amount}
          type={transaction.type === 'income' ? 'income' : 'expense'}
        />
      </td>
    </tr>
  )
}


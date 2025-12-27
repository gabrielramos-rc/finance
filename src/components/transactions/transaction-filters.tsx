'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MonthSelector } from '@/components/common/month-selector'
import { CategoryPicker } from './category-picker'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { Category } from '@/types/categories'

interface TransactionFiltersProps {
  month: string
  categoryId?: string
  type?: 'income' | 'expense' | 'transfer'
  search?: string
  uncategorized?: boolean
  categories: Category[]
  onMonthChange: (month: string) => void
  onCategoryChange: (categoryId: string | undefined) => void
  onTypeChange: (type: 'income' | 'expense' | 'transfer' | undefined) => void
  onSearchChange: (search: string) => void
  onUncategorizedChange: (uncategorized: boolean) => void
  onClear: () => void
}

export function TransactionFilters({
  month,
  categoryId,
  type,
  search,
  uncategorized,
  categories,
  onMonthChange,
  onCategoryChange,
  onTypeChange,
  onSearchChange,
  onUncategorizedChange,
  onClear,
}: TransactionFiltersProps) {
  const hasFilters = categoryId || type || search || uncategorized

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MonthSelector value={month} onChange={onMonthChange} />
        
        <CategoryPicker
          categories={categories}
          value={categoryId}
          onValueChange={(value) => onCategoryChange(value || undefined)}
          placeholder="Todas as categorias"
        />

        <Select
          value={type || 'all'}
          onValueChange={(value) =>
            onTypeChange(value === 'all' ? undefined : (value as typeof type))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Receita</SelectItem>
            <SelectItem value="expense">Despesa</SelectItem>
            <SelectItem value="transfer">Transferência</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Buscar transações..."
          value={search || ''}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
          <input
            type="checkbox"
            checked={uncategorized || false}
            onChange={(e) => onUncategorizedChange(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-600 focus:ring-emerald-600"
          />
          Apenas não categorizadas
        </label>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-zinc-400 hover:text-zinc-300"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  )
}


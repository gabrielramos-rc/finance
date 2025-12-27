'use client'

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TransactionRow } from './transaction-row'
import { TransactionFilters } from './transaction-filters'
import { TransactionDetail } from './transaction-detail'
import { BulkActions } from './bulk-actions'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingSkeleton } from '@/components/common/loading-spinner'
import { Button } from '@/components/ui/button'
import { Receipt, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { Category } from '@/types/categories'
import type { Transaction } from '@/types/transactions'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  isLoading?: boolean
  pagination?: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  filters: {
    month: string
    categoryId?: string
    type?: 'income' | 'expense' | 'transfer'
    search?: string
    uncategorized?: boolean
  }
  onFiltersChange: (filters: Partial<TransactionListProps['filters']>) => void
  onPageChange?: (offset: number) => void
  onUpdate?: (id: string, data: { categoryId?: string; notes?: string }) => Promise<void>
  onBulkCategorize?: (ids: string[]) => void
  onBulkDelete?: (ids: string[]) => void
  onBulkIgnore?: (ids: string[]) => void
}

export function TransactionList({
  transactions,
  categories,
  isLoading = false,
  pagination,
  filters,
  onFiltersChange,
  onPageChange,
  onUpdate,
  onBulkCategorize,
  onBulkDelete,
  onBulkIgnore,
}: TransactionListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const handleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds)
    if (selected) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(transactions.map((t) => t.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleEdit = (id: string) => {
    const transaction = transactions.find((t) => t.id === id)
    if (transaction) {
      setEditingTransaction(transaction)
    }
  }

  const handleUpdate = async (id: string, data: { categoryId?: string; notes?: string }) => {
    if (onUpdate) {
      await onUpdate(id, data)
    }
    setEditingTransaction(null)
  }

  const allSelected = transactions.length > 0 && selectedIds.size === transactions.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < transactions.length

  return (
    <div className="space-y-4">
      <TransactionFilters
        month={filters.month}
        categoryId={filters.categoryId}
        type={filters.type}
        search={filters.search}
        uncategorized={filters.uncategorized}
        categories={categories}
        onMonthChange={(month) => onFiltersChange({ month })}
        onCategoryChange={(categoryId) => onFiltersChange({ categoryId })}
        onTypeChange={(type) => onFiltersChange({ type })}
        onSearchChange={(search) => onFiltersChange({ search })}
        onUncategorizedChange={(uncategorized) => onFiltersChange({ uncategorized })}
        onClear={() => {
          onFiltersChange({
            categoryId: undefined,
            type: undefined,
            search: undefined,
            uncategorized: false,
          })
          setSelectedIds(new Set())
        }}
      />

      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<Receipt />}
          title="Nenhuma transação encontrada"
          description="Tente ajustar os filtros ou importe novos dados"
        />
      ) : (
        <>
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Selecionar todas as transações"
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-600 focus:ring-emerald-600"
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = someSelected
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    isSelected={selectedIds.has(transaction.id)}
                    onSelect={handleSelect}
                    onEdit={handleEdit}
                    showCheckbox
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">
                Mostrando {pagination.offset + 1} -{' '}
                {Math.min(pagination.offset + pagination.limit, pagination.total)} de{' '}
                {pagination.total} transações
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(Math.max(0, pagination.offset - pagination.limit))}
                  disabled={pagination.offset === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.offset + pagination.limit)}
                  disabled={!pagination.hasMore}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedIds.size > 0 && (
        <BulkActions
          selectedIds={Array.from(selectedIds)}
          onCategorize={(ids) => {
            onBulkCategorize?.(ids)
            setSelectedIds(new Set())
          }}
          onDelete={(ids) => {
            onBulkDelete?.(ids)
            setSelectedIds(new Set())
          }}
          onIgnore={(ids) => {
            onBulkIgnore?.(ids)
            setSelectedIds(new Set())
          }}
        />
      )}

      {editingTransaction && (
        <TransactionDetail
          transaction={editingTransaction}
          categories={categories}
          open={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}


'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CategoryPicker } from './category-picker'
import { CurrencyDisplay } from '@/components/common/currency-display'
import { DateDisplay } from '@/components/common/date-display'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  children?: Category[]
}

interface Transaction {
  id: string
  date: string
  description: string
  originalDesc?: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  category?: {
    id: string
    name: string
    icon: string | null
  } | null
  notes?: string | null
  metadata?: Record<string, unknown>
}

interface TransactionDetailProps {
  transaction: Transaction | null
  categories: Category[]
  open: boolean
  onClose: () => void
  onUpdate: (id: string, data: { categoryId?: string; notes?: string }) => Promise<void>
}

export function TransactionDetail({
  transaction,
  categories,
  open,
  onClose,
  onUpdate,
}: TransactionDetailProps) {
  const [categoryId, setCategoryId] = useState<string | undefined>(
    transaction?.category?.id
  )
  const [notes, setNotes] = useState(transaction?.notes || '')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Update local state when transaction changes
  useEffect(() => {
    if (transaction) {
      setCategoryId(transaction.category?.id)
      setNotes(transaction.notes || '')
    }
  }, [transaction])

  const handleSave = async () => {
    if (!transaction) return

    setIsSaving(true)
    try {
      await onUpdate(transaction.id, {
        categoryId: categoryId || undefined,
        notes: notes || undefined,
      })
      toast({
        title: 'Sucesso',
        description: 'Transação atualizada com sucesso',
      })
      onClose()
    } catch (error) {
      console.error('Failed to update transaction:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar transação. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Transação</DialogTitle>
          <DialogDescription>
            Visualize e edite os detalhes desta transação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transaction Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-zinc-400">Data</Label>
              <div className="mt-1 text-zinc-100">
                <DateDisplay date={transaction.date} formatType="long" />
              </div>
            </div>
            <div>
              <Label className="text-zinc-400">Valor</Label>
              <div className="mt-1">
                <CurrencyDisplay
                  value={transaction.amount}
                  type={transaction.type === 'income' ? 'income' : 'expense'}
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-zinc-400">Descrição</Label>
            <div className="mt-1 text-zinc-100">{transaction.description}</div>
            {transaction.originalDesc &&
              transaction.originalDesc !== transaction.description && (
                <div className="mt-1 text-xs text-zinc-500">
                  Original: {transaction.originalDesc}
                </div>
              )}
          </div>

          {/* Editable Fields */}
          <div>
            <Label htmlFor="category">Categoria</Label>
            <CategoryPicker
              categories={categories}
              value={categoryId}
              onValueChange={setCategoryId}
              placeholder="Selecione uma categoria"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione notas sobre esta transação..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Metadata */}
          {transaction.metadata &&
            Object.keys(transaction.metadata).length > 0 && (
              <div>
                <Label className="text-zinc-400">Informações Adicionais</Label>
                <div className="mt-2 space-y-1 text-sm">
                  {Object.entries(transaction.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-zinc-500">{key}:</span>
                      <span className="text-zinc-300">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


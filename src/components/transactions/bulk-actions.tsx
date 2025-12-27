'use client'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useState } from 'react'
import { Tag, Trash2, EyeOff } from 'lucide-react'

interface BulkActionsProps {
  selectedIds: string[]
  onCategorize: (ids: string[]) => void
  onDelete: (ids: string[]) => void
  onIgnore: (ids: string[]) => void
}

export function BulkActions({
  selectedIds,
  onCategorize,
  onDelete,
  onIgnore,
}: BulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showIgnoreConfirm, setShowIgnoreConfirm] = useState(false)

  if (selectedIds.length === 0) {
    return null
  }

  const handleDelete = () => {
    onDelete(selectedIds)
    setShowDeleteConfirm(false)
  }

  const handleIgnore = () => {
    onIgnore(selectedIds)
    setShowIgnoreConfirm(false)
  }

  return (
    <>
      <div className="sticky bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-sm text-zinc-300">
            {selectedIds.length} transação{selectedIds.length > 1 ? 'ões' : ''}{' '}
            selecionada{selectedIds.length > 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCategorize(selectedIds)}
            >
              <Tag className="h-4 w-4 mr-2" />
              Categorizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIgnoreConfirm(true)}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Ignorar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Excluir transações"
        description={`Tem certeza que deseja excluir ${selectedIds.length} transação(ões)? Esta ação não pode ser desfeita.`}
        variant="destructive"
        confirmLabel="Excluir"
      />

      <ConfirmDialog
        open={showIgnoreConfirm}
        onConfirm={handleIgnore}
        onCancel={() => setShowIgnoreConfirm(false)}
        title="Ignorar transações"
        description={`Tem certeza que deseja ignorar ${selectedIds.length} transação(ões)? Elas não aparecerão nos cálculos.`}
        confirmLabel="Ignorar"
      />
    </>
  )
}


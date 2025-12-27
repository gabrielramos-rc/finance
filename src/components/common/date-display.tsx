'use client'

import { formatDate, formatRelativeDate } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DateDisplayProps {
  date: Date | string
  formatType?: 'short' | 'long' | 'relative'
  className?: string
}

export function DateDisplay({
  date,
  formatType = 'short',
  className,
}: DateDisplayProps) {
  const d = typeof date === 'string' ? new Date(date) : date

  let displayText: string

  switch (formatType) {
    case 'relative':
      displayText = formatRelativeDate(d)
      break
    case 'long':
      displayText = format(d, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
      break
    case 'short':
    default:
      displayText = formatDate(d)
      break
  }

  return <span className={className}>{displayText}</span>
}


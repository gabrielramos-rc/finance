'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useMemo } from 'react'

interface MonthSelectorProps {
  value: string // YYYY-MM format
  onChange: (value: string) => void
  className?: string
  monthsBack?: number // How many months back to show (default: 12)
}

export function MonthSelector({
  value,
  onChange,
  className,
  monthsBack = 12,
}: MonthSelectorProps) {
  const months = useMemo(() => {
    const options: { value: string; label: string }[] = []
    const now = new Date()
    
    for (let i = 0; i < monthsBack; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthValue = format(date, 'yyyy-MM')
      const monthLabel = format(date, "MMMM 'de' yyyy", { locale: ptBR })
      options.push({ value: monthValue, label: monthLabel })
    }
    
    return options
  }, [monthsBack])

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Selecione o mês" />
      </SelectTrigger>
      <SelectContent>
        {months.map((month) => (
          <SelectItem key={month.value} value={month.value}>
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}


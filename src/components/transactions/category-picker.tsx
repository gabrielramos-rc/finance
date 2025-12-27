'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  children?: Category[]
}

interface CategoryPickerProps {
  categories: Category[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  excludeIds?: string[]
  className?: string
}

function flattenCategories(
  categories: Category[],
  excludeIds: string[] = [],
  prefix = ''
): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = []

  categories.forEach((category) => {
    if (excludeIds.includes(category.id)) {
      return
    }

    const label = prefix ? `${prefix} > ${category.name}` : category.name
    result.push({ id: category.id, label })

    if (category.children && category.children.length > 0) {
      const childPrefix = prefix ? `${prefix} > ${category.name}` : category.name
      result.push(...flattenCategories(category.children, excludeIds, childPrefix))
    }
  })

  return result
}

export function CategoryPicker({
  categories,
  value,
  onValueChange,
  placeholder = 'Selecione uma categoria',
  excludeIds = [],
  className,
}: CategoryPickerProps) {
  const [flatCategories, setFlatCategories] = useState<
    { id: string; label: string }[]
  >([])

  useEffect(() => {
    setFlatCategories(flattenCategories(categories, excludeIds))
  }, [categories, excludeIds])

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {flatCategories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}


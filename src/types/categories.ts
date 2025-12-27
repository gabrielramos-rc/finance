/**
 * Shared types for categories
 */

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  type?: string
  parentId?: string | null
  children?: Category[]
}

export interface CategoryData {
  category: string
  amount: number
  percentage: number
}


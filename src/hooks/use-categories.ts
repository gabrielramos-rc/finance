'use client'

import { useQuery } from '@tanstack/react-query'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  type: string
  parentId: string | null
  children?: Category[]
}

interface CategoriesResponse {
  data: Category[]
}

async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await fetch('/api/categories')
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }
  return response.json()
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes (categories don't change often)
  })
}


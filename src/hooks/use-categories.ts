'use client'

import { useQuery } from '@tanstack/react-query'
import type { Category } from '@/types/categories'

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
    // Note: Error handling should be done in components using this hook
    // React Query v5 removed onError from useQuery
  })
}


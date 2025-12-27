'use client'

import { useQuery } from '@tanstack/react-query'
import { useToast } from './use-toast'

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
  const { toast } = useToast()

  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes (categories don't change often)
    onError: (error) => {
      console.error('Failed to fetch categories:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar categorias. Tente novamente.',
        variant: 'destructive',
      })
    },
  })
}


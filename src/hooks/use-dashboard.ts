'use client'

import { useQuery } from '@tanstack/react-query'
import type { DashboardData } from '@/types/dashboard'

async function fetchDashboard(month?: string): Promise<DashboardData> {
  const url = month
    ? `/api/dashboard?month=${encodeURIComponent(month)}`
    : '/api/dashboard'
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }
  return response.json()
}

export function useDashboard(month?: string) {
  return useQuery({
    queryKey: ['dashboard', month],
    queryFn: () => fetchDashboard(month),
    staleTime: 60 * 1000, // 1 minute
    // Note: Error handling should be done in components using this hook
    // React Query v5 removed onError from useQuery
  })
}


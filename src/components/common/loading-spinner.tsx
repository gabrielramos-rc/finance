'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullPage?: boolean
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  fullPage = false,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2
          className={cn('animate-spin text-zinc-400', sizeClasses[size], className)}
        />
      </div>
    )
  }

  return (
    <Loader2
      className={cn('animate-spin text-zinc-400', sizeClasses[size], className)}
    />
  )
}

interface LoadingSkeletonProps {
  count?: number
  className?: string
}

export function LoadingSkeleton({ count = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}


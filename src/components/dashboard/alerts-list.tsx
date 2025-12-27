'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Alert {
  type: string
  message: string
  isRead: boolean
}

interface AlertsListProps {
  alerts: Alert[]
}

export function AlertsList({ alerts }: AlertsListProps) {
  const router = useRouter()

  if (alerts.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Bell />}
            title="Nenhum alerta no momento"
            description="Você está em dia!"
          />
        </CardContent>
      </Card>
    )
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'budget_warning':
      case 'budget_critical':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'budget_info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'uncategorized':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4 text-zinc-500" />
    }
  }

  const getAlertVariant = (type: string): 'default' | 'destructive' | 'secondary' => {
    if (type.includes('critical')) return 'destructive'
    if (type.includes('warning')) return 'default'
    return 'secondary'
  }

  const handleAlertClick = (alert: Alert) => {
    // Navigate based on alert type
    if (alert.type.startsWith('budget')) {
      router.push('/budgets')
    } else if (alert.type === 'uncategorized') {
      router.push('/transactions?uncategorized=true')
    }
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Alertas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`
                flex items-start gap-3 p-3 rounded-lg border transition-colors
                ${
                  alert.isRead
                    ? 'bg-zinc-800/30 border-zinc-800'
                    : 'bg-amber-500/10 border-amber-500/20 cursor-pointer hover:bg-amber-500/20'
                }
              `}
              onClick={() => !alert.isRead && handleAlertClick(alert)}
            >
              <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getAlertVariant(alert.type)} className="text-xs">
                    {alert.type.replace('_', ' ')}
                  </Badge>
                  {!alert.isRead && (
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <p className="text-sm text-zinc-300">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


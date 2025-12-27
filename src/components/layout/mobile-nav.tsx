'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  RefreshCw,
  CreditCard,
  Upload,
  Settings,
  Wallet,
  Menu,
  X,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transações', href: '/transactions', icon: Receipt },
  { name: 'Orçamentos', href: '/budgets', icon: PiggyBank },
  { name: 'Assinaturas', href: '/subscriptions', icon: RefreshCw },
  { name: 'Parcelas', href: '/installments', icon: CreditCard },
  { name: 'Importar', href: '/import', icon: Upload },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50"
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">Abrir menu</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto bg-zinc-950 border-r border-zinc-800 p-0 sm:max-w-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300">
          <DialogTitle className="sr-only">Menu de navegação</DialogTitle>
          <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-zinc-100">Finance</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50"
              onClick={() => setOpen(false)}
            >
              <span className="sr-only">Fechar menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </Button>
          </div>

          <nav className="flex flex-1 flex-col p-6">
            <ul role="list" className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200',
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0 transition-colors',
                          isActive
                            ? 'text-emerald-400'
                            : 'text-zinc-500 group-hover:text-zinc-300'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </DialogContent>
      </Dialog>
    </>
  )
}


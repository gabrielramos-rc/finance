'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  RefreshCw,
  CreditCard,
  Upload,
  Settings,
  Wallet,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transações', href: '/transactions', icon: Receipt },
  { name: 'Orçamentos', href: '/budgets', icon: PiggyBank },
  { name: 'Assinaturas', href: '/subscriptions', icon: RefreshCw },
  { name: 'Parcelas', href: '/installments', icon: CreditCard },
  { name: 'Importar', href: '/import', icon: Upload },
]

const secondaryNavigation = [
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-zinc-950 border-r border-zinc-800 px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-zinc-100 tracking-tight">
            Finance
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium leading-6 transition-all duration-200',
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
            </li>

            <li className="mt-auto">
              <ul role="list" className="-mx-2 space-y-1">
                {secondaryNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium leading-6 transition-all duration-200',
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
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}


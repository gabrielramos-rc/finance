import { createClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/auth/user-menu'
import { Bell } from 'lucide-react'
import { MobileNav } from './mobile-nav'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userData = {
    email: user?.email,
    name: user?.user_metadata?.full_name || user?.user_metadata?.name,
    avatar_url: user?.user_metadata?.avatar_url,
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile nav trigger */}
      <MobileNav />

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-zinc-800 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Spacer */}
        <div className="flex flex-1" />

        {/* Right side actions */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-lg transition-colors"
          >
            <span className="sr-only">Ver notificações</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            {/* Notification badge - show when there are unread notifications */}
            {/* <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950" /> */}
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-zinc-800" aria-hidden="true" />

          {/* User menu */}
          <UserMenu user={userData} />
        </div>
      </div>
    </header>
  )
}


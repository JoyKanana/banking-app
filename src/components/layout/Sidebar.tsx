import { NavLink } from 'react-router-dom'
import { visibleNavigation } from '@/config/navigation'
import { useAccount } from '@/domain/account/store'
import { cn } from '@/lib/utils'
import { BellIcon } from './icons'

type SidebarProps = {
  onOpenNotifications: () => void
}

export function Sidebar({ onOpenNotifications }: SidebarProps) {
  const account = useAccount()
  const items = visibleNavigation(account.enabledServiceIds)

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r border-white/10 bg-slate-900/95 p-6 md:flex">
      <div>
        <NavLink
          to="/"
          className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          <h1 className="text-2xl font-bold tracking-wide">
            RELAY<span className="text-teal-400">.</span>
          </h1>
          <p className="mt-2 text-xs text-slate-400">YOUR WORLD, CONNECTED.</p>
        </NavLink>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-400/15 text-sm font-semibold text-teal-300">
              {account.profile.displayName
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {account.profile.displayName}
              </p>
              <p className="truncate text-xs text-slate-500">
                {account.profile.operatingCurrency} · {account.profile.country}
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-7 space-y-1.5">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'group block rounded-xl px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
                  isActive
                    ? 'bg-teal-400/10 text-teal-200'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-slate-500 group-hover:text-slate-400">
                {item.description}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto space-y-3 pt-6">
        <button
          type="button"
          onClick={onOpenNotifications}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left transition hover:border-teal-400/30 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-300">
            <BellIcon className="h-4 w-4" />
            Activity
          </span>
          {account.unreadCount > 0 && (
            <span className="rounded-full bg-teal-400 px-2 py-0.5 text-xs font-semibold text-slate-950">
              {account.unreadCount}
            </span>
          )}
        </button>

        <NavLink
          to="/account?tab=services"
          className="block rounded-xl px-4 py-2 text-xs text-slate-500 transition hover:text-teal-300"
        >
          {account.enabledServiceIds.length} services active · Manage
        </NavLink>

        <p className="px-4 text-xs text-slate-600">
          Project Relay · Early preview
        </p>
      </div>
    </aside>
  )
}

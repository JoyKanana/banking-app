import { NavLink } from 'react-router-dom'
import { visibleNavigation } from '@/config/navigation'
import { useAccount } from '@/domain/account/store'
import { cn } from '@/lib/utils'
import { CloseIcon } from './icons'

type MobileNavProps = {
  onClose: () => void
}

export function MobileNav({ onClose }: MobileNavProps) {
  const account = useAccount()
  const items = visibleNavigation(account.enabledServiceIds)

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm md:hidden"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <aside className="flex h-full w-[86%] max-w-sm flex-col border-r border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              RELAY<span className="text-teal-400">.</span>
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {account.profile.displayName} · {account.profile.country}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 flex-1 space-y-1.5 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'block rounded-xl px-4 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
                  isActive
                    ? 'bg-teal-400/10 text-teal-200'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                {item.description}
              </span>
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/account?tab=services"
          onClick={onClose}
          className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300 transition hover:border-teal-400/30 hover:text-teal-200"
        >
          Manage services
        </NavLink>
      </aside>
    </div>
  )
}

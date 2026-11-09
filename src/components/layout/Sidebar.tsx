import { NavLink } from 'react-router-dom'
import { navigation } from '@/config/navigation'
import { cn } from '@/lib/utils'

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-white/10 bg-slate-900 p-6 md:flex">
      <div>
        <h1 className="text-2xl font-bold tracking-wide">
          RELAY<span className="text-teal-400">.</span>
        </h1>

        <p className="mt-2 text-xs text-slate-400">
          YOUR WORLD, CONNECTED.
        </p>

        <nav className="mt-12 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'block w-full rounded-xl px-4 py-3 text-left text-sm transition',
                  isActive
                    ? 'bg-teal-400/10 font-semibold text-teal-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto text-sm text-slate-500">
        Project Relay · Early preview
      </div>
    </aside>
  )
}

import { useAccount } from '@/domain/account/store'
import { BellIcon, MenuIcon } from './icons'

type MobileHeaderProps = {
  onOpenMenu: () => void
  onOpenNotifications: () => void
}

export function MobileHeader({
  onOpenMenu,
  onOpenNotifications,
}: MobileHeaderProps) {
  const account = useAccount()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-5 py-4 backdrop-blur md:hidden">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-slate-300 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <h1 className="text-xl font-bold tracking-wide">
        RELAY<span className="text-teal-400">.</span>
      </h1>

      <button
        type="button"
        onClick={onOpenNotifications}
        aria-label="Open notifications"
        className="relative rounded-lg p-2 text-slate-300 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
      >
        <BellIcon className="h-5 w-5" />
        {account.unreadCount > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-teal-400" />
        )}
      </button>
    </header>
  )
}

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { MobileHeader } from './MobileHeader'
import { MobileNav } from './MobileNav'
import { NotificationPanel } from './NotificationPanel'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar onOpenNotifications={() => setNotificationsOpen(true)} />
      <MobileHeader
        onOpenMenu={() => setMenuOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      <main className="min-h-screen p-5 pb-16 md:ml-72 md:p-10">
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>

      {menuOpen && <MobileNav onClose={() => setMenuOpen(false)} />}
      {notificationsOpen && (
        <NotificationPanel onClose={() => setNotificationsOpen(false)} />
      )}
    </div>
  )
}

import { Outlet } from 'react-router-dom'
import { MobileHeader } from './MobileHeader'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <MobileHeader />

      <main className="p-6 md:ml-64 md:p-10">
        <Outlet />
      </main>
    </div>
  )
}

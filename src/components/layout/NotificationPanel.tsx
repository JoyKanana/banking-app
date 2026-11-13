import { Link } from 'react-router-dom'
import { useAccount } from '@/domain/account/store'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CloseIcon } from './icons'

type NotificationPanelProps = {
  onClose: () => void
}

const toneClasses: Record<string, string> = {
  info: 'border-sky-400/20 bg-sky-400/5 text-sky-300',
  success: 'border-teal-400/20 bg-teal-400/5 text-teal-300',
  warning: 'border-amber-400/20 bg-amber-400/5 text-amber-300',
  danger: 'border-rose-400/20 bg-rose-400/5 text-rose-300',
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const account = useAccount()

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <aside className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-slate-900 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Activity
            </p>
            <h2 className="mt-1 text-xl font-semibold">Notifications</h2>
            <p className="mt-1 text-sm text-slate-400">
              {account.unreadCount} unread across money, payments and services.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="flex items-center justify-between gap-3 border-b border-white/5 px-6 py-3">
          <span className="text-xs text-slate-500">Newest first</span>
          <button
            type="button"
            onClick={account.markAllNotificationsRead}
            disabled={account.unreadCount === 0}
            className="text-xs font-medium text-teal-300 transition hover:text-teal-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark all read
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-3">
            {account.notifications.map((notification) => {
              const content = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-100">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-400" />
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    {notification.body}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                        toneClasses[notification.tone] ?? toneClasses.info,
                      )}
                    >
                      {notification.category}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(notification.date)}
                    </span>
                  </div>
                </>
              )

              return (
                <li key={notification.id}>
                  {notification.href ? (
                    <Link
                      to={notification.href}
                      onClick={() => {
                        account.markNotificationRead(notification.id)
                        onClose()
                      }}
                      className={cn(
                        'block rounded-xl border p-4 transition hover:border-teal-400/30 hover:bg-white/5',
                        notification.read
                          ? 'border-white/5 bg-slate-950/40'
                          : 'border-white/10 bg-slate-950/70',
                      )}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => account.markNotificationRead(notification.id)}
                      className={cn(
                        'w-full rounded-xl border p-4 text-left transition hover:border-teal-400/30 hover:bg-white/5',
                        notification.read
                          ? 'border-white/5 bg-slate-950/40'
                          : 'border-white/10 bg-slate-950/70',
                      )}
                    >
                      {content}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </aside>
    </div>
  )
}

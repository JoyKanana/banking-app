import { cn } from '@/lib/utils'
import { useCreatorStudio } from '../hooks/useCreatorStudioState'
import { CloseIcon } from './icons'

const toneClasses = {
  success: 'border-teal-400/30 bg-teal-400/10 text-teal-200',
  info: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  warning: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
}

export function CreatorStudioToast() {
  const creator = useCreatorStudio()
  const toast = creator.toast

  if (!toast) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur',
        toneClasses[toast.tone],
      )}
    >
      <p className="text-sm font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={creator.dismissToast}
        aria-label="Dismiss notification"
        className="rounded-lg p-1 opacity-60 transition hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

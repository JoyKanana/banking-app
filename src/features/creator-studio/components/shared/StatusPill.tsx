import { cn } from '@/lib/utils'
import type { StatusTone } from '../../lib/tones'

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-teal-400/10 text-teal-300 border-teal-400/30',
  warning: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  danger: 'bg-rose-400/10 text-rose-300 border-rose-400/30',
  neutral: 'bg-white/5 text-slate-400 border-white/10',
  info: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
}

type StatusPillProps = {
  tone: StatusTone
  children: string
}

export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone],
      )}
    >
      <span
        aria-hidden
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          tone === 'success' && 'bg-teal-400',
          tone === 'warning' && 'bg-amber-400',
          tone === 'danger' && 'bg-rose-400',
          tone === 'neutral' && 'bg-slate-500',
          tone === 'info' && 'bg-sky-400',
        )}
      />
      {children}
    </span>
  )
}

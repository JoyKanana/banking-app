import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  children?: ReactNode
  disabled?: boolean
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  children,
  disabled = false,
}: ToggleProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/60 p-4',
        disabled && 'opacity-60',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm font-medium text-slate-200">{label}</span>
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
              'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
              checked
                ? 'border-teal-400/40 bg-teal-400/80'
                : 'border-white/15 bg-slate-800',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition-all',
                checked ? 'left-[22px]' : 'left-0.5',
              )}
            />
          </button>
        </div>

        {description && (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        )}
        {children}
      </div>
    </div>
  )
}

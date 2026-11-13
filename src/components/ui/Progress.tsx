import { cn } from '@/lib/utils'

type ProgressProps = {
  value: number
  max: number
  tone?: 'teal' | 'amber' | 'rose'
  className?: string
  label?: string
}

const tones = {
  teal: 'bg-teal-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
}

export function Progress({
  value,
  max,
  tone = 'teal',
  className,
  label,
}: ProgressProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      className={cn('h-2 overflow-hidden rounded-full bg-white/10', className)}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn('h-full rounded-full transition-all', tones[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

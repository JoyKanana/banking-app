import { Card } from './Card'
import { cn } from '@/lib/utils'

type StatTone = 'default' | 'teal' | 'amber' | 'rose' | 'violet'

type StatProps = {
  label: string
  value: string
  sub?: string
  tone?: StatTone
  className?: string
}

const tones: Record<StatTone, string> = {
  default: 'text-white',
  teal: 'text-teal-300',
  amber: 'text-amber-300',
  rose: 'text-rose-300',
  violet: 'text-violet-300',
}

export function Stat({ label, value, sub, tone = 'default', className }: StatProps) {
  return (
    <Card className={cn('p-5', className)}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={cn('mt-2 text-2xl font-semibold', tones[tone])}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </Card>
  )
}

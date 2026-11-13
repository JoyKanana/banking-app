import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

type StatTone = 'default' | 'teal' | 'amber' | 'rose' | 'violet' | 'sky'

const toneClasses: Record<StatTone, string> = {
  default: 'text-white',
  teal: 'text-teal-300',
  amber: 'text-amber-300',
  rose: 'text-rose-300',
  violet: 'text-violet-300',
  sky: 'text-sky-300',
}

type StatCardProps = {
  label: string
  value: string
  sub?: string
  tone?: StatTone
}

export function StatCard({ label, value, sub, tone = 'default' }: StatCardProps) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={cn('mt-2 text-2xl font-semibold', toneClasses[tone])}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </Card>
  )
}

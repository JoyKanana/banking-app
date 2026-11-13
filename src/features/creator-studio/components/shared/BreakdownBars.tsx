import { formatKes, formatPercent } from '../../lib/format'

type BreakdownItem = {
  label: string
  amount: number
}

type BreakdownBarsProps = {
  items: BreakdownItem[]
}

export function BreakdownBars({ items }: BreakdownBarsProps) {
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const max = Math.max(...items.map((item) => item.amount), 1)

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const share = total > 0 ? (item.amount / total) * 100 : 0

        return (
          <li key={item.label}>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-slate-300">{item.label}</span>
              <span className="text-right">
                <span className="font-medium text-white">
                  {formatKes(item.amount)}
                </span>{' '}
                <span className="text-xs text-slate-500">
                  {formatPercent(share, 0)}
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                style={{ width: `${(item.amount / max) * 100}%` }}
                className="h-full rounded-full bg-gradient-to-r from-teal-500/60 to-teal-300"
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

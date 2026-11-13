import { cn } from '@/lib/utils'
import { formatCompactKes, formatKes } from '../../lib/format'
import type { MonthlyRevenuePoint } from '../../types'

type BarChartProps = {
  points: MonthlyRevenuePoint[]
  highlightLast?: boolean
}

export function BarChart({ points, highlightLast = true }: BarChartProps) {
  const max = Math.max(...points.map((point) => point.revenue), 1)

  return (
    <div>
      <div
        className="flex h-44 items-end gap-1.5 sm:gap-2"
        role="img"
        aria-label="Monthly revenue bar chart"
      >
        {points.map((point, index) => {
          const isLast = highlightLast && index === points.length - 1
          const height = Math.max((point.revenue / max) * 100, 3)

          return (
            <div
              key={point.month}
              className="group flex h-full flex-1 flex-col justify-end"
              title={`${point.label} — ${formatKes(point.revenue)}`}
            >
              <p className="mb-1 hidden text-center text-[10px] font-medium text-slate-400 opacity-0 transition group-hover:opacity-100 lg:block">
                {formatCompactKes(point.revenue)}
              </p>
              <div
                style={{ height: `${height}%` }}
                className={cn(
                  'rounded-t-md transition',
                  isLast
                    ? 'bg-gradient-to-t from-teal-500/50 to-teal-300'
                    : 'bg-gradient-to-t from-slate-700 to-slate-500 group-hover:from-teal-600/40 group-hover:to-teal-400/70',
                )}
              />
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {points.map((point) => (
          <p
            key={point.month}
            className="flex-1 text-center text-[10px] font-medium uppercase tracking-wide text-slate-500"
          >
            {point.label}
          </p>
        ))}
      </div>
    </div>
  )
}

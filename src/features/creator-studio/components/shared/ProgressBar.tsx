import { formatPercent } from '../../lib/format'

type ProgressBarProps = {
  value: number
  max: number
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const percent = Math.min((value / Math.max(max, 1)) * 100, 100)

  return (
    <div
      className="h-2.5 overflow-hidden rounded-full bg-white/5"
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{ width: `${percent}%` }}
        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-300"
      />
      <span className="sr-only">{formatPercent(percent, 0)}</span>
    </div>
  )
}

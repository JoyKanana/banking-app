import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/format'
import type { WishlistStats } from '../types'

type WishlistStatsProps = {
  stats: WishlistStats
}

export function WishlistStats({ stats }: WishlistStatsProps) {
  const items = [
    { label: 'Gifts saved', value: String(stats.giftCount) },
    { label: 'List value', value: formatCurrency(stats.totalValue) },
    { label: 'Received', value: formatCurrency(stats.receivedValue) },
    { label: 'Imported', value: String(stats.importedCount) },
    { label: 'Private links', value: String(stats.privateCount) },
  ]

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label} className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
        </Card>
      ))}
    </div>
  )
}

import type { Gift } from '../types'
import { GiftCard } from './GiftCard'
import { GiftIcon } from './icons'

type GiftGridProps = {
  gifts: Gift[]
  onTogglePin: (giftId: string) => void
  onTogglePrivacy: (giftId: string) => void
}

export function GiftGrid({
  gifts,
  onTogglePin,
  onTogglePrivacy,
}: GiftGridProps) {
  if (gifts.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-slate-900/60 p-12 text-center">
        <GiftIcon className="mx-auto h-8 w-8 text-slate-500" />
        <p className="mt-4 text-sm font-medium text-slate-300">
          No gifts match this view.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Try a different filter or add a new gift to this list.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {gifts.map((gift) => (
        <GiftCard
          key={gift.id}
          gift={gift}
          onTogglePin={onTogglePin}
          onTogglePrivacy={onTogglePrivacy}
        />
      ))}
    </div>
  )
}

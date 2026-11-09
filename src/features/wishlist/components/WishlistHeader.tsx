import { Badge } from '@/components/ui/Badge'
import { ImportIcon, PlusIcon } from './icons'

type WishlistHeaderProps = {
  onAddGift: () => void
  onImportGift: () => void
}

export function WishlistHeader({
  onAddGift,
  onImportGift,
}: WishlistHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <Badge>Wishlist</Badge>
        <h2 className="mt-6 text-3xl font-bold">Plan for what comes next.</h2>
        <p className="mt-3 max-w-xl text-slate-400">
          Collect gifts, cash and experiences across as many lists as you like.
          Private gifts stay off your public profile and are shared by direct
          link only.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onImportGift}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-teal-400/40 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          <ImportIcon className="h-4 w-4" />
          Import gift
        </button>

        <button
          type="button"
          onClick={onAddGift}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <PlusIcon className="h-4 w-4" />
          Add a gift
        </button>
      </div>
    </header>
  )
}

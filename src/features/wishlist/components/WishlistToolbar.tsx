import { cn } from '@/lib/utils'
import type { GiftFilter, GiftSort } from '../types'
import { SearchIcon } from './icons'

type WishlistToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  filter: GiftFilter
  onFilterChange: (filter: GiftFilter) => void
  sort: GiftSort
  onSortChange: (sort: GiftSort) => void
  counts: Record<GiftFilter, number>
}

const filters: { value: GiftFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'received', label: 'Received' },
  { value: 'imported', label: 'Imported' },
  { value: 'private', label: 'Private' },
]

const sortOptions: { value: GiftSort; label: string }[] = [
  { value: 'pinned', label: 'Pinned first' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'price-asc', label: 'Price: low to high' },
]

export function WishlistToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  counts,
}: WishlistToolbarProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative w-full max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search this list"
          aria-label="Search gifts"
          className="w-full rounded-xl border border-white/10 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((item) => {
          const isActive = item.value === filter

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilterChange(item.value)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
                isActive
                  ? 'border-teal-400/40 bg-teal-400/10 text-teal-200'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white',
              )}
            >
              {item.label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-[10px]',
                  isActive
                    ? 'bg-teal-400/15 text-teal-200'
                    : 'bg-white/5 text-slate-500',
                )}
              >
                {counts[item.value]}
              </span>
            </button>
          )
        })}

        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as GiftSort)}
          aria-label="Sort gifts"
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-300 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

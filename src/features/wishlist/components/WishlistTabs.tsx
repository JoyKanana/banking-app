import { useState, type FormEvent } from 'react'
import { cn } from '@/lib/utils'
import type { Wishlist } from '../types'
import { LockIcon, PlusIcon } from './icons'

type WishlistTabsProps = {
  wishlists: Wishlist[]
  activeWishlistId: string
  giftCounts: Record<string, number>
  onSelect: (wishlistId: string) => void
  onCreate: (title: string) => void
}

export function WishlistTabs({
  wishlists,
  activeWishlistId,
  giftCounts,
  onSelect,
  onCreate,
}: WishlistTabsProps) {
  const [isCreating, setCreating] = useState(false)
  const [title, setTitle] = useState('')

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = title.trim()
    if (!trimmed) return

    onCreate(trimmed)
    setTitle('')
    setCreating(false)
  }

  return (
    <div className="mt-8">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {wishlists.map((wishlist) => {
          const isActive = wishlist.id === activeWishlistId

          return (
            <button
              key={wishlist.id}
              type="button"
              onClick={() => onSelect(wishlist.id)}
              aria-pressed={isActive}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
                isActive
                  ? 'border-teal-400/40 bg-teal-400/10 text-teal-100'
                  : 'border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20 hover:text-white',
              )}
            >
              <span aria-hidden>{wishlist.emoji}</span>
              <span className="font-medium">{wishlist.title}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  isActive
                    ? 'bg-teal-400/15 text-teal-200'
                    : 'bg-white/5 text-slate-400',
                )}
              >
                {giftCounts[wishlist.id] ?? 0}
              </span>
              {wishlist.visibility === 'private' && (
                <LockIcon className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setCreating((current) => !current)}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm text-slate-400 transition hover:border-teal-400/40 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          <PlusIcon className="h-4 w-4" />
          New list
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 p-3"
        >
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="List name, e.g. Home studio"
            aria-label="New list name"
            autoFocus
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          />
          <button
            type="submit"
            className="rounded-lg bg-teal-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
          >
            Create list
          </button>
          <button
            type="button"
            onClick={() => {
              setCreating(false)
              setTitle('')
            }}
            className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:text-white"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  )
}

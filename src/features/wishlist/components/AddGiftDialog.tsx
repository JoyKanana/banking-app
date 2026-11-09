import { useEffect, useState, type FormEvent } from 'react'
import { cn } from '@/lib/utils'
import { giftCategories } from '../data/wishlists'
import type { NewGiftInput } from '../hooks/useWishlistState'
import type { GiftKind, Wishlist } from '../types'
import { CloseIcon, LockIcon } from './icons'

type AddGiftDialogProps = {
  wishlists: Wishlist[]
  defaultWishlistId: string
  onClose: () => void
  onAdd: (input: NewGiftInput) => void
}

const kinds: { value: GiftKind; label: string }[] = [
  { value: 'product', label: 'Gift' },
  { value: 'cash', label: 'Cash gift' },
  { value: 'crowdgift', label: 'Crowdgift' },
]

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20'

const labelClass =
  'mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400'

export function AddGiftDialog({
  wishlists,
  defaultWishlistId,
  onClose,
  onAdd,
}: AddGiftDialogProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>(giftCategories[0])
  const [kind, setKind] = useState<GiftKind>('product')
  const [wishlistId, setWishlistId] = useState(defaultWishlistId)
  const [isPrivate, setPrivate] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const amount = Number(price)
    const trimmedName = name.trim()

    if (!trimmedName || !Number.isFinite(amount) || amount <= 0) return

    onAdd({
      name: trimmedName,
      description:
        description.trim() || 'A gift saved to this Relay wishlist.',
      price: amount,
      category,
      kind,
      wishlistId,
      private: isPrivate,
    })

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-gift-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="add-gift-title" className="text-xl font-semibold">
              Add a gift
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Save something you would love to receive.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="gift-name" className={labelClass}>
              Gift name
            </label>
            <input
              id="gift-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Mirrorless camera"
              required
              autoFocus
              className={fieldClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="gift-price" className={labelClass}>
                Price (USD)
              </label>
              <input
                id="gift-price"
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="150"
                min={1}
                step={1}
                required
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="gift-category" className={labelClass}>
                Category
              </label>
              <select
                id="gift-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={fieldClass}
              >
                {giftCategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="gift-wishlist" className={labelClass}>
              Wishlist
            </label>
            <select
              id="gift-wishlist"
              value={wishlistId}
              onChange={(event) => setWishlistId(event.target.value)}
              className={fieldClass}
            >
              {wishlists.map((wishlist) => (
                <option key={wishlist.id} value={wishlist.id}>
                  {wishlist.title}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className={labelClass}>Gift type</legend>
            <div className="grid grid-cols-3 gap-2">
              {kinds.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setKind(option.value)}
                  aria-pressed={kind === option.value}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
                    kind === option.value
                      ? 'border-teal-400/40 bg-teal-400/10 text-teal-200'
                      : 'border-white/10 bg-slate-950 text-slate-400 hover:text-white',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="gift-description" className={labelClass}>
              Description <span className="normal-case">(optional)</span>
            </label>
            <textarea
              id="gift-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a note about size, colour or why you want it."
              rows={3}
              className={cn(fieldClass, 'resize-none')}
            />
          </div>

          <label
            htmlFor="gift-private"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-slate-950 p-3"
          >
            <input
              id="gift-private"
              type="checkbox"
              checked={isPrivate}
              onChange={(event) => setPrivate(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900 accent-teal-400"
            />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-200">
                <LockIcon className="h-3.5 w-3.5" />
                Keep this gift private
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Private gifts stay off your public profile and are reachable
                only through a direct link.
              </span>
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Add gift
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

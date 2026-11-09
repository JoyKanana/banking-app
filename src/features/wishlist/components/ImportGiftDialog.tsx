import { useEffect, useState, type FormEvent } from 'react'
import { cn } from '@/lib/utils'
import { giftCategories } from '../data/wishlists'
import { getRetailer, retailers } from '../data/retailers'
import type { NewGiftInput } from '../hooks/useWishlistState'
import type { Wishlist } from '../types'
import { CloseIcon, ImportIcon, LockIcon } from './icons'

type ImportGiftDialogProps = {
  wishlists: Wishlist[]
  defaultWishlistId: string
  onClose: () => void
  onImport: (input: NewGiftInput) => void
}

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20'

const labelClass =
  'mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400'

function getHostname(value: string): string | undefined {
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

function detectRetailer(value: string) {
  const hostname = getHostname(value)
  if (!hostname) return undefined

  return retailers.find(
    (retailer) => retailer.domain && hostname.endsWith(retailer.domain),
  )
}

export function ImportGiftDialog({
  wishlists,
  defaultWishlistId,
  onClose,
  onImport,
}: ImportGiftDialogProps) {
  const [storeId, setStoreId] = useState('amazon')
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>(giftCategories[0])
  const [wishlistId, setWishlistId] = useState(defaultWishlistId)
  const [isPrivate, setPrivate] = useState(false)
  const [error, setError] = useState('')

  const selectedRetailer = getRetailer(storeId)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleUrlChange(value: string) {
    setUrl(value)
    setError('')

    const detected = detectRetailer(value)
    if (detected && detected.id !== 'other') setStoreId(detected.id)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedUrl = url.trim()
    const amount = Number(price)
    const hostname = getHostname(trimmedUrl)

    if (!trimmedName || !Number.isFinite(amount) || amount <= 0) return

    if (!hostname) {
      setError('Enter a valid product link, including https://.')
      return
    }

    if (
      selectedRetailer?.domain &&
      !hostname.endsWith(selectedRetailer.domain)
    ) {
      setError(
        `That link does not look like a ${selectedRetailer.name} product URL.`,
      )
      return
    }

    onImport({
      name: trimmedName,
      description:
        description.trim() ||
        `Imported from ${selectedRetailer?.name ?? 'a store'}.`,
      price: amount,
      category,
      kind: 'product',
      wishlistId,
      private: isPrivate,
      storeId,
      sourceUrl: trimmedUrl,
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
        aria-labelledby="import-gift-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              id="import-gift-title"
              className="flex items-center gap-2 text-xl font-semibold"
            >
              <ImportIcon className="h-5 w-5 text-teal-300" />
              Import a gift
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Bring in a product from a store you already shop at.
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
          <fieldset>
            <legend className={labelClass}>Store</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {retailers.map((retailer) => (
                <button
                  key={retailer.id}
                  type="button"
                  onClick={() => {
                    setStoreId(retailer.id)
                    setError('')
                  }}
                  aria-pressed={storeId === retailer.id}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
                    storeId === retailer.id
                      ? 'border-teal-400/40 bg-teal-400/10 text-teal-100'
                      : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20 hover:text-white',
                  )}
                >
                  <span aria-hidden>{retailer.emoji}</span>
                  <span className="truncate">{retailer.name}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="import-url" className={labelClass}>
              Product link
            </label>
            <input
              id="import-url"
              type="url"
              value={url}
              onChange={(event) => handleUrlChange(event.target.value)}
              placeholder={selectedRetailer?.exampleUrl ?? 'https://...'}
              required
              className={fieldClass}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Relay keeps the original link with the gift. Product details are
              entered manually in this preview.
            </p>
          </div>

          <div>
            <label htmlFor="import-name" className={labelClass}>
              Gift name
            </label>
            <input
              id="import-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Linen blend co-ord set"
              required
              className={fieldClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="import-price" className={labelClass}>
                Price (USD)
              </label>
              <input
                id="import-price"
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="68"
                min={1}
                step={1}
                required
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="import-category" className={labelClass}>
                Category
              </label>
              <select
                id="import-category"
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
            <label htmlFor="import-wishlist" className={labelClass}>
              Wishlist
            </label>
            <select
              id="import-wishlist"
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

          <div>
            <label htmlFor="import-description" className={labelClass}>
              Description <span className="normal-case">(optional)</span>
            </label>
            <textarea
              id="import-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a note about size, colour or why you want it."
              rows={2}
              className={cn(fieldClass, 'resize-none')}
            />
          </div>

          <label
            htmlFor="import-private"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-slate-950 p-3"
          >
            <input
              id="import-private"
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

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-300"
            >
              {error}
            </p>
          )}

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
              className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <ImportIcon className="h-4 w-4" />
              Import gift
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

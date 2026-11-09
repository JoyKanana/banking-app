import { useState } from 'react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { getRetailer } from '../data/retailers'
import type { Gift } from '../types'
import { ExternalLinkIcon, GiftIcon, ImportIcon } from './icons'

type ImportedGiftsSectionProps = {
  gifts: Gift[]
  onImport: () => void
}

export function ImportedGiftsSection({
  gifts,
  onImport,
}: ImportedGiftsSectionProps) {
  const [activeStoreId, setActiveStoreId] = useState('all')

  const storeGroups = gifts.reduce<
    { retailerId: string; name: string; emoji: string; count: number }[]
  >((groups, gift) => {
    if (!gift.storeId) return groups

    const retailer = getRetailer(gift.storeId)
    if (!retailer) return groups

    const existing = groups.find((group) => group.retailerId === retailer.id)

    if (existing) {
      existing.count += 1
    } else {
      groups.push({
        retailerId: retailer.id,
        name: retailer.name,
        emoji: retailer.emoji,
        count: 1,
      })
    }

    return groups
  }, [])

  const effectiveStoreId = storeGroups.some(
    (group) => group.retailerId === activeStoreId,
  )
    ? activeStoreId
    : 'all'

  const visibleGifts =
    effectiveStoreId === 'all'
      ? gifts
      : gifts.filter((gift) => gift.storeId === effectiveStoreId)

  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-teal-300">
            Imported
          </p>
          <h3 className="mt-1 text-xl font-semibold">Imported from stores</h3>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Gifts added from Amazon, SHEIN, Alibaba, Throne and other stores.
            The original product link stays attached.
          </p>
        </div>

        <button
          type="button"
          onClick={onImport}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-teal-400/40 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          <ImportIcon className="h-4 w-4" />
          Import gift
        </button>
      </div>

      {gifts.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-white/15 bg-slate-950/30 p-8 text-center">
          <GiftIcon className="mx-auto h-7 w-7 text-slate-500" />
          <p className="mt-3 text-sm font-medium text-slate-300">
            No imported gifts in this list yet.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Bring in something from Amazon, SHEIN, Alibaba, Throne or another
            store.
          </p>
          <button
            type="button"
            onClick={onImport}
            className="mt-4 rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Import your first gift
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveStoreId('all')}
              aria-pressed={effectiveStoreId === 'all'}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
                effectiveStoreId === 'all'
                  ? 'border-teal-400/40 bg-teal-400/10 text-teal-200'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white',
              )}
            >
              All stores
              <span className="rounded-full bg-white/5 px-1.5 text-[10px] text-slate-400">
                {gifts.length}
              </span>
            </button>

            {storeGroups.map((group) => {
              const isActive = effectiveStoreId === group.retailerId

              return (
                <button
                  key={group.retailerId}
                  type="button"
                  onClick={() => setActiveStoreId(group.retailerId)}
                  aria-pressed={isActive}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
                    isActive
                      ? 'border-teal-400/40 bg-teal-400/10 text-teal-200'
                      : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white',
                  )}
                >
                  <span aria-hidden>{group.emoji}</span>
                  {group.name}
                  <span className="rounded-full bg-white/5 px-1.5 text-[10px] text-slate-400">
                    {group.count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {visibleGifts.map((gift) => {
              const retailer = getRetailer(gift.storeId)

              return (
                <div
                  key={gift.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg"
                    aria-hidden
                  >
                    {gift.emoji}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {gift.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      {retailer && (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                            retailer.badgeClass,
                          )}
                        >
                          <span aria-hidden>{retailer.emoji}</span>
                          {retailer.name}
                        </span>
                      )}
                      <span>{formatCurrency(gift.price)}</span>
                      {gift.private && <span>· Private</span>}
                    </div>
                  </div>

                  {gift.status === 'received' ? (
                    <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
                      Received
                    </span>
                  ) : (
                    gift.sourceUrl && (
                      <a
                        href={gift.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`View ${gift.name} on ${retailer?.name ?? 'store'}`}
                        title={`View on ${retailer?.name ?? 'store'}`}
                        className="shrink-0 rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-teal-400/40 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
                      >
                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                      </a>
                    )
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}

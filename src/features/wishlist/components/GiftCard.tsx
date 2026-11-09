import { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { getRetailer } from '../data/retailers'
import type { Gift, GiftKind } from '../types'
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  GlobeIcon,
  LockIcon,
  PinIcon,
} from './icons'

type GiftCardProps = {
  gift: Gift
  onTogglePin: (giftId: string) => void
  onTogglePrivacy: (giftId: string) => void
}

const categoryStyles: Record<string, string> = {
  Tech: 'from-sky-500/25 via-slate-900 to-slate-900',
  Music: 'from-violet-500/25 via-slate-900 to-slate-900',
  Home: 'from-amber-500/20 via-slate-900 to-slate-900',
  Art: 'from-rose-500/25 via-slate-900 to-slate-900',
  Fashion: 'from-fuchsia-500/20 via-slate-900 to-slate-900',
  Travel: 'from-emerald-500/20 via-slate-900 to-slate-900',
  Gaming: 'from-indigo-500/25 via-slate-900 to-slate-900',
  Beauty: 'from-pink-500/20 via-slate-900 to-slate-900',
  Fitness: 'from-lime-500/20 via-slate-900 to-slate-900',
  Lifestyle: 'from-teal-500/20 via-slate-900 to-slate-900',
}

const kindLabels: Record<GiftKind, string> = {
  product: 'Gift',
  cash: 'Cash gift',
  crowdgift: 'Crowdgift',
}

export function GiftCard({ gift, onTogglePin, onTogglePrivacy }: GiftCardProps) {
  const [copied, setCopied] = useState(false)
  const retailer = getRetailer(gift.storeId)

  const progress =
    gift.kind === 'crowdgift' && gift.price > 0
      ? Math.min(100, Math.round((gift.funded / gift.price) * 100))
      : 0

  function handleCopyLink() {
    const clipboard = navigator.clipboard
    if (!clipboard) return

    const url = `${window.location.origin}/wishlist?gift=${gift.id}`

    clipboard
      .writeText(url)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      })
      .catch(() => {
        setCopied(false)
      })
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition hover:-translate-y-0.5 hover:border-white/20">
      <div
        className={cn(
          'relative flex h-36 items-center justify-center bg-gradient-to-br',
          categoryStyles[gift.category] ??
            'from-slate-700/40 via-slate-900 to-slate-900',
        )}
      >
        <span className="text-5xl drop-shadow-lg" aria-hidden>
          {gift.emoji}
        </span>

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {retailer ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                retailer.badgeClass,
              )}
            >
              <span aria-hidden>{retailer.emoji}</span>
              {retailer.name}
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-slate-950/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-300 backdrop-blur">
              {kindLabels[gift.kind]}
            </span>
          )}

          {gift.status === 'received' && (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
              Received
            </span>
          )}

          {gift.private && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300">
              <LockIcon className="h-2.5 w-2.5" />
              Private
            </span>
          )}
        </div>

        <div className="absolute right-2 top-2 flex gap-1">
          <button
            type="button"
            onClick={() => onTogglePin(gift.id)}
            aria-pressed={gift.pinned}
            aria-label={gift.pinned ? 'Unpin gift' : 'Pin gift'}
            title={gift.pinned ? 'Unpin gift' : 'Pin gift'}
            className={cn(
              'rounded-lg border p-2 backdrop-blur transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
              gift.pinned
                ? 'border-teal-400/40 bg-teal-400/15 text-teal-300'
                : 'border-white/10 bg-slate-950/70 text-slate-300 hover:text-white',
            )}
          >
            <PinIcon className="h-4 w-4" filled={gift.pinned} />
          </button>

          <button
            type="button"
            onClick={() => onTogglePrivacy(gift.id)}
            aria-pressed={gift.private}
            aria-label={
              gift.private ? 'Make gift public' : 'Make gift private'
            }
            title={gift.private ? 'Make gift public' : 'Make gift private'}
            className={cn(
              'rounded-lg border p-2 backdrop-blur transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
              gift.private
                ? 'border-amber-400/40 bg-amber-400/15 text-amber-300'
                : 'border-white/10 bg-slate-950/70 text-slate-300 hover:text-white',
            )}
          >
            {gift.private ? (
              <LockIcon className="h-4 w-4" />
            ) : (
              <GlobeIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {gift.category}
        </p>
        <h4 className="mt-1 text-lg font-semibold text-white">{gift.name}</h4>
        <p className="mt-2 line-clamp-2 text-sm text-slate-400">
          {gift.description}
        </p>

        {gift.kind === 'crowdgift' && gift.status !== 'received' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                {formatCurrency(gift.funded)} of {formatCurrency(gift.price)}
              </span>
              <span>{progress}%</span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${gift.name} funding progress`}
            >
              <div
                className="h-full rounded-full bg-teal-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(gift.price)}
            </p>
            {retailer && gift.sourceUrl && (
              <a
                href={gift.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 transition hover:text-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              >
                View on {retailer.name}
                <ExternalLinkIcon className="h-3 w-3" />
              </a>
            )}
            {gift.private && (
              <p className="mt-0.5 text-xs text-slate-500">
                Private · link only
              </p>
            )}
          </div>

          {gift.private && (
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-teal-400/40 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              {copied ? (
                <CheckIcon className="h-3.5 w-3.5" />
              ) : (
                <CopyIcon className="h-3.5 w-3.5" />
              )}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

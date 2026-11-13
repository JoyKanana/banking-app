import { useEffect, useState, type FormEvent } from 'react'
import { formatKes } from '../../lib/format'
import type { PayoutDestination, PayoutRequestInput } from '../../types'
import { CloseIcon } from '../icons'
import { fieldClass, labelClass, primaryButtonClass, secondaryButtonClass } from './formStyles'

type PayoutRequestDialogProps = {
  available: number
  destinations: PayoutDestination[]
  onClose: () => void
  onRequest: (input: PayoutRequestInput) => boolean
}

function estimateFee(amount: number): number {
  return Math.max(30, Math.round(amount * 0.0075))
}

export function PayoutRequestDialog({
  available,
  destinations,
  onClose,
  onRequest,
}: PayoutRequestDialogProps) {
  const eligibleDestinations = destinations.filter(
    (destination) => destination.verified,
  )
  const [amount, setAmount] = useState('')
  const [destinationId, setDestinationId] = useState(
    eligibleDestinations[0]?.id ?? '',
  )

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const parsedAmount = Number(amount)
  const hasAmount =
    amount.trim() !== '' && Number.isFinite(parsedAmount) && parsedAmount > 0
  const fee = hasAmount ? estimateFee(parsedAmount) : 0
  const exceedsBalance = hasAmount && parsedAmount > available

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasAmount || !destinationId || exceedsBalance) return

    const accepted = onRequest({ amount: parsedAmount, destinationId })
    if (accepted) onClose()
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
        aria-labelledby="payout-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="payout-title" className="text-xl font-semibold">
              Request a payout
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Withdraw your available creator balance.
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
          <p className="rounded-xl border border-teal-400/20 bg-teal-400/5 px-4 py-3 text-sm text-teal-200">
            Available to withdraw: {formatKes(available)}
          </p>

          <div>
            <label htmlFor="payout-amount" className={labelClass}>
              Amount (KES)
            </label>
            <input
              id="payout-amount"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="50000"
              min={1}
              max={available}
              step={1}
              required
              autoFocus
              className={fieldClass}
            />
            {exceedsBalance && (
              <p className="mt-1.5 text-xs text-rose-300">
                This is more than your available balance.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="payout-destination" className={labelClass}>
              Destination
            </label>
            <select
              id="payout-destination"
              value={destinationId}
              onChange={(event) => setDestinationId(event.target.value)}
              className={fieldClass}
            >
              {eligibleDestinations.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.label} — {destination.detail}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Payout</span>
              <span className="text-white">
                {hasAmount ? formatKes(parsedAmount) : '—'}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-slate-400">
              <span>Withdrawal fee</span>
              <span>{hasAmount ? `− ${formatKes(fee)}` : '−'}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-medium">
              <span className="text-slate-300">You receive</span>
              <span className="text-teal-300">
                {hasAmount ? formatKes(parsedAmount - fee) : '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={secondaryButtonClass}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasAmount || exceedsBalance || !destinationId}
              className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Request payout
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import { incomeSourceOptions } from '../../lib/labels'
import type { NewPaymentLinkInput } from '../../types'
import { CloseIcon } from '../icons'
import { fieldClass, labelClass, primaryButtonClass, secondaryButtonClass } from './formStyles'

type NewPaymentLinkDialogProps = {
  onClose: () => void
  onCreate: (input: NewPaymentLinkInput) => void
}

export function NewPaymentLinkDialog({
  onClose,
  onCreate,
}: NewPaymentLinkDialogProps) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState(incomeSourceOptions[0].value)
  const [description, setDescription] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const parsedAmount = Number(amount)
    const hasAmount = amount.trim() !== '' && Number.isFinite(parsedAmount)

    onCreate({
      title: trimmedTitle,
      amount: hasAmount && parsedAmount > 0 ? parsedAmount : null,
      source,
      description: description.trim() || 'Collect a payment for your work.',
      expiresAt: expiresAt || undefined,
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
        aria-labelledby="new-link-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="new-link-title" className="text-xl font-semibold">
              New payment link
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Share a link and get paid by card, M-PESA or wallet.
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
            <label htmlFor="link-title" className={labelClass}>
              Link title
            </label>
            <input
              id="link-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Website design deposit"
              required
              autoFocus
              className={fieldClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="link-amount" className={labelClass}>
                Amount (KES){' '}
                <span className="normal-case">(optional)</span>
              </label>
              <input
                id="link-amount"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Leave blank for any amount"
                min={1}
                step={1}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="link-source" className={labelClass}>
                Income source
              </label>
              <select
                id="link-source"
                value={source}
                onChange={(event) =>
                  setSource(event.target.value as typeof source)
                }
                className={fieldClass}
              >
                {incomeSourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="link-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="link-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is the customer paying for?"
              rows={3}
              className={`${fieldClass} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="link-expiry" className={labelClass}>
              Expires on <span className="normal-case">(optional)</span>
            </label>
            <input
              id="link-expiry"
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={secondaryButtonClass}>
              Cancel
            </button>
            <button type="submit" className={primaryButtonClass}>
              Create link
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

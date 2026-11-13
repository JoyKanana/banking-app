import { useEffect, useState, type FormEvent } from 'react'
import type { NewInvoiceInput } from '../../types'
import { CloseIcon } from '../icons'
import { fieldClass, labelClass, primaryButtonClass, secondaryButtonClass } from './formStyles'

type NewInvoiceDialogProps = {
  onClose: () => void
  onCreate: (input: NewInvoiceInput) => void
}

export function NewInvoiceDialog({ onClose, onCreate }: NewInvoiceDialogProps) {
  const [customerName, setCustomerName] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [taxRate, setTaxRate] = useState('0')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedCustomer = customerName.trim()
    const trimmedDescription = description.trim()
    const parsedAmount = Number(amount)
    const parsedTax = Number(taxRate)
    const trimmedDueDate = dueDate.trim()

    if (
      !trimmedCustomer ||
      !trimmedDescription ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !trimmedDueDate
    ) {
      return
    }

    onCreate({
      customerName: trimmedCustomer,
      description: trimmedDescription,
      amount: parsedAmount,
      taxRate: Number.isFinite(parsedTax) ? parsedTax : 0,
      dueDate: trimmedDueDate,
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
        aria-labelledby="new-invoice-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="new-invoice-title" className="text-xl font-semibold">
              New invoice
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Bill a client for services, bookings or sponsorships.
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
            <label htmlFor="invoice-customer" className={labelClass}>
              Customer
            </label>
            <input
              id="invoice-customer"
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="e.g. Equity Bank"
              required
              autoFocus
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="invoice-description" className={labelClass}>
              Description
            </label>
            <input
              id="invoice-description"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Workshop facilitation"
              required
              className={fieldClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="invoice-amount" className={labelClass}>
                Amount (KES)
              </label>
              <input
                id="invoice-amount"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="45000"
                min={1}
                step={1}
                required
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="invoice-tax" className={labelClass}>
                Tax rate (%)
              </label>
              <input
                id="invoice-tax"
                type="number"
                value={taxRate}
                onChange={(event) => setTaxRate(event.target.value)}
                placeholder="0"
                min={0}
                max={100}
                step={0.5}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="invoice-due" className={labelClass}>
                Due date
              </label>
              <input
                id="invoice-due"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
                className={fieldClass}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={secondaryButtonClass}>
              Cancel
            </button>
            <button type="submit" className={primaryButtonClass}>
              Create invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

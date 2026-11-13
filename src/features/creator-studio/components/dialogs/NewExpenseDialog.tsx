import { useEffect, useState, type FormEvent } from 'react'
import { expenseCategoryOptions } from '../../lib/labels'
import type { NewExpenseInput } from '../../types'
import { CloseIcon } from '../icons'
import { fieldClass, labelClass, primaryButtonClass, secondaryButtonClass } from './formStyles'

type NewExpenseDialogProps = {
  onClose: () => void
  onAdd: (input: NewExpenseInput) => void
}

export function NewExpenseDialog({ onClose, onAdd }: NewExpenseDialogProps) {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(expenseCategoryOptions[0].value)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('2026-11-09')
  const [deductible, setDeductible] = useState(true)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedDescription = description.trim()
    const parsedAmount = Number(amount)
    const trimmedDate = date.trim()

    if (
      !trimmedDescription ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !trimmedDate
    ) {
      return
    }

    onAdd({
      description: trimmedDescription,
      category,
      amount: parsedAmount,
      date: trimmedDate,
      deductible,
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
        aria-labelledby="new-expense-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="new-expense-title" className="text-xl font-semibold">
              Add an expense
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Track business costs to see true monthly profit.
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
            <label htmlFor="expense-description" className={labelClass}>
              Description
            </label>
            <input
              id="expense-description"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Studio rent — November"
              required
              autoFocus
              className={fieldClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="expense-amount" className={labelClass}>
                Amount (KES)
              </label>
              <input
                id="expense-amount"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="18000"
                min={1}
                step={1}
                required
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="expense-category" className={labelClass}>
                Category
              </label>
              <select
                id="expense-category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as typeof category)
                }
                className={fieldClass}
              >
                {expenseCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="expense-date" className={labelClass}>
                Date
              </label>
              <input
                id="expense-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                className={fieldClass}
              />
            </div>
          </div>

          <label
            htmlFor="expense-deductible"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-slate-950 p-3"
          >
            <input
              id="expense-deductible"
              type="checkbox"
              checked={deductible}
              onChange={(event) => setDeductible(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900 accent-teal-400"
            />
            <span>
              <span className="block text-sm font-medium text-slate-200">
                Business expense for tax purposes
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Include this expense in tax-related reports.
              </span>
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={secondaryButtonClass}>
              Cancel
            </button>
            <button type="submit" className={primaryButtonClass}>
              Add expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

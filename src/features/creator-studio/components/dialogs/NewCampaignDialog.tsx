import { useEffect, useState, type FormEvent } from 'react'
import type { NewCampaignInput } from '../../types'
import { CloseIcon } from '../icons'
import { fieldClass, labelClass, primaryButtonClass, secondaryButtonClass } from './formStyles'

type NewCampaignDialogProps = {
  onClose: () => void
  onCreate: (input: NewCampaignInput) => void
}

export function NewCampaignDialog({
  onClose,
  onCreate,
}: NewCampaignDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')
  const [deadline, setDeadline] = useState('')
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

    const trimmedTitle = title.trim()
    const parsedGoal = Number(goal)
    const trimmedDeadline = deadline.trim()

    if (
      !trimmedTitle ||
      !Number.isFinite(parsedGoal) ||
      parsedGoal <= 0 ||
      !trimmedDeadline
    ) {
      return
    }

    onCreate({
      title: trimmedTitle,
      description: description.trim() || 'A new fundraising campaign.',
      goal: parsedGoal,
      deadline: trimmedDeadline,
      isPrivate,
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
        aria-labelledby="new-campaign-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="new-campaign-title" className="text-xl font-semibold">
              New campaign
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Raise money towards a goal with a public contribution page.
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
            <label htmlFor="campaign-title" className={labelClass}>
              Campaign title
            </label>
            <input
              id="campaign-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Podcast equipment upgrade"
              required
              autoFocus
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="campaign-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="campaign-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell supporters what the money will do."
              rows={3}
              className={`${fieldClass} resize-none`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="campaign-goal" className={labelClass}>
                Goal (KES)
              </label>
              <input
                id="campaign-goal"
                type="number"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="250000"
                min={1}
                step={1}
                required
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="campaign-deadline" className={labelClass}>
                Deadline
              </label>
              <input
                id="campaign-deadline"
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                required
                className={fieldClass}
              />
            </div>
          </div>

          <label
            htmlFor="campaign-private"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-slate-950 p-3"
          >
            <input
              id="campaign-private"
              type="checkbox"
              checked={isPrivate}
              onChange={(event) => setPrivate(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900 accent-teal-400"
            />
            <span>
              <span className="block text-sm font-medium text-slate-200">
                Private campaign
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Only people with the direct link can contribute.
              </span>
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={secondaryButtonClass}>
              Cancel
            </button>
            <button type="submit" className={primaryButtonClass}>
              Create campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

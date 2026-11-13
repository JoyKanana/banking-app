import { useState, type FormEvent } from 'react'
import { Badge, Card } from '@/components/ui'
import { formatDate, formatKes, formatNumber } from '../../lib/format'
import { methodLabels } from '../../lib/labels'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import { Avatar, ProgressBar, SectionHeading, StatCard } from '../shared'

export function TipsSection() {
  const creator = useCreatorStudio()
  const { tips, goal, contributeToGoal } = creator

  const [customAmount, setCustomAmount] = useState('')

  const totalTips = tips.reduce((sum, tip) => sum + tip.amount, 0)
  const recurringSupporters = tips.filter((tip) => tip.recurring).length
  const anonymousTips = tips.filter((tip) => tip.anonymous).length

  const goalPercent = Math.round((goal.raised / goal.target) * 100)

  function handleContribute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAmount = Number(customAmount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return

    contributeToGoal(parsedAmount)
    setCustomAmount('')
  }

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Tips & gifts"
        description="One-off and recurring contributions from your supporters, with optional messages."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Tips recorded" value={formatNumber(tips.length)} />
        <StatCard label="Total tips" value={formatKes(totalTips)} tone="teal" />
        <StatCard
          label="Recurring supporters"
          value={String(recurringSupporters)}
          sub="Monthly giving"
        />
        <StatCard label="Anonymous" value={String(anonymousTips)} sub="Privacy respected" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white">{goal.title}</h3>
              <p className="mt-1 text-sm text-slate-400">
                Contribution goal ·{' '}
                <span className="font-mono text-teal-300">
                  relay.app/pay/{goal.pageSlug}
                </span>
              </p>
            </div>
            <Badge className="px-3 py-1 text-xs">
              {goal.thankYouEnabled ? 'Thank-yous on' : 'Thank-yous off'}
            </Badge>
          </div>

          <div className="mt-6">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-2xl font-bold text-teal-300">
                {formatKes(goal.raised)}
              </span>
              <span className="text-slate-400">
                of {formatKes(goal.target)} · {goalPercent}%
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar value={goal.raised} max={goal.target} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {formatNumber(goal.contributors)} contributors
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Preset tip amounts
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {goal.presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => contributeToGoal(preset)}
                  className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-teal-400/40 hover:bg-teal-400/10 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
                >
                  {formatKes(preset)}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleContribute} className="mt-4 flex gap-2">
            <input
              type="number"
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
              placeholder="Custom amount (KES)"
              min={1}
              step={1}
              aria-label="Custom contribution amount"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
            <button
              type="submit"
              className="rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              Record
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-500">
            Recording a contribution adds it to the ledger and your main wallet
            balance.
          </p>
        </Card>

        <Card>
          <h3 className="font-semibold text-white">Supporter messages</h3>
          <p className="mt-1 text-sm text-slate-400">
            Every tip with its note and payment method.
          </p>

          <ul className="mt-4 space-y-3">
            {tips.map((tip) => (
              <li
                key={tip.id}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-slate-950/60 p-3"
              >
                <Avatar name={tip.supporterName} size="sm" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-slate-200">
                      {tip.supporterName}
                    </p>
                    <p className="text-sm font-semibold text-teal-300">
                      {formatKes(tip.amount)}
                    </p>
                  </div>
                  {tip.message && (
                    <p className="mt-1 text-xs text-slate-400">
                      “{tip.message}”
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-slate-500">
                    {formatDate(tip.date)} · {methodLabels[tip.method]}
                    {tip.recurring && ' · recurring'}
                    {tip.anonymous && ' · anonymous'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  )
}

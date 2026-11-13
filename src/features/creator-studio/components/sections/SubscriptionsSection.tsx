import { Badge, Card } from '@/components/ui'
import { formatDate, formatKes, formatNumber } from '../../lib/format'
import { subscriberStatusTones } from '../../lib/tones'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import { SectionHeading, StatCard, StatusPill } from '../shared'

const toneStyles: Record<string, string> = {
  teal: 'border-teal-400/30 bg-teal-400/5',
  violet: 'border-violet-400/30 bg-violet-400/5',
  amber: 'border-amber-400/30 bg-amber-400/5',
}

export function SubscriptionsSection() {
  const creator = useCreatorStudio()
  const { plans, subscribers } = creator

  const activeMembers = subscribers.filter(
    (subscriber) => subscriber.status === 'active',
  ).length
  const pastDue = subscribers.filter(
    (subscriber) => subscriber.status === 'past_due',
  ).length
  const cancelled = subscribers.filter(
    (subscriber) => subscriber.status === 'cancelled',
  ).length

  const monthlyRecurringRevenue = plans.reduce((sum, plan) => {
    const monthlyPrice =
      plan.interval === 'month' ? plan.price : plan.price / 12

    return sum + monthlyPrice * plan.members
  }, 0)

  const retention =
    subscribers.length > 0
      ? (activeMembers / subscribers.length) * 100
      : 100

  const planNameById = new Map(plans.map((plan) => [plan.id, plan.name]))

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Subscriptions"
        description="Membership plans and recurring income from your community."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Active members"
          value={formatNumber(activeMembers)}
          sub={`${formatNumber(subscribers.length)} lifetime`}
          tone="teal"
        />
        <StatCard
          label="Monthly recurring"
          value={formatKes(monthlyRecurringRevenue)}
          sub="Across all plans"
        />
        <StatCard
          label="Retention"
          value={`${retention.toFixed(1)}%`}
          sub={`${cancelled} cancelled lifetime`}
          tone={retention > 80 ? 'teal' : 'amber'}
        />
        <StatCard
          label="Past due"
          value={String(pastDue)}
          sub="Retry payment queued"
          tone={pastDue > 0 ? 'rose' : 'default'}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`p-5 ${toneStyles[plan.tone] ?? toneStyles.teal}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">{plan.name}</h3>
              <Badge className="px-3 py-1 text-xs">
                {plan.interval === 'month' ? 'Monthly' : 'Annual'}
              </Badge>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {plan.price === 0 ? 'Free' : formatKes(plan.price)}
              {plan.price > 0 && (
                <span className="text-sm font-normal text-slate-400">
                  /{plan.interval}
                </span>
              )}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {formatNumber(plan.members)} members
            </p>

            <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
              {plan.perks.map((perk) => (
                <li key={perk} className="text-xs text-slate-300">
                  {perk}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold text-white">Subscribers</h3>
        <p className="mt-1 text-sm text-slate-400">
          Renewals, failed payments and member history.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 pr-4 font-medium">Member</th>
                <th className="pb-3 pr-4 font-medium">Plan</th>
                <th className="pb-3 pr-4 font-medium">Since</th>
                <th className="pb-3 pr-4 font-medium">Renews</th>
                <th className="pb-3 pr-4 text-right font-medium">Paid</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-slate-200">
                      {subscriber.name}
                    </p>
                    <p className="text-xs text-slate-500">{subscriber.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-slate-300">
                    {planNameById.get(subscriber.planId) ?? subscriber.planId}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">
                    {formatDate(subscriber.since)}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">
                    {formatDate(subscriber.renewsAt)}
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-white">
                    {formatKes(subscriber.totalPaid)}
                  </td>
                  <td className="py-3">
                    <StatusPill tone={subscriberStatusTones[subscriber.status]}>
                      {subscriber.status === 'past_due'
                        ? 'Past due'
                        : subscriber.status === 'active'
                          ? 'Active'
                          : 'Cancelled'}
                    </StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  )
}

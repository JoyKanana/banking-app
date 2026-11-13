import { Badge, Card } from '@/components/ui'
import { sponsorships } from '../../data/creatorStudio'
import { formatDate, formatKes, formatNumber } from '../../lib/format'
import { sponsorshipStatusLabels } from '../../lib/labels'
import { sponsorshipStatusTones } from '../../lib/tones'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import { SectionHeading, StatCard, StatusPill } from '../shared'

export function PartnershipsSection() {
  const creator = useCreatorStudio()
  const { profile } = creator

  const pipeline = sponsorships
    .filter(
      (deal) =>
        deal.status === 'negotiating' ||
        deal.status === 'contracted' ||
        deal.status === 'in-progress',
    )
    .reduce((sum, deal) => sum + deal.value, 0)
  const paidTotal = sponsorships
    .filter((deal) => deal.status === 'paid')
    .reduce((sum, deal) => sum + deal.value, 0)
  const overdueTotal = sponsorships
    .filter((deal) => deal.status === 'overdue')
    .reduce((sum, deal) => sum + deal.value, 0)

  const topPortfolio = profile.portfolio.slice(0, 3)

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Partnerships"
        description="Brand deals, sponsorships and collaboration payments — from contract to payout."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pipeline value" value={formatKes(pipeline)} tone="sky" />
        <StatCard label="Paid sponsorships" value={formatKes(paidTotal)} tone="teal" />
        <StatCard
          label="Overdue"
          value={formatKes(overdueTotal)}
          tone={overdueTotal > 0 ? 'rose' : 'default'}
        />
        <StatCard label="Brand partners" value={String(sponsorships.length)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-white">Sponsorship payments</h3>
          <p className="mt-1 text-sm text-slate-400">
            Contract values, due dates and linked invoices.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Brand</th>
                  <th className="pb-3 pr-4 font-medium">Campaign</th>
                  <th className="pb-3 pr-4 text-right font-medium">Value</th>
                  <th className="pb-3 pr-4 font-medium">Due</th>
                  <th className="pb-3 pr-4 font-medium">Invoice</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sponsorships.map((deal) => (
                  <tr key={deal.id}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-200">{deal.brand}</p>
                      <p className="text-xs text-slate-500">{deal.contact}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">
                      {deal.campaign}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-white">
                      {formatKes(deal.value)}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {formatDate(deal.dueDate)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-400">
                      {deal.invoiceId ? deal.invoiceId.toUpperCase() : '—'}
                    </td>
                    <td className="py-3">
                      <StatusPill tone={sponsorshipStatusTones[deal.status]}>
                        {sponsorshipStatusLabels[deal.status]}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-white">Media kit</h3>
          <p className="mt-1 text-sm text-slate-400">
            What brands see before they reach out.
          </p>

          <div className="mt-4 rounded-xl border border-teal-400/20 bg-teal-400/5 p-4">
            <p className="text-sm font-semibold text-white">
              {profile.displayName}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {profile.category} · {profile.country}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {profile.businessDescription}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Audience reach
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {formatNumber(profile.analytics.profileViews)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Engagement
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {profile.analytics.conversionRate}%
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {topPortfolio.map((item) => (
              <li key={item.title}>
                <p className="text-sm text-slate-200">{item.title}</p>
                <p className="text-xs text-slate-500">
                  {item.type} · {item.metric}
                </p>
              </li>
            ))}
          </ul>

          <Badge className="mt-4 px-3 py-1 text-xs">
            Contracts are required before milestone payments
          </Badge>
        </Card>
      </div>
    </section>
  )
}

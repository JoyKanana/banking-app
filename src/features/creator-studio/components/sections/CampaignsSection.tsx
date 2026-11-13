import { useState } from 'react'
import { Badge, Card } from '@/components/ui'
import { formatDate, formatKes, formatNumber } from '../../lib/format'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import { NewCampaignDialog } from '../dialogs'
import { LockIcon, PlusIcon } from '../icons'
import { ProgressBar, SectionHeading, StatCard, StatusPill } from '../shared'

export function CampaignsSection() {
  const creator = useCreatorStudio()
  const { campaigns, createCampaign } = creator

  const [isCreateOpen, setCreateOpen] = useState(false)

  const active = campaigns.filter((campaign) => campaign.status === 'active')
  const totalRaised = campaigns.reduce(
    (sum, campaign) => sum + campaign.raised,
    0,
  )
  const averageProgress =
    campaigns.length > 0
      ? campaigns.reduce(
          (sum, campaign) => sum + campaign.raised / campaign.goal,
          0,
        ) / campaigns.length
      : 0

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Campaigns"
        description="Fundraising campaigns with public contribution pages, goals and deadlines."
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            <PlusIcon className="h-4 w-4" />
            New campaign
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active campaigns" value={String(active.length)} tone="teal" />
        <StatCard label="Total raised" value={formatKes(totalRaised)} />
        <StatCard
          label="Average progress"
          value={`${Math.round(averageProgress * 100)}%`}
        />
        <StatCard
          label="Contributors"
          value={formatNumber(
            campaigns.reduce(
              (sum, campaign) => sum + campaign.contributors,
              0,
            ),
          )}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {campaigns.map((campaign) => {
          const percent = Math.round((campaign.raised / campaign.goal) * 100)

          return (
            <Card key={campaign.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span aria-hidden className="text-3xl">
                    {campaign.emoji}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">
                      {campaign.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {campaign.description}
                    </p>
                  </div>
                </div>

                <StatusPill
                  tone={
                    campaign.status === 'completed'
                      ? 'success'
                      : campaign.status === 'draft'
                        ? 'neutral'
                        : 'info'
                  }
                >
                  {campaign.status === 'completed'
                    ? 'Completed'
                    : campaign.status === 'draft'
                      ? 'Draft'
                      : 'Active'}
                </StatusPill>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-teal-300">
                    {formatKes(campaign.raised)}
                  </span>
                  <span className="text-slate-400">
                    of {formatKes(campaign.goal)} · {percent}%
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={campaign.raised} max={campaign.goal} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="px-3 py-1 text-xs">
                    Deadline {formatDate(campaign.deadline)}
                  </Badge>
                  <Badge className="px-3 py-1 text-xs">
                    {formatNumber(campaign.contributors)} contributors
                  </Badge>
                  <Badge className="px-3 py-1 text-xs">
                    {campaign.updates} updates
                  </Badge>
                  {campaign.isPrivate && (
                    <Badge className="px-3 py-1 text-xs">
                      <LockIcon className="mr-1 inline h-3 w-3" />
                      Private
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {isCreateOpen && (
        <NewCampaignDialog
          onClose={() => setCreateOpen(false)}
          onCreate={createCampaign}
        />
      )}
    </section>
  )
}

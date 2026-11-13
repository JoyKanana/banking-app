import { useState } from 'react'
import { Badge, Card } from '@/components/ui'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import { CopyButton, SectionHeading, Toggle } from '../shared'

const notificationChannels = [
  { label: 'Payment received', description: 'Every successful payment.' },
  { label: 'Payout status', description: 'Processing, completed or failed.' },
  { label: 'Failed renewals', description: 'Subscription payments that fail.' },
  { label: 'Invoice reminders', description: 'Due soon and overdue notices.' },
  { label: 'Weekly summary', description: 'Revenue and expense digest.' },
]

export function SettingsSection() {
  const creator = useCreatorStudio()
  const { profile, destinations, automations, showToast } = creator

  const [showFees, setShowFees] = useState(true)
  const [channels, setChannels] = useState(
    notificationChannels.map((_, index) => index !== 4),
  )
  const [webhookUrl, setWebhookUrl] = useState('')

  const primaryDestination = destinations.find(
    (destination) => destination.primary,
  )
  const weeklyPayout = automations.find(
    (automation) => automation.id === 'auto-payouts',
  )

  function toggleChannel(index: number) {
    setChannels((current) =>
      current.map((enabled, position) =>
        position === index ? !enabled : enabled,
      ),
    )
  }

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Settings"
        description="Payment, payout and workspace preferences for your creator business."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-white">Payment settings</h3>
          <p className="mt-1 text-sm text-slate-400">
            How you get paid by default.
          </p>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Operating currency</dt>
              <dd className="font-medium text-white">
                {profile.currency} ({profile.country})
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Payment methods</dt>
              <dd className="text-slate-300">Card, M-PESA, Relay Wallet</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Public profile</dt>
              <dd className="font-mono text-xs text-teal-300">
                {profile.publicUrl}
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            <Toggle
              label="Show fees on receipts"
              description="Break out processing fees on customer receipts."
              checked={showFees}
              onChange={setShowFees}
            />
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-white">Payout settings</h3>
          <p className="mt-1 text-sm text-slate-400">
            Where and how your money leaves.
          </p>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Primary destination</dt>
              <dd className="font-medium text-white">
                {primaryDestination?.label ?? 'M-PESA'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Automatic schedule</dt>
              <dd className="text-slate-300">
                {weeklyPayout?.enabled ? 'Weekly, Fridays' : 'Manual only'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Withdrawal fee</dt>
              <dd className="text-slate-300">0.75% · minimum KSh 30</dd>
            </div>
          </dl>

          <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-500">
            Manage destinations, limits and verification in the Payouts
            section. Destination changes require two-factor confirmation.
          </p>
        </Card>

        <Card>
          <h3 className="font-semibold text-white">Notifications</h3>
          <p className="mt-1 text-sm text-slate-400">
            Choose what lands in your inbox.
          </p>

          <div className="mt-4 space-y-3">
            {notificationChannels.map((channel, index) => (
              <Toggle
                key={channel.label}
                label={channel.label}
                description={channel.description}
                checked={channels[index]}
                onChange={() => toggleChannel(index)}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-white">Integrations</h3>
          <p className="mt-1 text-sm text-slate-400">
            API keys and webhooks for connected applications.
          </p>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Live API key
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 font-mono text-xs text-slate-300">
                rly_live_7f3a••••••••••••e29c
              </span>
              <CopyButton value="rly_live_7f3a000000000000e29c" label="Copy key" />
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="webhook-url"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Payment webhook URL
            </label>
            <input
              id="webhook-url"
              type="url"
              value={webhookUrl}
              onChange={(event) => setWebhookUrl(event.target.value)}
              placeholder="https://yourapp.com/relay/webhooks"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
            <button
              type="button"
              onClick={() =>
                showToast(
                  webhookUrl.trim()
                    ? 'Webhook URL saved. Events will be signed.'
                    : 'Enter a webhook URL first.',
                  webhookUrl.trim() ? 'success' : 'warning',
                )
              }
              className="mt-2 rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              Save webhook
            </button>
          </div>

          <Badge className="mt-4 px-3 py-1 text-xs">
            Payment webhooks automation must be enabled to deliver events
          </Badge>
        </Card>

        <Card>
          <h3 className="font-semibold text-white">Team access</h3>
          <p className="mt-1 text-sm text-slate-400">
            Invite an accountant or assistant.
          </p>

          <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
            This is a solo workspace. Team members with financial access will be
            able to see balances and payouts — never your private identity
            documents.
          </p>

          <button
            type="button"
            onClick={() => showToast('Team invitations are coming soon.', 'info')}
            className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-teal-400/40 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            Invite a team member
          </button>
        </Card>

        <Card className="border-rose-400/20">
          <h3 className="font-semibold text-white">Close creator account</h3>
          <p className="mt-1 text-sm text-slate-400">
            Deactivating pauses payments, payment links and subscriptions.
            Outstanding payouts are settled first.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                showToast('Creator Studio deactivated. Reactivate anytime.', 'warning')
              }
              className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-medium text-amber-300 transition hover:bg-amber-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              Deactivate Creator Studio
            </button>
            <button
              type="button"
              onClick={() =>
                showToast(
                  'Deletion requires settling payouts and exporting your data first.',
                  'warning',
                )
              }
              className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            >
              Request permanent deletion
            </button>
          </div>
        </Card>
      </div>
    </section>
  )
}

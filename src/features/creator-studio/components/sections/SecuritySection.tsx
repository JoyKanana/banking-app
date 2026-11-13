import { Card } from '@/components/ui'
import { loginEvents } from '../../data/creatorStudio'
import { downloadCsv, formatDateTime, formatKes } from '../../lib/format'
import { sourceLabels } from '../../lib/labels'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import { CheckIcon, DownloadIcon, ShieldIcon } from '../icons'
import { SectionHeading } from '../shared'

const protections = [
  {
    title: 'Two-factor authentication',
    description: 'Required for every new device and payout change.',
  },
  {
    title: 'Biometric unlock',
    description: 'Face and fingerprint access on your signed-in devices.',
  },
  {
    title: 'Withdrawal confirmations',
    description: 'Every payout must be confirmed with your passcode.',
  },
  {
    title: 'Suspicious payment detection',
    description: 'Unusual payments are held and flagged for review.',
  },
  {
    title: 'Separate legal identity',
    description: 'Your legal name is never shown on public pages.',
  },
]

export function SecuritySection() {
  const creator = useCreatorStudio()
  const { transactions, customers, showToast } = creator

  function exportTransactions() {
    downloadCsv('creator-transaction-history.csv', [
      ['Date', 'Description', 'Customer', 'Source', 'Gross', 'Net', 'Status'],
      ...transactions.map((transaction) => [
        transaction.date,
        transaction.description,
        transaction.customerName,
        sourceLabels[transaction.source],
        transaction.gross,
        transaction.net,
        transaction.status,
      ]),
    ])
    showToast('Transaction history exported.')
  }

  function exportCustomers() {
    downloadCsv('creator-customers.csv', [
      ['Name', 'Email', 'Segment', 'Payments', 'Total spent', 'Joined'],
      ...customers.map((customer) => [
        customer.name,
        customer.email,
        customer.segment,
        customer.paymentCount,
        customer.totalSpent,
        customer.joinedAt,
      ]),
    ])
    showToast('Customer records exported.')
  }

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Security & privacy"
        description="Protect your money, your payouts and your identity."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-teal-400/30 bg-teal-400/10">
              <ShieldIcon className="h-5 w-5 text-teal-300" />
            </span>
            <div>
              <h3 className="font-semibold text-white">Account protection</h3>
              <p className="text-xs text-slate-500">
                All protections are active on your creator account.
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-3">
            {protections.map((protection) => (
              <li
                key={protection.title}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-slate-950/60 p-3"
              >
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {protection.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {protection.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="font-semibold text-white">Your data</h3>
          <p className="mt-1 text-sm text-slate-400">
            Download everything Relay holds about your creator business.
          </p>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={exportTransactions}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-teal-400/40 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              <DownloadIcon className="h-4 w-4" />
              Transaction history ({transactions.length} records)
            </button>
            <button
              type="button"
              onClick={exportCustomers}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-teal-400/40 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              <DownloadIcon className="h-4 w-4" />
              Customer records ({customers.length} customers)
            </button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Payout destinations, payout history and the total value of{' '}
            {formatKes(creator.wallet.totalWithdrawals)} withdrawn are included
            in your Relay account export.
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-white">Login history</h3>
        <p className="mt-1 text-sm text-slate-400">
          Devices that have accessed your account.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 pr-4 font-medium">Device</th>
                <th className="pb-3 pr-4 font-medium">Location</th>
                <th className="pb-3 pr-4 font-medium">When</th>
                <th className="pb-3 pr-4 font-medium">Method</th>
                <th className="pb-3 font-medium">Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loginEvents.map((event) => (
                <tr key={event.id}>
                  <td className="py-3 pr-4 font-medium text-slate-200">
                    {event.device}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">{event.location}</td>
                  <td className="py-3 pr-4 text-slate-400">
                    {formatDateTime(event.date)}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">{event.method}</td>
                  <td className="py-3">
                    <span
                      className={
                        event.current
                          ? 'rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-0.5 text-xs font-medium text-teal-300'
                          : 'text-xs text-slate-500'
                      }
                    >
                      {event.current ? 'This device' : 'Signed out'}
                    </span>
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

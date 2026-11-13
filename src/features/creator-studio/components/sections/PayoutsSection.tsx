import { useState } from 'react'
import { Badge, Card } from '@/components/ui'
import { formatDate, formatKes } from '../../lib/format'
import { payoutStatusLabels } from '../../lib/labels'
import { payoutStatusTones } from '../../lib/tones'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import { PayoutRequestDialog } from '../dialogs'
import { CheckIcon, WithdrawIcon } from '../icons'
import { SectionHeading, StatCard, StatusPill } from '../shared'

const destinationTypeLabels: Record<string, string> = {
  mpesa: 'Mobile money',
  bank: 'Bank account',
  wallet: 'Relay Wallet',
  crypto: 'Crypto wallet',
}

export function PayoutsSection() {
  const creator = useCreatorStudio()
  const { wallet, payouts, destinations, requestPayout } = creator

  const [isRequestOpen, setRequestOpen] = useState(false)

  const inTransit = payouts
    .filter(
      (payout) => payout.status === 'processing' || payout.status === 'scheduled',
    )
    .reduce((sum, payout) => sum + payout.amount, 0)

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Payouts"
        description="Withdraw your creator balance to M-PESA, bank or wallet — with tracking and receipts."
        actions={
          <button
            type="button"
            onClick={() => setRequestOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            <WithdrawIcon className="h-4 w-4" />
            Withdraw funds
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Available to withdraw"
          value={formatKes(wallet.available)}
          tone="teal"
        />
        <StatCard label="In transit" value={formatKes(inTransit)} sub="Processing or scheduled" />
        <StatCard label="Total withdrawn" value={formatKes(wallet.totalWithdrawals)} />
        <StatCard
          label="Withdrawal fee"
          value="0.75%"
          sub="Minimum KSh 30"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <h3 className="font-semibold text-white">Payout destinations</h3>
          <p className="mt-1 text-sm text-slate-400">
            Where your money goes.
          </p>

          <ul className="mt-4 space-y-3">
            {destinations.map((destination) => (
              <li
                key={destination.id}
                className="rounded-xl border border-white/10 bg-slate-950/60 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200">
                      {destination.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {destination.detail}
                    </p>
                  </div>
                  {destination.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-0.5 text-xs font-medium text-teal-300">
                      <CheckIcon className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                      In review
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Badge className="px-2.5 py-0.5 text-[11px]">
                    {destinationTypeLabels[destination.type]}
                  </Badge>
                  {destination.primary && (
                    <Badge className="border-teal-400/30 bg-teal-400/10 px-2.5 py-0.5 text-[11px] text-teal-300">
                      Primary
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Crypto payouts are subject to compliance review. You must complete
            identity verification before payouts to any destination.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-white">Payout history</h3>
          <p className="mt-1 text-sm text-slate-400">
            Every withdrawal with fees, net amounts and references.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Reference</th>
                  <th className="pb-3 pr-4 font-medium">Destination</th>
                  <th className="pb-3 pr-4 font-medium">Requested</th>
                  <th className="pb-3 pr-4 text-right font-medium">Amount</th>
                  <th className="pb-3 pr-4 text-right font-medium">Fee</th>
                  <th className="pb-3 pr-4 text-right font-medium">Net</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payouts.map((payout) => (
                  <tr key={payout.id}>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-400">
                      {payout.reference}
                    </td>
                    <td className="py-3 pr-4 text-slate-200">
                      {payout.destinationLabel}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {formatDate(payout.requestedAt)}
                      {payout.completedAt && (
                        <span className="block text-xs text-slate-500">
                          Completed {formatDate(payout.completedAt)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-300">
                      {formatKes(payout.amount)}
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-500">
                      {formatKes(payout.fee)}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-white">
                      {formatKes(payout.net)}
                    </td>
                    <td className="py-3">
                      <StatusPill tone={payoutStatusTones[payout.status]}>
                        {payoutStatusLabels[payout.status]}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {isRequestOpen && (
        <PayoutRequestDialog
          available={wallet.available}
          destinations={destinations}
          onClose={() => setRequestOpen(false)}
          onRequest={requestPayout}
        />
      )}
    </section>
  )
}

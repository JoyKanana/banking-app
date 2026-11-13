import { useState } from 'react'
import { Card } from '@/components/ui'
import { downloadCsv, formatDate, formatKes } from '../../lib/format'
import {
  incomeSourceOptions,
  methodLabels,
  sourceLabels,
  transactionStatusLabels,
} from '../../lib/labels'
import { transactionStatusTones } from '../../lib/tones'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import { DownloadIcon } from '../icons'
import { BarChart, SectionHeading, StatCard, StatusPill } from '../shared'

type SourceFilter = 'all' | (typeof incomeSourceOptions)[number]['value']

export function WalletSection() {
  const creator = useCreatorStudio()
  const { wallet, transactions, monthlyRevenue, showToast } = creator

  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')

  const visibleTransactions =
    sourceFilter === 'all'
      ? transactions
      : transactions.filter(
          (transaction) => transaction.source === sourceFilter,
        )

  const feeRows = [
    { label: 'Processing fees', value: wallet.processingFees },
    { label: 'Platform fees', value: wallet.platformFees },
    { label: 'Refunds issued', value: wallet.refunds },
    { label: 'Chargebacks', value: wallet.chargebacks },
  ]

  function handleExport() {
    downloadCsv('creator-transactions.csv', [
      ['Date', 'Description', 'Customer', 'Source', 'Method', 'Gross', 'Fee', 'Net', 'Status', 'Reference'],
      ...visibleTransactions.map((transaction) => [
        transaction.date,
        transaction.description,
        transaction.customerName,
        sourceLabels[transaction.source],
        methodLabels[transaction.method],
        transaction.gross,
        transaction.fee,
        transaction.net,
        transaction.status,
        transaction.reference,
      ]),
    ])
    showToast('Transactions exported as CSV.')
  }

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Creator wallet"
        description="A dedicated view of your creator income. This is the same underlying Relay account — earnings are never counted twice."
        actions={
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-teal-400/40 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            <DownloadIcon className="h-4 w-4" />
            Export statement
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Available"
          value={formatKes(wallet.available)}
          sub="Withdrawable now"
          tone="teal"
        />
        <StatCard
          label="Pending"
          value={formatKes(wallet.pending)}
          sub="Clearing in 1–3 days"
        />
        <StatCard
          label="Reserved"
          value={formatKes(wallet.reserved)}
          sub="Held for disputes"
        />
        <StatCard
          label="Withdrawable"
          value={formatKes(wallet.available)}
          sub="After fees at payout"
          tone="amber"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-white">Earnings history</h3>
          <p className="mt-1 text-sm text-slate-400">
            Net monthly revenue over the last 12 months.
          </p>
          <div className="mt-6">
            <BarChart points={monthlyRevenue} />
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-white">Fees and adjustments</h3>
          <ul className="mt-4 space-y-3">
            {feeRows.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-400">{row.label}</span>
                <span
                  className={
                    row.value === 0 ? 'text-slate-500' : 'font-medium text-white'
                  }
                >
                  {formatKes(row.value)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-xl border border-teal-400/20 bg-teal-400/5 p-4">
            <p className="text-xs font-medium text-teal-300">
              ONE ACCOUNT, ONE BALANCE
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Creator Studio is a sub-ledger of your Relay Wallet. Money earned
              here is reflected in your main balance — not a separate pot.
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">Transactions</h3>
            <p className="mt-1 text-sm text-slate-400">
              {visibleTransactions.length} recorded payments
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="wallet-source-filter" className="sr-only">
              Filter by income source
            </label>
            <select
              id="wallet-source-filter"
              value={sourceFilter}
              onChange={(event) =>
                setSourceFilter(event.target.value as SourceFilter)
              }
              className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            >
              <option value="all">All sources</option>
              {incomeSourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 pr-4 font-medium">Payment</th>
                <th className="pb-3 pr-4 font-medium">Customer</th>
                <th className="pb-3 pr-4 font-medium">Method</th>
                <th className="pb-3 pr-4 text-right font-medium">Gross</th>
                <th className="pb-3 pr-4 text-right font-medium">Fee</th>
                <th className="pb-3 pr-4 text-right font-medium">Net</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleTransactions.map((transaction) => (
                <tr key={transaction.id} className="align-middle">
                  <td className="whitespace-nowrap py-3 pr-4 text-slate-400">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-slate-200">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      {sourceLabels[transaction.source]}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-slate-300">
                    {transaction.customerName}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">
                    {methodLabels[transaction.method]}
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-300">
                    {formatKes(transaction.gross)}
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-500">
                    {formatKes(transaction.fee)}
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-white">
                    {formatKes(transaction.net)}
                  </td>
                  <td className="py-3">
                    <StatusPill tone={transactionStatusTones[transaction.status]}>
                      {transactionStatusLabels[transaction.status]}
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

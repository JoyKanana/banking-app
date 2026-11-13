import { useState } from 'react'
import { Card } from '@/components/ui'
import { downloadCsv, formatKes, formatNumber, formatPercent } from '../../lib/format'
import { methodLabels, sourceLabels } from '../../lib/labels'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import { DownloadIcon } from '../icons'
import { BarChart, BreakdownBars, SectionHeading, StatCard } from '../shared'

type Range = 'all' | 'month' | 'last-month' | 'year'

const rangeOptions: { value: Range; label: string }[] = [
  { value: 'month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'year', label: 'This year' },
  { value: 'all', label: 'All time' },
]

function inRange(date: string, range: Range): boolean {
  if (range === 'month') return date.startsWith('2026-11')
  if (range === 'last-month') return date.startsWith('2026-10')
  if (range === 'year') return date.startsWith('2026')
  return true
}

export function AnalyticsSection() {
  const creator = useCreatorStudio()
  const {
    transactions,
    customers,
    monthlyRevenue,
    sourceBreakdown,
    methodBreakdown,
    showToast,
  } = creator

  const [range, setRange] = useState<Range>('month')

  const scoped = transactions.filter(
    (transaction) =>
      transaction.status !== 'refunded' && inRange(transaction.date, range),
  )
  const paid = scoped.filter((transaction) => transaction.status === 'paid')
  const failed = scoped.filter((transaction) => transaction.status === 'failed')
  const pending = scoped.filter(
    (transaction) => transaction.status === 'pending',
  )

  const gross = paid.reduce((sum, transaction) => sum + transaction.gross, 0)
  const net = paid.reduce((sum, transaction) => sum + transaction.net, 0)
  const fees = paid.reduce((sum, transaction) => sum + transaction.fee, 0)
  const average = paid.length > 0 ? gross / paid.length : 0
  const successRate =
    paid.length + failed.length > 0
      ? (paid.length / (paid.length + failed.length)) * 100
      : 100

  const topCustomers = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)

  const sourceItems = sourceBreakdown.map((entry) => ({
    label: sourceLabels[entry.source],
    amount: entry.amount,
  }))
  const methodItems = methodBreakdown.map((entry) => ({
    label: methodLabels[entry.method],
    amount: entry.amount,
  }))

  function handleExport() {
    downloadCsv(`creator-analytics-${range}.csv`, [
      ['Date', 'Description', 'Customer', 'Source', 'Method', 'Gross', 'Fee', 'Net', 'Status'],
      ...scoped.map((transaction) => [
        transaction.date,
        transaction.description,
        transaction.customerName,
        sourceLabels[transaction.source],
        methodLabels[transaction.method],
        transaction.gross,
        transaction.fee,
        transaction.net,
        transaction.status,
      ]),
    ])
    showToast('Analytics exported as CSV.')
  }

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Analytics"
        description="Revenue, fees and customer performance calculated from your recorded transactions."
        actions={
          <div className="flex items-center gap-2">
            <select
              value={range}
              onChange={(event) => setRange(event.target.value as Range)}
              aria-label="Report period"
              className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            >
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-teal-400/40 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              <DownloadIcon className="h-4 w-4" />
              Export report
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Net revenue" value={formatKes(net)} tone="teal" />
        <StatCard label="Gross revenue" value={formatKes(gross)} />
        <StatCard label="Processing fees" value={formatKes(fees)} />
        <StatCard label="Average payment" value={formatKes(average)} />
        <StatCard
          label="Success rate"
          value={formatPercent(successRate, 0)}
          sub={`${paid.length} of ${paid.length + failed.length} payments`}
        />
        <StatCard
          label="Pending"
          value={String(pending.length)}
          sub={
            pending.length > 0
              ? formatKes(
                  pending.reduce(
                    (sum, transaction) => sum + transaction.gross,
                    0,
                  ),
                )
              : 'No pending payments'
          }
          tone="amber"
        />
      </div>

      <Card>
        <div className="flex items-baseline justify-between">
          <h3 className="font-semibold text-white">Revenue trend</h3>
          <p className="text-xs text-slate-500">
            {formatNumber(scoped.length)} transactions in selected period
          </p>
        </div>
        <div className="mt-6">
          <BarChart points={monthlyRevenue} />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-white">Revenue by income source</h3>
          <p className="mt-1 text-sm text-slate-400">
            Where your money comes from.
          </p>
          <div className="mt-5">
            <BreakdownBars items={sourceItems} />
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-white">Revenue by payment method</h3>
          <p className="mt-1 text-sm text-slate-400">
            How your customers prefer to pay.
          </p>
          <div className="mt-5">
            <BreakdownBars items={methodItems} />
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-white">Top customers</h3>
        <p className="mt-1 text-sm text-slate-400">
          Lifetime supporters ranked by total spending.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 pr-4 font-medium">Customer</th>
                <th className="pb-3 pr-4 text-right font-medium">Payments</th>
                <th className="pb-3 pr-4 text-right font-medium">Total spent</th>
                <th className="pb-3 font-medium">Segment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topCustomers.map((customer, index) => (
                <tr key={customer.id}>
                  <td className="py-3 pr-4">
                    <span className="mr-3 text-xs font-semibold text-slate-500">
                      {index + 1}
                    </span>
                    <span className="font-medium text-slate-200">
                      {customer.name}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-400">
                    {customer.paymentCount}
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-white">
                    {formatKes(customer.totalSpent)}
                  </td>
                  <td className="py-3 text-slate-400">{customer.tags[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  )
}

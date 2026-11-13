import { useSearchParams } from 'react-router-dom'
import { Badge, Button, Card, PageHeader, Progress, Stat, Tabs } from '@/components/ui'
import { useCreatorStudio } from '@/features/creator-studio/hooks/useCreatorStudioState'
import { totalAvailableInKes } from '@/domain/money/selectors'
import { useMoney } from '@/domain/money/store'
import type { MoneyTransaction } from '@/domain/money/types'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

type InsightsTab = 'cashflow' | 'spending' | 'creator' | 'reports'

const tabs: { id: InsightsTab; label: string }[] = [
  { id: 'cashflow', label: 'Cash flow' },
  { id: 'spending', label: 'Spending' },
  { id: 'creator', label: 'Creator' },
  { id: 'reports', label: 'Reports' },
]

const inflowKinds = new Set<MoneyTransaction['kind']>([
  'deposit',
  'creator_earning',
  'contribution',
  'refund',
])

const outflowKinds = new Set<MoneyTransaction['kind']>([
  'payment',
  'bill',
  'withdrawal',
  'fee',
])

const monthKeys = [
  '2026-06',
  '2026-07',
  '2026-08',
  '2026-09',
  '2026-10',
  '2026-11',
]

const monthLabels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']

function buildMonthlyFlow(transactions: MoneyTransaction[]) {
  return monthKeys.map((month, index) => {
    const monthTransactions = transactions.filter((transaction) =>
      transaction.createdAt.startsWith(month),
    )
    const inflow = monthTransactions
      .filter((transaction) => inflowKinds.has(transaction.kind))
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const outflow = monthTransactions
      .filter((transaction) => outflowKinds.has(transaction.kind))
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    return { month, label: monthLabels[index], inflow, outflow }
  })
}

function buildSpendingByCategory(transactions: MoneyTransaction[]) {
  const totals = new Map<string, number>()

  for (const transaction of transactions) {
    if (!outflowKinds.has(transaction.kind)) continue
    const category =
      typeof transaction.metadata?.category === 'string'
        ? transaction.metadata.category
        : transaction.kind === 'bill'
          ? 'Bills'
          : transaction.kind === 'withdrawal'
            ? 'Transfers out'
            : transaction.kind === 'fee'
              ? 'Fees'
              : 'Payments'
    totals.set(category, (totals.get(category) ?? 0) + transaction.amount)
  }

  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export function InsightsPage() {
  const money = useMoney()
  const creator = useCreatorStudio()
  const [searchParams, setSearchParams] = useSearchParams()
  const scope = searchParams.get('scope')
  const tabParam = searchParams.get('tab')
  const activeTab: InsightsTab =
    scope === 'creator'
      ? 'creator'
      : tabs.some((tab) => tab.id === tabParam)
        ? (tabParam as InsightsTab)
        : 'cashflow'

  const posted = money.transactions.filter(
    (transaction) =>
      transaction.status === 'posted' || transaction.status === 'processing',
  )

  const monthTransactions = posted.filter((transaction) =>
    transaction.createdAt.startsWith('2026-11'),
  )
  const monthIn = monthTransactions
    .filter((transaction) => inflowKinds.has(transaction.kind))
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const monthOut = monthTransactions
    .filter((transaction) => outflowKinds.has(transaction.kind))
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const available = totalAvailableInKes(
    money.subaccounts,
    money.entries,
    money.fxRates,
  )

  const monthly = buildMonthlyFlow(posted)

  const maxFlow = Math.max(
    ...monthly.map((month) => Math.max(month.inflow, month.outflow)),
    1,
  )

  const spendingByCategory = buildSpendingByCategory(posted)

  const maxCategory = Math.max(...spendingByCategory.map((item) => item.amount), 1)

  function setTab(tab: InsightsTab) {
    setSearchParams(tab === 'cashflow' ? {} : { tab })
  }

  function downloadTransactions() {
    const header = [
      'Reference',
      'Date',
      'Kind',
      'Status',
      'Counterparty',
      'Description',
      'Amount',
      'Fee',
      'Net',
      'Currency',
      'Rail',
    ]
    const rows = money.transactions.map((transaction) => [
      transaction.reference,
      transaction.createdAt,
      transaction.kind,
      transaction.status,
      transaction.counterparty,
      transaction.description,
      String(transaction.amount),
      String(transaction.fee),
      String(transaction.net),
      transaction.currency,
      transaction.rail,
    ])
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','),
      )
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'relay-transactions-2026-11.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Understand the whole picture."
        description="Cash flow, spending and creator performance are calculated from the same shared ledger — not from separate dashboards."
        actions={
          <Button variant="secondary" onClick={downloadTransactions}>
            Export transactions
          </Button>
        }
      />

      <Tabs
        className="mt-8"
        items={tabs}
        active={activeTab}
        onChange={setTab}
      />

      <div className="mt-6">
        {activeTab === 'cashflow' && (
          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Stat
                label="Available across subaccounts"
                value={formatMoney(available)}
                sub="Converted to KES"
                tone="teal"
              />
              <Stat
                label="November inflow"
                value={formatMoney(monthIn)}
                sub="Deposits, earnings and contributions"
              />
              <Stat
                label="November outflow"
                value={formatMoney(monthOut)}
                sub="Payments, bills, payouts and fees"
                tone={monthOut > monthIn ? 'rose' : 'default'}
              />
              <Stat
                label="Net movement"
                value={formatMoney(monthIn - monthOut)}
                sub={monthIn - monthOut >= 0 ? 'Positive this month' : 'Negative this month'}
                tone={monthIn - monthOut >= 0 ? 'teal' : 'rose'}
              />
            </section>

            <Card className="mt-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Six-month cash flow</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Inflow and outflow by month, from posted and processing ledger entries.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-teal-400" />
                    Inflow
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    Outflow
                  </span>
                </div>
              </div>

              <div className="mt-6 grid h-64 grid-cols-6 items-end gap-3">
                {monthly.map((month) => (
                  <div key={month.month} className="flex h-full flex-col justify-end gap-2">
                    <div className="flex h-full items-end justify-center gap-1">
                      <div
                        className="w-1/3 rounded-t-md bg-teal-400/80"
                        style={{
                          height: `${Math.max((month.inflow / maxFlow) * 100, 2)}%`,
                        }}
                        title={`${month.label} inflow ${formatMoney(month.inflow)}`}
                      />
                      <div
                        className="w-1/3 rounded-t-md bg-rose-400/70"
                        style={{
                          height: `${Math.max((month.outflow / maxFlow) * 100, 2)}%`,
                        }}
                        title={`${month.label} outflow ${formatMoney(month.outflow)}`}
                      />
                    </div>
                    <p className="text-center text-xs text-slate-500">{month.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {activeTab === 'spending' && (
          <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
            <Card>
              <h3 className="text-lg font-semibold">Spending by category</h3>
              <p className="mt-1 text-sm text-slate-400">
                Derived from outgoing transactions and recorded expenses.
              </p>
              <div className="mt-5 space-y-4">
                {spendingByCategory.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="capitalize text-slate-300">{item.category}</span>
                      <span className="font-semibold text-white">
                        {formatMoney(item.amount)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-violet-400/80"
                        style={{ width: `${(item.amount / maxCategory) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {spendingByCategory.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No outgoing transactions recorded yet.
                  </p>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold">Budgets</h3>
              <p className="mt-1 text-sm text-slate-400">
                Budgets are monthly envelopes, not separate accounts.
              </p>
              <div className="mt-5 space-y-4">
                {money.budgets.map((budget) => {
                  const percent = Math.min(
                    Math.round((budget.spent / budget.limit) * 100),
                    100,
                  )
                  return (
                    <div key={budget.id}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            {budget.name}
                          </p>
                          <p className="text-xs text-slate-500">{budget.category}</p>
                        </div>
                        <p className="text-sm text-slate-300">
                          {formatMoney(budget.spent, budget.currency)} /{' '}
                          {formatMoney(budget.limit, budget.currency)}
                        </p>
                      </div>
                      <Progress
                        className="mt-2"
                        value={percent}
                        max={100}
                        tone={percent >= 100 ? 'rose' : percent >= 80 ? 'amber' : 'teal'}
                      />
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'creator' && (
          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Stat
                label="Creator available"
                value={formatMoney(creator.wallet.available)}
                sub="From sub-creator balance"
                tone="teal"
              />
              <Stat
                label="November revenue"
                value={formatMoney(creator.wallet.monthlyRevenue)}
                sub={`${creator.wallet.growth >= 0 ? '+' : ''}${creator.wallet.growth}% vs October`}
                tone={creator.wallet.growth >= 0 ? 'teal' : 'rose'}
              />
              <Stat
                label="Net earnings"
                value={formatMoney(creator.wallet.totalEarnings)}
                sub="After processing fees"
              />
              <Stat
                label="Paid out"
                value={formatMoney(creator.wallet.totalWithdrawals)}
                sub="Completed creator withdrawals"
              />
            </section>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <Card>
                <h3 className="text-lg font-semibold">Income by source</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Paid creator earnings grouped by source.
                </p>
                <div className="mt-5 space-y-4">
                  {creator.sourceBreakdown.map((item) => {
                    const max = Math.max(
                      ...creator.sourceBreakdown.map((source) => source.amount),
                      1,
                    )
                    return (
                      <div key={item.source}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="capitalize text-slate-300">
                            {item.source.replaceAll('-', ' ')}
                          </span>
                          <span className="font-semibold text-white">
                            {formatMoney(item.amount)}
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-teal-400/80"
                            style={{ width: `${(item.amount / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold">Payment methods</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Where creator income actually arrived.
                </p>
                <div className="mt-5 space-y-3">
                  {creator.methodBreakdown.map((item) => (
                    <div
                      key={item.method}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3"
                    >
                      <span className="capitalize text-sm text-slate-300">
                        {item.method.replaceAll('-', ' ')}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {formatMoney(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Transaction report</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    A complete ledger-backed export, including fees and status.
                  </p>
                </div>
                <Button onClick={downloadTransactions}>Download CSV</Button>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="pb-3 font-medium">Reference</th>
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 text-right font-medium">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {money.transactions.slice(0, 12).map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="py-3 font-mono text-xs text-slate-400">
                          {transaction.reference}
                        </td>
                        <td className="py-3 text-slate-300">
                          {transaction.description}
                        </td>
                        <td className="py-3">
                          <Badge className="px-2.5 py-0.5 text-[10px]">
                            {transaction.status}
                          </Badge>
                        </td>
                        <td
                          className={cn(
                            'py-3 text-right font-medium',
                            transaction.net >= 0 ? 'text-teal-300' : 'text-rose-300',
                          )}
                        >
                          {formatMoney(transaction.net, transaction.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold">Report readiness</h3>
              <p className="mt-1 text-sm text-slate-400">
                Checks that make an export useful for reconciliation.
              </p>
              <div className="mt-5 space-y-3">
                <ReportRow
                  label="Ledger balanced"
                  detail={`${money.integrity.entryCount} entries`}
                  ok={money.integrity.balanced}
                />
                <ReportRow
                  label="Transaction count"
                  detail={`${money.transactions.length} transactions`}
                  ok={money.transactions.length > 0}
                />
                <ReportRow
                  label="Creator ledger bridge"
                  detail={`${creator.transactions.length} creator records`}
                  ok={creator.transactions.length > 0}
                />
                <ReportRow
                  label="Payout records"
                  detail={`${creator.payouts.length} payouts`}
                  ok={creator.payouts.length > 0}
                />
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}

function ReportRow({
  label,
  detail,
  ok,
}: {
  label: string
  detail: string
  ok: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs text-slate-500">{detail}</p>
      </div>
      <Badge
        className={cn(
          'px-2.5 py-0.5 text-[10px]',
          ok
            ? 'border-teal-400/30 bg-teal-400/10 text-teal-300'
            : 'border-amber-400/30 bg-amber-400/10 text-amber-300',
        )}
      >
        {ok ? 'Ready' : 'Review'}
      </Badge>
    </div>
  )
}

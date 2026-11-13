import { Badge, Card } from '@/components/ui'
import { formatKes, formatShortDate } from '../../lib/format'
import {
  methodLabels,
  sourceLabels,
  transactionStatusLabels,
} from '../../lib/labels'
import { transactionStatusTones } from '../../lib/tones'
import type { CreatorSectionId, Invoice, PendingRequest } from '../../types'
import { BarChart, SectionHeading, StatCard, StatusPill } from '../shared'
import { pendingRequests } from '../../data/creatorStudio'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'

type OverviewSectionProps = {
  onNavigate: (sectionId: CreatorSectionId) => void
}

const quickActions: { label: string; section: CreatorSectionId }[] = [
  { label: 'New payment link', section: 'payment-links' },
  { label: 'Create invoice', section: 'invoices' },
  { label: 'Withdraw funds', section: 'payouts' },
  { label: 'New campaign', section: 'campaigns' },
  { label: 'Ask the assistant', section: 'assistant' },
]

export function OverviewSection({ onNavigate }: OverviewSectionProps) {
  const creator = useCreatorStudio()
  const { wallet, monthlyRevenue, notifications, invoices, customers } = creator

  const recentTransactions = creator.transactions.slice(0, 6)
  const outstanding: Invoice[] = invoices.filter(
    (invoice) => invoice.status === 'sent' || invoice.status === 'overdue',
  )
  const outstandingTotal = outstanding.reduce(
    (sum, invoice) => sum + invoice.total,
    0,
  )
  const recentCustomers = [...customers]
    .sort((a, b) => (a.lastPayment < b.lastPayment ? 1 : -1))
    .slice(0, 4)

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Overview"
        description="Your earnings, balances and financial activity in one place."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Available"
          value={formatKes(wallet.available)}
          sub="Ready to withdraw"
          tone="teal"
        />
        <StatCard label="Pending" value={formatKes(wallet.pending)} sub="Clearing payments" />
        <StatCard label="Reserved" value={formatKes(wallet.reserved)} sub="Held for disputes" />
        <StatCard
          label="This month"
          value={formatKes(wallet.monthlyRevenue)}
          sub={`+${wallet.growth}% vs last month`}
          tone="amber"
        />
        <StatCard label="Total earnings" value={formatKes(wallet.totalEarnings)} sub="Net of fees" />
        <StatCard label="Withdrawn" value={formatKes(wallet.totalWithdrawals)} sub="Lifetime payouts" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold text-white">Monthly revenue</h3>
            <Badge className="px-3 py-1 text-xs">
              Last 12 months · {formatKes(wallet.annualRevenue)} total
            </Badge>
          </div>
          <div className="mt-6">
            <BarChart points={monthlyRevenue} />
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-white">Quick actions</h3>
          <p className="mt-1 text-sm text-slate-400">
            The fastest ways to get paid.
          </p>
          <div className="mt-4 space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => onNavigate(action.section)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-teal-400/40 hover:bg-teal-400/5 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              >
                {action.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold text-white">Recent transactions</h3>
            <button
              type="button"
              onClick={() => onNavigate('payouts')}
              className="text-xs font-medium text-teal-300 transition hover:text-teal-200"
            >
              Manage payouts
            </button>
          </div>

          <ul className="mt-4 divide-y divide-white/5">
            {recentTransactions.map((transaction) => (
              <li
                key={transaction.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {transaction.description}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {transaction.customerName} ·{' '}
                    {methodLabels[transaction.method]} ·{' '}
                    {formatShortDate(transaction.date)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-white">
                    {transaction.status === 'pending'
                      ? formatKes(transaction.gross)
                      : formatKes(transaction.net)}
                  </p>
                  <div className="mt-1">
                    <StatusPill tone={transactionStatusTones[transaction.status]}>
                      {transaction.status === 'pending' ? 'Expected' : transactionStatusLabels[transaction.status]}
                    </StatusPill>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold text-white">
              Notifications
              {creator.unreadNotifications > 0 && (
                <span className="ml-2 rounded-full bg-teal-400/15 px-2 py-0.5 text-xs text-teal-300">
                  {creator.unreadNotifications} new
                </span>
              )}
            </h3>
            {creator.unreadNotifications > 0 && (
              <button
                type="button"
                onClick={creator.markNotificationsRead}
                className="text-xs font-medium text-teal-300 transition hover:text-teal-200"
              >
                Mark all read
              </button>
            )}
          </div>

          <ul className="mt-4 space-y-3">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="rounded-xl border border-white/5 bg-slate-950/60 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-200">
                    {notification.title}
                  </p>
                  <StatusPill
                    tone={
                      notification.tone === 'success'
                        ? 'success'
                        : notification.tone === 'warning'
                          ? 'warning'
                          : 'info'
                    }
                  >
                    {notification.tone === 'success'
                      ? 'Good'
                      : notification.tone === 'warning'
                        ? 'Action'
                        : 'Info'}
                  </StatusPill>
                </div>
                <p className="mt-1 text-xs text-slate-400">{notification.body}</p>
                <p className="mt-1 text-[11px] text-slate-600">
                  {formatShortDate(notification.date)}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <h3 className="font-semibold text-white">Pending payment requests</h3>
          <ul className="mt-4 space-y-3">
            {pendingRequests.map((request: PendingRequest) => (
              <li
                key={request.id}
                className="rounded-xl border border-white/5 bg-slate-950/60 p-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-slate-200">
                    {request.customerName}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {formatKes(request.amount)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {sourceLabels[request.source]} · expires{' '}
                  {formatShortDate(request.expiresAt)}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold text-white">Outstanding invoices</h3>
            <button
              type="button"
              onClick={() => onNavigate('invoices')}
              className="text-xs font-medium text-teal-300 transition hover:text-teal-200"
            >
              Manage
            </button>
          </div>
          <p className="mt-2 text-2xl font-semibold text-amber-300">
            {formatKes(outstandingTotal)}
          </p>
          <p className="text-xs text-slate-500">
            Across {outstanding.length} unpaid invoices
          </p>
          <ul className="mt-4 space-y-3">
            {outstanding.slice(0, 3).map((invoice) => (
              <li key={invoice.id}>
                <p className="text-sm text-slate-200">
                  {invoice.number} · {invoice.customerName}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatKes(invoice.total)} · due{' '}
                  {formatShortDate(invoice.dueDate)}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold text-white">Recent supporters</h3>
            <button
              type="button"
              onClick={() => onNavigate('customers')}
              className="text-xs font-medium text-teal-300 transition hover:text-teal-200"
            >
              View all
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {recentCustomers.map((customer) => (
              <li key={customer.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {customer.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Last payment {formatShortDate(customer.lastPayment)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-white">
                  {formatKes(customer.totalSpent)}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  )
}

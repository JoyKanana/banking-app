import { Link } from 'react-router-dom'
import { Badge, Card, Progress, Stat } from '@/components/ui'
import { TransactionRow } from '@/components/money/TransactionRow'
import { useAccount } from '@/domain/account/store'
import { useMoney } from '@/domain/money/store'
import {
  getCreatorWalletSummary,
  getMonthlyPoints,
  totalAvailableInKes,
  totalPendingInKes,
  totalReservedInKes,
} from '@/domain/money/selectors'
import { transactionDirection } from '@/domain/money/presentation'
import { useWishlist } from '@/features/wishlist/hooks/WishlistProvider'
import { formatDate, formatMoney, formatPercent } from '@/lib/format'

export function OverviewPage() {
  const money = useMoney()
  const account = useAccount()
  const wishlist = useWishlist()

  const available = totalAvailableInKes(
    money.subaccounts,
    money.entries,
    money.fxRates,
  )
  const pending = totalPendingInKes(money.subaccounts, money.entries, money.fxRates)
  const reserved = totalReservedInKes(money.subaccounts, money.entries, money.fxRates)
  const creatorWallet = getCreatorWalletSummary(
    money.transactions,
    money.entries,
  )

  const monthPoints = getMonthlyPoints(money.transactions, {
    value: 'amount',
    months: ['2026-10', '2026-11'],
  })
  const previousMonth = monthPoints[0]?.revenue ?? 0
  const currentMonth = monthPoints[1]?.revenue ?? 0
  const monthGrowth =
    previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0

  const postedThisMonth = money.transactions.filter(
    (transaction) =>
      transaction.status === 'posted' &&
      transaction.createdAt.startsWith('2026-11') &&
      transactionDirection(transaction) !== 'internal',
  )
  const moneyIn = postedThisMonth
    .filter((transaction) => transactionDirection(transaction) === 'in')
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const moneyOut = postedThisMonth
    .filter((transaction) => transactionDirection(transaction) === 'out')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const upcomingBills = [...money.bills]
    .filter((bill) => bill.status !== 'paid')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3)

  const enabledServices = account.services.filter((service) => service.enabled)

  const quickActions = [
    { label: 'Send a payment', to: '/payments?tab=send' },
    { label: 'Move money', to: '/money?tab=move' },
    { label: 'Request payment', to: '/payments?tab=requests' },
    { label: 'Creator payout', to: '/work?section=payouts' },
    { label: 'Open wishlist', to: '/connections?tab=wishlist' },
  ].filter((action) => {
    if (action.to.startsWith('/work')) {
      return account.enabledServiceIds.includes('creator')
    }
    return true
  })

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{formatDate('2026-11-10')}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Good morning, {account.profile.displayName.split(' ')[0]}.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            One account, one ledger. Your money, connections and work move
            together.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-teal-400/25 bg-teal-400/5 text-teal-200">
            {money.integrity.balanced ? 'Ledger reconciled' : 'Ledger needs review'}
          </Badge>
          <Badge>{account.profile.operatingCurrency} account</Badge>
        </div>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Available"
          value={formatMoney(available)}
          sub={`${money.subaccounts.length} subaccounts · converted to KES`}
          tone="teal"
        />
        <Stat
          label="Pending"
          value={formatMoney(pending)}
          sub={`${formatMoney(reserved)} reserved`}
          tone="amber"
        />
        <Stat
          label="Money in · November"
          value={formatMoney(moneyIn)}
          sub={`${formatMoney(moneyOut)} out`}
          tone="violet"
        />
        <Stat
          label="Month activity"
          value={formatPercent(monthGrowth)}
          sub="Compared with last month"
          tone={monthGrowth >= 0 ? 'teal' : 'rose'}
        />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Recent activity</h3>
              <p className="mt-1 text-sm text-slate-400">
                Every movement posts to the same double-entry ledger.
              </p>
            </div>
            <Link
              to="/money?tab=activity"
              className="text-sm font-medium text-teal-300 transition hover:text-teal-200"
            >
              View ledger
            </Link>
          </div>

          <div className="mt-4 divide-y divide-white/5">
            {money.transactions.slice(0, 7).map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                subaccounts={money.subaccounts}
              />
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <h3 className="text-lg font-semibold">Quick actions</h3>
            <p className="mt-1 text-sm text-slate-400">
              Adaptive to the services you have enabled.
            </p>
            <div className="mt-4 space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="block rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-teal-400/40 hover:bg-teal-400/5 hover:text-teal-200"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold">Upcoming bills</h3>
              <Link
                to="/payments?tab=bills"
                className="text-xs font-medium text-teal-300 hover:text-teal-200"
              >
                Manage
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {upcomingBills.map((bill) => (
                <li key={bill.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {bill.provider}
                    </p>
                    <p className="text-xs text-slate-500">
                      {bill.category} · due {formatDate(bill.dueDate)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {formatMoney(bill.amount, bill.currency)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card>
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold">Creator balance</h3>
            <Link
              to="/work"
              className="text-xs font-medium text-teal-300 hover:text-teal-200"
            >
              Open studio
            </Link>
          </div>
          <p className="mt-3 text-3xl font-semibold text-teal-300">
            {formatMoney(creatorWallet.available)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {formatMoney(creatorWallet.pending)} pending ·{' '}
            {formatMoney(creatorWallet.reserved)} reserved
          </p>
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>This month</span>
              <span>{formatMoney(creatorWallet.monthlyRevenue)}</span>
            </div>
            <Progress
              className="mt-2"
              value={creatorWallet.monthlyRevenue}
              max={Math.max(creatorWallet.monthlyRevenue, creatorWallet.annualRevenue / 12, 1)}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Creator earnings settle into the shared Creator subaccount, not a
            separate wallet.
          </p>
        </Card>

        <Card>
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold">Savings goals</h3>
            <Link
              to="/money?tab=save"
              className="text-xs font-medium text-teal-300 hover:text-teal-200"
            >
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-4">
            {money.goals.slice(0, 3).map((goal) => (
              <li key={goal.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-200">{goal.name}</span>
                  <span className="text-slate-400">
                    {formatMoney(goal.saved, goal.currency)}
                  </span>
                </div>
                <Progress
                  className="mt-2"
                  value={goal.saved}
                  max={goal.target}
                  label={goal.name}
                />
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold">Connections</h3>
            <Link
              to="/connections?tab=wishlist"
              className="text-xs font-medium text-teal-300 hover:text-teal-200"
            >
              Open wishlist
            </Link>
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">
            {wishlist.stats.giftCount} gifts
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {formatMoney(wishlist.stats.totalValue, 'USD')} list value ·{' '}
            {wishlist.stats.privateCount} private links
          </p>
          <div className="mt-5 space-y-2">
            {wishlist.wishlists.slice(0, 3).map((list) => (
              <div
                key={list.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
              >
                <span className="text-slate-300">{list.title}</span>
                <span className="text-xs text-slate-500">
                  {wishlist.wishlistGiftCounts[list.id] ?? 0} items
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Active services</h3>
          <p className="mt-1 text-sm text-slate-400">
            Navigation adapts as you enable or disable services.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {enabledServices.map((service) => (
              <div
                key={service.id}
                className="rounded-xl border border-white/10 bg-slate-950/60 p-3"
              >
                <p className="text-sm font-medium text-slate-200">
                  {service.label}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <Link
            to="/account?tab=services"
            className="mt-4 inline-flex text-sm font-medium text-teal-300 transition hover:text-teal-200"
          >
            Manage services
          </Link>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Ledger integrity</h3>
          <p className="mt-1 text-sm text-slate-400">
            The shared ledger is authoritative across every service.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Entries
              </p>
              <p className="mt-1 text-xl font-semibold">
                {money.integrity.entryCount}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Unbalanced
              </p>
              <p className="mt-1 text-xl font-semibold">
                {money.integrity.unbalancedTransactions.length}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Last reconciled {formatDate(money.integrity.lastReconciledAt)}.
          </p>
          <Link
            to="/insights?scope=ledger"
            className="mt-4 inline-flex text-sm font-medium text-teal-300 transition hover:text-teal-200"
          >
            Inspect ledger
          </Link>
        </Card>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-slate-600">
        Demo data only. External rails are labelled sandbox, eligibility
        required or not connected. No live M-PESA, card, bank, SWIFT, Wise,
        PayPal or USDC processing is enabled.
      </p>
    </>
  )
}

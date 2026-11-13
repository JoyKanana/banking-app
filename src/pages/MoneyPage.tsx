import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Progress,
  Stat,
  Tabs,
} from '@/components/ui'
import { TransactionRow } from '@/components/money/TransactionRow'
import { useMoney } from '@/domain/money/store'
import {
  getSubaccountBalances,
  totalAvailableInKes,
  totalPendingInKes,
  totalReservedInKes,
} from '@/domain/money/selectors'
import { railStatusLabels } from '@/domain/money/presentation'
import type { CurrencyCode, PaymentRailId, SubaccountKind } from '@/domain/money/types'
import { formatDate, formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

type MoneyTab = 'accounts' | 'activity' | 'move' | 'save' | 'cards'

type Feedback = { tone: 'success' | 'warning' | 'info'; text: string } | null

const tabs: { id: MoneyTab; label: string }[] = [
  { id: 'accounts', label: 'Subaccounts' },
  { id: 'activity', label: 'Activity' },
  { id: 'move', label: 'Move money' },
  { id: 'save', label: 'Save & plan' },
  { id: 'cards', label: 'Cards' },
]

const inputClass =
  'w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20'
const labelClass =
  'mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400'

const kindOptions: { value: SubaccountKind; label: string }[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'savings', label: 'Savings' },
  { value: 'bills', label: 'Bills' },
  { value: 'creator', label: 'Creator' },
  { value: 'business', label: 'Business' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'professional', label: 'Professional (restricted)' },
]

const currencies: CurrencyCode[] = ['KES', 'USD', 'EUR', 'GBP', 'NGN', 'ZAR']

function feedbackClass(tone: 'success' | 'warning' | 'info') {
  if (tone === 'success') return 'border-teal-400/25 bg-teal-400/5 text-teal-200'
  if (tone === 'warning') return 'border-amber-400/25 bg-amber-400/5 text-amber-200'
  return 'border-sky-400/25 bg-sky-400/5 text-sky-200'
}

export function MoneyPage() {
  const money = useMoney()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: MoneyTab = tabs.some((tab) => tab.id === tabParam)
    ? (tabParam as MoneyTab)
    : 'accounts'
  const selectedSubaccount = searchParams.get('subaccount') ?? 'all'

  const [feedback, setFeedback] = useState<Feedback>(null)

  const balances = useMemo(
    () => getSubaccountBalances(money.subaccounts, money.entries),
    [money.subaccounts, money.entries],
  )
  const available = totalAvailableInKes(
    money.subaccounts,
    money.entries,
    money.fxRates,
  )
  const pending = totalPendingInKes(money.subaccounts, money.entries, money.fxRates)
  const reserved = totalReservedInKes(money.subaccounts, money.entries, money.fxRates)

  function setTab(tab: MoneyTab) {
    const next = new URLSearchParams(searchParams)
    next.set('tab', tab)
    setSearchParams(next)
  }

  function setSubaccountFilter(subaccountId: string) {
    const next = new URLSearchParams(searchParams)
    if (subaccountId === 'all') next.delete('subaccount')
    else next.set('subaccount', subaccountId)
    setSearchParams(next)
  }

  function showFeedback(next: Feedback) {
    setFeedback(next)
  }

  return (
    <>
      <PageHeader
        eyebrow="Money"
        title="One account. Purpose-built subaccounts."
        description="Every balance belongs to the same Relay account and posts to one double-entry ledger. Subaccounts separate intent — not your identity."
        actions={
          <Badge className="border-teal-400/25 bg-teal-400/5 text-teal-200">
            {money.integrity.balanced ? 'Ledger reconciled' : 'Ledger review needed'}
          </Badge>
        }
      />

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Available"
          value={formatMoney(available)}
          sub="Converted to KES"
          tone="teal"
        />
        <Stat label="Pending" value={formatMoney(pending)} sub="Clearing or expected" tone="amber" />
        <Stat label="Reserved" value={formatMoney(reserved)} sub="Held for payouts or payments" />
      </section>

      <Tabs
        className="mt-8"
        items={tabs}
        active={activeTab}
        onChange={setTab}
      />

      {feedback && (
        <div
          className={cn(
            'mt-4 rounded-xl border px-4 py-3 text-sm',
            feedbackClass(feedback.tone),
          )}
        >
          {feedback.text}
        </div>
      )}

      <div className="mt-6">
        {activeTab === 'accounts' && (
          <AccountsTab
            balances={balances}
            selectedSubaccount={selectedSubaccount}
            onSelect={setSubaccountFilter}
            onViewActivity={() => setTab('activity')}
            onFeedback={showFeedback}
          />
        )}
        {activeTab === 'activity' && (
          <ActivityTab
            selectedSubaccount={selectedSubaccount}
            onSelect={setSubaccountFilter}
          />
        )}
        {activeTab === 'move' && <MoveTab onFeedback={showFeedback} />}
        {activeTab === 'save' && <SaveTab onFeedback={showFeedback} />}
        {activeTab === 'cards' && <CardsTab />}
      </div>
    </>
  )
}

function AccountsTab({
  balances,
  selectedSubaccount,
  onSelect,
  onViewActivity,
  onFeedback,
}: {
  balances: ReturnType<typeof getSubaccountBalances>
  selectedSubaccount: string
  onSelect: (id: string) => void
  onViewActivity: () => void
  onFeedback: (feedback: Feedback) => void
}) {
  const money = useMoney()
  const [name, setName] = useState('')
  const [kind, setKind] = useState<SubaccountKind>('savings')
  const [currency, setCurrency] = useState<CurrencyCode>('KES')
  const [description, setDescription] = useState('')

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = money.createSubaccount({
      name,
      kind,
      currency,
      description,
    })
    onFeedback({ tone: result.ok ? 'success' : 'warning', text: result.message })
    if (result.ok) {
      setName('')
      setDescription('')
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-3">
        {money.subaccounts.map((subaccount) => {
          const balance = balances.find(
            (item) => item.subaccountId === subaccount.id,
          )
          const isSelected = selectedSubaccount === subaccount.id

          return (
            <Card
              key={subaccount.id}
              className={cn(
                'p-5 transition',
                isSelected && 'border-teal-400/40 bg-teal-400/5',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{subaccount.name}</h3>
                    <Badge className="px-2.5 py-0.5 text-[11px]">
                      {subaccount.currency}
                    </Badge>
                    {subaccount.isPrimary && (
                      <Badge className="border-teal-400/30 bg-teal-400/10 px-2.5 py-0.5 text-[11px] text-teal-300">
                        Primary
                      </Badge>
                    )}
                    {subaccount.status === 'restricted' && (
                      <Badge className="border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[11px] text-amber-300">
                        Restricted
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {subaccount.description}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {subaccount.services.join(' · ')}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-semibold text-white">
                    {formatMoney(
                      balance?.available ?? 0,
                      subaccount.currency,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatMoney(balance?.pending ?? 0, subaccount.currency)} pending ·{' '}
                    {formatMoney(balance?.reserved ?? 0, subaccount.currency)} reserved
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    onSelect(subaccount.id)
                    onViewActivity()
                  }}
                >
                  View activity
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSelect(subaccount.id)}
                >
                  {isSelected ? 'Selected filter' : 'Filter ledger'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <h3 className="text-lg font-semibold">Create a subaccount</h3>
        <p className="mt-1 text-sm text-slate-400">
          Separate a purpose without creating a separate wallet or identity.
        </p>

        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          <div>
            <label htmlFor="sub-name" className={labelClass}>
              Name
            </label>
            <input
              id="sub-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Home deposit"
              required
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sub-kind" className={labelClass}>
                Purpose
              </label>
              <select
                id="sub-kind"
                value={kind}
                onChange={(event) => setKind(event.target.value as SubaccountKind)}
                className={inputClass}
              >
                {kindOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sub-currency" className={labelClass}>
                Currency
              </label>
              <select
                id="sub-currency"
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value as CurrencyCode)
                }
                className={inputClass}
              >
                {currencies.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="sub-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="sub-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="What is this balance for?"
              className={`${inputClass} resize-none`}
            />
          </div>

          <Button type="submit" className="w-full">
            Create subaccount
          </Button>
        </form>

        <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-500">
          Professional subaccounts remain restricted until age, consent and
          provider approval requirements are satisfied. No prohibited payment
          processing is implied.
        </p>
      </Card>
    </div>
  )
}

function ActivityTab({
  selectedSubaccount,
  onSelect,
}: {
  selectedSubaccount: string
  onSelect: (id: string) => void
}) {
  const money = useMoney()
  const [kind, setKind] = useState('all')
  const [query, setQuery] = useState('')

  const transactions = money.transactions.filter((transaction) => {
    if (
      selectedSubaccount !== 'all' &&
      transaction.fromSubaccountId !== selectedSubaccount &&
      transaction.toSubaccountId !== selectedSubaccount
    ) {
      return false
    }
    if (kind !== 'all' && transaction.kind !== kind) return false
    if (query.trim()) {
      const term = query.trim().toLowerCase()
      return `${transaction.description} ${transaction.counterparty} ${transaction.reference}`
        .toLowerCase()
        .includes(term)
    }
    return true
  })

  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Shared ledger activity</h3>
          <p className="mt-1 text-sm text-slate-400">
            {transactions.length} entries · balances derive from posted and
            reserved entries.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedSubaccount}
            onChange={(event) => onSelect(event.target.value)}
            aria-label="Filter by subaccount"
            className={inputClass}
          >
            <option value="all">All subaccounts</option>
            {money.subaccounts.map((subaccount) => (
              <option key={subaccount.id} value={subaccount.id}>
                {subaccount.name}
              </option>
            ))}
          </select>
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value)}
            aria-label="Filter by transaction type"
            className={inputClass}
          >
            <option value="all">All types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="transfer">Transfers</option>
            <option value="payment">Payments</option>
            <option value="creator_earning">Creator earnings</option>
            <option value="bill">Bills</option>
            <option value="refund">Refunds</option>
            <option value="reversal">Reversals</option>
          </select>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ledger"
            aria-label="Search ledger"
            className={inputClass}
          />
        </div>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No matching entries"
          description="Try another subaccount, type or search term."
        />
      ) : (
        <div className="mt-4 divide-y divide-white/5">
          {transactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              subaccounts={money.subaccounts}
            />
          ))}
        </div>
      )}
    </Card>
  )
}

function MoveTab({ onFeedback }: { onFeedback: (feedback: Feedback) => void }) {
  const money = useMoney()
  const [fromId, setFromId] = useState('sub-personal')
  const [toId, setToId] = useState('sub-savings')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferNote, setTransferNote] = useState('')

  const [depositId, setDepositId] = useState('sub-personal')
  const [depositAmount, setDepositAmount] = useState('')
  const [depositRail, setDepositRail] = useState<PaymentRailId>('bank')

  const [withdrawId, setWithdrawId] = useState('sub-creator')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [destinationId, setDestinationId] = useState('dest-mpesa')

  function submitTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = money.transfer({
      fromSubaccountId: fromId,
      toSubaccountId: toId,
      amount: Number(transferAmount),
      description: transferNote,
    })
    onFeedback({ tone: result.ok ? 'success' : 'warning', text: result.message })
    if (result.ok) {
      setTransferAmount('')
      setTransferNote('')
    }
  }

  function submitDeposit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = money.deposit({
      subaccountId: depositId,
      amount: Number(depositAmount),
      rail: depositRail,
    })
    onFeedback({ tone: result.ok ? 'success' : 'warning', text: result.message })
    if (result.ok) setDepositAmount('')
  }

  function submitWithdrawal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = money.withdraw({
      subaccountId: withdrawId,
      amount: Number(withdrawAmount),
      destinationId,
    })
    onFeedback({ tone: result.ok ? 'success' : 'warning', text: result.message })
    if (result.ok) setWithdrawAmount('')
  }

  const depositRails = money.rails.filter(
    (rail) => rail.status !== 'not_connected',
  )

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card>
        <h3 className="text-lg font-semibold">Transfer between subaccounts</h3>
        <p className="mt-1 text-sm text-slate-400">
          Internal movements settle instantly in the shared ledger, including FX.
        </p>
        <form onSubmit={submitTransfer} className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>From</label>
            <select
              value={fromId}
              onChange={(event) => setFromId(event.target.value)}
              className={inputClass}
            >
              {money.subaccounts.map((subaccount) => (
                <option key={subaccount.id} value={subaccount.id}>
                  {subaccount.name} · {subaccount.currency}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>To</label>
            <select
              value={toId}
              onChange={(event) => setToId(event.target.value)}
              className={inputClass}
            >
              {money.subaccounts.map((subaccount) => (
                <option key={subaccount.id} value={subaccount.id}>
                  {subaccount.name} · {subaccount.currency}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Amount</label>
            <input
              type="number"
              min={1}
              step={0.01}
              value={transferAmount}
              onChange={(event) => setTransferAmount(event.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Note</label>
            <input
              value={transferNote}
              onChange={(event) => setTransferNote(event.target.value)}
              placeholder="Optional description"
              className={inputClass}
            />
          </div>
          <Button type="submit" className="w-full">
            Transfer
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Add money</h3>
        <p className="mt-1 text-sm text-slate-400">
          Sandbox deposits are recorded in the ledger but do not move real money.
        </p>
        <form onSubmit={submitDeposit} className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>Subaccount</label>
            <select
              value={depositId}
              onChange={(event) => setDepositId(event.target.value)}
              className={inputClass}
            >
              {money.subaccounts.map((subaccount) => (
                <option key={subaccount.id} value={subaccount.id}>
                  {subaccount.name} · {subaccount.currency}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Amount</label>
            <input
              type="number"
              min={1}
              step={0.01}
              value={depositAmount}
              onChange={(event) => setDepositAmount(event.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Rail</label>
            <select
              value={depositRail}
              onChange={(event) =>
                setDepositRail(event.target.value as PaymentRailId)
              }
              className={inputClass}
            >
              {depositRails.map((rail) => (
                <option key={rail.id} value={rail.id}>
                  {rail.label} · {railStatusLabels[rail.status]}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              {money.rails.find((rail) => rail.id === depositRail)?.note}
            </p>
          </div>
          <Button type="submit" className="w-full">
            Record deposit
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Withdraw</h3>
        <p className="mt-1 text-sm text-slate-400">
          Withdrawals reserve funds first, then settle when a provider confirms.
        </p>
        <form onSubmit={submitWithdrawal} className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>Subaccount</label>
            <select
              value={withdrawId}
              onChange={(event) => setWithdrawId(event.target.value)}
              className={inputClass}
            >
              {money.subaccounts.map((subaccount) => (
                <option key={subaccount.id} value={subaccount.id}>
                  {subaccount.name} · {subaccount.currency}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Destination</label>
            <select
              value={destinationId}
              onChange={(event) => setDestinationId(event.target.value)}
              className={inputClass}
            >
              {money.destinations.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.label} · {destination.verified ? 'Verified' : 'In review'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Amount</label>
            <input
              type="number"
              min={1}
              step={0.01}
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              className={inputClass}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Request withdrawal
          </Button>
        </form>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          M-PESA and bank destinations are sandbox records until provider access
          is live. USDC remains in compliance review.
        </p>
      </Card>
    </div>
  )
}

function SaveTab({ onFeedback }: { onFeedback: (feedback: Feedback) => void }) {
  const money = useMoney()
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalCurrency, setGoalCurrency] = useState<CurrencyCode>('KES')
  const [goalSubaccount, setGoalSubaccount] = useState('sub-savings')
  const [goalDeadline, setGoalDeadline] = useState('')

  const [selectedGoal, setSelectedGoal] = useState(money.goals[0]?.id ?? '')
  const [contribution, setContribution] = useState('')
  const [fromId, setFromId] = useState('sub-personal')

  function handleAddGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = money.addGoal({
      name: goalName,
      target: Number(goalTarget),
      currency: goalCurrency,
      subaccountId: goalSubaccount,
      deadline: goalDeadline || undefined,
    })
    onFeedback({ tone: result.ok ? 'success' : 'warning', text: result.message })
    if (result.ok) {
      setGoalName('')
      setGoalTarget('')
      setGoalDeadline('')
    }
  }

  function handleContribute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = money.contributeToGoal(
      selectedGoal,
      Number(contribution),
      fromId,
    )
    onFeedback({ tone: result.ok ? 'success' : 'warning', text: result.message })
    if (result.ok) setContribution('')
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        {money.goals.map((goal) => (
          <Card key={goal.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{goal.name}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {goal.deadline ? `Target ${formatDate(goal.deadline)}` : 'No deadline'}
                </p>
              </div>
              <Badge className="px-2.5 py-0.5 text-[11px]">
                {goal.currency}
              </Badge>
            </div>
            <p className="mt-4 text-2xl font-semibold text-white">
              {formatMoney(goal.saved, goal.currency)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              of {formatMoney(goal.target, goal.currency)}
            </p>
            <Progress
              className="mt-4"
              value={goal.saved}
              max={goal.target}
              label={goal.name}
            />
            <p className="mt-2 text-xs text-slate-500">
              {Math.round((goal.saved / Math.max(goal.target, 1)) * 100)}% funded
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Contribute to a goal</h3>
          <form onSubmit={handleContribute} className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>Goal</label>
              <select
                value={selectedGoal}
                onChange={(event) => setSelectedGoal(event.target.value)}
                className={inputClass}
              >
                {money.goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>From</label>
              <select
                value={fromId}
                onChange={(event) => setFromId(event.target.value)}
                className={inputClass}
              >
                {money.subaccounts.map((subaccount) => (
                  <option key={subaccount.id} value={subaccount.id}>
                    {subaccount.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Amount</label>
              <input
                type="number"
                min={1}
                value={contribution}
                onChange={(event) => setContribution(event.target.value)}
                className={inputClass}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Add to goal
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">New savings goal</h3>
          <form onSubmit={handleAddGoal} className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                value={goalName}
                onChange={(event) => setGoalName(event.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Target</label>
                <input
                  type="number"
                  min={1}
                  value={goalTarget}
                  onChange={(event) => setGoalTarget(event.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <select
                  value={goalCurrency}
                  onChange={(event) =>
                    setGoalCurrency(event.target.value as CurrencyCode)
                  }
                  className={inputClass}
                >
                  {currencies.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Subaccount</label>
                <select
                  value={goalSubaccount}
                  onChange={(event) => setGoalSubaccount(event.target.value)}
                  className={inputClass}
                >
                  {money.subaccounts.map((subaccount) => (
                    <option key={subaccount.id} value={subaccount.id}>
                      {subaccount.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Deadline</label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(event) => setGoalDeadline(event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create goal
            </Button>
          </form>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Budgets</h3>
          <div className="mt-4 space-y-4">
            {money.budgets.map((budget) => (
              <div key={budget.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-200">
                    {budget.name}
                  </span>
                  <span className="text-slate-400">
                    {formatMoney(budget.spent, budget.currency)} of{' '}
                    {formatMoney(budget.limit, budget.currency)}
                  </span>
                </div>
                <Progress
                  className="mt-2"
                  value={budget.spent}
                  max={budget.limit}
                  tone={budget.spent > budget.limit ? 'rose' : 'teal'}
                  label={budget.name}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Spending limits</h3>
          <div className="mt-4 space-y-3">
            {money.limits.map((limit) => (
              <div
                key={limit.id}
                className="rounded-xl border border-white/10 bg-slate-950/60 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-200">
                    {limit.scope}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatMoney(limit.dailyLimit, limit.currency)} / day
                  </p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Used {formatMoney(limit.usedToday, limit.currency)} today ·{' '}
                  {formatMoney(limit.usedMonth, limit.currency)} this month
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function CardsTab() {
  const money = useMoney()

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {money.cards.map((card) => (
        <Card key={card.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {card.type} card
              </p>
              <h3 className="mt-1 text-lg font-semibold">{card.label}</h3>
              <p className="mt-1 font-mono text-sm text-slate-400">
                {card.network} ···· {card.last4}
              </p>
            </div>
            <Badge
              className={cn(
                'px-2.5 py-0.5 text-[11px]',
                card.status === 'frozen'
                  ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                  : 'border-teal-400/30 bg-teal-400/10 text-teal-300',
              )}
            >
              {card.status}
            </Badge>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Spend limit
              </p>
              <p className="mt-1 font-semibold text-white">
                {formatMoney(card.spendLimit, card.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Spent
              </p>
              <p className="mt-1 font-semibold text-white">
                {formatMoney(card.spent, card.currency)}
              </p>
            </div>
          </div>

          <Progress
            className="mt-4"
            value={card.spent}
            max={card.spendLimit}
            tone={card.spent > card.spendLimit ? 'rose' : 'teal'}
            label={`${card.label} spending`}
          />

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Linked to{' '}
              {money.subaccounts.find(
                (subaccount) => subaccount.id === card.subaccountId,
              )?.name ?? 'subaccount'}
            </p>
            <Button
              size="sm"
              variant={card.status === 'frozen' ? 'secondary' : 'danger'}
              onClick={() => money.toggleCardFreeze(card.id)}
            >
              {card.status === 'frozen' ? 'Unfreeze' : 'Freeze card'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

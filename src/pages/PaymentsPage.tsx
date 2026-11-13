import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Stat,
  Tabs,
} from '@/components/ui'
import { useMoney } from '@/domain/money/store'
import { railLabels, railStatusLabels } from '@/domain/money/presentation'
import type {
  CurrencyCode,
  PaymentRailId,
  PaymentRequestDirection,
  ScheduledPaymentFrequency,
} from '@/domain/money/types'
import { formatDate, formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

type PaymentsTab = 'send' | 'track' | 'requests' | 'links' | 'bills' | 'scheduled'
type Feedback = { tone: 'success' | 'warning' | 'info'; text: string } | null

const tabs: { id: PaymentsTab; label: string }[] = [
  { id: 'send', label: 'Send' },
  { id: 'track', label: 'Track' },
  { id: 'requests', label: 'Requests' },
  { id: 'links', label: 'Payment links' },
  { id: 'bills', label: 'Bills' },
  { id: 'scheduled', label: 'Scheduled' },
]

const inputClass =
  'w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20'
const labelClass =
  'mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400'
const currencies: CurrencyCode[] = ['KES', 'USD', 'EUR', 'GBP', 'NGN', 'ZAR']

const feedbackClasses = {
  success: 'border-teal-400/25 bg-teal-400/5 text-teal-200',
  warning: 'border-amber-400/25 bg-amber-400/5 text-amber-200',
  info: 'border-sky-400/25 bg-sky-400/5 text-sky-200',
}

export function PaymentsPage() {
  const money = useMoney()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: PaymentsTab = tabs.some((tab) => tab.id === tabParam)
    ? (tabParam as PaymentsTab)
    : 'send'
  const [feedback, setFeedback] = useState<Feedback>(null)

  const openRequests = money.paymentRequests.filter(
    (request) => request.status === 'open',
  ).length
  const unpaidBills = money.bills.filter((bill) => bill.status !== 'paid')
  const dueTotal = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0)

  function setTab(tab: PaymentsTab) {
    const next = new URLSearchParams(searchParams)
    next.set('tab', tab)
    setSearchParams(next)
  }

  return (
    <>
      <PageHeader
        eyebrow="Payments"
        title="Move money with a clear status."
        description="Send, request, bill and schedule payments from any subaccount. Each attempt is tracked in the shared ledger with honest rail availability."
        actions={
          <Badge className="border-amber-400/25 bg-amber-400/5 text-amber-200">
            External rails are sandbox unless marked live
          </Badge>
        }
      />

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Open requests"
          value={String(openRequests)}
          sub="Awaiting action"
          tone={openRequests > 0 ? 'amber' : 'default'}
        />
        <Stat
          label="Bills due"
          value={formatMoney(dueTotal)}
          sub={`${unpaidBills.length} unpaid`}
        />
        <Stat
          label="Scheduled"
          value={String(
            money.scheduledPayments.filter((payment) => payment.status === 'active')
              .length,
          )}
          sub="Active recurring payments"
          tone="teal"
        />
      </section>

      <Tabs
        className="mt-8"
        items={tabs.map((tab) => ({
          ...tab,
          count: tab.id === 'requests' ? openRequests : undefined,
        }))}
        active={activeTab}
        onChange={setTab}
      />

      {feedback && (
        <div
          className={cn(
            'mt-4 rounded-xl border px-4 py-3 text-sm',
            feedbackClasses[feedback.tone],
          )}
        >
          {feedback.text}
        </div>
      )}

      <div className="mt-6">
        {activeTab === 'send' && <SendTab onFeedback={setFeedback} />}
        {activeTab === 'track' && <TrackTab onFeedback={setFeedback} />}
        {activeTab === 'requests' && <RequestsTab onFeedback={setFeedback} />}
        {activeTab === 'links' && <LinksTab onFeedback={setFeedback} />}
        {activeTab === 'bills' && <BillsTab onFeedback={setFeedback} />}
        {activeTab === 'scheduled' && <ScheduledTab onFeedback={setFeedback} />}
      </div>
    </>
  )
}

function SendTab({ onFeedback }: { onFeedback: (feedback: Feedback) => void }) {
  const money = useMoney()
  const [subaccountId, setSubaccountId] = useState('sub-personal')
  const [counterparty, setCounterparty] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('KES')
  const [rail, setRail] = useState<PaymentRailId>('relay')
  const [description, setDescription] = useState('')

  const selectedRail = money.rails.find((item) => item.id === rail)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = money.sendPayment({
      subaccountId,
      counterparty,
      amount: Number(amount),
      currency,
      rail,
      description,
    })
    onFeedback({ tone: result.ok ? 'success' : 'warning', text: result.message })
    if (result.ok) {
      setCounterparty('')
      setAmount('')
      setDescription('')
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <Card>
        <h3 className="text-lg font-semibold">Send a payment</h3>
        <p className="mt-1 text-sm text-slate-400">
          Relay is the live internal rail. Other rails are labelled by status.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>From subaccount</label>
            <select
              value={subaccountId}
              onChange={(event) => setSubaccountId(event.target.value)}
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
            <label className={labelClass}>Recipient</label>
            <input
              value={counterparty}
              onChange={(event) => setCounterparty(event.target.value)}
              placeholder="Person, business or biller"
              required
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Amount</label>
              <input
                type="number"
                min={1}
                step={0.01}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select
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
            <label className={labelClass}>Rail</label>
            <select
              value={rail}
              onChange={(event) => setRail(event.target.value as PaymentRailId)}
              className={inputClass}
            >
              {money.rails.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} · {railStatusLabels[item.status]}
                </option>
              ))}
            </select>
            {selectedRail && (
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                {selectedRail.description} {selectedRail.note}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this payment for?"
              className={inputClass}
            />
          </div>
          <Button type="submit" className="w-full">
            Submit payment
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Rail availability</h3>
        <p className="mt-1 text-sm text-slate-400">
          This app does not claim operational access to providers it does not have.
        </p>
        <div className="mt-4 space-y-2">
          {money.rails.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-200">{item.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.note}</p>
              </div>
              <Badge
                className={cn(
                  'shrink-0 px-2.5 py-0.5 text-[10px]',
                  item.status === 'available' &&
                    'border-teal-400/30 bg-teal-400/10 text-teal-300',
                  item.status === 'sandbox' &&
                    'border-sky-400/30 bg-sky-400/10 text-sky-300',
                  item.status === 'eligibility_required' &&
                    'border-amber-400/30 bg-amber-400/10 text-amber-300',
                  item.status === 'not_connected' &&
                    'border-slate-400/30 bg-slate-400/10 text-slate-300',
                )}
              >
                {railStatusLabels[item.status]}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function TrackTab({ onFeedback }: { onFeedback: (feedback: Feedback) => void }) {
  const money = useMoney()
  const tracked = money.transactions
    .filter((transaction) =>
      ['payment', 'transfer', 'bill', 'request'].includes(transaction.kind),
    )
    .slice(0, 20)

  function settle(transactionId: string) {
    const result = money.settleTransaction(transactionId)
    onFeedback({ tone: result.ok ? 'success' : 'warning', text: result.message })
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold">Track payments</h3>
      <p className="mt-1 text-sm text-slate-400">
        Every submitted payment stays visible with its rail and ledger status.
      </p>

      <div className="mt-4 divide-y divide-white/5">
        {tracked.length === 0 && (
          <EmptyState
            className="mt-4"
            title="Nothing in flight"
            description="Payments you send or schedule will appear here."
          />
        )}
        {tracked.map((transaction) => (
          <div
            key={transaction.id}
            className="flex flex-wrap items-start justify-between gap-3 py-4"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-100">
                  {transaction.counterparty}
                </p>
                <Badge className="px-2.5 py-0.5 text-[10px]">
                  {transaction.kind}
                </Badge>
                <Badge
                  className={cn(
                    'px-2.5 py-0.5 text-[10px]',
                    transaction.status === 'posted' &&
                      'border-teal-400/30 bg-teal-400/10 text-teal-300',
                    transaction.status === 'failed' &&
                      'border-rose-400/30 bg-rose-400/10 text-rose-300',
                    transaction.status === 'reversed' &&
                      'border-slate-400/30 bg-slate-400/10 text-slate-300',
                    (transaction.status === 'pending' ||
                      transaction.status === 'processing') &&
                      'border-amber-400/30 bg-amber-400/10 text-amber-300',
                  )}
                >
                  {transaction.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {transaction.reference} · {railLabels[transaction.rail]} ·{' '}
                {formatDate(transaction.createdAt)} · {transaction.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-white">
                {formatMoney(transaction.amount, transaction.currency)}
              </p>
              {(transaction.status === 'pending' ||
                transaction.status === 'processing') && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => settle(transaction.id)}
                >
                  Settle
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function RequestsTab({ onFeedback }: { onFeedback: (feedback: Feedback) => void }) {
  const money = useMoney()
  const [direction, setDirection] = useState<PaymentRequestDirection>('incoming')
  const [counterparty, setCounterparty] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('KES')
  const [note, setNote] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [subaccountId, setSubaccountId] = useState('sub-personal')

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const request = money.createPaymentRequest({
      direction,
      counterparty,
      amount: Number(amount),
      currency,
      note,
      subaccountId,
      dueAt: dueAt || undefined,
    })
    onFeedback({
      tone: 'success',
      text: `${request.reference} created for ${formatMoney(request.amount, request.currency)}.`,
    })
    setCounterparty('')
    setAmount('')
    setNote('')
    setDueAt('')
  }

  function handleMarkPaid(id: string) {
    const result = money.markPaymentRequestPaid(id)
    onFeedback({ tone: result.ok ? 'success' : 'warning', text: result.message })
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
      <Card>
        <h3 className="text-lg font-semibold">Payment requests</h3>
        <p className="mt-1 text-sm text-slate-400">
          Incoming requests collect money. Outgoing requests reserve funds when paid.
        </p>

        <div className="mt-4 divide-y divide-white/5">
          {money.paymentRequests.length === 0 && (
            <EmptyState
              className="mt-4"
              title="No requests yet"
              description="Create your first request from the form."
            />
          )}
          {money.paymentRequests.map((request) => (
            <div key={request.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-100">
                      {request.counterparty}
                    </p>
                    <Badge className="px-2.5 py-0.5 text-[10px]">
                      {request.direction}
                    </Badge>
                    <Badge
                      className={cn(
                        'px-2.5 py-0.5 text-[10px]',
                        request.status === 'open' &&
                          'border-amber-400/30 bg-amber-400/10 text-amber-300',
                        request.status === 'paid' &&
                          'border-teal-400/30 bg-teal-400/10 text-teal-300',
                        request.status === 'declined' &&
                          'border-rose-400/30 bg-rose-400/10 text-rose-300',
                      )}
                    >
                      {request.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {request.reference} · {request.note || 'No note'} ·{' '}
                    {request.dueAt ? `due ${formatDate(request.dueAt)}` : 'no due date'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {formatMoney(request.amount, request.currency)}
                  </p>
                  {request.status === 'open' && (
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMarkPaid(request.id)}
                      >
                        Mark paid
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => money.declinePaymentRequest(request.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">New request</h3>
        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>Direction</label>
            <select
              value={direction}
              onChange={(event) =>
                setDirection(event.target.value as PaymentRequestDirection)
              }
              className={inputClass}
            >
              <option value="incoming">Incoming — collect money</option>
              <option value="outgoing">Outgoing — pay someone</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Counterparty</label>
            <input
              value={counterparty}
              onChange={(event) => setCounterparty(event.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Amount</label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select
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
            <label className={labelClass}>Subaccount</label>
            <select
              value={subaccountId}
              onChange={(event) => setSubaccountId(event.target.value)}
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
            <label className={labelClass}>Note</label>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Due date</label>
            <input
              type="date"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
              className={inputClass}
            />
          </div>
          <Button type="submit" className="w-full">
            Create request
          </Button>
        </form>
      </Card>
    </div>
  )
}

function LinksTab({ onFeedback }: { onFeedback: (feedback: Feedback) => void }) {
  const money = useMoney()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('KES')
  const [source, setSource] = useState('services')
  const [description, setDescription] = useState('')

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const link = money.createPaymentLink({
      title,
      amount: amount.trim() ? Number(amount) : null,
      currency,
      source,
      description,
    })
    onFeedback({
      tone: 'success',
      text: `${link.title} created. Share relay.app/pay/${link.slug}.`,
    })
    setTitle('')
    setAmount('')
    setDescription('')
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
      <Card>
        <h3 className="text-lg font-semibold">Payment links</h3>
        <p className="mt-1 text-sm text-slate-400">
          Shareable collection pages for one-off or variable payments.
        </p>
        <div className="mt-4 space-y-3">
          {money.paymentLinks.map((link) => (
            <div
              key={link.id}
              className="rounded-xl border border-white/10 bg-slate-950/60 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-100">
                      {link.title}
                    </p>
                    <Badge
                      className={cn(
                        'px-2.5 py-0.5 text-[10px]',
                        link.status === 'active'
                          ? 'border-teal-400/30 bg-teal-400/10 text-teal-300'
                          : 'border-amber-400/30 bg-amber-400/10 text-amber-300',
                      )}
                    >
                      {link.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    relay.app/pay/{link.slug} · {link.source} ·{' '}
                    {link.type === 'fixed'
                      ? formatMoney(link.amount ?? 0, link.currency)
                      : 'Any amount'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {formatMoney(link.revenue, link.currency)}
                  </p>
                  <p className="text-xs text-slate-500">{link.payments} payments</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => money.togglePaymentLink(link.id)}
                >
                  {link.status === 'active' ? 'Pause link' : 'Activate link'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">New payment link</h3>
        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Amount (optional)</label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Any amount"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select
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
            <label className={labelClass}>Source</label>
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <Button type="submit" className="w-full">
            Create link
          </Button>
        </form>
      </Card>
    </div>
  )
}

function BillsTab({ onFeedback }: { onFeedback: (feedback: Feedback) => void }) {
  const money = useMoney()
  const [sourceByBill, setSourceByBill] = useState<Record<string, string>>({})

  function payBill(billId: string) {
    const subaccountId = sourceByBill[billId] ?? 'sub-bills'
    const result = money.payBill(billId, subaccountId)
    onFeedback({ tone: result.ok ? 'success' : 'warning', text: result.message })
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold">Bills</h3>
      <p className="mt-1 text-sm text-slate-400">
        Bill payments post to the ledger and are marked as sandbox biller records.
      </p>
      <div className="mt-4 divide-y divide-white/5">
        {money.bills.map((bill) => (
          <div key={bill.id} className="py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-100">
                    {bill.provider}
                  </p>
                  <Badge className="px-2.5 py-0.5 text-[10px]">
                    {bill.category}
                  </Badge>
                  <Badge
                    className={cn(
                      'px-2.5 py-0.5 text-[10px]',
                      bill.status === 'paid' &&
                        'border-teal-400/30 bg-teal-400/10 text-teal-300',
                      bill.status === 'overdue' &&
                        'border-rose-400/30 bg-rose-400/10 text-rose-300',
                      (bill.status === 'due' || bill.status === 'scheduled') &&
                        'border-amber-400/30 bg-amber-400/10 text-amber-300',
                    )}
                  >
                    {bill.status}
                  </Badge>
                  {bill.autopay && (
                    <Badge className="border-sky-400/30 bg-sky-400/10 px-2.5 py-0.5 text-[10px] text-sky-300">
                      Autopay
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Due {formatDate(bill.dueDate)} · {bill.accountRef}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-white">
                  {formatMoney(bill.amount, bill.currency)}
                </p>
                {bill.status !== 'paid' && (
                  <>
                    <select
                      value={sourceByBill[bill.id] ?? 'sub-bills'}
                      onChange={(event) =>
                        setSourceByBill((current) => ({
                          ...current,
                          [bill.id]: event.target.value,
                        }))
                      }
                      aria-label={`Source subaccount for ${bill.provider}`}
                      className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 text-xs text-slate-300"
                    >
                      {money.subaccounts.map((subaccount) => (
                        <option key={subaccount.id} value={subaccount.id}>
                          {subaccount.name}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" onClick={() => payBill(bill.id)}>
                      Pay bill
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ScheduledTab({
  onFeedback,
}: {
  onFeedback: (feedback: Feedback) => void
}) {
  const money = useMoney()
  const [counterparty, setCounterparty] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('KES')
  const [frequency, setFrequency] =
    useState<ScheduledPaymentFrequency>('monthly')
  const [nextRun, setNextRun] = useState('')
  const [rail, setRail] = useState<PaymentRailId>('relay')
  const [note, setNote] = useState('')
  const [subaccountId, setSubaccountId] = useState('sub-personal')

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = money.createScheduledPayment({
      counterparty,
      amount: Number(amount),
      currency,
      frequency,
      nextRun,
      rail,
      note,
      subaccountId,
    })
    onFeedback({ tone: result.ok ? 'success' : 'warning', text: result.message })
    if (result.ok) {
      setCounterparty('')
      setAmount('')
      setNote('')
      setNextRun('')
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
      <Card>
        <h3 className="text-lg font-semibold">Scheduled payments</h3>
        <p className="mt-1 text-sm text-slate-400">
          Recurring payments remain visible and can be paused at any time.
        </p>
        <div className="mt-4 divide-y divide-white/5">
          {money.scheduledPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-100">
                    {payment.counterparty}
                  </p>
                  <Badge className="px-2.5 py-0.5 text-[10px]">
                    {payment.frequency}
                  </Badge>
                  <Badge
                    className={cn(
                      'px-2.5 py-0.5 text-[10px]',
                      payment.status === 'active'
                        ? 'border-teal-400/30 bg-teal-400/10 text-teal-300'
                        : 'border-amber-400/30 bg-amber-400/10 text-amber-300',
                    )}
                  >
                    {payment.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {railLabels[payment.rail]} · next {formatDate(payment.nextRun)} ·{' '}
                  {payment.note || 'No note'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-white">
                  {formatMoney(payment.amount, payment.currency)}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => money.toggleScheduledPayment(payment.id)}
                >
                  {payment.status === 'active' ? 'Pause' : 'Resume'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">New scheduled payment</h3>
        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>Counterparty</label>
            <input
              value={counterparty}
              onChange={(event) => setCounterparty(event.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Amount</label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Frequency</label>
              <select
                value={frequency}
                onChange={(event) =>
                  setFrequency(event.target.value as ScheduledPaymentFrequency)
                }
                className={inputClass}
              >
                <option value="once">Once</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Next run</label>
              <input
                type="date"
                value={nextRun}
                onChange={(event) => setNextRun(event.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subaccount</label>
            <select
              value={subaccountId}
              onChange={(event) => setSubaccountId(event.target.value)}
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
            <label className={labelClass}>Rail</label>
            <select
              value={rail}
              onChange={(event) => setRail(event.target.value as PaymentRailId)}
              className={inputClass}
            >
              {money.rails.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} · {railStatusLabels[item.status]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Note</label>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className={inputClass}
            />
          </div>
          <Button type="submit" className="w-full">
            Schedule payment
          </Button>
        </form>
      </Card>
    </div>
  )
}

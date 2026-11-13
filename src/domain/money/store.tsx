import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { usePersistentState } from '@/hooks/usePersistentState'
import { useAccount } from '../account/store'
import {
  fxRates,
  initialBills,
  initialBudgets,
  initialCards,
  initialGoals,
  initialLedgerEntries,
  initialLimits,
  initialPaymentLinks,
  initialPaymentRequests,
  initialScheduledPayments,
  initialSubaccounts,
  initialTransactions,
  lastReconciledAt,
  paymentRails,
  payoutDestinations,
} from './data'
import {
  buildTransaction,
  createLedgerId,
  getLedgerIntegrity,
  getSubaccountBalance,
  reverseEntries,
} from './ledger'
import type { BuiltTransaction } from './ledger'
import type {
  Bill,
  Budget,
  Card,
  CreatorEarningInput,
  CurrencyCode,
  DepositInput,
  FxQuote,
  FxRate,
  LedgerEntry,
  MoneyTransaction,
  NewExpenseInput,
  NewGoalInput,
  NewPaymentLinkInput,
  NewPaymentRequestInput,
  NewScheduledPaymentInput,
  NewSubaccountInput,
  OutgoingPaymentInput,
  PaymentLink,
  PaymentRailId,
  PaymentRequest,
  PayoutDestination,
  SavingsGoal,
  ScheduledPayment,
  SpendingLimit,
  Subaccount,
  SubaccountBalance,
  TransferInput,
  WithdrawalInput,
} from './types'

export type MoneyActionResult = {
  ok: boolean
  message: string
  transactionId?: string
}

type MoneyStore = {
  subaccounts: Subaccount[]
  transactions: MoneyTransaction[]
  entries: LedgerEntry[]
  paymentRequests: PaymentRequest[]
  paymentLinks: PaymentLink[]
  bills: Bill[]
  scheduledPayments: ScheduledPayment[]
  cards: Card[]
  goals: SavingsGoal[]
  budgets: Budget[]
  limits: SpendingLimit[]
  destinations: PayoutDestination[]
  rails: typeof paymentRails
  fxRates: FxRate[]
  integrity: ReturnType<typeof getLedgerIntegrity>
  getBalance: (subaccountId: string) => SubaccountBalance
  getFxQuote: (from: CurrencyCode, to: CurrencyCode, amount: number, rail: PaymentRailId) => FxQuote
  createSubaccount: (input: NewSubaccountInput) => MoneyActionResult
  transfer: (input: TransferInput) => MoneyActionResult
  deposit: (input: DepositInput) => MoneyActionResult
  withdraw: (input: WithdrawalInput) => MoneyActionResult
  sendPayment: (input: OutgoingPaymentInput) => MoneyActionResult
  settleTransaction: (transactionId: string) => MoneyActionResult
  receiveCreatorEarning: (input: CreatorEarningInput) => MoneyActionResult
  createPaymentRequest: (input: NewPaymentRequestInput) => PaymentRequest
  markPaymentRequestPaid: (requestId: string) => MoneyActionResult
  declinePaymentRequest: (requestId: string) => void
  createPaymentLink: (input: NewPaymentLinkInput) => PaymentLink
  togglePaymentLink: (linkId: string) => void
  payBill: (billId: string, subaccountId: string) => MoneyActionResult
  createScheduledPayment: (input: NewScheduledPaymentInput) => MoneyActionResult
  toggleScheduledPayment: (paymentId: string) => void
  toggleCardFreeze: (cardId: string) => void
  addGoal: (input: NewGoalInput) => MoneyActionResult
  contributeToGoal: (goalId: string, amount: number, fromSubaccountId: string) => MoneyActionResult
  updateBudget: (budgetId: string, limit: number) => void
  updateLimit: (limitId: string, patch: Partial<SpendingLimit>) => void
  recordExpense: (input: NewExpenseInput) => MoneyActionResult
  reverseTransaction: (transactionId: string) => MoneyActionResult
}

const MoneyContext = createContext<MoneyStore | null>(null)

function nowIso(): string {
  return new Date().toISOString()
}

function today(): string {
  return nowIso().slice(0, 10)
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function findRate(rates: FxRate[], from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return 1
  return rates.find((rate) => rate.base === from && rate.quote === to)?.rate ?? 1
}

type MoneySeed = {
  transactions?: MoneyTransaction[]
  entries?: LedgerEntry[]
}

export function MoneyProvider({
  children,
  seed,
}: {
  children: ReactNode
  seed?: MoneySeed
}) {
  const account = useAccount()
  const [subaccounts, setSubaccounts] = usePersistentState<Subaccount[]>(
    'relay.money.v1.subaccounts',
    initialSubaccounts,
  )
  const [transactions, setTransactions] = usePersistentState<MoneyTransaction[]>(
    'relay.money.v1.transactions',
    () => [...(seed?.transactions ?? []), ...initialTransactions],
  )
  const [entries, setEntries] = usePersistentState<LedgerEntry[]>(
    'relay.money.v1.entries',
    () => [...(seed?.entries ?? []), ...initialLedgerEntries],
  )
  const [paymentRequests, setPaymentRequests] = usePersistentState<
    PaymentRequest[]
  >('relay.money.v1.payment-requests', initialPaymentRequests)
  const [paymentLinks, setPaymentLinks] = usePersistentState<PaymentLink[]>(
    'relay.money.v1.payment-links',
    initialPaymentLinks,
  )
  const [bills, setBills] = usePersistentState<Bill[]>(
    'relay.money.v1.bills',
    initialBills,
  )
  const [scheduledPayments, setScheduledPayments] = usePersistentState<
    ScheduledPayment[]
  >('relay.money.v1.scheduled-payments', initialScheduledPayments)
  const [cards, setCards] = usePersistentState<Card[]>(
    'relay.money.v1.cards',
    initialCards,
  )
  const [goals, setGoals] = usePersistentState<SavingsGoal[]>(
    'relay.money.v1.goals',
    initialGoals,
  )
  const [budgets, setBudgets] = usePersistentState<Budget[]>(
    'relay.money.v1.budgets',
    initialBudgets,
  )
  const [limits, setLimits] = usePersistentState<SpendingLimit[]>(
    'relay.money.v1.limits',
    initialLimits,
  )

  function commit(built: BuiltTransaction) {
    setTransactions((current) => [built.transaction, ...current])
    setEntries((current) => [...built.entries, ...current])
  }

  function getBalance(subaccountId: string): SubaccountBalance {
    const subaccount = subaccounts.find((item) => item.id === subaccountId)
    const currency = subaccount?.currency ?? 'KES'
    const buckets = getSubaccountBalance(entries, subaccountId, currency)

    return {
      subaccountId,
      ...buckets,
      total: buckets.available + buckets.pending,
    }
  }

  function getFxQuote(
    from: CurrencyCode,
    to: CurrencyCode,
    amount: number,
    rail: PaymentRailId,
  ): FxQuote {
    const rate = findRate(fxRates, from, to)
    const fee = from === to ? 0 : roundMoney(Math.max(amount * 0.008, 0))
    const converted = roundMoney(Math.max(amount - fee, 0) * rate)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    return {
      from,
      to,
      amount,
      rate,
      fee,
      converted,
      total: amount,
      rail,
      expiresAt,
    }
  }

  function createSubaccount(input: NewSubaccountInput): MoneyActionResult {
    const trimmed = input.name.trim()
    if (!trimmed) {
      return { ok: false, message: 'Give the subaccount a name.' }
    }

    const subaccount: Subaccount = {
      id: createLedgerId('sub'),
      kind: input.kind,
      name: trimmed,
      description: input.description.trim() || 'Purpose-specific subaccount.',
      currency: input.currency,
      isPrimary: false,
      status: 'active',
      services: [input.kind === 'savings' || input.kind === 'bills' ? 'personal' : input.kind],
      createdAt: today(),
      accent: 'teal',
    }

    setSubaccounts((current) => [...current, subaccount])
    account.pushNotification({
      title: 'Subaccount created',
      body: `${subaccount.name} is ready in ${subaccount.currency}.`,
      tone: 'success',
      category: 'money',
      date: today(),
      href: '/money?tab=accounts',
    })

    return { ok: true, message: `${subaccount.name} created.` }
  }

  function transfer(input: TransferInput): MoneyActionResult {
    const from = subaccounts.find((item) => item.id === input.fromSubaccountId)
    const to = subaccounts.find((item) => item.id === input.toSubaccountId)
    const amount = roundMoney(input.amount)

    if (!from || !to) return { ok: false, message: 'Choose two subaccounts.' }
    if (from.id === to.id) return { ok: false, message: 'Choose two different subaccounts.' }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: 'Enter an amount greater than zero.' }
    }

    const available = getBalance(from.id).available
    if (amount > available) {
      return { ok: false, message: 'That amount is above the available balance.' }
    }

    const rate = findRate(fxRates, from.currency, to.currency)
    const converted = roundMoney(amount * rate)
    const sameCurrency = from.currency === to.currency

    const built = buildTransaction({
      kind: 'transfer',
      amount,
      currency: from.currency,
      fee: 0,
      net: sameCurrency ? amount : converted,
      description: input.description.trim() || `Transfer to ${to.name}`,
      counterparty: to.name,
      fromSubaccountId: from.id,
      toSubaccountId: to.id,
      rail: 'relay',
      createdAt: nowIso(),
      metadata: sameCurrency
        ? undefined
        : { targetAmount: converted, targetCurrency: to.currency, rate },
      postings: sameCurrency
        ? [
            {
              accountRef: `subaccount:${from.id}`,
              subaccountId: from.id,
              direction: 'debit',
              amount,
              currency: from.currency,
              memo: input.description || `Transfer to ${to.name}`,
            },
            {
              accountRef: `subaccount:${to.id}`,
              subaccountId: to.id,
              direction: 'credit',
              amount,
              currency: to.currency,
              memo: input.description || `Transfer from ${from.name}`,
            },
          ]
        : [
            {
              accountRef: `subaccount:${from.id}`,
              subaccountId: from.id,
              direction: 'debit',
              amount,
              currency: from.currency,
              memo: input.description || `Transfer to ${to.name}`,
            },
            {
              accountRef: 'external:fx-clearing',
              direction: 'credit',
              amount,
              currency: from.currency,
              memo: 'FX conversion',
            },
            {
              accountRef: 'external:fx-clearing',
              direction: 'debit',
              amount: converted,
              currency: to.currency,
              memo: 'FX conversion',
            },
            {
              accountRef: `subaccount:${to.id}`,
              subaccountId: to.id,
              direction: 'credit',
              amount: converted,
              currency: to.currency,
              memo: input.description || `Transfer from ${from.name}`,
            },
          ],
    })

    commit(built)
    account.pushNotification({
      title: 'Transfer posted',
      body: `${from.name} to ${to.name} — ${amount.toLocaleString()} ${from.currency}.`,
      tone: 'success',
      category: 'money',
      date: today(),
      href: '/money?tab=activity',
    })

    return {
      ok: true,
      message: sameCurrency
        ? `Moved ${amount.toLocaleString()} ${from.currency} to ${to.name}.`
        : `Converted ${amount.toLocaleString()} ${from.currency} to ${converted.toLocaleString()} ${to.currency}.`,
      transactionId: built.transaction.id,
    }
  }

  function deposit(input: DepositInput): MoneyActionResult {
    const subaccount = subaccounts.find((item) => item.id === input.subaccountId)
    const rail = paymentRails.find((item) => item.id === input.rail)
    const amount = roundMoney(input.amount)

    if (!subaccount) return { ok: false, message: 'Choose a subaccount.' }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: 'Enter an amount greater than zero.' }
    }
    if (!rail || rail.status === 'not_connected') {
      return { ok: false, message: 'That rail is not connected. Use a sandbox rail for now.' }
    }
    if (rail.status === 'eligibility_required') {
      return {
        ok: false,
        message: `${rail.label} requires provider access and eligibility review before deposits can be enabled.`,
      }
    }

    const built = buildTransaction({
      kind: 'deposit',
      amount,
      currency: subaccount.currency,
      description: `Deposit to ${subaccount.name}`,
      counterparty: rail.label,
      toSubaccountId: subaccount.id,
      rail: rail.id,
      createdAt: nowIso(),
      postings: [
        {
          accountRef: `external:${rail.id}-clearing`,
          direction: 'debit',
          amount,
          currency: subaccount.currency,
          memo: `Sandbox deposit via ${rail.label}`,
        },
        {
          accountRef: `subaccount:${subaccount.id}`,
          subaccountId: subaccount.id,
          direction: 'credit',
          amount,
          currency: subaccount.currency,
          memo: `Sandbox deposit via ${rail.label}`,
        },
      ],
    })

    commit(built)
    account.pushNotification({
      title: 'Deposit posted',
      body: `${amount.toLocaleString()} ${subaccount.currency} added to ${subaccount.name} (sandbox).`,
      tone: 'success',
      category: 'money',
      date: today(),
      href: '/money?tab=activity',
    })

    return {
      ok: true,
      message: `Sandbox deposit posted to ${subaccount.name}.`,
      transactionId: built.transaction.id,
    }
  }

  function withdraw(input: WithdrawalInput): MoneyActionResult {
    const subaccount = subaccounts.find((item) => item.id === input.subaccountId)
    const destination = payoutDestinations.find(
      (item) => item.id === input.destinationId,
    )
    const amount = roundMoney(input.amount)

    if (!subaccount) return { ok: false, message: 'Choose a subaccount.' }
    if (!destination) return { ok: false, message: 'Choose a payout destination.' }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: 'Enter an amount greater than zero.' }
    }
    if (amount > getBalance(subaccount.id).available) {
      return { ok: false, message: 'That amount is above the available balance.' }
    }
    if (!destination.verified) {
      return {
        ok: false,
        message: `${destination.label} is still under compliance review.`,
      }
    }

    if (destination.type === 'wallet') {
      const personal = subaccounts.find((item) => item.isPrimary)
      if (!personal || personal.id === subaccount.id) {
        return { ok: false, message: 'No eligible destination subaccount.' }
      }

      return transfer({
        fromSubaccountId: subaccount.id,
        toSubaccountId: personal.id,
        amount,
        description: `Payout to ${personal.name}`,
      })
    }

    const fee = roundMoney(Math.max(amount * 0.0075, 30))
    const built = buildTransaction({
      kind: 'withdrawal',
      status: 'processing',
      amount,
      currency: subaccount.currency,
      fee,
      net: roundMoney(amount - fee),
      description: `Withdrawal to ${destination.label}`,
      counterparty: destination.label,
      fromSubaccountId: subaccount.id,
      rail: destination.type === 'mpesa' ? 'mpesa' : 'bank',
      createdAt: nowIso(),
      metadata: { destinationId: destination.id },
      postings: [
        {
          accountRef: `subaccount:${subaccount.id}`,
          subaccountId: subaccount.id,
          direction: 'debit',
          amount,
          currency: subaccount.currency,
          status: 'reserved',
          memo: `Payout reserved for ${destination.label}`,
        },
        {
          accountRef: `external:${destination.id}-hold`,
          direction: 'credit',
          amount,
          currency: subaccount.currency,
          status: 'reserved',
          memo: `Payout hold for ${destination.label}`,
        },
      ],
    })

    commit(built)
    account.pushNotification({
      title: 'Withdrawal requested',
      body: `${amount.toLocaleString()} ${subaccount.currency} reserved for ${destination.label}.`,
      tone: 'info',
      category: 'money',
      date: today(),
      href: '/money?tab=activity',
    })

    return {
      ok: true,
      message: `Withdrawal reserved. ${destination.label} is a sandbox destination until provider access is live.`,
      transactionId: built.transaction.id,
    }
  }

  function sendPayment(input: OutgoingPaymentInput): MoneyActionResult {
    const subaccount = subaccounts.find((item) => item.id === input.subaccountId)
    const rail = paymentRails.find((item) => item.id === input.rail)
    const amount = roundMoney(input.amount)

    if (!subaccount) return { ok: false, message: 'Choose a source subaccount.' }
    if (!rail) return { ok: false, message: 'Choose a payment rail.' }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: 'Enter an amount greater than zero.' }
    }
    if (amount > getBalance(subaccount.id).available) {
      return { ok: false, message: 'That amount is above the available balance.' }
    }
    if (rail.status === 'not_connected' || rail.status === 'eligibility_required') {
      return {
        ok: false,
        message: `${rail.label} is not active. ${rail.note}`,
      }
    }

    const built = buildTransaction({
      kind: 'payment',
      status: 'processing',
      amount,
      currency: input.currency,
      description: input.description.trim() || `Payment to ${input.counterparty}`,
      counterparty: input.counterparty.trim() || 'Recipient',
      fromSubaccountId: subaccount.id,
      rail: rail.id,
      createdAt: nowIso(),
      postings: [
        {
          accountRef: `subaccount:${subaccount.id}`,
          subaccountId: subaccount.id,
          direction: 'debit',
          amount,
          currency: input.currency,
          status: 'reserved',
          memo: `Payment hold for ${input.counterparty}`,
        },
        {
          accountRef: `external:${rail.id}-hold`,
          direction: 'credit',
          amount,
          currency: input.currency,
          status: 'reserved',
          memo: `Payment hold for ${input.counterparty}`,
        },
      ],
    })

    commit(built)
    account.pushNotification({
      title: 'Payment submitted',
      body: `${amount.toLocaleString()} ${input.currency} to ${input.counterparty} via ${rail.label}.`,
      tone: 'info',
      category: 'payments',
      date: today(),
      href: '/payments?tab=track',
    })

    return {
      ok: true,
      message:
        rail.id === 'relay'
          ? 'Payment recorded in the shared ledger.'
          : `${rail.label} is a sandbox rail. The payment is tracked but not sent to a live provider.`,
      transactionId: built.transaction.id,
    }
  }

  function settleTransaction(transactionId: string): MoneyActionResult {
    const transaction = transactions.find((item) => item.id === transactionId)
    if (!transaction) return { ok: false, message: 'Transaction not found.' }
    if (transaction.status === 'posted' || transaction.status === 'reversed') {
      return { ok: false, message: 'This transaction is already settled.' }
    }

    setEntries((current) =>
      current.map((entry) =>
        entry.transactionId === transactionId &&
        (entry.status === 'reserved' || entry.status === 'pending')
          ? { ...entry, status: 'posted' }
          : entry,
      ),
    )
    setTransactions((current) =>
      current.map((item) =>
        item.id === transactionId
          ? { ...item, status: 'posted', postedAt: nowIso() }
          : item,
      ),
    )
    account.pushNotification({
      title: 'Payment settled',
      body: `${transaction.description} is now posted.`,
      tone: 'success',
      category: 'payments',
      date: today(),
      href: '/payments?tab=track',
    })

    return { ok: true, message: 'Transaction settled in the ledger.' }
  }

  function receiveCreatorEarning(input: CreatorEarningInput): MoneyActionResult {
    const creator = subaccounts.find((item) => item.id === 'sub-creator')
    if (!creator) return { ok: false, message: 'Creator subaccount is unavailable.' }

    const gross = roundMoney(input.gross)
    const fee = roundMoney(input.fee)
    const net = roundMoney(gross - fee)
    const status = input.status === 'pending' ? 'pending' : 'posted'

    if (!Number.isFinite(gross) || gross <= 0) {
      return { ok: false, message: 'Enter an amount greater than zero.' }
    }

    const built = buildTransaction({
      kind: 'creator_earning',
      status,
      amount: gross,
      currency: input.currency,
      fee,
      net,
      description: input.description,
      counterparty: input.counterparty,
      toSubaccountId: creator.id,
      rail: 'relay',
      createdAt: input.date,
      postedAt: status === 'posted' ? input.date : undefined,
      metadata: {
        reference: input.reference,
        ...input.metadata,
      },
      postings: [
        {
          accountRef: 'external:creator-clearing',
          direction: 'debit',
          amount: gross,
          currency: input.currency,
          status: status === 'pending' ? 'pending' : 'posted',
          memo: input.description,
        },
        {
          accountRef: `subaccount:${creator.id}`,
          subaccountId: creator.id,
          direction: 'credit',
          amount: net,
          currency: input.currency,
          status: status === 'pending' ? 'pending' : 'posted',
          memo: input.description,
        },
        {
          accountRef: 'external:fees',
          direction: 'credit',
          amount: fee,
          currency: input.currency,
          status: status === 'pending' ? 'pending' : 'posted',
          memo: 'Processing fee',
        },
      ],
    })

    commit(built)
    account.pushNotification({
      title: status === 'pending' ? 'Creator payment pending' : 'Creator payment received',
      body: `${net.toLocaleString()} ${input.currency} from ${input.counterparty}.`,
      tone: status === 'pending' ? 'info' : 'success',
      category: 'creator',
      date: today(),
      href: '/money?subaccount=sub-creator',
    })

    return { ok: true, message: 'Creator earning posted to the shared ledger.', transactionId: built.transaction.id }
  }

  function createPaymentRequest(input: NewPaymentRequestInput): PaymentRequest {
    const request: PaymentRequest = {
      id: createLedgerId('req'),
      reference: `PAY-${Date.now().toString().slice(-5)}`,
      direction: input.direction,
      counterparty: input.counterparty.trim() || 'Contact',
      amount: roundMoney(input.amount),
      currency: input.currency,
      note: input.note.trim(),
      status: 'open',
      createdAt: today(),
      dueAt: input.dueAt,
      subaccountId: input.subaccountId,
      link: `https://relay.app/pay/${createLedgerId('link').slice(-8)}`,
      conversationId: input.conversationId,
    }

    setPaymentRequests((current) => [request, ...current])
    account.pushNotification({
      title: 'Payment request created',
      body: `${request.amount.toLocaleString()} ${request.currency} requested from ${request.counterparty}.`,
      tone: 'info',
      category: 'payments',
      date: today(),
      href: '/payments?tab=requests',
    })

    return request
  }

  function markPaymentRequestPaid(requestId: string): MoneyActionResult {
    const request = paymentRequests.find((item) => item.id === requestId)
    if (!request) return { ok: false, message: 'Request not found.' }
    if (request.status !== 'open') return { ok: false, message: 'This request is not open.' }

    const subaccount = subaccounts.find((item) => item.id === request.subaccountId)
    if (!subaccount) return { ok: false, message: 'Subaccount not found.' }

    if (request.direction === 'incoming') {
      const built = buildTransaction({
        kind: 'request',
        amount: request.amount,
        currency: request.currency,
        description: `Payment request — ${request.note || request.reference}`,
        counterparty: request.counterparty,
        toSubaccountId: subaccount.id,
        rail: 'relay',
        createdAt: nowIso(),
        metadata: { requestId: request.id, reference: request.reference },
        postings: [
          {
            accountRef: 'external:request-clearing',
            direction: 'debit',
            amount: request.amount,
            currency: request.currency,
            memo: request.note || request.reference,
          },
          {
            accountRef: `subaccount:${subaccount.id}`,
            subaccountId: subaccount.id,
            direction: 'credit',
            amount: request.amount,
            currency: request.currency,
            memo: request.note || request.reference,
          },
        ],
      })
      commit(built)
    } else {
      const result = sendPayment({
        subaccountId: subaccount.id,
        counterparty: request.counterparty,
        amount: request.amount,
        currency: request.currency,
        rail: 'relay',
        description: `Payment request — ${request.note || request.reference}`,
      })
      if (!result.ok) return result
    }

    setPaymentRequests((current) =>
      current.map((item) =>
        item.id === requestId ? { ...item, status: 'paid' } : item,
      ),
    )

    return { ok: true, message: 'Payment request marked paid.' }
  }

  function declinePaymentRequest(requestId: string) {
    setPaymentRequests((current) =>
      current.map((item) =>
        item.id === requestId ? { ...item, status: 'declined' } : item,
      ),
    )
  }

  function createPaymentLink(input: NewPaymentLinkInput): PaymentLink {
    const baseSlug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const link: PaymentLink = {
      id: createLedgerId('pl'),
      title: input.title.trim() || 'Untitled link',
      slug: baseSlug || `link-${Date.now()}`,
      type: input.amount ? 'fixed' : 'variable',
      amount: input.amount ?? undefined,
      currency: input.currency,
      source: input.source,
      description: input.description.trim(),
      status: 'active',
      payments: 0,
      revenue: 0,
      createdAt: today(),
      expiresAt: input.expiresAt || undefined,
    }

    setPaymentLinks((current) => [link, ...current])
    return link
  }

  function togglePaymentLink(linkId: string) {
    setPaymentLinks((current) =>
      current.map((link) =>
        link.id === linkId
          ? { ...link, status: link.status === 'active' ? 'paused' : 'active' }
          : link,
      ),
    )
  }

  function payBill(billId: string, subaccountId: string): MoneyActionResult {
    const bill = bills.find((item) => item.id === billId)
    const subaccount = subaccounts.find((item) => item.id === subaccountId)
    if (!bill) return { ok: false, message: 'Bill not found.' }
    if (!subaccount) return { ok: false, message: 'Choose a source subaccount.' }
    if (bill.status === 'paid') return { ok: false, message: 'This bill is already paid.' }
    if (bill.amount > getBalance(subaccount.id).available) {
      return { ok: false, message: 'That amount is above the available balance.' }
    }

    const built = buildTransaction({
      kind: 'bill',
      amount: bill.amount,
      currency: bill.currency,
      description: `${bill.category} bill — ${bill.provider}`,
      counterparty: bill.provider,
      fromSubaccountId: subaccount.id,
      rail: 'bill',
      createdAt: nowIso(),
      metadata: { billId: bill.id },
      postings: [
        {
          accountRef: `subaccount:${subaccount.id}`,
          subaccountId: subaccount.id,
          direction: 'debit',
          amount: bill.amount,
          currency: bill.currency,
          memo: `${bill.category} bill`,
        },
        {
          accountRef: 'external:bill-clearing',
          direction: 'credit',
          amount: bill.amount,
          currency: bill.currency,
          memo: `${bill.category} bill`,
        },
      ],
    })

    commit(built)
    setBills((current) =>
      current.map((item) =>
        item.id === billId ? { ...item, status: 'paid' } : item,
      ),
    )
    account.pushNotification({
      title: 'Bill paid',
      body: `${bill.provider} — ${bill.amount.toLocaleString()} ${bill.currency}.`,
      tone: 'success',
      category: 'payments',
      date: today(),
      href: '/payments?tab=bills',
    })

    return { ok: true, message: `${bill.provider} marked paid (sandbox biller).` }
  }

  function createScheduledPayment(
    input: NewScheduledPaymentInput,
  ): MoneyActionResult {
    const amount = roundMoney(input.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: 'Enter an amount greater than zero.' }
    }

    const payment: ScheduledPayment = {
      id: createLedgerId('sched'),
      counterparty: input.counterparty.trim() || 'Recipient',
      amount,
      currency: input.currency,
      frequency: input.frequency,
      nextRun: input.nextRun,
      rail: input.rail,
      status: 'active',
      note: input.note.trim(),
      subaccountId: input.subaccountId,
    }

    setScheduledPayments((current) => [payment, ...current])
    return { ok: true, message: 'Scheduled payment created.' }
  }

  function toggleScheduledPayment(paymentId: string) {
    setScheduledPayments((current) =>
      current.map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              status: payment.status === 'active' ? 'paused' : 'active',
            }
          : payment,
      ),
    )
  }

  function toggleCardFreeze(cardId: string) {
    setCards((current) =>
      current.map((card) =>
        card.id === cardId
          ? {
              ...card,
              status: card.status === 'frozen' ? 'active' : 'frozen',
            }
          : card,
      ),
    )
  }

  function addGoal(input: NewGoalInput): MoneyActionResult {
    const target = roundMoney(input.target)
    if (!Number.isFinite(target) || target <= 0) {
      return { ok: false, message: 'Enter a target greater than zero.' }
    }

    const goal: SavingsGoal = {
      id: createLedgerId('goal'),
      name: input.name.trim() || 'New goal',
      target,
      saved: 0,
      currency: input.currency,
      deadline: input.deadline,
      subaccountId: input.subaccountId,
      emoji: '🎯',
    }

    setGoals((current) => [...current, goal])
    return { ok: true, message: `${goal.name} created.` }
  }

  function contributeToGoal(
    goalId: string,
    amount: number,
    fromSubaccountId: string,
  ): MoneyActionResult {
    const goal = goals.find((item) => item.id === goalId)
    if (!goal) return { ok: false, message: 'Goal not found.' }
    if (goal.subaccountId === fromSubaccountId) {
      return { ok: false, message: 'Choose a different source subaccount.' }
    }

    const result = transfer({
      fromSubaccountId,
      toSubaccountId: goal.subaccountId,
      amount,
      description: `Savings goal — ${goal.name}`,
    })

    if (!result.ok) return result

    setGoals((current) =>
      current.map((item) =>
        item.id === goalId
          ? { ...item, saved: roundMoney(item.saved + amount) }
          : item,
      ),
    )

    return { ok: true, message: `Added to ${goal.name}.` }
  }

  function updateBudget(budgetId: string, limit: number) {
    setBudgets((current) =>
      current.map((budget) =>
        budget.id === budgetId
          ? { ...budget, limit: roundMoney(Math.max(limit, 0)) }
          : budget,
      ),
    )
  }

  function updateLimit(limitId: string, patch: Partial<SpendingLimit>) {
    setLimits((current) =>
      current.map((limit) =>
        limit.id === limitId ? { ...limit, ...patch } : limit,
      ),
    )
  }

  function recordExpense(input: NewExpenseInput): MoneyActionResult {
    const subaccount = subaccounts.find((item) => item.id === input.subaccountId)
    const amount = roundMoney(input.amount)
    if (!subaccount) return { ok: false, message: 'Choose a subaccount.' }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: 'Enter an amount greater than zero.' }
    }
    if (amount > getBalance(subaccount.id).available) {
      return { ok: false, message: 'That amount is above the available balance.' }
    }

    const built = buildTransaction({
      kind: 'payment',
      amount,
      currency: input.currency,
      description: input.description,
      counterparty: input.category,
      fromSubaccountId: subaccount.id,
      rail: 'card',
      createdAt: input.date,
      metadata: { category: input.category, expense: true },
      postings: [
        {
          accountRef: `subaccount:${subaccount.id}`,
          subaccountId: subaccount.id,
          direction: 'debit',
          amount,
          currency: input.currency,
          memo: input.description,
        },
        {
          accountRef: 'external:expense-clearing',
          direction: 'credit',
          amount,
          currency: input.currency,
          memo: input.description,
        },
      ],
    })

    commit(built)
    return { ok: true, message: 'Expense recorded in the ledger.' }
  }

  function reverseTransaction(transactionId: string): MoneyActionResult {
    const transaction = transactions.find((item) => item.id === transactionId)
    if (!transaction) return { ok: false, message: 'Transaction not found.' }
    if (transaction.status === 'reversed') {
      return { ok: false, message: 'This transaction is already reversed.' }
    }

    const originalEntries = entries.filter(
      (entry) => entry.transactionId === transactionId,
    )
    if (originalEntries.length === 0) {
      return { ok: false, message: 'No ledger entries to reverse.' }
    }

    const reversalId = createLedgerId('rev')
    const reversalEntries = reverseEntries(
      originalEntries,
      reversalId,
      nowIso(),
      `Reversal of ${transaction.reference}`,
    )
    const reversalTransaction: MoneyTransaction = {
      ...transaction,
      id: reversalId,
      reference: `REV-${transaction.reference.replace(/^RLY-/, '')}`,
      kind: 'reversal',
      status: 'posted',
      description: `Reversal — ${transaction.description}`,
      counterparty: transaction.counterparty,
      createdAt: nowIso(),
      postedAt: nowIso(),
      idempotencyKey: createLedgerId('idem'),
      reversalOf: transaction.id,
    }

    setEntries((current) => [
      ...reversalEntries,
      ...current.map((entry) =>
        entry.transactionId === transactionId
          ? { ...entry, status: 'reversed' as const }
          : entry,
      ),
    ])
    setTransactions((current) => [
      reversalTransaction,
      ...current.map((item) =>
        item.id === transactionId
          ? { ...item, status: 'reversed' as const }
          : item,
      ),
    ])
    account.pushNotification({
      title: 'Transaction reversed',
      body: `${transaction.description} was reversed with a new ledger entry.`,
      tone: 'warning',
      category: 'money',
      date: today(),
      href: '/money?tab=activity',
    })

    return { ok: true, message: 'Reversal posted. The original entry is immutable and now marked reversed.' }
  }

  const integrity = useMemo(
    () => getLedgerIntegrity(transactions, entries, lastReconciledAt),
    [transactions, entries],
  )

  const value = useMemo<MoneyStore>(
    () => ({
      subaccounts,
      transactions,
      entries,
      paymentRequests,
      paymentLinks,
      bills,
      scheduledPayments,
      cards,
      goals,
      budgets,
      limits,
      destinations: payoutDestinations,
      rails: paymentRails,
      fxRates,
      integrity,
      getBalance,
      getFxQuote,
      createSubaccount,
      transfer,
      deposit,
      withdraw,
      sendPayment,
      settleTransaction,
      receiveCreatorEarning,
      createPaymentRequest,
      markPaymentRequestPaid,
      declinePaymentRequest,
      createPaymentLink,
      togglePaymentLink,
      payBill,
      createScheduledPayment,
      toggleScheduledPayment,
      toggleCardFreeze,
      addGoal,
      contributeToGoal,
      updateBudget,
      updateLimit,
      recordExpense,
      reverseTransaction,
    }),
    [
      subaccounts,
      transactions,
      entries,
      paymentRequests,
      paymentLinks,
      bills,
      scheduledPayments,
      cards,
      goals,
      budgets,
      limits,
      integrity,
    ],
  )

  return <MoneyContext.Provider value={value}>{children}</MoneyContext.Provider>
}

export function useMoney(): MoneyStore {
  const context = useContext(MoneyContext)

  if (!context) {
    throw new Error('useMoney must be used inside MoneyProvider')
  }

  return context
}

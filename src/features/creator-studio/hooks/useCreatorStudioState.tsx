import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { usePersistentState } from '@/hooks/usePersistentState'
import {
  getCreatorWalletSummary,
  getMonthlyPoints,
} from '@/domain/money/selectors'
import type {
  MoneyTransaction,
  PaymentLink as MoneyPaymentLink,
  PaymentRailId,
} from '@/domain/money/types'
import { useAccount } from '@/domain/account/store'
import { useMoney } from '@/domain/money/store'
import {
  contributionGoal as initialContributionGoal,
  creatorProfile as initialProfile,
  initialAutomations,
  initialCampaigns,
  initialCustomers,
  initialExpenses,
  initialInvoices,
  initialSubscribers,
  initialTips,
  subscriptionPlans,
} from '../data/creatorStudio'
import { answerFinancialQuery } from '../lib/assistant'
import { createId } from '../lib/format'
import type {
  AssistantMessage,
  Automation,
  Campaign,
  ContributionGoal,
  CreatorNotification,
  CreatorProfile,
  Customer,
  Expense,
  IncomeSource,
  Invoice,
  InvoiceStatus,
  MethodBreakdown,
  NewCampaignInput,
  NewExpenseInput,
  NewInvoiceInput,
  NewPaymentLinkInput,
  PaymentLink,
  PaymentMethod,
  Payout,
  PayoutDestination,
  PayoutRequestInput,
  PayoutStatus,
  SourceBreakdown,
  Tip,
  Transaction,
  WalletSummary,
} from '../types'

export type ToastMessage = {
  id: string
  message: string
  tone: 'success' | 'info' | 'warning'
}

const initialMessages: AssistantMessage[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    text: 'Hi Amina. I can read your Creator Studio ledger and answer questions about earnings, expenses, invoices, payouts and customers. I only use recorded transactions — I will say so if there is not enough data to answer.',
  },
]

const railMethods: Record<PaymentRailId, PaymentMethod> = {
  relay: 'wallet',
  mpesa: 'mpesa',
  bank: 'bank-transfer',
  card: 'card',
  swift: 'bank-transfer',
  wise: 'bank-transfer',
  paypal: 'paypal',
  usdc: 'crypto',
  qr: 'wallet',
  bill: 'wallet',
}

function weekdayDate(offsetDays = 0): string {
  const date = new Date('2026-11-09T12:00:00')
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

function metadataString(
  transaction: MoneyTransaction,
  key: string,
): string | undefined {
  const value = transaction.metadata?.[key]
  return typeof value === 'string' ? value : undefined
}

function toCreatorTransaction(transaction: MoneyTransaction): Transaction {
  const status: Transaction['status'] =
    transaction.kind === 'refund' || transaction.status === 'reversed'
      ? 'refunded'
      : transaction.status === 'failed'
        ? 'failed'
        : transaction.status === 'pending' ||
            transaction.status === 'processing'
          ? 'pending'
          : 'paid'
  const source = (metadataString(transaction, 'source') ?? 'other') as IncomeSource
  const method = (metadataString(transaction, 'method') ??
    railMethods[transaction.rail]) as PaymentMethod

  return {
    id: transaction.id,
    date: transaction.createdAt.slice(0, 10),
    description: transaction.description,
    customerId: metadataString(transaction, 'customerId'),
    customerName:
      metadataString(transaction, 'customerName') ?? transaction.counterparty,
    source,
    method,
    gross: transaction.amount,
    fee: transaction.fee,
    net: transaction.net,
    status,
    reference: transaction.reference,
  }
}

function toCreatorPaymentLink(link: MoneyPaymentLink): PaymentLink {
  return {
    id: link.id,
    title: link.title,
    slug: link.slug,
    type: link.type,
    amount: link.amount,
    source: link.source as IncomeSource,
    description: link.description,
    status: link.status,
    payments: link.payments,
    revenue: link.revenue,
    createdAt: link.createdAt,
    expiresAt: link.expiresAt,
    limit: link.limit,
  }
}

function toCreatorPayout(transaction: MoneyTransaction): Payout {
  const status: PayoutStatus =
    transaction.status === 'posted'
      ? 'paid'
      : transaction.status === 'failed'
        ? 'failed'
        : transaction.status === 'pending'
          ? 'scheduled'
          : 'processing'

  return {
    id: transaction.id,
    amount: transaction.amount,
    fee: transaction.fee,
    net: transaction.net,
    destinationId:
      metadataString(transaction, 'destinationId') ?? 'dest-unknown',
    destinationLabel:
      metadataString(transaction, 'destinationLabel') ??
      transaction.counterparty,
    status,
    requestedAt: transaction.createdAt.slice(0, 10),
    completedAt: transaction.postedAt?.slice(0, 10),
    reference: transaction.reference,
  }
}

export function useCreatorStudioState() {
  const money = useMoney()
  const account = useAccount()
  const [profile, setProfile] = usePersistentState<CreatorProfile>(
    'relay.creator.v1.profile',
    initialProfile,
  )
  const [invoices, setInvoices] = usePersistentState<Invoice[]>(
    'relay.creator.v1.invoices',
    initialInvoices,
  )
  const [customers, setCustomers] = usePersistentState<Customer[]>(
    'relay.creator.v1.customers',
    initialCustomers,
  )
  const [campaigns, setCampaigns] = usePersistentState<Campaign[]>(
    'relay.creator.v1.campaigns',
    initialCampaigns,
  )
  const [expenses, setExpenses] = usePersistentState<Expense[]>(
    'relay.creator.v1.expenses',
    initialExpenses,
  )
  const [automations, setAutomations] = usePersistentState<Automation[]>(
    'relay.creator.v1.automations',
    initialAutomations,
  )
  const [tips, setTips] = usePersistentState<Tip[]>(
    'relay.creator.v1.tips',
    initialTips,
  )
  const [goal, setGoal] = usePersistentState<ContributionGoal>(
    'relay.creator.v1.goal',
    initialContributionGoal,
  )
  const [assistantMessages, setAssistantMessages] = usePersistentState<
    AssistantMessage[]
  >('relay.creator.v1.assistant-messages', initialMessages)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [invoiceCounter, setInvoiceCounter] = usePersistentState(
    'relay.creator.v1.invoice-counter',
    47,
  )
  const [subscribers] = useState(initialSubscribers)

  const plans = subscriptionPlans

  const wallet: WalletSummary = useMemo(
    () => getCreatorWalletSummary(money.transactions, money.entries),
    [money.transactions, money.entries],
  )

  const transactions = useMemo(
    () =>
      money.transactions
        .filter(
          (transaction) =>
            (transaction.kind === 'creator_earning' ||
              transaction.kind === 'refund') &&
            (transaction.toSubaccountId === 'sub-creator' ||
              transaction.fromSubaccountId === 'sub-creator'),
        )
        .map(toCreatorTransaction)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [money.transactions],
  )

  const paymentLinks = useMemo(
    () => money.paymentLinks.map(toCreatorPaymentLink),
    [money.paymentLinks],
  )

  const payouts = useMemo(
    () =>
      money.transactions
        .filter(
          (transaction) =>
            transaction.kind === 'withdrawal' &&
            transaction.fromSubaccountId === 'sub-creator',
        )
        .map(toCreatorPayout)
        .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
    [money.transactions],
  )

  const destinations: PayoutDestination[] = useMemo(
    () =>
      money.destinations.map((destination) => ({
        id: destination.id,
        label: destination.label,
        type: destination.type,
        detail: destination.detail,
        primary: destination.primary,
        verified: destination.verified,
      })),
    [money.destinations],
  )

  const notifications: CreatorNotification[] = useMemo(
    () =>
      account.notifications
        .filter((notification) =>
          ['creator', 'money', 'payments'].includes(notification.category),
        )
        .map((notification) => ({
          id: notification.id,
          title: notification.title,
          body: notification.body,
          tone:
            notification.tone === 'danger'
              ? 'warning'
              : notification.tone === 'success'
                ? 'success'
                : notification.tone === 'warning'
                  ? 'warning'
                  : 'info',
          date: notification.date,
          read: notification.read,
        })),
    [account.notifications],
  )

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read,
  ).length

  const monthlyRevenue = useMemo(
    () =>
      getMonthlyPoints(money.transactions, {
        subaccountId: 'sub-creator',
        kind: 'creator_earning',
      }),
    [money.transactions],
  )

  const sourceBreakdown: SourceBreakdown[] = useMemo(() => {
    const totals = new Map<IncomeSource, number>()

    for (const transaction of transactions) {
      if (transaction.status !== 'paid') continue
      totals.set(
        transaction.source,
        (totals.get(transaction.source) ?? 0) + transaction.net,
      )
    }

    return [...totals.entries()]
      .map(([source, amount]) => ({ source, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  const methodBreakdown: MethodBreakdown[] = useMemo(() => {
    const totals = new Map<PaymentMethod, number>()

    for (const transaction of transactions) {
      if (transaction.status !== 'paid') continue
      totals.set(
        transaction.method,
        (totals.get(transaction.method) ?? 0) + transaction.net,
      )
    }

    return [...totals.entries()]
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  function showToast(message: string, tone: ToastMessage['tone'] = 'success') {
    const nextToast = { id: createId('toast'), message, tone }
    setToast(nextToast)
    window.setTimeout(() => {
      setToast((current) => (current?.id === nextToast.id ? null : current))
    }, 3600)
  }

  function dismissToast() {
    setToast(null)
  }

  function updateProfile(patch: Partial<CreatorProfile>) {
    setProfile((current) => ({ ...current, ...patch }))
  }

  function addPaymentLink(input: NewPaymentLinkInput): PaymentLink {
    const link = money.createPaymentLink({
      title: input.title,
      amount: input.amount,
      currency: 'KES',
      source: input.source,
      description: input.description,
      expiresAt: input.expiresAt,
    })

    showToast(`Payment link “${link.title}” is live.`)
    return toCreatorPaymentLink(link)
  }

  function createInvoice(input: NewInvoiceInput): Invoice {
    const subtotal = input.amount
    const tax = Math.round((subtotal * input.taxRate) / 100)
    const customer = customers.find(
      (item) => item.name.toLowerCase() === input.customerName.toLowerCase(),
    )
    const invoice: Invoice = {
      id: createId('inv'),
      number: `INV-2026-${String(invoiceCounter).padStart(3, '0')}`,
      customerId: customer?.id,
      customerName: input.customerName,
      description: input.description,
      items: [
        {
          label: input.description,
          quantity: 1,
          unitPrice: subtotal,
        },
      ],
      subtotal,
      tax,
      discount: 0,
      total: subtotal + tax,
      issuedAt: weekdayDate(),
      dueDate: input.dueDate,
      status: 'sent',
    }

    setInvoices((current) => [invoice, ...current])
    setInvoiceCounter((current) => current + 1)
    showToast(`${invoice.number} created and marked as sent.`)
    return invoice
  }

  function markInvoicePaid(invoiceId: string) {
    const invoice = invoices.find((item) => item.id === invoiceId)

    if (!invoice || invoice.status === 'paid') return

    const fee = Math.round(invoice.total * 0.029 + 30)
    const result = money.receiveCreatorEarning({
      gross: invoice.total,
      fee,
      currency: 'KES',
      description: `Invoice payment — ${invoice.description}`,
      counterparty: invoice.customerName,
      reference: invoice.number,
      date: weekdayDate(),
      status: 'paid',
      metadata: {
        source: 'services',
        method: 'bank-transfer',
        customerId: invoice.customerId,
        customerName: invoice.customerName,
      },
    })

    if (!result.ok) {
      showToast(result.message, 'warning')
      return
    }

    setInvoices((current) =>
      current.map((item) =>
        item.id === invoiceId
          ? { ...item, status: 'paid', paidAt: weekdayDate() }
          : item,
      ),
    )
    showToast(`${invoice.number} marked paid — ${invoice.total - fee} net added to your ledger.`)
  }

  function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    if (status === 'paid') {
      markInvoicePaid(invoiceId)
      return
    }

    setInvoices((current) =>
      current.map((item) =>
        item.id === invoiceId ? { ...item, status } : item,
      ),
    )
    showToast(`Invoice updated to ${status}.`, 'info')
  }

  function requestPayout(input: PayoutRequestInput): boolean {
    const result = money.withdraw({
      subaccountId: 'sub-creator',
      amount: input.amount,
      destinationId: input.destinationId,
    })

    if (!result.ok) {
      showToast(result.message, 'warning')
      return false
    }

    showToast(result.message)
    return true
  }

  function addExpense(input: NewExpenseInput): Expense | null {
    const result = money.recordExpense({
      subaccountId: 'sub-creator',
      description: input.description,
      amount: input.amount,
      currency: 'KES',
      category: input.category,
      date: input.date,
    })

    if (!result.ok) {
      showToast(result.message, 'warning')
      return null
    }

    const expense: Expense = {
      ...input,
      id: createId('exp'),
      hasReceipt: false,
    }

    setExpenses((current) => [expense, ...current])
    showToast('Expense recorded in the shared ledger.', 'info')
    return expense
  }

  function createCampaign(input: NewCampaignInput): Campaign {
    const campaign: Campaign = {
      id: createId('camp'),
      title: input.title,
      description: input.description,
      goal: input.goal,
      raised: 0,
      contributors: 0,
      deadline: input.deadline,
      status: 'active',
      isPrivate: input.isPrivate,
      emoji: input.isPrivate ? '🔒' : '✨',
      updates: 0,
    }

    setCampaigns((current) => [campaign, ...current])
    showToast(`Campaign “${campaign.title}” created.`)
    return campaign
  }

  function contributeToGoal(amount: number) {
    if (amount <= 0) return

    const fee = Math.round(amount * 0.029 + 30)
    const result = money.receiveCreatorEarning({
      gross: amount,
      fee,
      currency: 'KES',
      description: 'Campaign contribution — studio fund',
      counterparty: 'Demo supporter',
      reference: `CAMP-${Date.now().toString().slice(-5)}`,
      date: weekdayDate(),
      status: 'paid',
      metadata: {
        source: 'crowdfunding',
        method: 'wallet',
        customerName: 'Demo supporter',
      },
    })

    if (!result.ok) {
      showToast(result.message, 'warning')
      return
    }

    const tip: Tip = {
      id: createId('tip'),
      supporterName: 'Demo supporter',
      amount,
      message: 'Sent from the Creator Studio contribution page.',
      date: weekdayDate(),
      anonymous: false,
      recurring: false,
      method: 'wallet',
    }

    setTips((current) => [tip, ...current])
    setGoal((current) => ({
      ...current,
      raised: current.raised + amount,
      contributors: current.contributors + 1,
    }))
    showToast('Contribution recorded and added to the shared ledger.')
  }

  function toggleAutomation(automationId: string) {
    setAutomations((current) =>
      current.map((automation) =>
        automation.id === automationId
          ? { ...automation, enabled: !automation.enabled }
          : automation,
      ),
    )
  }

  function updateCustomer(customerId: string, patch: Partial<Customer>) {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === customerId ? { ...customer, ...patch } : customer,
      ),
    )
  }

  function markNotificationsRead() {
    account.markAllNotificationsRead()
  }

  function askAssistant(query: string) {
    const trimmed = query.trim()
    if (!trimmed) return

    const userMessage: AssistantMessage = {
      id: createId('msg'),
      role: 'user',
      text: trimmed,
    }
    const answer = answerFinancialQuery(trimmed, {
      transactions,
      expenses,
      invoices,
      payouts,
      customers,
      campaigns,
    })
    const assistantMessage: AssistantMessage = {
      id: createId('msg'),
      role: 'assistant',
      text: answer,
    }

    setAssistantMessages((current) => [
      ...current,
      userMessage,
      assistantMessage,
    ])
  }

  return useMemo(
    () => ({
      profile,
      wallet,
      transactions,
      paymentLinks,
      invoices,
      customers,
      campaigns,
      payouts,
      destinations,
      expenses,
      automations,
      notifications,
      unreadNotifications,
      tips,
      goal,
      plans,
      subscribers,
      assistantMessages,
      toast,
      monthlyRevenue,
      sourceBreakdown,
      methodBreakdown,
      updateProfile,
      addPaymentLink,
      createInvoice,
      updateInvoiceStatus,
      requestPayout,
      addExpense,
      createCampaign,
      contributeToGoal,
      toggleAutomation,
      updateCustomer,
      markNotificationsRead,
      askAssistant,
      showToast,
      dismissToast,
    }),
    // The returned API closes over current state; recreating it on every state
    // change keeps mutations and derived values in sync.
    [
      profile,
      wallet,
      transactions,
      paymentLinks,
      invoices,
      customers,
      campaigns,
      payouts,
      destinations,
      expenses,
      automations,
      notifications,
      unreadNotifications,
      tips,
      goal,
      subscribers,
      assistantMessages,
      toast,
      monthlyRevenue,
      sourceBreakdown,
      methodBreakdown,
      invoiceCounter,
    ],
  )
}

export type CreatorStudioApi = ReturnType<typeof useCreatorStudioState>

const CreatorStudioContext = createContext<CreatorStudioApi | null>(null)

export function CreatorStudioProvider({ children }: { children: ReactNode }) {
  const value = useCreatorStudioState()

  return (
    <CreatorStudioContext.Provider value={value}>
      {children}
    </CreatorStudioContext.Provider>
  )
}

export function useCreatorStudio(): CreatorStudioApi {
  const context = useContext(CreatorStudioContext)

  if (!context) {
    throw new Error(
      'useCreatorStudio must be used inside CreatorStudioProvider',
    )
  }

  return context
}

export default useCreatorStudioState

import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  contributionGoal as initialContributionGoal,
  creatorProfile as initialProfile,
  initialAutomations,
  initialCampaigns,
  initialCustomers,
  initialExpenses,
  initialInvoices,
  initialNotifications,
  initialPaymentLinks,
  initialPayouts,
  initialSubscribers,
  initialTips,
  initialTransactions,
  monthlyRevenue,
  payoutDestinations,
  subscriptionPlans,
  walletSummary as initialWalletSummary,
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
  Invoice,
  InvoiceStatus,
  NewCampaignInput,
  NewExpenseInput,
  NewInvoiceInput,
  NewPaymentLinkInput,
  PaymentLink,
  Payout,
  PayoutRequestInput,
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

function weekdayDate(offsetDays = 0): string {
  const date = new Date('2026-11-09T12:00:00')
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

export function useCreatorStudioState() {
  const [profile, setProfile] = useState<CreatorProfile>(initialProfile)
  const [wallet, setWallet] = useState<WalletSummary>(initialWalletSummary)
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions)
  const [paymentLinks, setPaymentLinks] =
    useState<PaymentLink[]>(initialPaymentLinks)
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts)
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [automations, setAutomations] =
    useState<Automation[]>(initialAutomations)
  const [notifications, setNotifications] =
    useState<CreatorNotification[]>(initialNotifications)
  const [tips, setTips] = useState<Tip[]>(initialTips)
  const [goal, setGoal] = useState<ContributionGoal>(initialContributionGoal)
  const [assistantMessages, setAssistantMessages] =
    useState<AssistantMessage[]>(initialMessages)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [invoiceCounter, setInvoiceCounter] = useState(47)
  const [subscribers] = useState(initialSubscribers)

  const plans = subscriptionPlans

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
    const baseSlug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const link: PaymentLink = {
      id: createId('pl'),
      title: input.title,
      slug: baseSlug || `link-${Date.now()}`,
      type: input.amount ? 'fixed' : 'variable',
      amount: input.amount ?? undefined,
      source: input.source,
      description: input.description,
      status: 'active',
      payments: 0,
      revenue: 0,
      createdAt: weekdayDate(),
      expiresAt: input.expiresAt || undefined,
    }

    setPaymentLinks((current) => [link, ...current])
    showToast(`Payment link “${link.title}” is live.`)
    return link
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
    const net = invoice.total - fee
    const transaction: Transaction = {
      id: createId('tx'),
      date: weekdayDate(),
      description: `Invoice payment — ${invoice.description}`,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      source: 'services',
      method: 'bank-transfer',
      gross: invoice.total,
      fee,
      net,
      status: 'paid',
      reference: invoice.number,
    }

    setInvoices((current) =>
      current.map((item) =>
        item.id === invoiceId
          ? { ...item, status: 'paid', paidAt: weekdayDate() }
          : item,
      ),
    )
    setTransactions((current) => [transaction, ...current])
    setWallet((current) => ({
      ...current,
      available: current.available + net,
      totalEarnings: current.totalEarnings + net,
      totalReceived: current.totalReceived + invoice.total,
      processingFees: current.processingFees + fee,
    }))
    showToast(`${invoice.number} marked paid — ${net} net added to your ledger.`)
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
    const destination = payoutDestinations.find(
      (item) => item.id === input.destinationId,
    )

    if (!destination || input.amount <= 0 || input.amount > wallet.available) {
      showToast('Choose an amount within your available balance.', 'warning')
      return false
    }

    const fee = Math.max(30, Math.round(input.amount * 0.0075))
    const payout: Payout = {
      id: createId('pay'),
      amount: input.amount,
      fee,
      net: input.amount - fee,
      destinationId: destination.id,
      destinationLabel: destination.label,
      status: 'processing',
      requestedAt: weekdayDate(),
      reference: `PO-${Date.now().toString().slice(-6)}`,
    }

    setPayouts((current) => [payout, ...current])
    setWallet((current) => ({
      ...current,
      available: current.available - input.amount,
      totalWithdrawals: current.totalWithdrawals + input.amount,
    }))
    showToast(
      `Payout of ${input.amount.toLocaleString()} requested to ${destination.label}.`,
    )
    return true
  }

  function addExpense(input: NewExpenseInput): Expense {
    const expense: Expense = {
      ...input,
      id: createId('exp'),
      hasReceipt: false,
    }

    setExpenses((current) => [expense, ...current])
    showToast('Expense recorded. Upload the receipt when it is ready.', 'info')
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
    const net = amount - fee
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
    setTransactions((current) => [
      {
        id: createId('tx'),
        date: weekdayDate(),
        description: 'Campaign contribution — studio fund',
        customerName: 'Demo supporter',
        source: 'crowdfunding',
        method: 'wallet',
        gross: amount,
        fee,
        net,
        status: 'paid',
        reference: `CAMP-${Date.now().toString().slice(-5)}`,
      },
      ...current,
    ])
    setWallet((current) => ({
      ...current,
      available: current.available + net,
      totalEarnings: current.totalEarnings + net,
      totalReceived: current.totalReceived + amount,
      processingFees: current.processingFees + fee,
    }))
    showToast('Contribution recorded and added to your ledger.')
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
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    )
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

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read,
  ).length

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
      destinations: payoutDestinations,
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
      expenses,
      automations,
      notifications,
      unreadNotifications,
      tips,
      goal,
      subscribers,
      assistantMessages,
      toast,
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

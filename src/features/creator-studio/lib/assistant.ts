import { monthlyRevenue, walletSummary } from '../data/creatorStudio'
import type {
  Campaign,
  Customer,
  Expense,
  IncomeSource,
  Invoice,
  Payout,
  Transaction,
} from '../types'
import { formatDate, formatKes } from './format'
import { expenseCategoryLabels, sourceLabels } from './labels'

export type AssistantContext = {
  transactions: Transaction[]
  expenses: Expense[]
  invoices: Invoice[]
  payouts: Payout[]
  customers: Customer[]
  campaigns: Campaign[]
}

const monthNames: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
}

const sourcePatterns: Array<{ source: IncomeSource; pattern: RegExp }> = [
  { source: 'subscriptions', pattern: /subscri|renewal|recurring member/i },
  { source: 'memberships', pattern: /membership/i },
  { source: 'tips', pattern: /tips?|gifts?|support(?:er)? contributions?/i },
  { source: 'sponsorships', pattern: /sponsor|brand deal|partnership/i },
  { source: 'consultations', pattern: /consult|coaching|1:1|one-to-one/i },
  { source: 'digital-products', pattern: /digital|workbook|template|course|download/i },
  { source: 'physical-products', pattern: /physical|print|planner|merch/i },
  { source: 'paid-content', pattern: /paid content|workshop|ticket|recording/i },
  { source: 'services', pattern: /services?|freelance/i },
  { source: 'affiliate', pattern: /affiliate|commission/i },
  { source: 'crowdfunding', pattern: /crowdfund|campaign|fundrais/i },
  { source: 'donations', pattern: /donation|charity/i },
]

function detectMonth(query: string): string | null {
  const lower = query.toLowerCase()
  const explicitYear = lower.match(/\b(20\d{2})\b/)
  const year = explicitYear ? Number(explicitYear[1]) : null

  if (/\bthis month\b/.test(lower)) return '2026-11'
  if (/\blast month\b/.test(lower)) return '2026-10'

  for (const [name, month] of Object.entries(monthNames)) {
    if (!new RegExp(`\\b${name}\\b`).test(lower)) continue

    const inferredYear = year ?? (month > 11 ? 2025 : 2026)
    return `${inferredYear}-${String(month).padStart(2, '0')}`
  }

  return null
}

function detectSource(query: string): IncomeSource | null {
  for (const entry of sourcePatterns) {
    if (entry.pattern.test(query)) return entry.source
  }

  return null
}

function matchesPeriod(date: string, month: string | null, year: boolean) {
  if (month) return date.startsWith(month)
  if (year) return date.startsWith('2026')
  return true
}

function periodLabel(month: string | null, year: boolean): string {
  if (month) {
    const [yearPart, monthPart] = month.split('-')
    const date = new Date(`${yearPart}-${monthPart}-02T00:00:00`)
    return new Intl.DateTimeFormat('en-GB', {
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  return year ? '2026 so far' : 'the recorded period'
}

function invoiceAnswer(invoices: Invoice[]): string {
  const outstanding = invoices.filter(
    (invoice) => invoice.status === 'sent' || invoice.status === 'overdue',
  )
  const total = outstanding.reduce((sum, invoice) => sum + invoice.total, 0)

  if (outstanding.length === 0) {
    return 'You have no outstanding invoices right now. Every issued invoice has been marked paid or cancelled.'
  }

  const lines = outstanding.map(
    (invoice) =>
      `• ${invoice.number} — ${invoice.customerName}: ${formatKes(invoice.total)} (${invoice.status}, due ${formatDate(invoice.dueDate)})`,
  )

  return `You have ${outstanding.length} outstanding invoices worth ${formatKes(total)}:\n${lines.join('\n')}\n\nThese amounts are not included in your available balance until the payments are recorded.`
}

function customerAnswer(customers: Customer[]): string {
  const top = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 4)
  const total = customers.reduce((sum, customer) => sum + customer.totalSpent, 0)

  return `Across ${customers.length} recorded customers, lifetime spending totals ${formatKes(total)}. Your top supporters are:\n${top
    .map(
      (customer, index) =>
        `${index + 1}. ${customer.name} — ${formatKes(customer.totalSpent)} across ${customer.paymentCount} payments`,
    )
    .join('\n')}\n\nVIP and repeat customers can be filtered in the Customers section.`
}

function expenseAnswer(
  expenses: Expense[],
  month: string | null,
  year: boolean,
): string {
  const scoped = expenses.filter((expense) =>
    matchesPeriod(expense.date, month, year),
  )
  const total = scoped.reduce((sum, expense) => sum + expense.amount, 0)

  if (scoped.length === 0) {
    return `I found no expense records for ${periodLabel(month, year)}.`
  }

  const byCategory = new Map<string, number>()
  for (const expense of scoped) {
    byCategory.set(
      expense.category,
      (byCategory.get(expense.category) ?? 0) + expense.amount,
    )
  }

  const topCategory = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0]

  return `You recorded ${formatKes(total)} of expenses across ${scoped.length} entries for ${periodLabel(month, year)}. The largest category is ${expenseCategoryLabels[topCategory[0] as keyof typeof expenseCategoryLabels]} at ${formatKes(topCategory[1])}. ${scoped.filter((expense) => !expense.hasReceipt).length} entries are still missing a receipt.`
}

function revenueAnswer(
  transactions: Transaction[],
  source: IncomeSource | null,
  month: string | null,
  year: boolean,
): string {
  const scoped = transactions.filter(
    (transaction) =>
      transaction.status === 'paid' &&
      matchesPeriod(transaction.date, month, year) &&
      (source === null || transaction.source === source),
  )

  if (scoped.length === 0) {
    const sourceText = source ? ` from ${sourceLabels[source]}` : ''
    return `I found no paid transactions${sourceText} for ${periodLabel(month, year)}. I will not estimate a figure when there are no matching ledger records.`
  }

  const gross = scoped.reduce((sum, transaction) => sum + transaction.gross, 0)
  const net = scoped.reduce((sum, transaction) => sum + transaction.net, 0)
  const fees = scoped.reduce((sum, transaction) => sum + transaction.fee, 0)
  const pending = transactions.filter(
    (transaction) =>
      transaction.status === 'pending' &&
      matchesPeriod(transaction.date, month, year) &&
      (source === null || transaction.source === source),
  )

  const sourceText = source ? ` from ${sourceLabels[source]}` : ''
  const lines = [
    `You recorded ${formatKes(net)} net${sourceText} in ${periodLabel(month, year)}, from ${scoped.length} paid transactions.`,
    `Gross income was ${formatKes(gross)} and processing fees were ${formatKes(fees)}.`,
  ]

  if (pending.length > 0) {
    lines.push(
      `${pending.length} further payment${pending.length === 1 ? '' : 's'} worth ${formatKes(pending.reduce((sum, transaction) => sum + transaction.gross, 0))} ${pending.length === 1 ? 'is' : 'are'} still pending and excluded from net income.`,
    )
  }

  lines.push(
    'This is calculated from the payment records in your Creator Studio ledger.',
  )

  return lines.join(' ')
}

function cashFlowAnswer(payouts: Payout[]): string {
  const scheduled = payouts
    .filter((payout) => payout.status === 'scheduled' || payout.status === 'processing')
    .reduce((sum, payout) => sum + payout.amount, 0)

  return `Your current cash position is:\n• Available now: ${formatKes(walletSummary.available)}\n• Pending payments: ${formatKes(walletSummary.pending)}\n• Reserved funds: ${formatKes(walletSummary.reserved)}\n• Already queued for payout: ${formatKes(scheduled)}\n\nCreator Studio is a sub-ledger of your Relay Wallet, so these balances are a view of the same underlying account — not a second wallet.`
}

function payoutAnswer(payouts: Payout[], month: string | null): string {
  const scoped = payouts.filter((payout) =>
    matchesPeriod(payout.requestedAt, month, false),
  )
  const paid = scoped.filter((payout) => payout.status === 'paid')
  const total = paid.reduce((sum, payout) => sum + payout.amount, 0)

  return `You have ${payouts.length} recorded payouts. ${paid.length} have completed, totalling ${formatKes(total)}${month ? ` in ${periodLabel(month, false)}` : ''}. ${scoped.filter((payout) => payout.status !== 'paid').length} payout${scoped.length === 1 ? '' : 's'} are still processing or scheduled. You can see destination, fee and reference details in Payouts.`
}

function campaignAnswer(campaigns: Campaign[]): string {
  const active = campaigns.filter((campaign) => campaign.status === 'active')
  const raised = active.reduce((sum, campaign) => sum + campaign.raised, 0)
  const goals = active.reduce((sum, campaign) => sum + campaign.goal, 0)

  return `You have ${active.length} active campaigns. Together they have raised ${formatKes(raised)} of ${formatKes(goals)} (${Math.round((raised / Math.max(goals, 1)) * 100)}%). The closest to completion is ${[...active].sort((a, b) => b.raised / b.goal - a.raised / a.goal)[0]?.title ?? '—'}.`
}

function forecastAnswer(): string {
  const recent = monthlyRevenue.slice(-3)
  const average =
    recent.reduce((sum, point) => sum + point.revenue, 0) / recent.length
  const forecast = Math.round(average * 1.08)

  return `A simple trend projection based on the last three recorded months (${recent.map((point) => `${point.label}: ${formatKes(point.revenue)}`).join(', ')}) suggests roughly ${formatKes(forecast)} next month. That is a projection, not a confirmed amount — it excludes new campaigns or one-off sponsorship income.`
}

export function answerFinancialQuery(
  query: string,
  context: AssistantContext,
): string {
  const trimmed = query.trim()

  if (!trimmed) {
    return 'Ask me about earnings, expenses, invoices, payouts, customers or campaigns. I answer from the records in your workspace.'
  }

  const month = detectMonth(trimmed)
  const year = /\b(this year|annual|year to date|ytd)\b/i.test(trimmed)
  const source = detectSource(trimmed)

  if (/invoice|billing|overdue|receivable/i.test(trimmed)) {
    return invoiceAnswer(context.invoices)
  }

  if (/payout|withdraw/i.test(trimmed)) {
    return payoutAnswer(context.payouts, month)
  }

  if (/expense|spend|cost|budget/i.test(trimmed)) {
    return expenseAnswer(context.expenses, month, year)
  }

  if (/campaign|fundrais|crowdfund/i.test(trimmed)) {
    return campaignAnswer(context.campaigns)
  }

  if (/customer|supporter|client|who spent|top.*(customer|supporter)/i.test(trimmed)) {
    return customerAnswer(context.customers)
  }

  if (/forecast|projection|next month|predict/i.test(trimmed)) {
    return forecastAnswer()
  }

  if (/cash.?flow|available|balance|how much.*(have|left)/i.test(trimmed)) {
    return cashFlowAnswer(context.payouts)
  }

  if (
    source ||
    /earn|revenue|income|sales|made|received|paid me/i.test(trimmed)
  ) {
    return revenueAnswer(context.transactions, source, month, year)
  }

  return `Here is a quick summary from your records:\n• Net earnings: ${formatKes(walletSummary.totalEarnings)}\n• Available balance: ${formatKes(walletSummary.available)}\n• Pending payments: ${formatKes(walletSummary.pending)}\n• This month: ${formatKes(walletSummary.monthlyRevenue)}\n\nTry asking about subscriptions in October, outstanding invoices, expenses this month, your top customers or next month’s forecast.`
}

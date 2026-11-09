export type CreatorSectionId =
  | 'overview'
  | 'profile'
  | 'payment-links'
  | 'wallet'
  | 'subscriptions'
  | 'tips'
  | 'storefront'
  | 'invoices'
  | 'customers'
  | 'campaigns'
  | 'partnerships'
  | 'payouts'
  | 'analytics'
  | 'expenses'
  | 'assistant'
  | 'automations'
  | 'security'
  | 'settings'

export type SectionNavItem = {
  id: CreatorSectionId
  label: string
  description: string
}

export type IncomeSource =
  | 'subscriptions'
  | 'memberships'
  | 'digital-products'
  | 'physical-products'
  | 'services'
  | 'consultations'
  | 'bookings'
  | 'tips'
  | 'donations'
  | 'sponsorships'
  | 'affiliate'
  | 'crowdfunding'
  | 'gifts'
  | 'paid-content'
  | 'freelance'
  | 'other'

export type PaymentMethod =
  | 'mpesa'
  | 'card'
  | 'bank-transfer'
  | 'wallet'
  | 'paypal'
  | 'crypto'

export type TransactionStatus = 'paid' | 'pending' | 'failed' | 'refunded'

export type Transaction = {
  id: string
  date: string
  description: string
  customerId?: string
  customerName: string
  source: IncomeSource
  method: PaymentMethod
  gross: number
  fee: number
  net: number
  status: TransactionStatus
  reference: string
}

export type WalletSummary = {
  available: number
  pending: number
  reserved: number
  totalEarnings: number
  totalReceived: number
  totalWithdrawals: number
  platformFees: number
  processingFees: number
  refunds: number
  chargebacks: number
  monthlyRevenue: number
  annualRevenue: number
  growth: number
}

export type MonthlyRevenuePoint = {
  month: string
  label: string
  revenue: number
}

export type SourceBreakdown = {
  source: IncomeSource
  amount: number
}

export type MethodBreakdown = {
  method: PaymentMethod
  amount: number
}

export type CreatorProfile = {
  displayName: string
  legalName: string
  username: string
  category: string
  bio: string
  businessDescription: string
  country: string
  currency: string
  publicUrl: string
  website: string
  publicEmail: string
  supportEmail: string
  phone: string
  socials: { label: string; handle: string }[]
  verified: boolean
  status: 'active' | 'paused'
  profileVisibility: 'public' | 'unlisted' | 'private'
  showEarnings: boolean
  showSupporters: boolean
  portfolio: { title: string; type: string; metric: string }[]
  analytics: {
    profileViews: number
    linkClicks: number
    conversionRate: number
    topCountry: string
  }
}

export type PaymentLink = {
  id: string
  title: string
  slug: string
  type: 'fixed' | 'variable'
  amount?: number
  source: IncomeSource
  description: string
  status: 'active' | 'paused'
  payments: number
  revenue: number
  createdAt: string
  expiresAt?: string
  limit?: number
}

export type SubscriptionPlan = {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  members: number
  perks: string[]
  status: 'active' | 'paused'
  tone: 'teal' | 'violet' | 'amber'
}

export type Subscriber = {
  id: string
  customerId: string
  name: string
  email: string
  planId: string
  status: 'active' | 'past_due' | 'cancelled'
  since: string
  renewsAt: string
  totalPaid: number
}

export type Tip = {
  id: string
  supporterName: string
  amount: number
  message?: string
  date: string
  anonymous: boolean
  recurring: boolean
  method: PaymentMethod
}

export type ContributionGoal = {
  title: string
  target: number
  raised: number
  contributors: number
  presets: number[]
  pageSlug: string
  thankYouEnabled: boolean
}

export type Product = {
  id: string
  name: string
  type: 'digital' | 'physical' | 'service'
  price: number
  sales: number
  revenue: number
  stock?: number
  status: 'active' | 'draft'
  delivery: string
  emoji: string
}

export type Order = {
  id: string
  customerName: string
  productName: string
  amount: number
  method: PaymentMethod
  date: string
  status: 'paid' | 'pending' | 'refunded' | 'delivered'
}

export type DiscountCode = {
  code: string
  value: string
  uses: number
  status: 'active' | 'expired'
}

export type InvoiceItem = {
  label: string
  quantity: number
  unitPrice: number
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export type Invoice = {
  id: string
  number: string
  customerId?: string
  customerName: string
  description: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  issuedAt: string
  dueDate: string
  status: InvoiceStatus
  paidAt?: string
}

export type CustomerSegment = 'vip' | 'repeat' | 'new' | 'subscriber'

export type Customer = {
  id: string
  name: string
  email: string
  segment: CustomerSegment
  totalSpent: number
  paymentCount: number
  lastPayment: string
  tags: string[]
  notes: string
  joinedAt: string
  status: 'active' | 'blocked'
  source: string
}

export type Campaign = {
  id: string
  title: string
  description: string
  goal: number
  raised: number
  contributors: number
  deadline: string
  status: 'active' | 'completed' | 'draft'
  isPrivate: boolean
  emoji: string
  updates: number
}

export type SponsorshipStatus =
  | 'negotiating'
  | 'contracted'
  | 'in-progress'
  | 'paid'
  | 'overdue'

export type Sponsorship = {
  id: string
  brand: string
  campaign: string
  value: number
  status: SponsorshipStatus
  dueDate: string
  invoiceId?: string
  contact: string
}

export type PayoutDestination = {
  id: string
  label: string
  type: 'mpesa' | 'bank' | 'wallet' | 'crypto'
  detail: string
  primary: boolean
  verified: boolean
}

export type PayoutStatus = 'paid' | 'processing' | 'scheduled' | 'failed'

export type Payout = {
  id: string
  amount: number
  fee: number
  net: number
  destinationId: string
  destinationLabel: string
  status: PayoutStatus
  requestedAt: string
  completedAt?: string
  reference: string
}

export type ExpenseCategory =
  | 'equipment'
  | 'workspace'
  | 'software'
  | 'utilities'
  | 'travel'
  | 'professional-services'
  | 'marketing'
  | 'other'

export type Expense = {
  id: string
  description: string
  category: ExpenseCategory
  amount: number
  date: string
  hasReceipt: boolean
  deductible: boolean
}

export type Automation = {
  id: string
  name: string
  description: string
  trigger: string
  enabled: boolean
  lastRun: string
  runs: number
}

export type LoginEvent = {
  id: string
  device: string
  location: string
  date: string
  method: string
  current: boolean
}

export type PendingRequest = {
  id: string
  customerName: string
  amount: number
  source: IncomeSource
  date: string
  expiresAt: string
  reference: string
}

export type CreatorNotification = {
  id: string
  title: string
  body: string
  tone: 'info' | 'success' | 'warning'
  date: string
  read: boolean
}

export type AssistantMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export type NewPaymentLinkInput = {
  title: string
  amount: number | null
  source: IncomeSource
  description: string
  expiresAt?: string
}

export type NewInvoiceInput = {
  customerName: string
  description: string
  amount: number
  taxRate: number
  dueDate: string
}

export type NewExpenseInput = {
  description: string
  category: ExpenseCategory
  amount: number
  date: string
  deductible: boolean
}

export type NewCampaignInput = {
  title: string
  description: string
  goal: number
  deadline: string
  isPrivate: boolean
}

export type PayoutRequestInput = {
  amount: number
  destinationId: string
}

export type CurrencyCode = 'KES' | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'ZAR'

export type ServiceId =
  | 'personal'
  | 'creator'
  | 'business'
  | 'commerce'
  | 'professional'

export type SubaccountKind = ServiceId | 'savings' | 'bills'

export type SubaccountStatus = 'active' | 'restricted' | 'closed'

export type Subaccount = {
  id: string
  kind: SubaccountKind
  name: string
  description: string
  currency: CurrencyCode
  isPrimary: boolean
  status: SubaccountStatus
  services: ServiceId[]
  createdAt: string
  accent: 'teal' | 'violet' | 'amber' | 'sky' | 'rose' | 'slate'
}

export type LedgerEntryStatus = 'posted' | 'pending' | 'reserved' | 'reversed'

export type LedgerDirection = 'debit' | 'credit'

export type LedgerEntry = {
  id: string
  transactionId: string
  accountRef: string
  subaccountId?: string
  direction: LedgerDirection
  amount: number
  currency: CurrencyCode
  status: LedgerEntryStatus
  postedAt: string
  memo: string
}

export type MoneyTransactionKind =
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'payment'
  | 'request'
  | 'bill'
  | 'refund'
  | 'reversal'
  | 'fee'
  | 'creator_earning'
  | 'contribution'
  | 'fx'

export type MoneyTransactionStatus =
  | 'pending'
  | 'processing'
  | 'posted'
  | 'failed'
  | 'reversed'

export type PaymentRailId =
  | 'relay'
  | 'mpesa'
  | 'bank'
  | 'card'
  | 'swift'
  | 'wise'
  | 'paypal'
  | 'usdc'
  | 'qr'
  | 'bill'

export type MoneyTransaction = {
  id: string
  reference: string
  kind: MoneyTransactionKind
  status: MoneyTransactionStatus
  amount: number
  currency: CurrencyCode
  fee: number
  net: number
  description: string
  counterparty: string
  fromSubaccountId?: string
  toSubaccountId?: string
  rail: PaymentRailId
  createdAt: string
  postedAt?: string
  idempotencyKey: string
  reversalOf?: string
  metadata?: Record<string, string | number | boolean | undefined>
}

export type BalanceBuckets = {
  available: number
  pending: number
  reserved: number
  currency: CurrencyCode
}

export type SubaccountBalance = BalanceBuckets & {
  subaccountId: string
  total: number
}

export type PaymentRequestDirection = 'incoming' | 'outgoing'

export type PaymentRequestStatus = 'open' | 'paid' | 'declined' | 'expired'

export type PaymentRequest = {
  id: string
  reference: string
  direction: PaymentRequestDirection
  counterparty: string
  amount: number
  currency: CurrencyCode
  note: string
  status: PaymentRequestStatus
  createdAt: string
  dueAt?: string
  subaccountId: string
  link: string
  conversationId?: string
}

export type PaymentLink = {
  id: string
  title: string
  slug: string
  type: 'fixed' | 'variable'
  amount?: number
  currency: CurrencyCode
  source: string
  description: string
  status: 'active' | 'paused'
  payments: number
  revenue: number
  createdAt: string
  expiresAt?: string
  limit?: number
}

export type BillStatus = 'due' | 'scheduled' | 'paid' | 'overdue'

export type Bill = {
  id: string
  provider: string
  category: string
  amount: number
  currency: CurrencyCode
  dueDate: string
  status: BillStatus
  autopay: boolean
  accountRef: string
}

export type ScheduledPaymentFrequency = 'once' | 'weekly' | 'monthly'

export type ScheduledPaymentStatus = 'active' | 'paused' | 'completed'

export type ScheduledPayment = {
  id: string
  counterparty: string
  amount: number
  currency: CurrencyCode
  frequency: ScheduledPaymentFrequency
  nextRun: string
  rail: PaymentRailId
  status: ScheduledPaymentStatus
  note: string
  subaccountId: string
}

export type CardStatus = 'active' | 'frozen' | 'cancelled'

export type Card = {
  id: string
  label: string
  network: 'Visa' | 'Mastercard'
  last4: string
  currency: CurrencyCode
  status: CardStatus
  spendLimit: number
  spent: number
  type: 'virtual' | 'physical'
  subaccountId: string
}

export type SavingsGoal = {
  id: string
  name: string
  target: number
  saved: number
  currency: CurrencyCode
  deadline?: string
  subaccountId: string
  emoji: string
}

export type Budget = {
  id: string
  name: string
  category: string
  limit: number
  spent: number
  currency: CurrencyCode
  period: 'monthly' | 'weekly'
}

export type SpendingLimit = {
  id: string
  scope: string
  subaccountId: string
  dailyLimit: number
  monthlyLimit: number
  usedToday: number
  usedMonth: number
  currency: CurrencyCode
}

export type FxRate = {
  base: CurrencyCode
  quote: CurrencyCode
  rate: number
  updatedAt: string
}

export type FxQuote = {
  from: CurrencyCode
  to: CurrencyCode
  amount: number
  rate: number
  fee: number
  converted: number
  total: number
  rail: PaymentRailId
  expiresAt: string
}

export type PayoutDestination = {
  id: string
  label: string
  type: 'mpesa' | 'bank' | 'wallet' | 'crypto'
  detail: string
  primary: boolean
  verified: boolean
  currency: CurrencyCode
}

export type PaymentRailStatus =
  | 'available'
  | 'sandbox'
  | 'not_connected'
  | 'eligibility_required'

export type PaymentRail = {
  id: PaymentRailId
  label: string
  description: string
  status: PaymentRailStatus
  countries: string[]
  currencies: CurrencyCode[]
  note: string
}

export type LedgerIntegrity = {
  balanced: boolean
  entryCount: number
  unbalancedTransactions: string[]
  lastReconciledAt: string
}

export type NewSubaccountInput = {
  name: string
  kind: SubaccountKind
  currency: CurrencyCode
  description: string
}

export type TransferInput = {
  fromSubaccountId: string
  toSubaccountId: string
  amount: number
  description: string
}

export type DepositInput = {
  subaccountId: string
  amount: number
  rail: PaymentRailId
}

export type WithdrawalInput = {
  subaccountId: string
  amount: number
  destinationId: string
}

export type OutgoingPaymentInput = {
  subaccountId: string
  counterparty: string
  amount: number
  currency: CurrencyCode
  rail: PaymentRailId
  description: string
}

export type NewPaymentRequestInput = {
  direction: PaymentRequestDirection
  counterparty: string
  amount: number
  currency: CurrencyCode
  note: string
  subaccountId: string
  dueAt?: string
  conversationId?: string
}

export type NewPaymentLinkInput = {
  title: string
  amount: number | null
  currency: CurrencyCode
  source: string
  description: string
  expiresAt?: string
}

export type NewScheduledPaymentInput = {
  counterparty: string
  amount: number
  currency: CurrencyCode
  frequency: ScheduledPaymentFrequency
  nextRun: string
  rail: PaymentRailId
  note: string
  subaccountId: string
}

export type NewGoalInput = {
  name: string
  target: number
  currency: CurrencyCode
  subaccountId: string
  deadline?: string
}

export type NewExpenseInput = {
  subaccountId: string
  description: string
  amount: number
  currency: CurrencyCode
  category: string
  date: string
}

export type CreatorEarningInput = {
  gross: number
  fee: number
  currency: CurrencyCode
  description: string
  counterparty: string
  reference: string
  date: string
  status?: 'paid' | 'pending'
  metadata?: Record<string, string | number | boolean | undefined>
}

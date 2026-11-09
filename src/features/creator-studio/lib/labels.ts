import type {
  CustomerSegment,
  ExpenseCategory,
  IncomeSource,
  InvoiceStatus,
  PaymentMethod,
  PayoutStatus,
  SponsorshipStatus,
  TransactionStatus,
} from '../types'

export const sourceLabels: Record<IncomeSource, string> = {
  subscriptions: 'Subscriptions',
  memberships: 'Memberships',
  'digital-products': 'Digital products',
  'physical-products': 'Physical products',
  services: 'Services',
  consultations: 'Consultations',
  bookings: 'Bookings',
  tips: 'Tips',
  donations: 'Donations',
  sponsorships: 'Sponsorships',
  affiliate: 'Affiliate commissions',
  crowdfunding: 'Crowdfunding',
  gifts: 'Gifts',
  'paid-content': 'Paid content',
  freelance: 'Freelance',
  other: 'Other income',
}

export const methodLabels: Record<PaymentMethod, string> = {
  mpesa: 'M-PESA',
  card: 'Card',
  'bank-transfer': 'Bank transfer',
  wallet: 'Relay Wallet',
  paypal: 'PayPal',
  crypto: 'Crypto (USDC)',
}

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
}

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
}

export const payoutStatusLabels: Record<PayoutStatus, string> = {
  paid: 'Paid',
  processing: 'Processing',
  scheduled: 'Scheduled',
  failed: 'Failed',
}

export const sponsorshipStatusLabels: Record<SponsorshipStatus, string> = {
  negotiating: 'Negotiating',
  contracted: 'Contracted',
  'in-progress': 'In progress',
  paid: 'Paid',
  overdue: 'Overdue',
}

export const segmentLabels: Record<CustomerSegment, string> = {
  vip: 'VIP',
  repeat: 'Repeat',
  new: 'New',
  subscriber: 'Subscriber',
}

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  equipment: 'Equipment',
  workspace: 'Workspace',
  software: 'Software',
  utilities: 'Utilities',
  travel: 'Travel',
  'professional-services': 'Professional services',
  marketing: 'Marketing',
  other: 'Other',
}

export const incomeSourceOptions = Object.entries(sourceLabels).map(
  ([value, label]) => ({ value: value as IncomeSource, label }),
)

export const expenseCategoryOptions = Object.entries(expenseCategoryLabels).map(
  ([value, label]) => ({ value: value as ExpenseCategory, label }),
)

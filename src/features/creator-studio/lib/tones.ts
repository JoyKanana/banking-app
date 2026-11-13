import type {
  InvoiceStatus,
  Order,
  PayoutStatus,
  SponsorshipStatus,
  Subscriber,
  TransactionStatus,
} from '../types'

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

export const transactionStatusTones: Record<TransactionStatus, StatusTone> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'info',
}

export const invoiceStatusTones: Record<InvoiceStatus, StatusTone> = {
  draft: 'neutral',
  sent: 'info',
  paid: 'success',
  overdue: 'danger',
  cancelled: 'neutral',
}

export const payoutStatusTones: Record<PayoutStatus, StatusTone> = {
  paid: 'success',
  processing: 'info',
  scheduled: 'warning',
  failed: 'danger',
}

export const sponsorshipStatusTones: Record<SponsorshipStatus, StatusTone> = {
  negotiating: 'neutral',
  contracted: 'info',
  'in-progress': 'warning',
  paid: 'success',
  overdue: 'danger',
}

export const subscriberStatusTones: Record<Subscriber['status'], StatusTone> = {
  active: 'success',
  past_due: 'warning',
  cancelled: 'neutral',
}

export const orderStatusTones: Record<Order['status'], StatusTone> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'info',
  delivered: 'neutral',
}

export const productStatusTones: Record<'active' | 'draft', StatusTone> = {
  active: 'success',
  draft: 'neutral',
}

export const linkStatusTones: Record<'active' | 'paused', StatusTone> = {
  active: 'success',
  paused: 'neutral',
}

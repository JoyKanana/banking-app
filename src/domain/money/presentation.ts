import type {
  MoneyTransaction,
  PaymentRailId,
  PaymentRailStatus,
  Subaccount,
} from './types'

export const railLabels: Record<PaymentRailId, string> = {
  relay: 'Relay',
  mpesa: 'M-PESA',
  bank: 'Bank',
  card: 'Card',
  swift: 'SWIFT',
  wise: 'Wise',
  paypal: 'PayPal',
  usdc: 'USDC',
  qr: 'QR',
  bill: 'Biller',
}

export const railStatusLabels: Record<PaymentRailStatus, string> = {
  available: 'Live',
  sandbox: 'Sandbox',
  not_connected: 'Not connected',
  eligibility_required: 'Eligibility required',
}

export const transactionStatusLabels: Record<
  MoneyTransaction['status'],
  string
> = {
  pending: 'Pending',
  processing: 'Processing',
  posted: 'Posted',
  failed: 'Failed',
  reversed: 'Reversed',
}

export function transactionDirection(
  transaction: MoneyTransaction,
): 'in' | 'out' | 'internal' {
  if (transaction.fromSubaccountId && transaction.toSubaccountId) {
    return 'internal'
  }
  if (transaction.toSubaccountId) return 'in'
  if (transaction.fromSubaccountId) return 'out'
  return 'internal'
}

export function subaccountLabel(
  subaccounts: Subaccount[],
  id?: string,
): string {
  if (!id) return 'External'
  return subaccounts.find((subaccount) => subaccount.id === id)?.name ?? id
}

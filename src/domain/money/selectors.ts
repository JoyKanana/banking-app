import { getSubaccountBalance } from './ledger'
import type {
  CurrencyCode,
  FxRate,
  LedgerEntry,
  MoneyTransaction,
  Subaccount,
  SubaccountBalance,
} from './types'

export type CreatorWalletSummary = {
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

export type MonthlyPoint = {
  month: string
  label: string
  revenue: number
}

export function findRate(
  rates: FxRate[],
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  if (from === to) return 1
  return rates.find((rate) => rate.base === from && rate.quote === to)?.rate ?? 1
}

export function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: FxRate[],
): number {
  return Math.round(amount * findRate(rates, from, to) * 100) / 100
}

export function totalAvailableInKes(
  subaccounts: Subaccount[],
  entries: LedgerEntry[],
  rates: FxRate[],
): number {
  return subaccounts.reduce((total, subaccount) => {
    const balance = getSubaccountBalance(entries, subaccount.id, subaccount.currency)
    return total + convertAmount(balance.available, subaccount.currency, 'KES', rates)
  }, 0)
}

export function totalPendingInKes(
  subaccounts: Subaccount[],
  entries: LedgerEntry[],
  rates: FxRate[],
): number {
  return subaccounts.reduce((total, subaccount) => {
    const balance = getSubaccountBalance(entries, subaccount.id, subaccount.currency)
    return total + convertAmount(balance.pending, subaccount.currency, 'KES', rates)
  }, 0)
}

export function totalReservedInKes(
  subaccounts: Subaccount[],
  entries: LedgerEntry[],
  rates: FxRate[],
): number {
  return subaccounts.reduce((total, subaccount) => {
    const balance = getSubaccountBalance(entries, subaccount.id, subaccount.currency)
    return total + convertAmount(balance.reserved, subaccount.currency, 'KES', rates)
  }, 0)
}

export function getSubaccountBalances(
  subaccounts: Subaccount[],
  entries: LedgerEntry[],
): SubaccountBalance[] {
  return subaccounts.map((subaccount) => {
    const buckets = getSubaccountBalance(entries, subaccount.id, subaccount.currency)
    return {
      subaccountId: subaccount.id,
      ...buckets,
      total: buckets.available + buckets.pending,
    }
  })
}

export function getCreatorWalletSummary(
  transactions: MoneyTransaction[],
  entries: LedgerEntry[],
): CreatorWalletSummary {
  const balance = getSubaccountBalance(entries, 'sub-creator', 'KES')
  const creatorTransactions = transactions.filter(
    (transaction) =>
      transaction.toSubaccountId === 'sub-creator' ||
      transaction.fromSubaccountId === 'sub-creator',
  )
  const earnings = creatorTransactions.filter(
    (transaction) =>
      transaction.kind === 'creator_earning' &&
      transaction.status !== 'reversed',
  )
  const postedEarnings = earnings.filter(
    (transaction) => transaction.status === 'posted',
  )
  const withdrawals = creatorTransactions.filter(
    (transaction) =>
      transaction.kind === 'withdrawal' &&
      transaction.fromSubaccountId === 'sub-creator' &&
      transaction.status !== 'reversed',
  )
  const refunds = creatorTransactions.filter(
    (transaction) =>
      transaction.kind === 'refund' &&
      transaction.fromSubaccountId === 'sub-creator' &&
      transaction.status !== 'reversed',
  )

  const monthlyRevenue = postedEarnings
    .filter((transaction) => transaction.createdAt.startsWith('2026-11'))
    .reduce((total, transaction) => total + transaction.net, 0)
  const lastMonthRevenue = postedEarnings
    .filter((transaction) => transaction.createdAt.startsWith('2026-10'))
    .reduce((total, transaction) => total + transaction.net, 0)
  const annualRevenue = postedEarnings
    .filter((transaction) => transaction.createdAt.startsWith('2026'))
    .reduce((total, transaction) => total + transaction.net, 0)
  const growth =
    lastMonthRevenue > 0
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0

  return {
    available: balance.available,
    pending: balance.pending,
    reserved: balance.reserved,
    totalEarnings: postedEarnings.reduce(
      (total, transaction) => total + transaction.net,
      0,
    ),
    totalReceived: postedEarnings.reduce(
      (total, transaction) => total + transaction.amount,
      0,
    ),
    totalWithdrawals: withdrawals
      .filter((transaction) => transaction.status === 'posted')
      .reduce((total, transaction) => total + transaction.amount, 0),
    platformFees: 0,
    processingFees: postedEarnings.reduce(
      (total, transaction) => total + transaction.fee,
      0,
    ),
    refunds: refunds.reduce(
      (total, transaction) => total + transaction.amount,
      0,
    ),
    chargebacks: 0,
    monthlyRevenue,
    annualRevenue,
    growth: Math.round(growth * 10) / 10,
  }
}

export function getMonthlyPoints(
  transactions: MoneyTransaction[],
  options: {
    subaccountId?: string
    kind?: MoneyTransaction['kind']
    value?: 'net' | 'amount'
    months?: string[]
  } = {},
): MonthlyPoint[] {
  const months =
    options.months ??
    [
      '2025-12',
      '2026-01',
      '2026-02',
      '2026-03',
      '2026-04',
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
      '2026-11',
    ]
  const valueKey = options.value ?? 'net'
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return months.map((month) => {
    const total = transactions
      .filter((transaction) => {
        if (transaction.status === 'reversed' || transaction.status === 'failed') {
          return false
        }
        if (options.subaccountId) {
          const matches =
            transaction.toSubaccountId === options.subaccountId ||
            transaction.fromSubaccountId === options.subaccountId
          if (!matches) return false
        }
        if (options.kind && transaction.kind !== options.kind) return false
        return transaction.createdAt.startsWith(month)
      })
      .reduce(
        (sum, transaction) => sum + transaction[valueKey],
        0,
      )

    const monthIndex = Number(month.slice(5, 7)) - 1

    return {
      month,
      label: labels[monthIndex] ?? month,
      revenue: Math.round(total),
    }
  })
}

export function getSubaccountTransactions(
  transactions: MoneyTransaction[],
  subaccountId: string,
): MoneyTransaction[] {
  return transactions.filter(
    (transaction) =>
      transaction.fromSubaccountId === subaccountId ||
      transaction.toSubaccountId === subaccountId,
  )
}

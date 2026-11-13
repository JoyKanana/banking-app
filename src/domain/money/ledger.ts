import type {
  BalanceBuckets,
  CurrencyCode,
  LedgerEntry,
  LedgerEntryStatus,
  LedgerIntegrity,
  MoneyTransaction,
  MoneyTransactionKind,
  MoneyTransactionStatus,
  PaymentRailId,
} from './types'

let ledgerSequence = 0

export function createLedgerId(prefix = 'led'): string {
  ledgerSequence += 1
  const random =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)

  return `${prefix}-${random}-${ledgerSequence}`
}

export type PostingInput = {
  accountRef: string
  subaccountId?: string
  direction: 'debit' | 'credit'
  amount: number
  currency: CurrencyCode
  status?: LedgerEntryStatus
  memo: string
}

export type BuildTransactionInput = {
  id?: string
  reference?: string
  kind: MoneyTransactionKind
  status?: MoneyTransactionStatus
  amount: number
  currency: CurrencyCode
  fee?: number
  net?: number
  description: string
  counterparty: string
  fromSubaccountId?: string
  toSubaccountId?: string
  rail: PaymentRailId
  createdAt: string
  postedAt?: string
  idempotencyKey?: string
  reversalOf?: string
  metadata?: Record<string, string | number | boolean | undefined>
  postings: PostingInput[]
}

export type BuiltTransaction = {
  transaction: MoneyTransaction
  entries: LedgerEntry[]
}

export function buildTransaction(input: BuildTransactionInput): BuiltTransaction {
  const transactionId = input.id ?? createLedgerId('txn')
  const status = input.status ?? 'posted'
  const entryStatus: LedgerEntryStatus =
    status === 'pending' || status === 'processing'
      ? 'pending'
      : status === 'reversed'
        ? 'reversed'
        : 'posted'

  const entries: LedgerEntry[] = input.postings.map((posting) => ({
    id: createLedgerId('entry'),
    transactionId,
    accountRef: posting.accountRef,
    subaccountId: posting.subaccountId,
    direction: posting.direction,
    amount: posting.amount,
    currency: posting.currency,
    status: posting.status ?? entryStatus,
    postedAt: input.postedAt ?? input.createdAt,
    memo: posting.memo,
  }))

  const transaction: MoneyTransaction = {
    id: transactionId,
    reference:
      input.reference ??
      `RLY-${transactionId.replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase()}`,
    kind: input.kind,
    status,
    amount: input.amount,
    currency: input.currency,
    fee: input.fee ?? 0,
    net: input.net ?? input.amount - (input.fee ?? 0),
    description: input.description,
    counterparty: input.counterparty,
    fromSubaccountId: input.fromSubaccountId,
    toSubaccountId: input.toSubaccountId,
    rail: input.rail,
    createdAt: input.createdAt,
    postedAt: input.postedAt ?? (status === 'posted' ? input.createdAt : undefined),
    idempotencyKey: input.idempotencyKey ?? createLedgerId('idem'),
    reversalOf: input.reversalOf,
    metadata: input.metadata,
  }

  return { transaction, entries }
}

export function getSubaccountBalance(
  entries: LedgerEntry[],
  subaccountId: string,
  currency: CurrencyCode,
): BalanceBuckets {
  let available = 0
  let pending = 0
  let reserved = 0

  for (const entry of entries) {
    if (entry.subaccountId !== subaccountId || entry.currency !== currency) {
      continue
    }

    const signed = entry.direction === 'credit' ? entry.amount : -entry.amount

    if (entry.status === 'posted') {
      available += signed
    } else if (entry.status === 'pending') {
      pending += signed
    } else if (entry.status === 'reserved') {
      reserved += entry.direction === 'debit' ? entry.amount : -entry.amount
    }
  }

  return {
    available: available - reserved,
    pending,
    reserved,
    currency,
  }
}

export function getLedgerIntegrity(
  transactions: MoneyTransaction[],
  entries: LedgerEntry[],
  lastReconciledAt: string,
): LedgerIntegrity {
  const totals = new Map<string, number>()
  const transactionIds = new Set(transactions.map((transaction) => transaction.id))
  const unbalancedTransactions = new Set<string>()

  for (const entry of entries) {
    if (entry.status === 'reversed') continue

    const key = `${entry.transactionId}:${entry.currency}`
    const signed = entry.direction === 'debit' ? entry.amount : -entry.amount
    totals.set(key, (totals.get(key) ?? 0) + signed)

    if (!transactionIds.has(entry.transactionId)) {
      unbalancedTransactions.add(entry.transactionId)
    }
  }

  for (const [key, total] of totals) {
    if (Math.abs(total) > 0.005) {
      unbalancedTransactions.add(key.split(':')[0])
    }
  }

  return {
    balanced: unbalancedTransactions.size === 0,
    entryCount: entries.length,
    unbalancedTransactions: [...unbalancedTransactions],
    lastReconciledAt,
  }
}

export function isBalanced(entries: LedgerEntry[]): boolean {
  const totals = new Map<string, number>()

  for (const entry of entries) {
    if (entry.status === 'reversed') continue

    const signed = entry.direction === 'debit' ? entry.amount : -entry.amount
    totals.set(entry.currency, (totals.get(entry.currency) ?? 0) + signed)
  }

  return [...totals.values()].every((total) => Math.abs(total) <= 0.005)
}

export function reverseEntries(
  originalEntries: LedgerEntry[],
  reversalTransactionId: string,
  postedAt: string,
  memo: string,
): LedgerEntry[] {
  return originalEntries.map((entry) => ({
    ...entry,
    id: createLedgerId('entry'),
    transactionId: reversalTransactionId,
    direction: entry.direction === 'debit' ? 'credit' : 'debit',
    status: 'posted',
    postedAt,
    memo,
  }))
}

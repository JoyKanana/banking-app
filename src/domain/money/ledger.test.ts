import { describe, expect, it } from 'vitest'
import {
  buildTransaction,
  getLedgerIntegrity,
  getSubaccountBalance,
  isBalanced,
  reverseEntries,
} from './ledger'
import type { BuildTransactionInput, BuiltTransaction } from './ledger'

const createdAt = '2026-11-10T10:00:00.000Z'

function buildTransfer(
  overrides: Partial<BuildTransactionInput> = {},
): BuiltTransaction {
  return buildTransaction({
    kind: 'transfer',
    amount: 100,
    currency: 'KES',
    description: 'Test transfer',
    counterparty: 'Test account',
    fromSubaccountId: 'sub-a',
    toSubaccountId: 'sub-b',
    rail: 'relay',
    createdAt,
    postings: [
      {
        accountRef: 'sub-a',
        subaccountId: 'sub-a',
        direction: 'debit',
        amount: 100,
        currency: 'KES',
        memo: 'Transfer out',
      },
      {
        accountRef: 'sub-b',
        subaccountId: 'sub-b',
        direction: 'credit',
        amount: 100,
        currency: 'KES',
        memo: 'Transfer in',
      },
    ],
    ...overrides,
  })
}

describe('buildTransaction', () => {
  it('creates a transaction with balanced posted entries', () => {
    const built = buildTransfer()

    expect(built.transaction.status).toBe('posted')
    expect(built.entries).toHaveLength(2)
    expect(built.entries.every((entry) => entry.transactionId === built.transaction.id)).toBe(
      true,
    )
    expect(isBalanced(built.entries)).toBe(true)
  })

  it('marks entries as pending when the transaction is pending', () => {
    const built = buildTransfer({ status: 'pending' })

    expect(built.entries.every((entry) => entry.status === 'pending')).toBe(true)
  })
})

describe('getSubaccountBalance', () => {
  it('derives available balances from posted entries', () => {
    const built = buildTransfer()

    expect(getSubaccountBalance(built.entries, 'sub-a', 'KES').available).toBe(-100)
    expect(getSubaccountBalance(built.entries, 'sub-b', 'KES').available).toBe(100)
  })

  it('separates pending and reserved buckets', () => {
    const built = buildTransaction({
      kind: 'transfer',
      amount: 100,
      currency: 'KES',
      description: 'Pending and reserved transfer',
      counterparty: 'Test account',
      rail: 'relay',
      createdAt,
      postings: [
        {
          accountRef: 'sub-a',
          subaccountId: 'sub-a',
          direction: 'credit',
          amount: 100,
          currency: 'KES',
          memo: 'Posted credit',
        },
        {
          accountRef: 'sub-a',
          subaccountId: 'sub-a',
          direction: 'debit',
          amount: 30,
          currency: 'KES',
          status: 'reserved',
          memo: 'Reserved debit',
        },
        {
          accountRef: 'sub-b',
          subaccountId: 'sub-b',
          direction: 'debit',
          amount: 20,
          currency: 'KES',
          status: 'pending',
          memo: 'Pending debit',
        },
        {
          accountRef: 'sub-a',
          subaccountId: 'sub-a',
          direction: 'debit',
          amount: 100,
          currency: 'KES',
          memo: 'Balancing debit',
        },
      ],
    })

    const balance = getSubaccountBalance(built.entries, 'sub-a', 'KES')

    expect(balance.available).toBe(-30)
    expect(balance.reserved).toBe(30)
  })
})

describe('getLedgerIntegrity', () => {
  it('accepts balanced entries linked to known transactions', () => {
    const built = buildTransfer()
    const integrity = getLedgerIntegrity(
      [built.transaction],
      built.entries,
      createdAt,
    )

    expect(integrity.balanced).toBe(true)
    expect(integrity.unbalancedTransactions).toEqual([])
  })

  it('flags entries without a matching transaction', () => {
    const built = buildTransfer()
    const orphan = { ...built.entries[0], id: 'entry-orphan', transactionId: 'txn-missing' }
    const integrity = getLedgerIntegrity([built.transaction], [orphan], createdAt)

    expect(integrity.balanced).toBe(false)
    expect(integrity.unbalancedTransactions).toContain('txn-missing')
  })

  it('flags transactions that do not balance by currency', () => {
    const built = buildTransfer()
    const unbalanced = [
      built.entries[0],
      { ...built.entries[1], amount: 90 },
    ]
    const integrity = getLedgerIntegrity([built.transaction], unbalanced, createdAt)

    expect(integrity.balanced).toBe(false)
    expect(integrity.unbalancedTransactions).toContain(built.transaction.id)
  })
})

describe('reverseEntries', () => {
  it('flips entry directions and keeps the reversal balanced', () => {
    const built = buildTransfer()
    const reversed = reverseEntries(
      built.entries,
      'txn-reversal',
      '2026-11-11T10:00:00.000Z',
      'Reversal',
    )

    expect(reversed.every((entry) => entry.transactionId === 'txn-reversal')).toBe(
      true,
    )
    expect(reversed[0].direction).toBe('credit')
    expect(reversed[1].direction).toBe('debit')
    expect(isBalanced([...built.entries, ...reversed])).toBe(true)
  })
})

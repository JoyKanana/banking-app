import { buildTransaction } from '@/domain/money/ledger'
import type { BuiltTransaction } from '@/domain/money/ledger'
import type { LedgerEntry, MoneyTransaction } from '@/domain/money/types'
import { initialPayouts, initialTransactions } from './creatorStudio'

function timestamp(date: string): string {
  return `${date}T12:00:00`
}

function earningTransaction(
  transaction: (typeof initialTransactions)[number],
): BuiltTransaction {
  const status = transaction.status === 'pending' ? 'pending' : 'posted'
  const isRefund = transaction.status === 'refunded'

  if (isRefund) {
    return buildTransaction({
      id: `creator-${transaction.id}`,
      kind: 'refund',
      amount: transaction.gross,
      currency: 'KES',
      description: transaction.description,
      counterparty: transaction.customerName,
      fromSubaccountId: 'sub-creator',
      rail: 'relay',
      createdAt: timestamp(transaction.date),
      metadata: {
        creatorTransactionId: transaction.id,
        source: transaction.source,
        method: transaction.method,
        customerName: transaction.customerName,
        reference: transaction.reference,
        status: 'refunded',
      },
      postings: [
        {
          accountRef: 'subaccount:sub-creator',
          subaccountId: 'sub-creator',
          direction: 'debit',
          amount: transaction.gross,
          currency: 'KES',
          memo: transaction.description,
        },
        {
          accountRef: 'external:creator-clearing',
          direction: 'credit',
          amount: transaction.gross,
          currency: 'KES',
          memo: transaction.description,
        },
      ],
    })
  }

  return buildTransaction({
    id: `creator-${transaction.id}`,
    kind: 'creator_earning',
    status,
    amount: transaction.gross,
    currency: 'KES',
    fee: transaction.fee,
    net: transaction.net,
    description: transaction.description,
    counterparty: transaction.customerName,
    toSubaccountId: 'sub-creator',
    rail: 'relay',
    createdAt: timestamp(transaction.date),
    metadata: {
      creatorTransactionId: transaction.id,
      source: transaction.source,
      method: transaction.method,
      customerName: transaction.customerName,
      customerId: transaction.customerId,
      reference: transaction.reference,
      status: transaction.status,
    },
    postings: [
      {
        accountRef: 'external:creator-clearing',
        direction: 'debit',
        amount: transaction.gross,
        currency: 'KES',
        status: status === 'pending' ? 'pending' : 'posted',
        memo: transaction.description,
      },
      {
        accountRef: 'subaccount:sub-creator',
        subaccountId: 'sub-creator',
        direction: 'credit',
        amount: transaction.net,
        currency: 'KES',
        status: status === 'pending' ? 'pending' : 'posted',
        memo: transaction.description,
      },
      {
        accountRef: 'external:fees',
        direction: 'credit',
        amount: transaction.fee,
        currency: 'KES',
        status: status === 'pending' ? 'pending' : 'posted',
        memo: 'Processing fee',
      },
    ],
  })
}

function payoutTransaction(
  payout: (typeof initialPayouts)[number],
): BuiltTransaction {
  const settled = payout.status === 'paid'
  const entryStatus = settled ? 'posted' : 'reserved'

  return buildTransaction({
    id: `creator-${payout.id}`,
    kind: 'withdrawal',
    status: settled ? 'posted' : 'processing',
    amount: payout.amount,
    currency: 'KES',
    fee: payout.fee,
    net: payout.net,
    description: `Creator payout to ${payout.destinationLabel}`,
    counterparty: payout.destinationLabel,
    fromSubaccountId: 'sub-creator',
    rail: payout.destinationId === 'dest-mpesa' ? 'mpesa' : 'bank',
    createdAt: timestamp(payout.requestedAt),
    postedAt: payout.completedAt ? timestamp(payout.completedAt) : undefined,
    metadata: {
      creatorPayoutId: payout.id,
      reference: payout.reference,
      destinationId: payout.destinationId,
      destinationLabel: payout.destinationLabel,
      payoutStatus: payout.status,
    },
    postings: settled
      ? [
          {
            accountRef: 'subaccount:sub-creator',
            subaccountId: 'sub-creator',
            direction: 'debit',
            amount: payout.amount,
            currency: 'KES',
            memo: `Payout to ${payout.destinationLabel}`,
          },
          {
            accountRef: `external:${payout.destinationId}-clearing`,
            direction: 'credit',
            amount: payout.net,
            currency: 'KES',
            memo: `Payout to ${payout.destinationLabel}`,
          },
          {
            accountRef: 'external:fees',
            direction: 'credit',
            amount: payout.fee,
            currency: 'KES',
            memo: 'Payout fee',
          },
        ]
      : [
          {
            accountRef: 'subaccount:sub-creator',
            subaccountId: 'sub-creator',
            direction: 'debit',
            amount: payout.amount,
            currency: 'KES',
            status: entryStatus,
            memo: `Payout hold for ${payout.destinationLabel}`,
          },
          {
            accountRef: `external:${payout.destinationId}-hold`,
            direction: 'credit',
            amount: payout.amount,
            currency: 'KES',
            status: entryStatus,
            memo: `Payout hold for ${payout.destinationLabel}`,
          },
        ],
  })
}

const creatorSeed: BuiltTransaction[] = [
  ...initialTransactions.map(earningTransaction),
  ...initialPayouts.map(payoutTransaction),
]

export const creatorSeedTransactions: MoneyTransaction[] = creatorSeed.map(
  (item) => item.transaction,
)

export const creatorSeedEntries: LedgerEntry[] = creatorSeed.flatMap(
  (item) => item.entries,
)

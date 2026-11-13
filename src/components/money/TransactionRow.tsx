import type { MoneyTransaction, Subaccount } from '@/domain/money/types'
import {
  railLabels,
  subaccountLabel,
  transactionDirection,
} from '@/domain/money/presentation'
import { formatMoney, formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'

type TransactionRowProps = {
  transaction: MoneyTransaction
  subaccounts: Subaccount[]
  showAccount?: boolean
}

const statusStyles: Record<MoneyTransaction['status'], string> = {
  pending: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  processing: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
  posted: 'border-teal-400/25 bg-teal-400/10 text-teal-300',
  failed: 'border-rose-400/25 bg-rose-400/10 text-rose-300',
  reversed: 'border-slate-400/25 bg-slate-400/10 text-slate-300',
}

const statusLabels: Record<MoneyTransaction['status'], string> = {
  pending: 'Pending',
  processing: 'Processing',
  posted: 'Posted',
  failed: 'Failed',
  reversed: 'Reversed',
}

export function TransactionRow({
  transaction,
  subaccounts,
  showAccount = true,
}: TransactionRowProps) {
  const direction = transactionDirection(transaction)
  const sign = direction === 'in' ? '+' : direction === 'out' ? '−' : ''
  const amountClass =
    direction === 'in'
      ? 'text-teal-300'
      : direction === 'out'
        ? 'text-slate-100'
        : 'text-slate-400'
  const accountLabel =
    direction === 'in'
      ? subaccountLabel(subaccounts, transaction.toSubaccountId)
      : direction === 'out'
        ? subaccountLabel(subaccounts, transaction.fromSubaccountId)
        : `${subaccountLabel(subaccounts, transaction.fromSubaccountId)} → ${subaccountLabel(subaccounts, transaction.toSubaccountId)}`

  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-200">
          {transaction.description}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {transaction.counterparty} · {railLabels[transaction.rail]} ·{' '}
          {formatShortDate(transaction.createdAt)}
          {showAccount && ` · ${accountLabel}`}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <p className={cn('text-sm font-semibold', amountClass)}>
            {sign}
            {formatMoney(transaction.amount, transaction.currency)}
          </p>
          <span
            className={cn(
              'mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              statusStyles[transaction.status],
            )}
          >
            {statusLabels[transaction.status]}
          </span>
        </div>
      </div>
    </div>
  )
}

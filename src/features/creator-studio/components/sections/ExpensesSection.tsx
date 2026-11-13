import { useState } from 'react'
import { Badge, Card } from '@/components/ui'
import { monthlyExpenseBudget } from '../../data/creatorStudio'
import { formatDate, formatKes } from '../../lib/format'
import { expenseCategoryLabels } from '../../lib/labels'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import type { ExpenseCategory } from '../../types'
import { NewExpenseDialog } from '../dialogs'
import { PlusIcon } from '../icons'
import { BreakdownBars, ProgressBar, SectionHeading, StatCard, StatusPill } from '../shared'

export function ExpensesSection() {
  const creator = useCreatorStudio()
  const { expenses, wallet, addExpense } = creator

  const [isAddOpen, setAddOpen] = useState(false)

  const thisMonth = expenses.filter((expense) =>
    expense.date.startsWith('2026-11'),
  )
  const thisMonthTotal = thisMonth.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  )
  const deductibleTotal = expenses
    .filter((expense) => expense.deductible)
    .reduce((sum, expense) => sum + expense.amount, 0)
  const missingReceipts = expenses.filter(
    (expense) => !expense.hasReceipt,
  ).length

  const categoryTotals = new Map<ExpenseCategory, number>()
  for (const expense of expenses) {
    categoryTotals.set(
      expense.category,
      (categoryTotals.get(expense.category) ?? 0) + expense.amount,
    )
  }
  const categoryItems = [...categoryTotals.entries()]
    .map(([category, amount]) => ({
      label: expenseCategoryLabels[category],
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)

  const netProfit = wallet.monthlyRevenue - thisMonthTotal

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Expenses"
        description="Track business costs so you can see true monthly profit and prepare for tax season."
        actions={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            <PlusIcon className="h-4 w-4" />
            Add expense
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="This month" value={formatKes(thisMonthTotal)} sub={`${thisMonth.length} entries`} />
        <StatCard
          label="Budget remaining"
          value={formatKes(Math.max(monthlyExpenseBudget - thisMonthTotal, 0))}
          sub={`of ${formatKes(monthlyExpenseBudget)} budget`}
          tone={monthlyExpenseBudget - thisMonthTotal < 0 ? 'rose' : 'teal'}
        />
        <StatCard
          label="Est. net profit"
          value={formatKes(netProfit)}
          sub="Revenue minus expenses"
          tone={netProfit >= 0 ? 'teal' : 'rose'}
        />
        <StatCard
          label="Missing receipts"
          value={String(missingReceipts)}
          tone={missingReceipts > 0 ? 'amber' : 'default'}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-white">Expense log</h3>
          <p className="mt-1 text-sm text-slate-400">
            Business costs with receipts and tax flags.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Description</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Receipt</th>
                  <th className="pb-3 pr-4 font-medium">Tax</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="py-3 pr-4 font-medium text-slate-200">
                      {expense.description}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className="px-2.5 py-0.5 text-[11px]">
                        {expenseCategoryLabels[expense.category]}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {formatDate(expense.date)}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusPill
                        tone={expense.hasReceipt ? 'success' : 'warning'}
                      >
                        {expense.hasReceipt ? 'Attached' : 'Missing'}
                      </StatusPill>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {expense.deductible ? 'Deductible' : '—'}
                    </td>
                    <td className="py-3 text-right font-semibold text-white">
                      {formatKes(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <h3 className="font-semibold text-white">Monthly budget</h3>
            <p className="mt-1 text-sm text-slate-400">
              November spending against your limit.
            </p>

            <div className="mt-5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold text-white">
                  {formatKes(thisMonthTotal)}
                </span>
                <span className="text-slate-400">
                  of {formatKes(monthlyExpenseBudget)}
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar value={thisMonthTotal} max={monthlyExpenseBudget} />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-white">Spending by category</h3>
            <div className="mt-5">
              <BreakdownBars items={categoryItems} />
            </div>
            <p className="mt-4 text-xs text-slate-500">
              {formatKes(deductibleTotal)} of logged expenses are flagged as
              tax-deductible.
            </p>
          </Card>
        </div>
      </div>

      {isAddOpen && (
        <NewExpenseDialog onClose={() => setAddOpen(false)} onAdd={addExpense} />
      )}
    </section>
  )
}

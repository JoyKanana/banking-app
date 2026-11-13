import { useState } from 'react'
import { Card } from '@/components/ui'
import { formatDate, formatKes } from '../../lib/format'
import { invoiceStatusLabels } from '../../lib/labels'
import { invoiceStatusTones } from '../../lib/tones'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import type { Invoice } from '../../types'
import { NewInvoiceDialog } from '../dialogs'
import { PlusIcon } from '../icons'
import { SectionHeading, StatCard, StatusPill } from '../shared'

const actionableStatuses = ['draft', 'sent', 'overdue']

export function InvoicesSection() {
  const creator = useCreatorStudio()
  const { invoices, createInvoice, updateInvoiceStatus } = creator

  const [isCreateOpen, setCreateOpen] = useState(false)

  const outstanding = invoices.filter(
    (invoice) => invoice.status === 'sent' || invoice.status === 'overdue',
  )
  const outstandingTotal = outstanding.reduce(
    (sum, invoice) => sum + invoice.total,
    0,
  )
  const overdueCount = invoices.filter(
    (invoice) => invoice.status === 'overdue',
  ).length
  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === 'paid',
  )
  const paidTotal = paidInvoices.reduce(
    (sum, invoice) => sum + invoice.total,
    0,
  )

  function renderRowActions(invoice: Invoice) {
    if (!actionableStatuses.includes(invoice.status)) {
      return (
        invoice.paidAt && (
          <span className="text-xs text-slate-500">
            Paid {formatDate(invoice.paidAt)}
          </span>
        )
      )
    }

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
          className="rounded-lg bg-teal-400/10 px-2.5 py-1 text-xs font-medium text-teal-300 transition hover:bg-teal-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          Mark paid
        </button>
        <button
          type="button"
          onClick={() => updateInvoiceStatus(invoice.id, 'cancelled')}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 transition hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Invoices"
        description="Bill clients for services, bookings and sponsorships. Paid invoices settle straight into your wallet."
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            <PlusIcon className="h-4 w-4" />
            New invoice
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Outstanding"
          value={formatKes(outstandingTotal)}
          sub={`${outstanding.length} unpaid invoices`}
          tone="amber"
        />
        <StatCard label="Overdue" value={String(overdueCount)} tone={overdueCount > 0 ? 'rose' : 'default'} />
        <StatCard
          label="Paid this year"
          value={formatKes(paidTotal)}
          sub={`${paidInvoices.length} invoices`}
          tone="teal"
        />
        <StatCard
          label="Average invoice"
          value={formatKes(
            invoices.length > 0
              ? invoices.reduce((sum, invoice) => sum + invoice.total, 0) /
                  invoices.length
              : 0,
          )}
        />
      </div>

      <Card>
        <h3 className="font-semibold text-white">All invoices</h3>
        <p className="mt-1 text-sm text-slate-400">
          Status, due dates and payment actions.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 pr-4 font-medium">Invoice</th>
                <th className="pb-3 pr-4 font-medium">Customer</th>
                <th className="pb-3 pr-4 font-medium">Issued</th>
                <th className="pb-3 pr-4 font-medium">Due</th>
                <th className="pb-3 pr-4 text-right font-medium">Total</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="py-3 pr-4">
                    <p className="font-mono text-xs font-medium text-slate-300">
                      {invoice.number}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {invoice.description}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-slate-200">
                    {invoice.customerName}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">
                    {formatDate(invoice.issuedAt)}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-white">
                    {formatKes(invoice.total)}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusPill tone={invoiceStatusTones[invoice.status]}>
                      {invoiceStatusLabels[invoice.status]}
                    </StatusPill>
                  </td>
                  <td className="py-3">{renderRowActions(invoice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isCreateOpen && (
        <NewInvoiceDialog
          onClose={() => setCreateOpen(false)}
          onCreate={createInvoice}
        />
      )}
    </section>
  )
}

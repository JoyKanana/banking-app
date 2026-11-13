import { useState } from 'react'
import { Badge, Card } from '@/components/ui'
import { formatDate, formatKes } from '../../lib/format'
import { segmentLabels } from '../../lib/labels'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import type { Customer } from '../../types'
import { SearchIcon } from '../icons'
import { Avatar, SectionHeading, StatCard } from '../shared'
import { fieldClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../dialogs/formStyles'

const segmentFilters: { value: 'all' | Customer['segment']; label: string }[] = [
  { value: 'all', label: 'All customers' },
  { value: 'vip', label: 'VIP' },
  { value: 'repeat', label: 'Repeat' },
  { value: 'subscriber', label: 'Subscribers' },
  { value: 'new', label: 'New' },
]

const segmentTones: Record<Customer['segment'], string> = {
  vip: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
  repeat: 'border-teal-400/30 bg-teal-400/10 text-teal-300',
  new: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  subscriber: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
}

export function CustomersSection() {
  const creator = useCreatorStudio()
  const { customers, updateCustomer, showToast } = creator

  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState<'all' | Customer['segment']>('all')
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null)

  const normalizedSearch = search.trim().toLowerCase()

  const visibleCustomers = customers.filter((customer) => {
    const matchesSearch =
      !normalizedSearch ||
      customer.name.toLowerCase().includes(normalizedSearch) ||
      customer.email.toLowerCase().includes(normalizedSearch) ||
      customer.tags.some((tag) =>
        tag.toLowerCase().includes(normalizedSearch),
      )

    const matchesSegment = segment === 'all' || customer.segment === segment

    return matchesSearch && matchesSegment
  })

  const vipCount = customers.filter(
    (customer) => customer.segment === 'vip',
  ).length
  const averageSpend =
    customers.length > 0
      ? customers.reduce((sum, customer) => sum + customer.totalSpent, 0) /
        customers.length
      : 0
  const repeatRate =
    customers.length > 0
      ? (customers.filter((customer) => customer.paymentCount > 1).length /
          customers.length) *
        100
      : 0

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Customers"
        description="Everyone who has paid you — supporters, clients and members — with their full payment history."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Customers" value={String(customers.length)} tone="teal" />
        <StatCard label="VIP supporters" value={String(vipCount)} />
        <StatCard label="Average spend" value={formatKes(averageSpend)} />
        <StatCard label="Repeat rate" value={`${repeatRate.toFixed(0)}%`} />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">Customer records</h3>
            <p className="mt-1 text-sm text-slate-400">
              {visibleCustomers.length} of {customers.length} customers
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email or tag"
                aria-label="Search customers"
                className="w-56 rounded-xl border border-white/10 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>

            <select
              value={segment}
              onChange={(event) =>
                setSegment(event.target.value as typeof segment)
              }
              aria-label="Filter by segment"
              className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            >
              {segmentFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 pr-4 font-medium">Customer</th>
                <th className="pb-3 pr-4 font-medium">Segment</th>
                <th className="pb-3 pr-4 text-right font-medium">Spent</th>
                <th className="pb-3 pr-4 text-right font-medium">Payments</th>
                <th className="pb-3 pr-4 font-medium">Last payment</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="cursor-pointer transition hover:bg-white/[0.03]"
                  onClick={() => setActiveCustomer(customer)}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={customer.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-200">
                          {customer.name}
                        </p>
                        <p className="text-xs text-slate-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${segmentTones[customer.segment]}`}
                    >
                      {segmentLabels[customer.segment]}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-white">
                    {formatKes(customer.totalSpent)}
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-400">
                    {customer.paymentCount}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">
                    {formatDate(customer.lastPayment)}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={
                        customer.status === 'blocked'
                          ? 'text-xs font-medium text-rose-300'
                          : 'text-xs font-medium text-teal-300'
                      }
                    >
                      {customer.status === 'blocked' ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        setActiveCustomer(customer)
                      }}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-teal-300 transition hover:bg-teal-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {activeCustomer && (
        <CustomerDialog
          customer={activeCustomer}
          onClose={() => setActiveCustomer(null)}
          onUpdate={(patch) => {
            updateCustomer(activeCustomer.id, patch)
            showToast(`${activeCustomer.name}'s record updated.`)
          }}
        />
      )}
    </section>
  )
}

type CustomerDialogProps = {
  customer: Customer
  onClose: () => void
  onUpdate: (patch: Partial<Customer>) => void
}

function CustomerDialog({ customer, onClose, onUpdate }: CustomerDialogProps) {
  const [notes, setNotes] = useState(customer.notes)
  const [tags, setTags] = useState(customer.tags.join(', '))

  function handleSave() {
    onUpdate({
      notes: notes.trim(),
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
    onClose()
  }

  function handleToggleBlock() {
    onUpdate({
      status: customer.status === 'blocked' ? 'active' : 'blocked',
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <Avatar name={customer.name} size="lg" />

          <div className="min-w-0 flex-1">
            <h3 id="customer-dialog-title" className="text-xl font-semibold">
              {customer.name}
            </h3>
            <p className="mt-0.5 text-sm text-slate-400">{customer.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="px-3 py-1 text-xs">
                {segmentLabels[customer.segment]}
              </Badge>
              <Badge className="px-3 py-1 text-xs">
                Via {customer.source}
              </Badge>
              <Badge className="px-3 py-1 text-xs">
                Joined {formatDate(customer.joinedAt)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Lifetime spend
            </p>
            <p className="mt-1 text-lg font-semibold text-teal-300">
              {formatKes(customer.totalSpent)}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Payments
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {customer.paymentCount}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="customer-tags" className={labelClass}>
              Tags
            </label>
            <input
              id="customer-tags"
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="VIP, Coaching, M-PESA"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="customer-notes" className={labelClass}>
              Private notes
            </label>
            <textarea
              id="customer-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className={`${fieldClass} resize-none`}
            />
            <p className="mt-1 text-xs text-slate-500">
              Notes are private to your workspace.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleToggleBlock}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 ${
              customer.status === 'blocked'
                ? 'text-teal-300 hover:bg-teal-400/10'
                : 'text-rose-300 hover:bg-rose-400/10'
            }`}
          >
            {customer.status === 'blocked' ? 'Unblock customer' : 'Block customer'}
          </button>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className={secondaryButtonClass}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} className={primaryButtonClass}>
              Save record
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

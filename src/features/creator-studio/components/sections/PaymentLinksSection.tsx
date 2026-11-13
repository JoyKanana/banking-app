import { useState } from 'react'
import { Badge, Card } from '@/components/ui'
import { formatDate, formatKes, formatNumber } from '../../lib/format'
import { sourceLabels } from '../../lib/labels'
import { linkStatusTones } from '../../lib/tones'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import type { PaymentLink } from '../../types'
import {
  NewPaymentLinkDialog,
  QrCodeDialog,
} from '../dialogs'
import { PlusIcon, QrIcon } from '../icons'
import { CopyButton, SectionHeading, StatCard, StatusPill } from '../shared'

function linkUrl(profileUrl: string, slug: string): string {
  return `https://${profileUrl}/pay/${slug}`
}

export function PaymentLinksSection() {
  const creator = useCreatorStudio()
  const { paymentLinks, profile, addPaymentLink } = creator

  const [isCreateOpen, setCreateOpen] = useState(false)
  const [qrLink, setQrLink] = useState<PaymentLink | null>(null)

  const activeLinks = paymentLinks.filter((link) => link.status === 'active')
  const totalRevenue = paymentLinks.reduce((sum, link) => sum + link.revenue, 0)
  const totalPayments = paymentLinks.reduce(
    (sum, link) => sum + link.payments,
    0,
  )

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Payment links"
        description="Shareable links for one-time payments, deposits and tips. Customers pay by card, M-PESA or Relay Wallet."
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            <PlusIcon className="h-4 w-4" />
            New payment link
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active links" value={String(activeLinks.length)} tone="teal" />
        <StatCard label="Collected via links" value={formatKes(totalRevenue)} />
        <StatCard label="Payments received" value={formatNumber(totalPayments)} />
        <StatCard
          label="Primary tip link"
          value={paymentLinks[0]?.slug ?? '—'}
          sub="relay.app/pay/…"
        />
      </div>

      <div className="space-y-4">
        {paymentLinks.map((link) => (
          <Card key={link.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-white">
                    {link.title}
                  </h3>
                  <StatusPill tone={linkStatusTones[link.status]}>
                    {link.status === 'active' ? 'Live' : 'Paused'}
                  </StatusPill>
                </div>

                <p className="mt-1 text-sm text-slate-400">{link.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 font-mono text-xs text-slate-400">
                    {linkUrl(profile.publicUrl, link.slug)}
                  </span>
                  <CopyButton value={linkUrl(profile.publicUrl, link.slug)} label="Copy" />
                  <button
                    type="button"
                    onClick={() => setQrLink(link)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-teal-400/40 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
                  >
                    <QrIcon className="h-3.5 w-3.5" />
                    QR code
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge className="px-3 py-1 text-xs">
                  {sourceLabels[link.source]}
                </Badge>
                <Badge className="px-3 py-1 text-xs">
                  {link.type === 'fixed'
                    ? `Fixed · ${formatKes(link.amount ?? 0)}`
                    : 'Any amount'}
                </Badge>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Payments
                </p>
                <p className="mt-0.5 font-semibold text-white">
                  {formatNumber(link.payments)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Revenue
                </p>
                <p className="mt-0.5 font-semibold text-teal-300">
                  {formatKes(link.revenue)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Created
                </p>
                <p className="mt-0.5 text-slate-300">{formatDate(link.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {link.expiresAt ? 'Expires' : 'Limit'}
                </p>
                <p className="mt-0.5 text-slate-300">
                  {link.expiresAt
                    ? formatDate(link.expiresAt)
                    : link.limit
                      ? `${link.limit} payments`
                      : 'No limit'}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {isCreateOpen && (
        <NewPaymentLinkDialog
          onClose={() => setCreateOpen(false)}
          onCreate={addPaymentLink}
        />
      )}

      {qrLink && (
        <QrCodeDialog
          title={qrLink.title}
          url={linkUrl(profile.publicUrl, qrLink.slug)}
          onClose={() => setQrLink(null)}
        />
      )}
    </section>
  )
}

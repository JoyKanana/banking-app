import { Badge, Card } from '@/components/ui'
import { discountCodes, orders, products } from '../../data/creatorStudio'
import { formatKes, formatNumber } from '../../lib/format'
import { methodLabels } from '../../lib/labels'
import { orderStatusTones, productStatusTones } from '../../lib/tones'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import { SectionHeading, StatCard, StatusPill } from '../shared'

const typeLabels: Record<string, string> = {
  digital: 'Digital',
  physical: 'Physical',
  service: 'Service',
}

export function StorefrontSection() {
  const creator = useCreatorStudio()

  const storefrontRevenue = products.reduce(
    (sum, product) => sum + product.revenue,
    0,
  )
  const totalSales = products.reduce((sum, product) => sum + product.sales, 0)
  const activeProducts = products.filter(
    (product) => product.status === 'active',
  ).length

  const publicUrl = `https://${creator.profile.publicUrl}/store`

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Storefront"
        description="Sell digital products, physical goods and services. Every sale lands in your creator wallet."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Storefront revenue" value={formatKes(storefrontRevenue)} tone="teal" />
        <StatCard label="Items sold" value={formatNumber(totalSales)} />
        <StatCard label="Active listings" value={String(activeProducts)} />
        <StatCard label="Recent orders" value={String(orders.length)} sub="Last 30 days" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="p-5">
            <div className="flex items-start justify-between">
              <span aria-hidden className="text-3xl">
                {product.emoji}
              </span>
              <StatusPill tone={productStatusTones[product.status]}>
                {product.status === 'active' ? 'Live' : 'Draft'}
              </StatusPill>
            </div>

            <h3 className="mt-3 text-sm font-semibold text-white">
              {product.name}
            </h3>
            <Badge className="mt-1 px-2.5 py-0.5 text-[11px]">
              {typeLabels[product.type]}
            </Badge>

            <p className="mt-3 text-lg font-bold text-white">
              {formatKes(product.price)}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{product.delivery}</p>

            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-400">
              <span>
                {product.stock !== undefined
                  ? `${product.stock} in stock`
                  : `${formatNumber(product.sales)} sold`}
              </span>
              <span className="font-semibold text-teal-300">
                {formatKes(product.revenue)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold text-white">Recent orders</h3>
            <span className="font-mono text-xs text-slate-500">{publicUrl}</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Order</th>
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Item</th>
                  <th className="pb-3 pr-4 font-medium">Method</th>
                  <th className="pb-3 pr-4 text-right font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-400">
                      {order.id}
                    </td>
                    <td className="py-3 pr-4 text-slate-200">
                      {order.customerName}
                    </td>
                    <td className="py-3 pr-4 text-slate-300">
                      {order.productName}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {methodLabels[order.method]}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-white">
                      {formatKes(order.amount)}
                    </td>
                    <td className="py-3">
                      <StatusPill tone={orderStatusTones[order.status]}>
                        {order.status === 'delivered' ? 'Delivered' : order.status[0].toUpperCase() + order.status.slice(1)}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-white">Discount codes</h3>
          <p className="mt-1 text-sm text-slate-400">
            Promotional pricing for launches and events.
          </p>

          <ul className="mt-4 space-y-3">
            {discountCodes.map((code) => (
              <li
                key={code.code}
                className="rounded-xl border border-white/5 bg-slate-950/60 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm font-semibold text-teal-300">
                    {code.code}
                  </span>
                  <StatusPill
                    tone={code.status === 'active' ? 'success' : 'neutral'}
                  >
                    {code.status === 'active' ? 'Active' : 'Expired'}
                  </StatusPill>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {code.value} · used {code.uses} times
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  )
}

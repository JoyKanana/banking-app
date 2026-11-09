import { Badge } from './Badge'

type PagePlaceholderProps = {
  eyebrow: string
  title: string
  description: string
}

export function PagePlaceholder({
  eyebrow,
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <section>
      <Badge>{eyebrow}</Badge>

      <h2 className="mt-6 text-3xl font-bold">{title}</h2>
      <p className="mt-3 max-w-xl text-slate-400">{description}</p>

      <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-slate-900/60 p-10 text-center">
        <p className="text-sm text-slate-400">
          This area is under construction.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Wallet balances, payments and other services are not connected yet.
        </p>
      </div>
    </section>
  )
}

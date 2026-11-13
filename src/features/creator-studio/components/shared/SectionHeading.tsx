import type { ReactNode } from 'react'

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>
      </div>

      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

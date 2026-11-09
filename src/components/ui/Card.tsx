import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

export function Card({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-slate-900 p-6',
        className,
      )}
      {...props}
    />
  )
}

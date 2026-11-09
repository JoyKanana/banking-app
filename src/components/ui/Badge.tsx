import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

export function Badge({
  className,
  ...props
}: ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300',
        className,
      )}
      {...props}
    />
  )
}

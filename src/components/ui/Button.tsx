import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md'

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-teal-400 text-slate-950 hover:bg-teal-300 focus-visible:ring-teal-300',
  secondary:
    'border border-white/15 bg-white/5 text-slate-200 hover:border-teal-400/40 hover:text-teal-200 focus-visible:ring-teal-300',
  ghost:
    'text-slate-400 hover:bg-white/5 hover:text-white focus-visible:ring-teal-300',
  danger:
    'border border-rose-400/30 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20 focus-visible:ring-rose-300',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-40',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

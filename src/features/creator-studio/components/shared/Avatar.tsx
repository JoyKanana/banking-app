import { cn } from '@/lib/utils'

const toneClasses = [
  'bg-teal-400/15 text-teal-300 border-teal-400/30',
  'bg-violet-400/15 text-violet-300 border-violet-400/30',
  'bg-amber-400/15 text-amber-300 border-amber-400/30',
  'bg-sky-400/15 text-sky-300 border-sky-400/30',
  'bg-rose-400/15 text-rose-300 border-rose-400/30',
]

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
}

function hashName(name: string): number {
  let hash = 0

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 9973
  }

  return hash
}

type AvatarProps = {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const tone = toneClasses[hashName(name) % toneClasses.length]
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
  }

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border font-semibold',
        tone,
        sizeClasses[size],
      )}
    >
      {initialsFrom(name)}
    </span>
  )
}

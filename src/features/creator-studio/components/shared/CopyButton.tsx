import { useState } from 'react'
import { cn } from '@/lib/utils'
import { copyToClipboard } from '../../lib/format'
import { CheckIcon, CopyIcon } from '../icons'

type CopyButtonProps = {
  value: string
  label?: string
  className?: string
}

export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    copyToClipboard(value)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      })
      .catch(() => undefined)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : `Copy ${label ?? value}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-teal-400/40 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
        className,
      )}
    >
      {copied ? (
        <CheckIcon className="h-3.5 w-3.5 text-teal-300" />
      ) : (
        <CopyIcon className="h-3.5 w-3.5" />
      )}
      {copied ? 'Copied' : label ?? 'Copy'}
    </button>
  )
}

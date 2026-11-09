type IconProps = {
  className?: string
}

const baseProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function PinIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg {...baseProps} className={className} fill={filled ? 'currentColor' : 'none'}>
      <path d="M9 4h6l-1 6 3 3v1H7v-1l3-3-1-6Z" />
      <path d="M12 14v6" />
    </svg>
  )
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.5 2.2 2.5 13.8 0 16M12 4c-2.5 2.2-2.5 13.8 0 16" />
    </svg>
  )
}

export function CopyIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="9" y="9" width="10" height="11" rx="2" />
      <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function GiftIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13" />
      <path d="M12 7c-1.5-3-5.5-3-5.5-.5S10 7 12 7Zm0 0c1.5-3 5.5-3 5.5-.5S14 7 12 7Z" />
    </svg>
  )
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M14 4h6v6M20 4l-8 8" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  )
}

export function ImportIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 4v10M8 10l4 4 4-4" />
      <path d="M5 17v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2" />
    </svg>
  )
}

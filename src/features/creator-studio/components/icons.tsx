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

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
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

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 4v10m0 0 4-4m-4 4-4-4" />
      <path d="M5 19h14" />
    </svg>
  )
}

export function QrIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h3m3 0v3m0 3h-6v-3" />
    </svg>
  )
}

export function SendIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M4 12 20 4l-4 16-4.5-6.5L4 12Z" />
    </svg>
  )
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 4 5 6v6c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6l-7-2Z" />
      <path d="m9 12 2 2 4-4" />
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

export function WithdrawIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 20V8m0 0-4 4m4-4 4 4" />
      <path d="M5 5h14" />
    </svg>
  )
}

export function ReceiptIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M6 4h12v16l-3-2-3 2-3-2-3 2V4Z" />
      <path d="M9 9h6M9 13h6" />
    </svg>
  )
}

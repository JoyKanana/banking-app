const kesFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
})

const kesExactFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactFormatter = new Intl.NumberFormat('en-KE', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatKes(value: number, exact = false): string {
  return (exact ? kesExactFormatter : kesFormatter).format(value)
}

export function formatCompactKes(value: number): string {
  return `KSh ${compactFormatter.format(value)}`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-KE').format(value)
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatShortDate(iso: string): string {
  return shortDateFormatter.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

export function createId(prefix: string): string {
  const randomPart =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10)

  return `${prefix}-${randomPart}`
}

export function copyToClipboard(value: string): Promise<void> {
  if (!navigator.clipboard) {
    return Promise.reject(new Error('Clipboard is unavailable'))
  }

  return navigator.clipboard.writeText(value)
}

function escapeCsvCell(value: string | number): string {
  const text = String(value)

  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`
  }

  return text
}

export function downloadCsv(
  filename: string,
  rows: Array<Array<string | number>>,
): void {
  const csv = rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()

  URL.revokeObjectURL(url)
}

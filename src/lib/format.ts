import type { CurrencyCode } from '@/domain/money/types'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
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

/**
 * Format a whole-dollar amount for display, e.g. 1899 -> "$1,899".
 */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatMoney(
  value: number,
  currency: CurrencyCode = 'KES',
  options: { compact?: boolean; exact?: boolean } = {},
): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    notation: options.compact ? 'compact' : 'standard',
    maximumFractionDigits: options.compact ? 1 : options.exact ? 2 : 0,
    minimumFractionDigits: options.exact ? 2 : 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-KE').format(value)
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatShortDate(iso: string): string {
  return shortDateFormatter.format(new Date(iso))
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

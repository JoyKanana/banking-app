import type { CreatorSectionId, SectionNavItem } from '../types'

export const creatorSections: SectionNavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Earnings and financial activity',
  },
  {
    id: 'profile',
    label: 'Creator profile',
    description: 'Professional identity and public profile',
  },
  {
    id: 'wallet',
    label: 'Creator wallet',
    description: 'Earnings, fees and statement export',
  },
  {
    id: 'payment-links',
    label: 'Payment links',
    description: 'Collect payments',
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    description: 'Recurring creator income',
  },
  {
    id: 'tips',
    label: 'Tips & gifts',
    description: 'Supporter contributions',
  },
  {
    id: 'storefront',
    label: 'Storefront',
    description: 'Products and services',
  },
  {
    id: 'invoices',
    label: 'Invoices',
    description: 'Billing and payment requests',
  },
  {
    id: 'customers',
    label: 'Customers',
    description: 'Supporters and client records',
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    description: 'Fundraising and contributions',
  },
  {
    id: 'partnerships',
    label: 'Partnerships',
    description: 'Sponsorships and brand payments',
  },
  {
    id: 'payouts',
    label: 'Payouts',
    description: 'Withdrawals and payout tracking',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Revenue, fees and customer performance',
  },
  {
    id: 'expenses',
    label: 'Expenses',
    description: 'Business finances and budgets',
  },
  {
    id: 'assistant',
    label: 'AI assistant',
    description: 'Financial insights and assistance',
  },
  {
    id: 'automations',
    label: 'Automations',
    description: 'Automated payment workflows',
  },
  {
    id: 'security',
    label: 'Security & privacy',
    description: 'Protection, login history and data exports',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Payment, payout and workspace preferences',
  },
]

export const defaultSectionId: CreatorSectionId = 'overview'

export function isCreatorSectionId(value: string | null): value is CreatorSectionId {
  return creatorSections.some((section) => section.id === value)
}

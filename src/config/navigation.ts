import type { ServiceId } from '@/domain/money/types'
import type { NavigationItem } from '@/types/navigation'

export const navigation: NavigationItem[] = [
  {
    label: 'Overview',
    path: '/',
    description: 'Your connected world at a glance',
  },
  {
    label: 'Money',
    path: '/money',
    description: 'Subaccounts, transfers, savings and cards',
    services: ['personal'],
  },
  {
    label: 'Payments',
    path: '/payments',
    description: 'Send, request, bills and scheduled payments',
    services: ['personal'],
  },
  {
    label: 'Connections',
    path: '/connections',
    description: 'People, conversations and wishlists',
    services: ['personal', 'creator'],
  },
  {
    label: 'Work & Shop',
    path: '/work',
    description: 'Creator Studio, business tools and storefront',
    services: ['creator', 'business', 'commerce'],
  },
  {
    label: 'Insights',
    path: '/insights',
    description: 'Cash flow, budgets and financial reports',
    services: ['personal', 'creator', 'business'],
  },
  {
    label: 'Discover',
    path: '/discover',
    description: 'Find people, products and opportunities',
  },
  {
    label: 'Account',
    path: '/account',
    description: 'Identity, services, security and preferences',
  },
]

export function isNavigationItemEnabled(
  item: NavigationItem,
  enabledServices: ServiceId[],
): boolean {
  if (!item.services || item.services.length === 0) return true
  return item.services.some((service) => enabledServices.includes(service))
}

export function visibleNavigation(enabledServices: ServiceId[]): NavigationItem[] {
  return navigation.filter((item) =>
    isNavigationItemEnabled(item, enabledServices),
  )
}

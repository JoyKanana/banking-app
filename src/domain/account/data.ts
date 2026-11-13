import type {
  AccountProfile,
  AuthSettings,
  CountryAvailability,
  DeviceSession,
  Dispute,
  NotificationItem,
  NotificationPreference,
  PrivacySettings,
  RiskSignal,
  ServiceState,
  VerificationStep,
} from './types'

export const accountProfile: AccountProfile = {
  displayName: 'Amina Wanjiru',
  legalName: 'Amina Wanjiru Kamau',
  username: 'amina.money',
  email: 'hello@aminamoney.co.ke',
  phone: '+254 712 *** 889',
  country: 'Kenya',
  operatingCurrency: 'KES',
  accountType: 'individual',
  joinedAt: '2025-01-12',
  publicUrl: 'relay.app/@amina.money',
  supportEmail: 'support@aminamoney.co.ke',
  avatarTone: 'teal',
}

export const initialServices: ServiceState[] = [
  {
    id: 'personal',
    label: 'Personal money',
    description: 'Everyday spending, savings, bills and personal payments.',
    enabled: true,
    eligibility: 'enabled',
    countries: ['Kenya'],
    permissions: ['money.view', 'money.move', 'payments.send'],
  },
  {
    id: 'creator',
    label: 'Creator Studio',
    description: 'Monetisation, memberships, storefronts, tips and payouts.',
    enabled: true,
    eligibility: 'enabled',
    countries: ['Kenya'],
    permissions: ['workspace.creator', 'money.receive', 'payouts.request'],
  },
  {
    id: 'business',
    label: 'Business tools',
    description: 'Invoices, clients, vendors, payroll and reconciliation.',
    enabled: true,
    eligibility: 'enabled',
    countries: ['Kenya'],
    permissions: ['workspace.business', 'invoices.manage', 'payroll.run'],
  },
  {
    id: 'commerce',
    label: 'Commerce',
    description: 'Storefronts, listings, orders and bookings.',
    enabled: true,
    eligibility: 'enabled',
    countries: ['Kenya'],
    permissions: ['workspace.commerce', 'orders.manage'],
  },
  {
    id: 'professional',
    label: 'Professional (age-restricted)',
    description:
      'Discreet tools for lawful adult-industry professionals, subject to age, consent and provider approval.',
    enabled: false,
    eligibility: 'review_required',
    countries: ['Kenya'],
    permissions: ['workspace.professional'],
    requiresAgeVerification: true,
    requiresProviderApproval: true,
  },
]

export const verificationSteps: VerificationStep[] = [
  {
    id: 'identity',
    label: 'Personal identity',
    status: 'complete',
    detail: 'National ID and selfie verified on 12 Jan 2025.',
  },
  {
    id: 'address',
    label: 'Address verification',
    status: 'in_progress',
    detail: 'A recent utility bill is being reviewed.',
  },
  {
    id: 'business',
    label: 'Business identity',
    status: 'pending',
    detail: 'Registration certificate and beneficial ownership review pending.',
  },
  {
    id: 'tax',
    label: 'Tax information',
    status: 'pending',
    detail: 'KRA PIN is recorded. Tax reporting preferences are not set.',
  },
]

export const initialPrivacy: PrivacySettings = {
  profileVisibility: 'public',
  showSupporters: true,
  showEarnings: false,
  allowDiscovery: true,
  shareActivityWithConnections: true,
  hideLegalName: true,
}

export const initialAuth: AuthSettings = {
  twoFactorEnabled: true,
  biometricEnabled: true,
  passkeyEnabled: true,
  payoutConfirmation: true,
  loginAlerts: true,
}

export const initialNotificationPreferences: NotificationPreference[] = [
  {
    id: 'payments',
    label: 'Payment activity',
    description: 'Payments received, sent, failed or reversed.',
    enabled: true,
  },
  {
    id: 'payouts',
    label: 'Payout status',
    description: 'Processing, completed or failed withdrawals.',
    enabled: true,
  },
  {
    id: 'invoices',
    label: 'Invoices and requests',
    description: 'Due soon, overdue and paid requests.',
    enabled: true,
  },
  {
    id: 'security',
    label: 'Security alerts',
    description: 'New devices, login attempts and payout changes.',
    enabled: true,
  },
  {
    id: 'weekly',
    label: 'Weekly summary',
    description: 'A digest of money in, money out and goals.',
    enabled: false,
  },
]

export const initialSessions: DeviceSession[] = [
  {
    id: 'session-mac',
    device: 'MacBook Pro — Safari',
    location: 'Nairobi, Kenya',
    lastActive: '2026-11-10T08:14:00',
    method: 'Passkey + 2FA',
    current: true,
    trusted: true,
  },
  {
    id: 'session-iphone',
    device: 'iPhone 15 — Relay app',
    location: 'Nairobi, Kenya',
    lastActive: '2026-11-09T21:06:00',
    method: 'Biometric',
    current: false,
    trusted: true,
  },
  {
    id: 'session-windows',
    device: 'Chrome — Windows',
    location: 'Mombasa, Kenya',
    lastActive: '2026-11-07T16:32:00',
    method: 'Password + 2FA',
    current: false,
    trusted: false,
  },
  {
    id: 'session-ipad',
    device: 'iPad — Safari',
    location: 'Nairobi, Kenya',
    lastActive: '2026-11-03T11:20:00',
    method: '2FA',
    current: false,
    trusted: true,
  },
]

export const initialDisputes: Dispute[] = [
  {
    id: 'dispute-1',
    reference: 'DSP-2026-014',
    counterparty: 'Streaming service',
    amount: 1200,
    currency: 'KES',
    reason: 'Charged twice for the same subscription period.',
    status: 'under_review',
    openedAt: '2026-11-06',
  },
  {
    id: 'dispute-2',
    reference: 'DSP-2026-009',
    counterparty: 'Courier partner',
    amount: 2200,
    currency: 'KES',
    reason: 'Order marked delivered but not received.',
    status: 'resolved',
    openedAt: '2026-10-18',
  },
]

export const initialRiskSignals: RiskSignal[] = [
  {
    id: 'risk-1',
    label: 'New payout destination',
    detail: 'A USDC wallet was added and is awaiting compliance review.',
    level: 'medium',
    date: '2026-11-08',
  },
  {
    id: 'risk-2',
    label: 'Unusual login location',
    detail: 'A Windows device signed in from Mombasa. 2FA was completed.',
    level: 'low',
    date: '2026-11-07',
  },
  {
    id: 'risk-3',
    label: 'Chargeback monitoring',
    detail: 'No chargebacks recorded in the last 90 days.',
    level: 'low',
    date: '2026-11-01',
  },
]

export const initialNotifications: NotificationItem[] = [
  {
    id: 'note-payout',
    title: 'Payout scheduled',
    body: 'KSh 120,000 will be sent to M-PESA on Friday once the provider rail is enabled.',
    tone: 'info',
    category: 'money',
    date: '2026-11-09',
    read: false,
    href: '/money?tab=activity',
  },
  {
    id: 'note-renewal',
    title: 'Subscription payment failed',
    body: "Faith Njeri's Premium renewal did not go through. A retry is queued.",
    tone: 'warning',
    category: 'creator',
    date: '2026-11-08',
    read: false,
    href: '/work?section=subscriptions',
  },
  {
    id: 'note-campaign',
    title: 'Campaign milestone reached',
    body: 'The studio fundraiser passed 70% of its target.',
    tone: 'success',
    category: 'creator',
    date: '2026-11-07',
    read: false,
    href: '/work?section=campaigns',
  },
  {
    id: 'note-invoice',
    title: 'Invoice overdue',
    body: 'INV-2026-043 for Brian Otieno is now overdue.',
    tone: 'warning',
    category: 'business',
    date: '2026-11-06',
    read: true,
    href: '/work?section=invoices',
  },
  {
    id: 'note-login',
    title: 'New device signed in',
    body: 'Chrome on Windows signed in from Mombasa. Review the session if this was not you.',
    tone: 'danger',
    category: 'security',
    date: '2026-11-07',
    read: true,
    href: '/account?tab=security',
  },
  {
    id: 'note-reconcile',
    title: 'Ledger reconciled',
    body: 'All posted entries balanced at 23:00. No unmatched transactions.',
    tone: 'success',
    category: 'system',
    date: '2026-11-09',
    read: true,
    href: '/money?tab=accounts',
  },
]

export const countryAvailability: CountryAvailability[] = [
  {
    country: 'Kenya',
    registration: true,
    personalMoney: true,
    creator: true,
    business: true,
    professional: false,
    note: 'Core services available in Kenya subject to partner and provider approvals.',
  },
  {
    country: 'Uganda',
    registration: true,
    personalMoney: false,
    creator: false,
    business: false,
    professional: false,
    note: 'Registration only while licensing and partner coverage are arranged.',
  },
  {
    country: 'Tanzania',
    registration: true,
    personalMoney: false,
    creator: false,
    business: false,
    professional: false,
    note: 'Registration only while licensing and partner coverage are arranged.',
  },
  {
    country: 'Nigeria',
    registration: true,
    personalMoney: false,
    creator: false,
    business: false,
    professional: false,
    note: 'Registration only. Regulated financial services are not active.',
  },
  {
    country: 'South Africa',
    registration: true,
    personalMoney: false,
    creator: false,
    business: false,
    professional: false,
    note: 'Registration only. Regulated financial services are not active.',
  },
]

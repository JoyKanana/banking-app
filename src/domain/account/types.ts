import type { ServiceId } from '../money/types'

export type ServiceEligibility =
  | 'enabled'
  | 'available'
  | 'review_required'
  | 'unavailable'

export type ServiceState = {
  id: ServiceId
  label: string
  description: string
  enabled: boolean
  eligibility: ServiceEligibility
  countries: string[]
  permissions: string[]
  requiresAgeVerification?: boolean
  requiresProviderApproval?: boolean
}

export type VerificationStatus =
  | 'complete'
  | 'in_progress'
  | 'pending'
  | 'not_started'

export type VerificationStep = {
  id: string
  label: string
  status: VerificationStatus
  detail: string
}

export type AccountProfile = {
  displayName: string
  legalName: string
  username: string
  email: string
  phone: string
  country: string
  operatingCurrency: string
  accountType: 'individual' | 'business'
  joinedAt: string
  publicUrl: string
  supportEmail: string
  avatarTone: 'teal' | 'violet' | 'amber'
}

export type NotificationTone = 'info' | 'success' | 'warning' | 'danger'

export type NotificationItem = {
  id: string
  title: string
  body: string
  tone: NotificationTone
  category: 'money' | 'payments' | 'creator' | 'business' | 'security' | 'system'
  date: string
  read: boolean
  href?: string
}

export type DeviceSession = {
  id: string
  device: string
  location: string
  lastActive: string
  method: string
  current: boolean
  trusted: boolean
}

export type Dispute = {
  id: string
  reference: string
  counterparty: string
  amount: number
  currency: string
  reason: string
  status: 'open' | 'under_review' | 'resolved'
  openedAt: string
}

export type RiskSignal = {
  id: string
  label: string
  detail: string
  level: 'low' | 'medium' | 'high'
  date: string
}

export type PrivacySettings = {
  profileVisibility: 'public' | 'unlisted' | 'private'
  showSupporters: boolean
  showEarnings: boolean
  allowDiscovery: boolean
  shareActivityWithConnections: boolean
  hideLegalName: boolean
}

export type AuthSettings = {
  twoFactorEnabled: boolean
  biometricEnabled: boolean
  passkeyEnabled: boolean
  payoutConfirmation: boolean
  loginAlerts: boolean
}

export type NotificationPreference = {
  id: string
  label: string
  description: string
  enabled: boolean
}

export type CountryAvailability = {
  country: string
  registration: boolean
  personalMoney: boolean
  creator: boolean
  business: boolean
  professional: boolean
  note: string
}

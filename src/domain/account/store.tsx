import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { usePersistentState } from '@/hooks/usePersistentState'
import {
  accountProfile,
  initialAuth,
  initialDisputes,
  initialNotificationPreferences,
  initialNotifications,
  initialPrivacy,
  initialRiskSignals,
  initialServices,
  initialSessions,
  verificationSteps,
} from './data'
import type {
  AuthSettings,
  DeviceSession,
  Dispute,
  NotificationItem,
  NotificationPreference,
  PrivacySettings,
  RiskSignal,
  ServiceState,
  VerificationStep,
} from './types'
import type { ServiceId } from '../money/types'

type AccountStore = {
  profile: typeof accountProfile
  services: ServiceState[]
  verification: VerificationStep[]
  privacy: PrivacySettings
  auth: AuthSettings
  sessions: DeviceSession[]
  disputes: Dispute[]
  riskSignals: RiskSignal[]
  notifications: NotificationItem[]
  notificationPreferences: NotificationPreference[]
  unreadCount: number
  ageVerified: boolean
  enabledServiceIds: ServiceId[]
  setAgeVerified: (value: boolean) => void
  toggleService: (serviceId: ServiceId) => void
  updatePrivacy: (patch: Partial<PrivacySettings>) => void
  updateAuth: (patch: Partial<AuthSettings>) => void
  toggleNotificationPreference: (id: string) => void
  pushNotification: (notification: Omit<NotificationItem, 'id' | 'read'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  revokeSession: (id: string) => void
  trustSession: (id: string) => void
}

const AccountContext = createContext<AccountStore | null>(null)

export function AccountProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = usePersistentState<ServiceState[]>(
    'relay.account.v1.services',
    initialServices,
  )
  const [verification] = useState<VerificationStep[]>(verificationSteps)
  const [privacy, setPrivacy] = usePersistentState<PrivacySettings>(
    'relay.account.v1.privacy',
    initialPrivacy,
  )
  const [auth, setAuth] = usePersistentState<AuthSettings>(
    'relay.account.v1.auth',
    initialAuth,
  )
  const [sessions, setSessions] = usePersistentState<DeviceSession[]>(
    'relay.account.v1.sessions',
    initialSessions,
  )
  const [disputes] = useState<Dispute[]>(initialDisputes)
  const [riskSignals] = useState<RiskSignal[]>(initialRiskSignals)
  const [notifications, setNotifications] = usePersistentState<NotificationItem[]>(
    'relay.account.v1.notifications',
    initialNotifications,
  )
  const [notificationPreferences, setNotificationPreferences] =
    usePersistentState<NotificationPreference[]>(
      'relay.account.v1.notification-preferences',
      initialNotificationPreferences,
    )
  const [ageVerified, setAgeVerified] = usePersistentState(
    'relay.account.v1.age-verified',
    false,
  )

  function toggleService(serviceId: ServiceId) {
    setServices((current) =>
      current.map((service) => {
        if (service.id !== serviceId) return service

        if (
          service.requiresAgeVerification &&
          !ageVerified &&
          !service.enabled
        ) {
          return service
        }

        return { ...service, enabled: !service.enabled }
      }),
    )
  }

  function updatePrivacy(patch: Partial<PrivacySettings>) {
    setPrivacy((current) => ({ ...current, ...patch }))
  }

  function updateAuth(patch: Partial<AuthSettings>) {
    setAuth((current) => ({ ...current, ...patch }))
  }

  function toggleNotificationPreference(id: string) {
    setNotificationPreferences((current) =>
      current.map((preference) =>
        preference.id === id
          ? { ...preference, enabled: !preference.enabled }
          : preference,
      ),
    )
  }

  function pushNotification(notification: Omit<NotificationItem, 'id' | 'read'>) {
    setNotifications((current) => [
      {
        ...notification,
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        read: false,
      },
      ...current,
    ])
  }

  function markNotificationRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification,
      ),
    )
  }

  function markAllNotificationsRead() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    )
  }

  function revokeSession(id: string) {
    setSessions((current) => current.filter((session) => session.id !== id))
  }

  function trustSession(id: string) {
    setSessions((current) =>
      current.map((session) =>
        session.id === id ? { ...session, trusted: true } : session,
      ),
    )
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length
  const enabledServiceIds = services
    .filter((service) => service.enabled)
    .map((service) => service.id)

  const value = useMemo<AccountStore>(
    () => ({
      profile: accountProfile,
      services,
      verification,
      privacy,
      auth,
      sessions,
      disputes,
      riskSignals,
      notifications,
      notificationPreferences,
      unreadCount,
      ageVerified,
      enabledServiceIds,
      setAgeVerified,
      toggleService,
      updatePrivacy,
      updateAuth,
      toggleNotificationPreference,
      pushNotification,
      markNotificationRead,
      markAllNotificationsRead,
      revokeSession,
      trustSession,
    }),
    [
      services,
      privacy,
      auth,
      sessions,
      disputes,
      riskSignals,
      notifications,
      notificationPreferences,
      unreadCount,
      ageVerified,
      enabledServiceIds,
    ],
  )

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  )
}

export function useAccount(): AccountStore {
  const context = useContext(AccountContext)

  if (!context) {
    throw new Error('useAccount must be used inside AccountProvider')
  }

  return context
}

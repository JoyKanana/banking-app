import { useSearchParams } from 'react-router-dom'
import { Badge, Button, Card, PageHeader, Progress, Tabs } from '@/components/ui'
import { useAccount } from '@/domain/account/store'
import type {
  AuthSettings,
  NotificationPreference,
  PrivacySettings,
  ServiceState,
  VerificationStatus,
} from '@/domain/account/types'
import type { CurrencyCode } from '@/domain/money/types'
import { formatDate, formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

type AccountTab =
  | 'profile'
  | 'services'
  | 'security'
  | 'preferences'
  | 'notifications'

const tabs: { id: AccountTab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'services', label: 'Services' },
  { id: 'security', label: 'Security' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'notifications', label: 'Notifications' },
]

const statusTone: Record<VerificationStatus, string> = {
  complete: 'border-teal-400/30 bg-teal-400/10 text-teal-300',
  in_progress: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  pending: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  not_started: 'border-slate-400/30 bg-slate-400/10 text-slate-300',
}

type BooleanPrivacyKey = {
  [Key in keyof PrivacySettings]: PrivacySettings[Key] extends boolean ? Key : never
}[keyof PrivacySettings]

const privacyLabels: {
  key: BooleanPrivacyKey
  label: string
  description: string
}[] = [
  {
    key: 'showSupporters',
    label: 'Show supporters',
    description: 'Let people see who supports your public work.',
  },
  {
    key: 'showEarnings',
    label: 'Show earnings',
    description: 'Display creator earnings publicly on your profile.',
  },
  {
    key: 'allowDiscovery',
    label: 'Allow discovery',
    description: 'Include your profile in Discover recommendations.',
  },
  {
    key: 'shareActivityWithConnections',
    label: 'Share activity',
    description: 'Let connections see selected payment and wishlist activity.',
  },
  {
    key: 'hideLegalName',
    label: 'Hide legal name',
    description: 'Use your display name anywhere a legal name would appear.',
  },
]

const authLabels: {
  key: keyof AuthSettings
  label: string
  description: string
}[] = [
  {
    key: 'twoFactorEnabled',
    label: 'Two-factor authentication',
    description: 'Require a second factor when signing in on a new device.',
  },
  {
    key: 'biometricEnabled',
    label: 'Biometric unlock',
    description: 'Use device biometrics to reopen the app.',
  },
  {
    key: 'passkeyEnabled',
    label: 'Passkeys',
    description: 'Sign in with a passkey instead of a password where supported.',
  },
  {
    key: 'payoutConfirmation',
    label: 'Payout confirmation',
    description: 'Require confirmation before creator payouts are sent.',
  },
  {
    key: 'loginAlerts',
    label: 'Login alerts',
    description: 'Notify you whenever a new device signs in.',
  },
]

export function AccountPage() {
  const account = useAccount()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: AccountTab = tabs.some((tab) => tab.id === tabParam)
    ? (tabParam as AccountTab)
    : 'profile'

  const completedSteps = account.verification.filter(
    (step) => step.status === 'complete',
  ).length
  const verificationPercent = Math.round(
    (completedSteps / account.verification.length) * 100,
  )
  const enabledServices = account.services.filter((service) => service.enabled)

  function setTab(tab: AccountTab) {
    const next = new URLSearchParams(searchParams)
    next.set('tab', tab)
    setSearchParams(next)
  }

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="One identity. Clear controls."
        description="Identity, services, security and preferences for the whole Relay account. Enabling a service adds tools — it does not create a separate wallet."
        actions={
          <Badge className="border-teal-400/25 bg-teal-400/5 text-teal-200">
            {enabledServices.length} services enabled
          </Badge>
        }
      />

      <Tabs
        className="mt-8"
        items={tabs.map((tab) => ({
          ...tab,
          count: tab.id === 'notifications' ? account.unreadCount : undefined,
        }))}
        active={activeTab}
        onChange={setTab}
      />

      <div className="mt-6">
        {activeTab === 'profile' && (
          <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
            <Card>
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold',
                    account.profile.avatarTone === 'teal' &&
                      'bg-teal-400/15 text-teal-300',
                    account.profile.avatarTone === 'violet' &&
                      'bg-violet-400/15 text-violet-300',
                    account.profile.avatarTone === 'amber' &&
                      'bg-amber-400/15 text-amber-300',
                  )}
                >
                  {account.profile.displayName
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{account.profile.displayName}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {account.profile.username} · {account.profile.accountType} account
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Joined {formatDate(account.profile.joinedAt)}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                <ProfileRow label="Legal name" value={account.profile.legalName} />
                <ProfileRow label="Email" value={account.profile.email} />
                <ProfileRow label="Phone" value={account.profile.phone} />
                <ProfileRow label="Country" value={account.profile.country} />
                <ProfileRow
                  label="Operating currency"
                  value={account.profile.operatingCurrency}
                />
                <ProfileRow label="Public URL" value={account.profile.publicUrl} />
                <ProfileRow label="Support email" value={account.profile.supportEmail} />
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Verification</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Identity checks unlock higher limits and regulated services.
                  </p>
                </div>
                <Badge className="px-2.5 py-0.5 text-[10px]">
                  {completedSteps}/{account.verification.length} complete
                </Badge>
              </div>

              <Progress
                className="mt-4"
                value={verificationPercent}
                max={100}
                tone={verificationPercent === 100 ? 'teal' : 'amber'}
              />

              <div className="mt-5 space-y-3">
                {account.verification.map((step) => (
                  <div
                    key={step.id}
                    className="rounded-xl border border-white/10 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-slate-200">{step.label}</p>
                      <Badge
                        className={cn(
                          'shrink-0 px-2.5 py-0.5 text-[10px]',
                          statusTone[step.status],
                        )}
                      >
                        {step.status.replaceAll('_', ' ')}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {step.detail}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'services' && (
          <>
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Account services</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Services add purpose-built tools on top of the same ledger and
                    subaccounts.
                  </p>
                </div>
                {!account.ageVerified && (
                  <Button variant="secondary" onClick={() => account.setAgeVerified(true)}>
                    Verify age to unlock professional tools
                  </Button>
                )}
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {account.services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onToggle={() => account.toggleService(service.id)}
                  />
                ))}
              </div>
            </Card>

            <Card className="mt-5">
              <h3 className="text-lg font-semibold">Service availability</h3>
              <p className="mt-1 text-sm text-slate-400">
                Country rules are shown honestly; Relay does not promise availability
                it cannot support.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="pb-3 font-medium">Country</th>
                      <th className="pb-3 font-medium">Registration</th>
                      <th className="pb-3 font-medium">Personal</th>
                      <th className="pb-3 font-medium">Creator</th>
                      <th className="pb-3 font-medium">Business</th>
                      <th className="pb-3 font-medium">Professional</th>
                      <th className="pb-3 font-medium">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {account.services.length > 0 &&
                      countryRows.map((row) => (
                        <tr key={row.country}>
                          <td className="py-3 font-medium text-slate-200">{row.country}</td>
                          <td className="py-3">{availabilityBadge(row.registration)}</td>
                          <td className="py-3">{availabilityBadge(row.personalMoney)}</td>
                          <td className="py-3">{availabilityBadge(row.creator)}</td>
                          <td className="py-3">{availabilityBadge(row.business)}</td>
                          <td className="py-3">{availabilityBadge(row.professional)}</td>
                          <td className="py-3 text-xs text-slate-500">{row.note}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'security' && (
          <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
            <Card>
              <h3 className="text-lg font-semibold">Sign-in protection</h3>
              <p className="mt-1 text-sm text-slate-400">
                Controls apply to the whole account, not individual subaccounts.
              </p>
              <div className="mt-4 divide-y divide-white/5">
                {authLabels.map((item) => (
                  <ToggleRow
                    key={item.key}
                    label={item.label}
                    description={item.description}
                    enabled={account.auth[item.key]}
                    onToggle={() =>
                      account.updateAuth({ [item.key]: !account.auth[item.key] })
                    }
                  />
                ))}
              </div>
            </Card>

            <div className="space-y-5">
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Device sessions</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Revoke anything you do not recognise.
                    </p>
                  </div>
                  <Badge className="px-2.5 py-0.5 text-[10px]">
                    {account.sessions.length} active
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {account.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-xl border border-white/10 bg-slate-950/60 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-slate-200">
                              {session.device}
                            </p>
                            {session.current && (
                              <Badge className="border-teal-400/30 bg-teal-400/10 px-2.5 py-0.5 text-[10px] text-teal-300">
                                This device
                              </Badge>
                            )}
                            {session.trusted && (
                              <Badge className="px-2.5 py-0.5 text-[10px]">
                                Trusted
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {session.location} · {session.method} · {session.lastActive}
                          </p>
                        </div>
                        {!session.current && (
                          <div className="flex gap-2">
                            {!session.trusted && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => account.trustSession(session.id)}
                              >
                                Trust
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => account.revokeSession(session.id)}
                            >
                              Revoke
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold">Risk signals</h3>
                <div className="mt-4 space-y-2">
                  {account.riskSignals.map((signal) => (
                    <div
                      key={signal.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-200">{signal.label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{signal.detail}</p>
                      </div>
                      <Badge
                        className={cn(
                          'shrink-0 px-2.5 py-0.5 text-[10px]',
                          signal.level === 'high' &&
                            'border-rose-400/30 bg-rose-400/10 text-rose-300',
                          signal.level === 'medium' &&
                            'border-amber-400/30 bg-amber-400/10 text-amber-300',
                          signal.level === 'low' &&
                            'border-teal-400/30 bg-teal-400/10 text-teal-300',
                        )}
                      >
                        {signal.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="xl:col-span-2">
              <h3 className="text-lg font-semibold">Disputes</h3>
              <p className="mt-1 text-sm text-slate-400">
                Disputes stay attached to their original ledger transactions.
              </p>
              <div className="mt-4 divide-y divide-white/5">
                {account.disputes.length === 0 && (
                  <p className="py-4 text-sm text-slate-500">No disputes recorded.</p>
                )}
                {account.disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="flex flex-wrap items-start justify-between gap-3 py-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-100">
                          {dispute.counterparty}
                        </p>
                        <Badge className="px-2.5 py-0.5 text-[10px]">
                          {dispute.reference}
                        </Badge>
                        <Badge
                          className={cn(
                            'px-2.5 py-0.5 text-[10px]',
                            dispute.status === 'resolved' &&
                              'border-teal-400/30 bg-teal-400/10 text-teal-300',
                            dispute.status === 'under_review' &&
                              'border-sky-400/30 bg-sky-400/10 text-sky-300',
                            dispute.status === 'open' &&
                              'border-amber-400/30 bg-amber-400/10 text-amber-300',
                          )}
                        >
                          {dispute.status.replaceAll('_', ' ')}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {dispute.reason} · opened {formatDate(dispute.openedAt)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {formatMoney(dispute.amount, dispute.currency as CurrencyCode)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="grid gap-5 xl:grid-cols-2">
            <Card>
              <h3 className="text-lg font-semibold">Privacy</h3>
              <p className="mt-1 text-sm text-slate-400">
                Choose what other people can see about your account.
              </p>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Profile visibility
                </label>
                <select
                  value={account.privacy.profileVisibility}
                  onChange={(event) =>
                    account.updatePrivacy({
                      profileVisibility: event.target
                        .value as PrivacySettings['profileVisibility'],
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="mt-4 divide-y divide-white/5">
                {privacyLabels.map((item) => (
                  <ToggleRow
                    key={item.key}
                    label={item.label}
                    description={item.description}
                    enabled={account.privacy[item.key]}
                    onToggle={() =>
                      account.updatePrivacy({
                        [item.key]: !account.privacy[item.key],
                      })
                    }
                  />
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="mt-1 text-sm text-slate-400">
                Choose which events should reach you outside the app.
              </p>
              <div className="mt-4 divide-y divide-white/5">
                {account.notificationPreferences.map((preference) => (
                  <PreferenceRow
                    key={preference.id}
                    preference={preference}
                    onToggle={() =>
                      account.toggleNotificationPreference(preference.id)
                    }
                  />
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm font-medium text-slate-200">Operating currency</p>
                <p className="mt-1 text-xs text-slate-500">
                  {account.profile.operatingCurrency} is the reporting currency. Each
                  subaccount can still hold its own currency.
                </p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Notifications</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {account.unreadCount} unread across money, payments, creator and
                  security.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={account.markAllNotificationsRead}
                disabled={account.unreadCount === 0}
              >
                Mark all read
              </Button>
            </div>

            <div className="mt-4 divide-y divide-white/5">
              {account.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'py-4',
                    !notification.read && 'bg-white/[0.02]',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-100">
                          {notification.title}
                        </p>
                        <Badge className="px-2.5 py-0.5 text-[10px]">
                          {notification.category}
                        </Badge>
                        <Badge
                          className={cn(
                            'px-2.5 py-0.5 text-[10px]',
                            notification.tone === 'success' &&
                              'border-teal-400/30 bg-teal-400/10 text-teal-300',
                            notification.tone === 'warning' &&
                              'border-amber-400/30 bg-amber-400/10 text-amber-300',
                            notification.tone === 'danger' &&
                              'border-rose-400/30 bg-rose-400/10 text-rose-300',
                          )}
                        >
                          {notification.tone}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-slate-400">
                        {notification.body}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        {formatDate(notification.date)}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => account.markNotificationRead(notification.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  )
}

const countryRows = [
  {
    country: 'Kenya',
    registration: true,
    personalMoney: true,
    creator: true,
    business: true,
    professional: true,
    note: 'Full sandbox coverage.',
  },
  {
    country: 'Uganda',
    registration: true,
    personalMoney: true,
    creator: true,
    business: true,
    professional: false,
    note: 'Professional tools pending review.',
  },
  {
    country: 'Ghana',
    registration: true,
    personalMoney: true,
    creator: true,
    business: false,
    professional: false,
    note: 'Business onboarding not yet available.',
  },
  {
    country: 'Rwanda',
    registration: true,
    personalMoney: true,
    creator: true,
    business: false,
    professional: false,
    note: 'Creator payouts limited to sandbox.',
  },
]

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200">{value}</span>
    </div>
  )
}

function ServiceCard({
  service,
  onToggle,
}: {
  service: ServiceState
  onToggle: () => void
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-100">{service.label}</p>
            <Badge
              className={cn(
                'px-2.5 py-0.5 text-[10px]',
                service.enabled
                  ? 'border-teal-400/30 bg-teal-400/10 text-teal-300'
                  : 'border-slate-400/30 bg-slate-400/10 text-slate-300',
              )}
            >
              {service.enabled ? 'Enabled' : service.eligibility.replaceAll('_', ' ')}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {service.description}
          </p>
        </div>
        <Button
          size="sm"
          variant={service.enabled ? 'secondary' : 'primary'}
          onClick={onToggle}
        >
          {service.enabled ? 'Disable' : 'Enable'}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {service.permissions.map((permission) => (
          <span
            key={permission}
            className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-500"
          >
            {permission}
          </span>
        ))}
      </div>

      {(service.requiresAgeVerification || service.requiresProviderApproval) && (
        <p className="mt-3 text-xs text-amber-300/80">
          {service.requiresAgeVerification && 'Age verification required. '}
          {service.requiresProviderApproval && 'Provider approval required.'}
        </p>
      )}
    </div>
  )
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={onToggle}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition',
          enabled
            ? 'border-teal-400/40 bg-teal-400/30'
            : 'border-white/15 bg-white/5',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition',
            enabled ? 'left-[22px]' : 'left-0.5',
          )}
          style={{ height: 18, width: 18 }}
        />
      </button>
    </div>
  )
}

function PreferenceRow({
  preference,
  onToggle,
}: {
  preference: NotificationPreference
  onToggle: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-200">{preference.label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
          {preference.description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={preference.enabled}
        aria-label={preference.label}
        onClick={onToggle}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition',
          preference.enabled
            ? 'border-teal-400/40 bg-teal-400/30'
            : 'border-white/15 bg-white/5',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition',
            preference.enabled ? 'left-[22px]' : 'left-0.5',
          )}
          style={{ height: 18, width: 18 }}
        />
      </button>
    </div>
  )
}

function availabilityBadge(available: boolean) {
  return (
    <Badge
      className={cn(
        'px-2.5 py-0.5 text-[10px]',
        available
          ? 'border-teal-400/30 bg-teal-400/10 text-teal-300'
          : 'border-slate-400/30 bg-slate-400/10 text-slate-300',
      )}
    >
      {available ? 'Available' : 'Unavailable'}
    </Badge>
  )
}

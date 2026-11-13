import { useSearchParams } from 'react-router-dom'
import { Badge } from '@/components/ui'
import {
  CreatorStudioNav,
  CreatorStudioToast,
} from '@/features/creator-studio/components'
import {
  defaultSectionId,
  isCreatorSectionId,
} from '@/features/creator-studio/data/sections'
import { useCreatorStudio } from '@/features/creator-studio/hooks/useCreatorStudioState'
import type { CreatorSectionId } from '@/features/creator-studio/types'
import {
  AnalyticsSection,
  AssistantSection,
  AutomationsSection,
  CampaignsSection,
  CustomersSection,
  ExpensesSection,
  InvoicesSection,
  OverviewSection,
  PartnershipsSection,
  PaymentLinksSection,
  PayoutsSection,
  ProfileSection,
  SecuritySection,
  SettingsSection,
  StorefrontSection,
  SubscriptionsSection,
  TipsSection,
  WalletSection,
} from '@/features/creator-studio/components/sections'
import { CheckIcon } from '@/features/creator-studio/components/icons'

export function CreatorStudioPage() {
  const creator = useCreatorStudio()
  const [searchParams, setSearchParams] = useSearchParams()

  const sectionParam = searchParams.get('section')
  const activeSection: CreatorSectionId = isCreatorSectionId(sectionParam)
    ? sectionParam
    : defaultSectionId

  function handleNavigate(sectionId: CreatorSectionId) {
    setSearchParams(
      sectionId === defaultSectionId ? {} : { section: sectionId },
    )
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <header>
        <Badge>Creator Studio</Badge>

        <h2 className="mt-6 text-3xl font-bold">Build your income.</h2>
        <p className="mt-3 max-w-xl text-slate-400">
          A professional financial workspace for creators — collect payments,
          grow supporters and manage payouts on top of your Relay account.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1.5 font-medium text-slate-300">
            {creator.profile.displayName}
          </span>
          {creator.profile.verified && (
            <span className="inline-flex items-center gap-1 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1.5 font-medium text-teal-300">
              <CheckIcon className="h-3 w-3" />
              Verified creator
            </span>
          )}
          <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1.5 font-medium text-slate-300">
            {creator.profile.country} · {creator.profile.currency}
          </span>
        </div>
      </header>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:gap-8">
        <CreatorStudioNav
          activeSection={activeSection}
          onSelect={handleNavigate}
        />

        <div className="min-w-0 flex-1">
          {activeSection === 'overview' && (
            <OverviewSection onNavigate={handleNavigate} />
          )}
          {activeSection === 'profile' && <ProfileSection />}
          {activeSection === 'wallet' && <WalletSection />}
          {activeSection === 'payment-links' && <PaymentLinksSection />}
          {activeSection === 'subscriptions' && <SubscriptionsSection />}
          {activeSection === 'tips' && <TipsSection />}
          {activeSection === 'storefront' && <StorefrontSection />}
          {activeSection === 'invoices' && <InvoicesSection />}
          {activeSection === 'customers' && <CustomersSection />}
          {activeSection === 'campaigns' && <CampaignsSection />}
          {activeSection === 'partnerships' && <PartnershipsSection />}
          {activeSection === 'payouts' && <PayoutsSection />}
          {activeSection === 'analytics' && <AnalyticsSection />}
          {activeSection === 'expenses' && <ExpensesSection />}
          {activeSection === 'assistant' && <AssistantSection />}
          {activeSection === 'automations' && <AutomationsSection />}
          {activeSection === 'security' && <SecuritySection />}
          {activeSection === 'settings' && <SettingsSection />}
        </div>
      </div>

      <CreatorStudioToast />
    </>
  )
}

import { Card } from '@/components/ui/Card'
import {
  FeatureGrid,
  WelcomeHeader,
  WorkspaceIntro,
} from '@/features/dashboard/components'

export function OverviewPage() {
  return (
    <>
      <WelcomeHeader />
      <WorkspaceIntro />
      <FeatureGrid />

      <Card className="mt-8 border-teal-400/20 bg-teal-400/5">
        <p className="text-sm font-medium text-teal-300">PROJECT RELAY</p>
        <h4 className="mt-2 text-xl font-semibold">
          A connected digital ecosystem.
        </h4>
        <p className="mt-2 text-sm text-slate-400">
          This is our first development screen. Wallet balances, payments and
          other services are not connected yet.
        </p>
      </Card>
    </>
  )
}

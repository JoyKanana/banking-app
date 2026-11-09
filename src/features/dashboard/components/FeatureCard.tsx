import { Card } from '@/components/ui/Card'
import type { DashboardFeature } from '../types'

type FeatureCardProps = {
  feature: DashboardFeature
}

export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <Card>
      <p className="text-sm text-slate-400">{feature.label}</p>
      <h4 className="mt-4 text-xl font-semibold">{feature.title}</h4>
      <p className="mt-2 text-sm text-slate-500">{feature.description}</p>
    </Card>
  )
}

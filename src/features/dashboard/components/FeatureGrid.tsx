import { dashboardFeatures } from '../data/features'
import { FeatureCard } from './FeatureCard'

export function FeatureGrid() {
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {dashboardFeatures.map((feature) => (
        <FeatureCard key={feature.title} feature={feature} />
      ))}
    </div>
  )
}

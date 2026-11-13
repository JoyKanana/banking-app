import { Badge } from '@/components/ui'
import { formatDateTime, formatNumber } from '../../lib/format'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import { SectionHeading, StatCard, Toggle } from '../shared'

export function AutomationsSection() {
  const creator = useCreatorStudio()
  const { automations, toggleAutomation } = creator

  const enabledCount = automations.filter(
    (automation) => automation.enabled,
  ).length
  const totalRuns = automations.reduce(
    (sum, automation) => sum + automation.runs,
    0,
  )

  const lastRun =
    automations
      .map((automation) => automation.lastRun)
      .filter((run) => run !== 'Never')
      .sort()
      .reverse()[0] ?? null

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Automations"
        description="Workflows that run on your payments without you lifting a finger."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Active automations" value={`${enabledCount} of ${automations.length}`} tone="teal" />
        <StatCard label="Total runs" value={formatNumber(totalRuns)} />
        <StatCard
          label="Last run"
          value={lastRun ? formatDateTime(lastRun) : '—'}
          sub="Most recent automation"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {automations.map((automation) => (
          <Toggle
            key={automation.id}
            label={automation.name}
            description={automation.description}
            checked={automation.enabled}
            onChange={() => toggleAutomation(automation.id)}
          >
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className="px-2.5 py-0.5 text-[11px]">
                {automation.trigger}
              </Badge>
              <span className="text-[11px] text-slate-500">
                {automation.runs > 0
                  ? `${formatNumber(automation.runs)} runs · last ${formatDateTime(automation.lastRun)}`
                  : 'Never run'}
              </span>
            </div>
          </Toggle>
        ))}
      </div>
    </section>
  )
}

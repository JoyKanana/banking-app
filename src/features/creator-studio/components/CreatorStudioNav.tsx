import { cn } from '@/lib/utils'
import { creatorSections } from '../data/sections'
import type { CreatorSectionId } from '../types'

type CreatorStudioNavProps = {
  activeSection: CreatorSectionId
  onSelect: (sectionId: CreatorSectionId) => void
}

export function CreatorStudioNav({
  activeSection,
  onSelect,
}: CreatorStudioNavProps) {
  return (
    <>
      <nav
        aria-label="Creator Studio sections"
        className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 lg:hidden"
      >
        {creatorSections.map((section) => {
          const isActive = section.id === activeSection

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'shrink-0 rounded-xl border px-3.5 py-2 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
                isActive
                  ? 'border-teal-400/40 bg-teal-400/10 text-teal-100'
                  : 'border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-white',
              )}
            >
              {section.label}
            </button>
          )
        })}
      </nav>

      <nav
        aria-label="Creator Studio sections"
        className="hidden w-56 shrink-0 lg:block"
      >
        <div className="sticky top-8 space-y-1">
          {creatorSections.map((section) => {
            const isActive = section.id === activeSection

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelect(section.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'block w-full rounded-xl px-3.5 py-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
                  isActive
                    ? 'bg-teal-400/10 text-sm font-semibold text-teal-300'
                    : 'text-sm text-slate-400 hover:bg-white/5 hover:text-white',
                )}
              >
                {section.label}
                {isActive && (
                  <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
                    {section.description}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}

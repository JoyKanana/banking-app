import { cn } from '@/lib/utils'

export type TabItem<T extends string = string> = {
  id: T
  label: string
  count?: number
}

type TabsProps<T extends string> = {
  items: TabItem<T>[]
  active: T
  onChange: (id: T) => void
  className?: string
}

export function Tabs<T extends string>({
  items,
  active,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div
      className={cn(
        'flex gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/70 p-1.5',
        className,
      )}
      role="tablist"
    >
      {items.map((item) => {
        const isActive = item.id === active

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
              isActive
                ? 'bg-teal-400/10 text-teal-200'
                : 'text-slate-400 hover:bg-white/5 hover:text-white',
            )}
          >
            {item.label}
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px]',
                  isActive
                    ? 'bg-teal-400/15 text-teal-200'
                    : 'bg-white/5 text-slate-500',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

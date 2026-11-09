import { Badge } from '@/components/ui/Badge'
import { useFormattedDate } from '@/hooks/useFormattedDate'

export function WelcomeHeader() {
  const today = useFormattedDate()

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm text-slate-400">{today}</p>
        <h2 className="mt-2 text-2xl font-semibold">Welcome to Relay.</h2>
      </div>

      <Badge>Demo account</Badge>
    </header>
  )
}

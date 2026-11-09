import { Link } from 'react-router-dom'
import { PagePlaceholder } from '@/components/ui/PagePlaceholder'

export function NotFoundPage() {
  return (
    <div>
      <PagePlaceholder
        eyebrow="404"
        title="Page not found."
        description="The page you are looking for does not exist yet."
      />

      <Link
        to="/"
        className="mt-6 inline-flex text-sm font-medium text-teal-300 transition hover:text-teal-200"
      >
        Back to overview
      </Link>
    </div>
  )
}

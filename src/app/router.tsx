import { Navigate, createBrowserRouter, redirect } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AccountPage } from '@/pages/AccountPage'
import { ConnectionsPage } from '@/pages/ConnectionsPage'
import { CreatorStudioPage } from '@/pages/CreatorStudioPage'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { InsightsPage } from '@/pages/InsightsPage'
import { MoneyPage } from '@/pages/MoneyPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OverviewPage } from '@/pages/OverviewPage'
import { PaymentsPage } from '@/pages/PaymentsPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'money', element: <MoneyPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'connections', element: <ConnectionsPage /> },
      { path: 'work', element: <CreatorStudioPage /> },
      { path: 'insights', element: <InsightsPage /> },
      { path: 'discover', element: <DiscoverPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: 'wallet', element: <Navigate to="/money" replace /> },
      {
        path: 'creator-studio',
        loader: ({ request }) => {
          const url = new URL(request.url)
          return redirect(`/work${url.search}`)
        },
      },
      { path: 'wishlist', element: <Navigate to="/connections?tab=wishlist" replace /> },
      { path: 'messages', element: <Navigate to="/connections?tab=conversations" replace /> },
      { path: 'business', element: <Navigate to="/work?section=storefront" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

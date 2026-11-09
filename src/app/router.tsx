import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { BusinessPage } from '@/pages/BusinessPage'
import { CreatorStudioPage } from '@/pages/CreatorStudioPage'
import { MessagesPage } from '@/pages/MessagesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OverviewPage } from '@/pages/OverviewPage'
import { PaymentsPage } from '@/pages/PaymentsPage'
import { WalletPage } from '@/pages/WalletPage'
import { WishlistPage } from '@/pages/WishlistPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'creator-studio', element: <CreatorStudioPage /> },
      { path: 'business', element: <BusinessPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

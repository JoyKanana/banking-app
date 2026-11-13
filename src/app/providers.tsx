import type { ReactNode } from 'react'
import { AccountProvider } from '@/domain/account/store'
import { MoneyProvider } from '@/domain/money/store'
import {
  creatorSeedEntries,
  creatorSeedTransactions,
} from '@/features/creator-studio/data/ledgerBridge'
import { CreatorStudioProvider } from '@/features/creator-studio/hooks/useCreatorStudioState'
import { WishlistProvider } from '@/features/wishlist/hooks/WishlistProvider'

const creatorSeed = {
  transactions: creatorSeedTransactions,
  entries: creatorSeedEntries,
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AccountProvider>
      <MoneyProvider seed={creatorSeed}>
        <WishlistProvider>
          <CreatorStudioProvider>{children}</CreatorStudioProvider>
        </WishlistProvider>
      </MoneyProvider>
    </AccountProvider>
  )
}

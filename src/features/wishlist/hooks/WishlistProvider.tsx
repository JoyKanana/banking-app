import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useWishlistState } from './useWishlistState'

type WishlistApi = ReturnType<typeof useWishlistState>

const WishlistContext = createContext<WishlistApi | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const value = useWishlistState()

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistApi {
  const context = useContext(WishlistContext)

  if (!context) {
    throw new Error('useWishlist must be used inside WishlistProvider')
  }

  return context
}

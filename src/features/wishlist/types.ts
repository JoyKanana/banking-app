export type WishlistVisibility = 'public' | 'private'

export type GiftKind = 'product' | 'cash' | 'crowdgift'

export type GiftStatus = 'available' | 'received'

export type GiftFilter =
  | 'all'
  | 'available'
  | 'received'
  | 'imported'
  | 'private'

export type GiftSort = 'pinned' | 'newest' | 'price-desc' | 'price-asc'

export type Wishlist = {
  id: string
  title: string
  description: string
  emoji: string
  visibility: WishlistVisibility
  isPrimary?: boolean
}

export type Gift = {
  id: string
  wishlistId: string
  name: string
  description: string
  price: number
  category: string
  emoji: string
  kind: GiftKind
  status: GiftStatus
  pinned: boolean
  private: boolean
  funded: number
  addedAt: string
  storeId?: string
  sourceUrl?: string
}

export type WishlistStats = {
  giftCount: number
  totalValue: number
  receivedValue: number
  importedCount: number
  privateCount: number
}

import { useMemo, useState } from 'react'
import { categoryEmoji, initialGifts, initialWishlists } from '../data/wishlists'
import type {
  Gift,
  GiftFilter,
  GiftKind,
  GiftSort,
  Wishlist,
  WishlistStats,
} from '../types'

export type NewGiftInput = {
  name: string
  description: string
  price: number
  category: string
  kind: GiftKind
  wishlistId: string
  private: boolean
  storeId?: string
  sourceUrl?: string
}

const sorters: Record<GiftSort, (a: Gift, b: Gift) => number> = {
  pinned: (a, b) => b.addedAt.localeCompare(a.addedAt),
  newest: (a, b) => b.addedAt.localeCompare(a.addedAt),
  'price-desc': (a, b) => b.price - a.price,
  'price-asc': (a, b) => a.price - b.price,
}

function matchesFilter(gift: Gift, filter: GiftFilter): boolean {
  if (filter === 'available') return gift.status === 'available'
  if (filter === 'received') return gift.status === 'received'
  if (filter === 'imported') return Boolean(gift.storeId)
  if (filter === 'private') return gift.private
  return true
}

function createId(prefix: string): string {
  const randomPart =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10)

  return `${prefix}-${randomPart}`
}

/**
 * Owns all client-side wishlist state: collections, gifts, filtering and
 * the small mutations the page exposes (pin, privacy, add, create list).
 */
export function useWishlistState() {
  const [wishlists, setWishlists] = useState<Wishlist[]>(initialWishlists)
  const [gifts, setGifts] = useState<Gift[]>(initialGifts)
  const [activeWishlistId, setActiveWishlistId] = useState(
    initialWishlists[0].id,
  )
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<GiftFilter>('all')
  const [sort, setSort] = useState<GiftSort>('pinned')
  const [isAddGiftOpen, setAddGiftOpen] = useState(false)
  const [isImportOpen, setImportOpen] = useState(false)

  const activeWishlist =
    wishlists.find((wishlist) => wishlist.id === activeWishlistId) ??
    wishlists[0]

  const listGifts = useMemo(
    () => gifts.filter((gift) => gift.wishlistId === activeWishlistId),
    [gifts, activeWishlistId],
  )

  const stats: WishlistStats = useMemo(
    () => ({
      giftCount: listGifts.length,
      totalValue: listGifts.reduce((total, gift) => total + gift.price, 0),
      receivedValue: listGifts
        .filter((gift) => gift.status === 'received')
        .reduce((total, gift) => total + gift.price, 0),
      importedCount: listGifts.filter((gift) => Boolean(gift.storeId)).length,
      privateCount: listGifts.filter((gift) => gift.private).length,
    }),
    [listGifts],
  )

  const visibleGifts = useMemo(() => {
    const term = search.trim().toLowerCase()

    return listGifts
      .filter((gift) => matchesFilter(gift, filter))
      .filter((gift) => {
        if (!term) return true
        return `${gift.name} ${gift.description} ${gift.category}`
          .toLowerCase()
          .includes(term)
      })
      .sort(
        (a, b) =>
          Number(b.pinned) - Number(a.pinned) || sorters[sort](a, b),
      )
  }, [listGifts, filter, search, sort])

  const giftCounts = useMemo(
    () => ({
      all: listGifts.length,
      available: listGifts.filter((gift) => gift.status === 'available').length,
      received: listGifts.filter((gift) => gift.status === 'received').length,
      imported: listGifts.filter((gift) => Boolean(gift.storeId)).length,
      private: listGifts.filter((gift) => gift.private).length,
    }),
    [listGifts],
  )

  const importedGifts = useMemo(
    () => listGifts.filter((gift) => Boolean(gift.storeId)),
    [listGifts],
  )

  const wishlistGiftCounts = useMemo(
    () =>
      Object.fromEntries(
        wishlists.map((wishlist) => [
          wishlist.id,
          gifts.filter((gift) => gift.wishlistId === wishlist.id).length,
        ]),
      ) as Record<string, number>,
    [wishlists, gifts],
  )

  function togglePin(giftId: string) {
    setGifts((current) =>
      current.map((gift) =>
        gift.id === giftId ? { ...gift, pinned: !gift.pinned } : gift,
      ),
    )
  }

  function togglePrivacy(giftId: string) {
    setGifts((current) =>
      current.map((gift) =>
        gift.id === giftId ? { ...gift, private: !gift.private } : gift,
      ),
    )
  }

  function addGift(input: NewGiftInput) {
    const gift: Gift = {
      ...input,
      id: createId('gift'),
      emoji: categoryEmoji[input.category] ?? '🎁',
      status: 'available',
      pinned: false,
      funded: 0,
      addedAt: new Date().toISOString(),
    }

    setGifts((current) => [gift, ...current])
    setActiveWishlistId(input.wishlistId)
    setFilter('all')
    setSearch('')
  }

  function addWishlist(title: string) {
    const wishlist: Wishlist = {
      id: createId('wl'),
      title,
      description: 'A new collection of gifts.',
      emoji: '✨',
      visibility: 'public',
    }

    setWishlists((current) => [...current, wishlist])
    setActiveWishlistId(wishlist.id)
    setFilter('all')
    setSearch('')
  }

  return {
    wishlists,
    activeWishlist,
    activeWishlistId,
    setActiveWishlistId,
    visibleGifts,
    stats,
    giftCounts,
    importedGifts,
    wishlistGiftCounts,
    search,
    setSearch,
    filter,
    setFilter,
    sort,
    setSort,
    togglePin,
    togglePrivacy,
    addGift,
    addWishlist,
    isAddGiftOpen,
    openAddGift: () => setAddGiftOpen(true),
    closeAddGift: () => setAddGiftOpen(false),
    isImportOpen,
    openImportGift: () => setImportOpen(true),
    closeImportGift: () => setImportOpen(false),
  }
}

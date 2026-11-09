import {
  AddGiftDialog,
  GiftGrid,
  ImportGiftDialog,
  ImportedGiftsSection,
  WishlistHeader,
  WishlistStats,
  WishlistTabs,
  WishlistToolbar,
} from '@/features/wishlist/components'
import { useWishlistState } from '@/features/wishlist/hooks/useWishlistState'

export function WishlistPage() {
  const wishlist = useWishlistState()

  return (
    <>
      <WishlistHeader
        onAddGift={wishlist.openAddGift}
        onImportGift={wishlist.openImportGift}
      />

      <WishlistStats stats={wishlist.stats} />

      <WishlistTabs
        wishlists={wishlist.wishlists}
        activeWishlistId={wishlist.activeWishlistId}
        giftCounts={wishlist.wishlistGiftCounts}
        onSelect={wishlist.setActiveWishlistId}
        onCreate={wishlist.addWishlist}
      />

      <p className="mt-2 text-sm text-slate-500">
        {wishlist.activeWishlist.description}
      </p>

      <ImportedGiftsSection
        gifts={wishlist.importedGifts}
        onImport={wishlist.openImportGift}
      />

      <WishlistToolbar
        search={wishlist.search}
        onSearchChange={wishlist.setSearch}
        filter={wishlist.filter}
        onFilterChange={wishlist.setFilter}
        sort={wishlist.sort}
        onSortChange={wishlist.setSort}
        counts={wishlist.giftCounts}
      />

      <GiftGrid
        gifts={wishlist.visibleGifts}
        onTogglePin={wishlist.togglePin}
        onTogglePrivacy={wishlist.togglePrivacy}
      />

      {wishlist.isAddGiftOpen && (
        <AddGiftDialog
          wishlists={wishlist.wishlists}
          defaultWishlistId={wishlist.activeWishlistId}
          onClose={wishlist.closeAddGift}
          onAdd={wishlist.addGift}
        />
      )}

      {wishlist.isImportOpen && (
        <ImportGiftDialog
          wishlists={wishlist.wishlists}
          defaultWishlistId={wishlist.activeWishlistId}
          onClose={wishlist.closeImportGift}
          onImport={wishlist.addGift}
        />
      )}
    </>
  )
}

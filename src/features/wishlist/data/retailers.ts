export type Retailer = {
  id: string
  name: string
  domain: string
  emoji: string
  badgeClass: string
  exampleUrl: string
}

export const retailers: Retailer[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    domain: 'amazon.com',
    emoji: '📦',
    badgeClass: 'border-orange-400/30 bg-orange-400/15 text-orange-300',
    exampleUrl: 'https://www.amazon.com/dp/...',
  },
  {
    id: 'shein',
    name: 'SHEIN',
    domain: 'shein.com',
    emoji: '👗',
    badgeClass: 'border-slate-300/30 bg-slate-300/10 text-slate-200',
    exampleUrl: 'https://www.shein.com/p/...',
  },
  {
    id: 'alibaba',
    name: 'Alibaba',
    domain: 'alibaba.com',
    emoji: '🏭',
    badgeClass: 'border-amber-400/30 bg-amber-400/15 text-amber-300',
    exampleUrl: 'https://www.alibaba.com/product-detail/...',
  },
  {
    id: 'throne',
    name: 'Throne',
    domain: 'throne.com',
    emoji: '👑',
    badgeClass: 'border-violet-400/30 bg-violet-400/15 text-violet-300',
    exampleUrl: 'https://throne.com/...',
  },
  {
    id: 'etsy',
    name: 'Etsy',
    domain: 'etsy.com',
    emoji: '🧶',
    badgeClass: 'border-orange-300/30 bg-orange-300/10 text-orange-200',
    exampleUrl: 'https://www.etsy.com/listing/...',
  },
  {
    id: 'ebay',
    name: 'eBay',
    domain: 'ebay.com',
    emoji: '🔎',
    badgeClass: 'border-blue-400/30 bg-blue-400/15 text-blue-300',
    exampleUrl: 'https://www.ebay.com/itm/...',
  },
  {
    id: 'walmart',
    name: 'Walmart',
    domain: 'walmart.com',
    emoji: '🛒',
    badgeClass: 'border-sky-400/30 bg-sky-400/15 text-sky-300',
    exampleUrl: 'https://www.walmart.com/ip/...',
  },
  {
    id: 'target',
    name: 'Target',
    domain: 'target.com',
    emoji: '🎯',
    badgeClass: 'border-red-400/30 bg-red-400/15 text-red-300',
    exampleUrl: 'https://www.target.com/p/...',
  },
  {
    id: 'temu',
    name: 'Temu',
    domain: 'temu.com',
    emoji: '🧺',
    badgeClass: 'border-orange-400/30 bg-orange-400/15 text-orange-300',
    exampleUrl: 'https://www.temu.com/...',
  },
  {
    id: 'aliexpress',
    name: 'AliExpress',
    domain: 'aliexpress.com',
    emoji: '🚚',
    badgeClass: 'border-rose-400/30 bg-rose-400/15 text-rose-300',
    exampleUrl: 'https://www.aliexpress.com/item/...',
  },
  {
    id: 'other',
    name: 'Other store',
    domain: '',
    emoji: '🌐',
    badgeClass: 'border-white/15 bg-white/5 text-slate-300',
    exampleUrl: 'https://...',
  },
]

export function getRetailer(storeId?: string): Retailer | undefined {
  if (!storeId) return undefined
  return retailers.find((retailer) => retailer.id === storeId)
}

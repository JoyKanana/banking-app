import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, PageHeader, Tabs } from '@/components/ui'
import { useCreatorStudio } from '@/features/creator-studio/hooks/useCreatorStudioState'
import { useWishlist } from '@/features/wishlist/hooks/WishlistProvider'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

type DiscoverTab = 'creators' | 'products' | 'opportunities'

const tabs: { id: DiscoverTab; label: string }[] = [
  { id: 'creators', label: 'Creators' },
  { id: 'products', label: 'Products' },
  { id: 'opportunities', label: 'Opportunities' },
]

type CreatorCard = {
  id: string
  name: string
  handle: string
  focus: string
  description: string
  followers: string
  location: string
  tone: 'teal' | 'violet' | 'amber'
  tags: string[]
}

const creators: CreatorCard[] = [
  {
    id: 'c-joy',
    name: 'Joy Wanjiru',
    handle: '@joybuilds',
    focus: 'Personal finance',
    description:
      'Builds practical money systems for freelancers and small teams across East Africa.',
    followers: '24.8k',
    location: 'Nairobi, Kenya',
    tone: 'teal',
    tags: ['Budgeting', 'Freelance'],
  },
  {
    id: 'c-kevo',
    name: 'Kevo Mwangi',
    handle: '@kevostudio',
    focus: 'Design & brand',
    description:
      'Brand systems, pitch decks and design sprints for early-stage founders.',
    followers: '11.2k',
    location: 'Kampala, Uganda',
    tone: 'violet',
    tags: ['Branding', 'Templates'],
  },
  {
    id: 'c-nia',
    name: 'Nia Achieng',
    handle: '@niaspeaks',
    focus: 'Career & leadership',
    description:
      'Coaching and workshops for managers stepping into their first leadership role.',
    followers: '18.4k',
    location: 'Accra, Ghana',
    tone: 'amber',
    tags: ['Coaching', 'Workshops'],
  },
  {
    id: 'c-tuko',
    name: 'Tuko Research',
    handle: '@tukoresearch',
    focus: 'Market research',
    description:
      'Consumer research and field insights for products built for African markets.',
    followers: '6.7k',
    location: 'Kigali, Rwanda',
    tone: 'teal',
    tags: ['Research', 'Reports'],
  },
]

type ProductCard = {
  id: string
  title: string
  creator: string
  type: string
  price: number
  description: string
  tag: string
}

const products: ProductCard[] = [
  {
    id: 'prod-1',
    title: 'The Money Reset Workbook',
    creator: 'Joy Wanjiru',
    type: 'Digital workbook',
    price: 1800,
    description:
      'A 30-day workbook for rebuilding spending, saving and debt habits.',
    tag: 'Bestseller',
  },
  {
    id: 'prod-2',
    title: 'Founder Pitch Kit',
    creator: 'Kevo Mwangi',
    type: 'Template pack',
    price: 4500,
    description:
      'Slide structures, narrative prompts and a financial model starter.',
    tag: 'New',
  },
  {
    id: 'prod-3',
    title: 'First 90 Days as a Manager',
    creator: 'Nia Achieng',
    type: 'Cohort workshop',
    price: 12000,
    description:
      'A four-week live programme for new people leaders and their teams.',
    tag: 'Cohort',
  },
  {
    id: 'prod-4',
    title: 'East Africa Consumer Snapshot',
    creator: 'Tuko Research',
    type: 'Research report',
    price: 6500,
    description:
      'Survey data and field notes on spending behaviour in five urban markets.',
    tag: 'Report',
  },
]

type OpportunityCard = {
  id: string
  title: string
  organisation: string
  budget: string
  type: string
  deadline: string
  description: string
}

const opportunities: OpportunityCard[] = [
  {
    id: 'opp-1',
    title: 'Financial literacy content series',
    organisation: 'Equity Bank',
    budget: 'KSh 180,000',
    type: 'Brand partnership',
    deadline: '22 Nov 2026',
    description:
      'Six short-form videos and one live Q&A for a youth budgeting campaign.',
  },
  {
    id: 'opp-2',
    title: 'Product design sprint facilitator',
    organisation: 'Sokoni Labs',
    budget: 'USD 3,500',
    type: 'Facilitation',
    deadline: '30 Nov 2026',
    description:
      'Run a five-day sprint with a payments team preparing a merchant launch.',
  },
  {
    id: 'opp-3',
    title: 'Creator-in-residence programme',
    organisation: 'Nairobi Design Week',
    budget: 'KSh 250,000',
    type: 'Residency',
    deadline: '05 Dec 2026',
    description:
      'A three-month residency for a creator building tools for local businesses.',
  },
]

export function DiscoverPage() {
  const creator = useCreatorStudio()
  const wishlist = useWishlist()
  const [activeTab, setActiveTab] = useState<DiscoverTab>('creators')
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState<string[]>([])

  const term = search.trim().toLowerCase()

  const visibleCreators = useMemo(
    () =>
      creators.filter((item) =>
        `${item.name} ${item.handle} ${item.focus} ${item.tags.join(' ')}`
          .toLowerCase()
          .includes(term),
      ),
    [term],
  )

  const visibleProducts = useMemo(
    () =>
      products.filter((item) =>
        `${item.title} ${item.creator} ${item.type} ${item.description}`
          .toLowerCase()
          .includes(term),
      ),
    [term],
  )

  const visibleOpportunities = useMemo(
    () =>
      opportunities.filter((item) =>
        `${item.title} ${item.organisation} ${item.type} ${item.description}`
          .toLowerCase()
          .includes(term),
      ),
    [term],
  )

  const wishlistValue = wishlist.stats.totalValue
  const creatorLinks = creator.paymentLinks.slice(0, 3)

  function toggleSaved(id: string) {
    setSaved((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Discover"
        title="Find your next collaboration."
        description="A curated demo directory of creators, products and paid opportunities. Discovery is not yet connected to a live marketplace."
        actions={
          <Badge className="border-amber-400/25 bg-amber-400/5 text-amber-200">
            Curated demo directory
          </Badge>
        }
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Wishlist value</p>
          <p className="mt-1 text-xl font-semibold text-white">
            {formatMoney(wishlistValue, 'USD')}
          </p>
          <p className="mt-1 text-xs text-slate-500">Across saved gift ideas</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Your payment links</p>
          <p className="mt-1 text-xl font-semibold text-white">
            {creator.paymentLinks.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Shareable ways to get paid</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Saved</p>
          <p className="mt-1 text-xl font-semibold text-white">{saved.length}</p>
          <p className="mt-1 text-xs text-slate-500">Creators, products and roles</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs items={tabs} active={activeTab} onChange={setActiveTab} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search creators, products or opportunities"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20 lg:max-w-sm"
        />
      </div>

      <div className="mt-6">
        {activeTab === 'creators' && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleCreators.map((item) => (
              <Card key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                        item.tone === 'teal' && 'bg-teal-400/15 text-teal-300',
                        item.tone === 'violet' && 'bg-violet-400/15 text-violet-300',
                        item.tone === 'amber' && 'bg-amber-400/15 text-amber-300',
                      )}
                    >
                      {item.name
                        .split(' ')
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.handle} · {item.location}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSaved(item.id)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition',
                      saved.includes(item.id)
                        ? 'border-teal-400/30 bg-teal-400/10 text-teal-300'
                        : 'border-white/10 text-slate-400 hover:border-white/25',
                    )}
                  >
                    {saved.includes(item.id) ? 'Saved' : 'Save'}
                  </button>
                </div>

                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {item.focus} · {item.followers} followers
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {item.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to="/connections?tab=conversations"
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-teal-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-teal-300"
                  >
                    Connect
                  </Link>
                  <Link
                    to="/payments?tab=send"
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-teal-400/40 hover:text-teal-200"
                  >
                    Pay
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <>
            {creatorLinks.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Your live payment links
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {creatorLinks.map((link) => (
                    <div
                      key={link.id}
                      className="rounded-2xl border border-teal-400/20 bg-teal-400/[0.04] p-4"
                    >
                      <p className="text-sm font-semibold text-slate-100">{link.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {link.type === 'fixed' && link.amount
                          ? formatMoney(link.amount)
                          : 'Any amount'}{' '}
                        · {link.payments} payments
                      </p>
                      <Link
                        to="/work?section=payment-links"
                        className="mt-3 inline-block text-xs font-semibold text-teal-300"
                      >
                        Manage link
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((item) => (
                <Card key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge className="px-2.5 py-0.5 text-[10px]">{item.tag}</Badge>
                      <h3 className="mt-3 text-base font-semibold text-slate-100">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.creator} · {item.type}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-white">
                      {formatMoney(item.price)}
                    </p>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {item.description}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSaved(item.id)}
                      className={cn(
                        'flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition',
                        saved.includes(item.id)
                          ? 'border-teal-400/30 bg-teal-400/10 text-teal-300'
                          : 'border-white/15 bg-white/5 text-slate-200 hover:border-white/25',
                      )}
                    >
                      {saved.includes(item.id) ? 'Saved' : 'Save product'}
                    </button>
                    <Link
                      to="/payments?tab=send"
                      className="inline-flex flex-1 items-center justify-center rounded-xl bg-teal-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-teal-300"
                    >
                      Buy
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {activeTab === 'opportunities' && (
          <div className="space-y-4">
            {visibleOpportunities.map((item) => (
              <Card key={item.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="px-2.5 py-0.5 text-[10px]">{item.type}</Badge>
                      <span className="text-xs text-slate-500">
                        Closes {item.deadline}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-100">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.organisation} · {item.budget}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => toggleSaved(item.id)}
                    >
                      {saved.includes(item.id) ? 'Saved' : 'Save'}
                    </Button>
                    <Link
                      to="/connections?tab=conversations"
                      className="inline-flex items-center justify-center rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
                    >
                      Express interest
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {((activeTab === 'creators' && visibleCreators.length === 0) ||
          (activeTab === 'products' && visibleProducts.length === 0) ||
          (activeTab === 'opportunities' && visibleOpportunities.length === 0)) && (
          <Card className="mt-4 text-center">
            <p className="text-sm font-medium text-slate-300">No matches found.</p>
            <p className="mt-1 text-sm text-slate-500">
              Try a broader search term or switch categories.
            </p>
          </Card>
        )}
      </div>
    </>
  )
}

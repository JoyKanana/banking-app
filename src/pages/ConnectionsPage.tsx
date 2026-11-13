import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AddGiftDialog,
  GiftGrid,
  ImportGiftDialog,
  ImportedGiftsSection,
  WishlistStats,
  WishlistTabs,
  WishlistToolbar,
} from '@/features/wishlist/components'
import { useWishlist } from '@/features/wishlist/hooks/WishlistProvider'
import {
  Badge,
  Button,
  Card,
  PageHeader,
  Tabs,
} from '@/components/ui'
import { cn } from '@/lib/utils'

type ConnectionsTab = 'people' | 'conversations' | 'wishlist'

const tabs: { id: ConnectionsTab; label: string }[] = [
  { id: 'people', label: 'People' },
  { id: 'conversations', label: 'Conversations' },
  { id: 'wishlist', label: 'Wishlist' },
]

type Person = {
  id: string
  name: string
  relationship: string
  handle: string
  detail: string
  tone: 'teal' | 'violet' | 'amber'
}

const people: Person[] = [
  {
    id: 'p-faith',
    name: 'Faith Njeri',
    relationship: 'Workbook customer',
    handle: '@faith.njeri',
    detail: 'Last paid KSh 1,800 for the Money Reset Workbook.',
    tone: 'teal',
  },
  {
    id: 'p-wanjiku',
    name: 'Wanjiku Maina',
    relationship: 'Creator member',
    handle: '@wanjiku',
    detail: 'Starter membership renews on 12 November.',
    tone: 'violet',
  },
  {
    id: 'p-brian',
    name: 'Brian Otieno',
    relationship: 'Coaching client',
    handle: '@brian.otieno',
    detail: 'Two consultations completed this quarter.',
    tone: 'amber',
  },
  {
    id: 'p-mary',
    name: 'Mary Wambui',
    relationship: 'Consultation client',
    handle: '@mary.w',
    detail: 'Debt payoff plan pending confirmation.',
    tone: 'teal',
  },
  {
    id: 'p-equity',
    name: 'Equity Bank',
    relationship: 'Business partner',
    handle: '@equity',
    detail: 'Campaign deposit requested for youth budgeting series.',
    tone: 'violet',
  },
]

type Message = {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
}

type Conversation = {
  id: string
  name: string
  relationship: string
  unread: number
  messages: Message[]
}

const initialConversations: Conversation[] = [
  {
    id: 'conv-faith',
    name: 'Faith Njeri',
    relationship: 'Workbook customer',
    unread: 1,
    messages: [
      {
        id: 'm1',
        from: 'them',
        text: 'Hi Amina — I loved the workbook. Can I get the invoice for my records?',
        time: '09:12',
      },
      {
        id: 'm2',
        from: 'me',
        text: 'Of course. I have created a payment request and attached the reference.',
        time: '09:18',
      },
      {
        id: 'm3',
        from: 'them',
        text: 'Received, thank you. The budgeting template is already helping.',
        time: '09:24',
      },
    ],
  },
  {
    id: 'conv-wanjiku',
    name: 'Wanjiku Maina',
    relationship: 'Creator member',
    unread: 0,
    messages: [
      {
        id: 'm4',
        from: 'them',
        text: 'Will the November Q&A be recorded?',
        time: 'Yesterday',
      },
      {
        id: 'm5',
        from: 'me',
        text: 'Yes — the replay will be available to all Starter members.',
        time: 'Yesterday',
      },
    ],
  },
  {
    id: 'conv-brian',
    name: 'Brian Otieno',
    relationship: 'Coaching client',
    unread: 0,
    messages: [
      {
        id: 'm6',
        from: 'me',
        text: 'Your revised money plan is ready. I will send the summary shortly.',
        time: 'Mon',
      },
    ],
  },
]

export function ConnectionsPage() {
  const wishlist = useWishlist()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: ConnectionsTab = tabs.some((tab) => tab.id === tabParam)
    ? (tabParam as ConnectionsTab)
    : 'people'
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState(
    initialConversations[0].id,
  )
  const [draft, setDraft] = useState('')

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeConversationId) ??
    conversations[0]

  function setTab(tab: ConnectionsTab) {
    const next = new URLSearchParams(searchParams)
    next.set('tab', tab)
    setSearchParams(next)
  }

  function openConversation(id: string) {
    setActiveConversationId(id)
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, unread: 0 } : conversation,
      ),
    )
    setTab('conversations')
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              messages: [
                ...conversation.messages,
                {
                  id: `msg-${Date.now()}`,
                  from: 'me',
                  text,
                  time: 'Now',
                },
              ],
            }
          : conversation,
      ),
    )
    setDraft('')
  }

  return (
    <>
      <PageHeader
        eyebrow="Connections"
        title="People, conversations and the things you share."
        description="Keep relationships, payment context and wishlists together. Conversations are demo-only until a messaging backend is connected."
        actions={
          activeTab === 'wishlist' ? (
            <>
              <Button variant="secondary" onClick={wishlist.openImportGift}>
                Import gift
              </Button>
              <Button onClick={wishlist.openAddGift}>Add a gift</Button>
            </>
          ) : (
            <Button onClick={() => setTab('conversations')}>
              Open conversations
            </Button>
          )
        }
      />

      <Tabs
        className="mt-8"
        items={tabs.map((tab) => ({
          ...tab,
          count:
            tab.id === 'conversations'
              ? conversations.reduce((sum, conversation) => sum + conversation.unread, 0)
              : tab.id === 'wishlist'
                ? wishlist.stats.giftCount
                : undefined,
        }))}
        active={activeTab}
        onChange={setTab}
      />

      <div className="mt-6">
        {activeTab === 'people' && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {people.map((person) => (
              <Card key={person.id}>
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                      person.tone === 'teal' && 'bg-teal-400/15 text-teal-300',
                      person.tone === 'violet' && 'bg-violet-400/15 text-violet-300',
                      person.tone === 'amber' && 'bg-amber-400/15 text-amber-300',
                    )}
                  >
                    {person.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {person.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {person.handle} · {person.relationship}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  {person.detail}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const existing = conversations.find(
                        (conversation) =>
                          conversation.name === person.name,
                      )
                      if (existing) openConversation(existing.id)
                      else setTab('conversations')
                    }}
                  >
                    Message
                  </Button>
                  <Link
                    to="/payments?tab=send"
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-teal-400/40 hover:text-teal-200"
                  >
                    Send money
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <Card className="p-3">
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => openConversation(conversation.id)}
                    className={cn(
                      'w-full rounded-xl px-3 py-3 text-left transition',
                      conversation.id === activeConversation.id
                        ? 'bg-teal-400/10'
                        : 'hover:bg-white/5',
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-100">
                        {conversation.name}
                      </p>
                      {conversation.unread > 0 && (
                        <span className="rounded-full bg-teal-400 px-2 py-0.5 text-[10px] font-semibold text-slate-950">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {conversation.relationship}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-600">
                      {conversation.messages.at(-1)?.text}
                    </p>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="flex min-h-[520px] flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {activeConversation.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {activeConversation.relationship} · demo conversation
                  </p>
                </div>
                <Badge className="border-amber-400/25 bg-amber-400/5 px-2.5 py-0.5 text-[10px] text-amber-200">
                  No live messaging backend
                </Badge>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto py-5">
                {activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      message.from === 'me'
                        ? 'ml-auto bg-teal-400/10 text-teal-100'
                        : 'bg-slate-950/70 text-slate-300',
                    )}
                  >
                    {message.text}
                    <span className="mt-1 block text-[10px] text-slate-500">
                      {message.time}
                    </span>
                  </div>
                ))}
              </div>

              <form
                onSubmit={sendMessage}
                className="flex items-center gap-2 border-t border-white/10 pt-4"
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a demo message"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                />
                <Button type="submit">Send</Button>
              </form>
            </Card>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <>
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
        )}
      </div>
    </>
  )
}

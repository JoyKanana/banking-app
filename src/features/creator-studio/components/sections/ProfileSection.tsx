import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Badge, Card } from '@/components/ui'
import { formatNumber, formatPercent } from '../../lib/format'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import { Avatar, CopyButton, SectionHeading, Toggle } from '../shared'
import { CheckIcon } from '../icons'

const visibilityOptions: { value: 'public' | 'unlisted' | 'private'; label: string }[] = [
  { value: 'public', label: 'Public — listed and searchable' },
  { value: 'unlisted', label: 'Unlisted — direct link only' },
  { value: 'private', label: 'Private — payments paused' },
]

export function ProfileSection() {
  const creator = useCreatorStudio()
  const { profile, updateProfile, showToast } = creator

  const [displayName, setDisplayName] = useState(profile.displayName)
  const [username, setUsername] = useState(profile.username)
  const [category, setCategory] = useState(profile.category)
  const [bio, setBio] = useState(profile.bio)

  function handleVisibilityChange(event: ChangeEvent<HTMLSelectElement>) {
    updateProfile({
      profileVisibility: event.target.value as typeof profile.profileVisibility,
    })
    showToast('Profile visibility updated.', 'info')
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = displayName.trim()
    const trimmedUsername = username.trim()
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, '-')
      .replace(/^-|-$/g, '')

    if (!trimmedName || !trimmedUsername) {
      showToast('A display name and username are required.', 'warning')
      return
    }

    updateProfile({
      displayName: trimmedName,
      username: trimmedUsername,
      category: category.trim() || profile.category,
      bio: bio.trim() || profile.bio,
    })
    showToast('Public profile saved.')
  }

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="Creator profile"
        description="Your professional identity and public payment page. Your legal identity stays private."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start gap-5">
            <Avatar name={profile.displayName} size="lg" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  {profile.displayName}
                </h3>
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-0.5 text-xs font-medium text-teal-300">
                    <CheckIcon className="h-3 w-3" />
                    Verified
                  </span>
                )}
                <Badge className="px-3 py-1 text-xs">{profile.category}</Badge>
              </div>

              <p className="mt-1 font-mono text-sm text-teal-300">
                @{profile.username}
              </p>
              <p className="mt-3 text-sm text-slate-400">{profile.bio}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 font-mono text-xs text-slate-300">
                  {profile.publicUrl}
                </span>
                <CopyButton value={`https://${profile.publicUrl}`} label="Copy URL" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/5 pt-6 sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Profile views
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {formatNumber(profile.analytics.profileViews)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Link clicks
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {formatNumber(profile.analytics.linkClicks)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Conversion
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {formatPercent(profile.analytics.conversionRate)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Top country
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {profile.analytics.topCountry}
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <h3 className="font-semibold text-white">Contact and links</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Public email
                </dt>
                <dd className="mt-0.5 text-slate-300">{profile.publicEmail}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Support email
                </dt>
                <dd className="mt-0.5 text-slate-300">{profile.supportEmail}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Phone (private)
                </dt>
                <dd className="mt-0.5 text-slate-300">{profile.phone}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Website
                </dt>
                <dd className="mt-0.5 text-slate-300">{profile.website}</dd>
              </div>
            </dl>

            <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
              {profile.socials.map((social) => (
                <div
                  key={social.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-500">{social.label}</span>
                  <span className="text-slate-300">{social.handle}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-white">Legal identity</h3>
            <p className="mt-2 text-sm text-slate-400">
              Your legal name is used for verification, taxes and payouts. It is
              never shown on your public profile or payment pages.
            </p>
            <p className="mt-3 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-300">
              {profile.legalName}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {profile.country} · operating in {profile.currency}
            </p>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-white">Edit public profile</h3>
          <p className="mt-1 text-sm text-slate-400">
            Changes appear on your public payment page immediately.
          </p>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-display-name"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Display name
                </label>
                <input
                  id="profile-display-name"
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="profile-username"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Username
                </label>
                <input
                  id="profile-username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-category"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Creator category
              </label>
              <input
                id="profile-category"
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="e.g. Personal finance education"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>

            <div>
              <label
                htmlFor="profile-bio"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Public bio
              </label>
              <textarea
                id="profile-bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              >
                Save public profile
              </button>
            </div>
          </form>
        </Card>

        <div className="space-y-5">
          <Card>
            <h3 className="font-semibold text-white">Privacy and visibility</h3>
            <p className="mt-1 text-sm text-slate-400">
              Control what supporters can see.
            </p>

            <div className="mt-5">
              <label
                htmlFor="profile-visibility"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Profile visibility
              </label>
              <select
                id="profile-visibility"
                value={profile.profileVisibility}
                onChange={handleVisibilityChange}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              >
                {visibilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 space-y-3">
              <Toggle
                label="Show earnings on public page"
                description="Display a total earnings figure to visitors."
                checked={profile.showEarnings}
                onChange={(checked) =>
                  updateProfile({ showEarnings: checked })
                }
              />
              <Toggle
                label="Show recent supporters"
                description="List your latest supporters on your profile."
                checked={profile.showSupporters}
                onChange={(checked) =>
                  updateProfile({ showSupporters: checked })
                }
              />
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-white">Professional portfolio</h3>
            <p className="mt-1 text-sm text-slate-400">
              Highlighted work shown to customers and brands.
            </p>
            <ul className="mt-4 space-y-3">
              {profile.portfolio.map((item) => (
                <li
                  key={item.title}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-slate-950/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">{item.type}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-teal-300">
                    {item.metric}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  )
}

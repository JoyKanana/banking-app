# Project Relay — Architecture Plan

Last updated: 2026-11-10

## Current Architecture

Project Relay is a client-side React single-page application.

- React 19
- Vite 8
- TypeScript 7
- Tailwind CSS 4
- React Router 7
- Oxlint

The application is feature-first, with shared domain state under `src/domain` and feature-specific UI under `src/features`.

### Provider Graph

```text
AccountProvider
└── MoneyProvider
    └── WishlistProvider
        └── CreatorStudioProvider
            └── RouterProvider
```

### Source of Truth

- `AccountProvider` owns profile, services, country availability, privacy, auth, sessions, disputes, risk signals and notifications.
- `MoneyProvider` owns subaccounts, transactions, ledger entries, payment requests, payment links, bills, scheduled payments, cards, goals, budgets, limits, destinations and FX rates.
- `WishlistProvider` owns wishlist lists, gifts, filters and local mutations.
- `CreatorStudioProvider` derives creator data from the shared money and account stores, while keeping some creator-only state local.

Balances are derived from `LedgerEntry[]`; Creator Studio is a sub-ledger of the same account, not a separate wallet.

## Current Constraints

1. No backend, API, authentication or authorization.
2. Account, money, wishlist and creator state use a versioned `localStorage` demo adapter; there is still no server persistence.
3. External rails are sandbox representations and never move real money.
4. Amounts are floating-point numbers rather than integer minor units.
5. Vitest is configured with initial ledger invariant tests; broader workflow coverage is still needed.
6. The former root application and nested `banking-app/` workspace have been merged; `src/` at the repository root is the single authoritative application.

## Target Architecture

### Principles

1. Preserve existing routes, workflows and visual language.
2. Keep one financial account with purpose-specific subaccounts and views.
3. Make every balance derive from the ledger.
4. Separate domain rules from presentation.
5. Keep external providers behind typed adapters.
6. Make demo, sandbox and live behavior explicit in the UI and code.
7. Enforce entitlements by service, country, age and provider approval.
8. Add tests around money movement and ledger invariants before provider work.

### Proposed Layers

```text
src/
├── app/                 # providers, router, composition
├── components/          # shared presentation and layout
├── domain/              # ledger, accounts, entitlements, money types
├── features/            # feature UI and feature-specific state
├── services/            # repository and provider interfaces
├── lib/                 # framework-agnostic helpers
└── pages/               # route composition
```

### Repository Interfaces

Introduce typed repositories before adding more pillars:

- `AccountRepository`
- `LedgerRepository`
- `WishlistRepository`
- `CreatorRepository`
- `MessagingRepository`
- `FamilyRepository`
- `BusinessRepository`
- `NotificationRepository`

Start with in-memory or `localStorage` demo adapters. Replace them with API adapters later without changing feature components.

### Money Model

Before real provider integration:

- Store amounts as integer minor units plus `CurrencyCode`.
- Centralise rounding and fee calculations.
- Keep FX rates and quotes versioned with expiry.
- Add ledger invariant tests for debits, credits, reversals and cross-currency transfers.
- Add idempotency enforcement and audit metadata.

### Entitlements

Centralise service access:

```text
entitlement = service + country + age verification + provider approval
```

The pure policy lives in `src/domain/access/entitlements.ts` and is covered by tests. It currently returns a reason code so the UI can explain whether a service is disabled, unavailable in the country, awaiting age verification or awaiting provider approval.

Use the same rules for navigation visibility, subaccount creation, payout destinations, professional tools, family members and business roles.

### Persistence

Phase 2 should add a demo persistence adapter so state survives refreshes. The adapter should be versioned, safe to reset, and clearly separate seeded data from user-created data.

### Testing

Current baseline:

- Vitest is configured via `npm test`.
- Ledger builders, balances, integrity checks and reversals have initial unit coverage.

Recommended next:

- Unit tests for selectors, fee calculations and entitlements.
- Component tests for critical forms and empty/error states.
- Integration tests for transfers, deposits, withdrawals and creator earnings.
- Build, typecheck, lint and test in CI.

## Pillar Implementation Order

1. Foundation: persistence, entitlements, money hardening, tests and docs.
2. Family Circle.
3. Business Studio.
4. Messaging.
5. Professional/adult workspace.
6. Wishlist funding.
7. Premium tiers.
8. Pan-African access and provider expansion.
9. Future financial expansion.

## Non-Goals

- No real money movement until compliance, licensing and provider approvals exist.
- No removal of existing routes or legacy pages without explicit approval.
- No migration to a different framework during the current implementation.
- No real API keys or secrets committed to the repository.

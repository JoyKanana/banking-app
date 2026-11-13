# Project Relay — Implementation Inventory

Last updated: 2026-11-10

## Purpose

This document is the Phase 1 audit and implementation register for Project Relay. It records what exists, what is demo-only, what is missing, and the agreed implementation order. It must be updated whenever a pillar or shared capability changes status.

## Status Legend

| Status | Meaning |
| --- | --- |
| Implemented | Working end-to-end in the current frontend, backed by shared state where relevant. |
| Partial | Some workflows exist, but important capabilities or integration paths are missing. |
| Frontend demo | UI and local state work, but there is no backend, persistence or real provider. |
| Sandbox | External rail or provider is represented but intentionally does not move real money. |
| Planned | Not implemented yet. |
| Blocked | Cannot proceed without a product, compliance or provider decision. |

## Current Verification

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run build` | Pass |
| `npm run lint` | Pass with pre-existing warnings |
| `npm test` | 16 ledger and entitlement tests passing |

## Authoritative Application

Implementation continues at the repository root, `/home/joy/project-relay`.

The former duplicate root application, stale `.next/` artifacts and nested `banking-app/` workspace have been merged into a single application. `src/` at the repository root is now the only authoritative source tree.

## Route Map

| Route | Purpose |
| --- | --- |
| `/` | Overview |
| `/money` | Subaccounts, activity, transfers, savings, cards |
| `/payments` | Send, track, requests, links, bills, scheduled payments |
| `/connections` | People, demo conversations, wishlist |
| `/work` | Creator Studio and business/commerce tools |
| `/insights` | Cash flow, spending, creator performance, reports |
| `/discover` | Demo directory of creators, products and opportunities |
| `/account` | Profile, services, security, preferences, notifications |

Legacy routes redirect to the current structure. `/creator-studio` preserves its `section` query string.

## Pillar Inventory

| Pillar | Implemented | Status | Gaps |
| --- | --- | --- | --- |
| Unified multi-currency wallet | Subaccounts, shared double-entry ledger, balances, transfers, FX quotes, deposits, withdrawals, cards, goals, budgets, bills, scheduled payments, limits, requests, links, reversals | Frontend demo | In-memory state; static FX; floating-point amounts; sandbox rails; no persistence or provider integration |
| Creator Studio | 18 sections including wallet, analytics, security and settings; payment links, subscriptions, tips, storefront, invoices, customers, campaigns, partnerships, payouts, expenses, assistant, automations | Frontend demo | Static content in several sections; rule-based assistant; automations toggle only; payouts and webhooks sandbox |
| Adult-industry inclusion | `professional` service, subaccount, age-verification flag, provider-approval fields, restricted country availability | Partial | No professional workspace, consent flow, age gate, provider approval workflow, separate identity or payout controls |
| Wishlist Studio | Lists, gifts, imports, pinning, privacy, sharing, filters, stats | Frontend demo | No cash/crowdgift funding, ledger integration, checkout, real retailer import or contributor flow |
| Family Circle | None | Planned | Entire feature missing |
| Business Studio | Business service, invoices, customers, expenses, storefront, partnerships | Partial | No payroll, vendors, reconciliation, tax workflows, team roles, approvals or multi-user access |
| Messaging | Connections people/conversations, local send, unread counts | Frontend demo | No backend, real-time delivery, attachments, payment-in-chat, moderation or persistence |
| Pan-African access | Five countries modelled; rails list countries and currencies; only Kenya active | Partial | No localisation, per-country KYC, licensing, local rails or regulatory rules |
| Premium tiers | Creator membership plans | Partial | No Relay account premium plans, entitlements, billing, gating, upgrades or downgrades |
| Unified architecture | Shared providers, ledger, UI primitives, feature modules | Partial | Duplicate root app; unused legacy pages; mixed boundaries; no repository/service layer; no tests |
| Future financial expansion | Sandbox rails for M-PESA, card, bank, SWIFT, Wise, PayPal, USDC, QR and bills; crypto payout | Sandbox | No real integrations, licensing, risk controls, betting, investment, credit or insurance |

## Detailed Feature Register

### Money and Ledger

| Capability | Status | Notes |
| --- | --- | --- |
| Shared subaccounts | Implemented | Personal, creator, business, commerce, professional, savings and bills. |
| Double-entry ledger | Implemented | Transactions build balanced entries; integrity selector exists. |
| Multi-currency balances | Implemented | KES, USD, EUR, GBP, NGN, ZAR. |
| FX quotes | Partial | Static rates and estimated fee. |
| Transfers | Implemented | Same-currency and cross-currency transfers. |
| Deposits and withdrawals | Sandbox | Ledger-backed but no real money movement. |
| Cards, goals, budgets, limits | Frontend demo | Local state only. |
| Bills and scheduled payments | Frontend demo | Local state only. |
| Payment requests and links | Frontend demo | Local state only. |
| Reversals | Implemented | Reversal entries created in the shared ledger. |
| Persistence | Frontend demo | Account, money, wishlist and creator state persist in `localStorage`. No backend yet. |
| Integer minor units | Planned | Current amounts use floating-point numbers. |

### Creator Studio

| Capability | Status | Notes |
| --- | --- | --- |
| Overview, profile, payment links, subscriptions, tips, storefront | Frontend demo | Some sections use seeded content. |
| Invoices, customers, campaigns, partnerships | Frontend demo | Invoices and campaign contributions can write to the shared ledger. |
| Payouts and destinations | Sandbox | No real provider. |
| Expenses | Implemented | Writes to the shared ledger. |
| Wallet statement and fees | Implemented | Restored as an accessible Creator Studio section. |
| Analytics and CSV export | Implemented | Restored as an accessible Creator Studio section. |
| Security, login history and data exports | Implemented | Restored as an accessible Creator Studio section. |
| Settings, API key, webhooks and team access | Frontend demo | Restored; API key is fake and webhook save is local-only. |
| AI assistant | Frontend demo | Rule-based over recorded data. |
| Automations | Frontend demo | Toggles local state only. |

### Connections and Wishlist

| Capability | Status | Notes |
| --- | --- | --- |
| People directory | Frontend demo | Seeded contacts. |
| Conversations | Frontend demo | Local send and unread updates only. |
| Wishlist lists and gifts | Implemented | Add, pin, filter, sort, privacy and stats. |
| Retailer import | Frontend demo | Seeded import flow. |
| Wishlist sharing | Implemented | Share links point to `/connections?tab=wishlist&gift=...`. |
| Cash and crowdgift funding | Planned | No ledger integration or contributor flow. |

### Account and Access

| Capability | Status | Notes |
| --- | --- | --- |
| Profile and services | Implemented | Service toggles, country availability and professional restrictions. |
| Age verification | Partial | Local flag only; no verification provider. |
| Privacy and auth preferences | Frontend demo | Local state only. |
| Sessions and disputes | Frontend demo | Revoke/trust sessions locally. |
| Notifications | Implemented | Shared notification store with deep links. |
| Roles and permissions | Planned | Permissions exist in service data but are not enforced. |
| Family Circle | Planned | Missing. |

## Feature Register

| Feature | Existing status | Required work | Dependencies | Backend status | Frontend status | Integration status | Testing status | Limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Unified wallet and subaccounts | Frontend demo | Repository layer, server persistence, minor units | Auth, ledger service | Not started | Partial | Sandbox | Ledger unit tests started | State is local; no real money movement |
| Double-entry ledger | Implemented in frontend | Server ledger, reconciliation jobs, audit trail | Database, auth | Not started | Complete | Sandbox | Unit tested | Floating-point amounts; no concurrency control |
| FX and multi-currency | Partial | Versioned rates, conversion ledger postings, provider adapters | FX provider, treasury | Not started | Partial | Sandbox | Not tested | Static rates; no live quotes |
| Payments and requests | Frontend demo | Server payment intents, idempotency, webhooks | Provider adapters | Not started | Partial | Sandbox | Not tested | No real provider confirmation |
| Creator Studio | Frontend demo | Persist creator records, real payouts, supporter CRM, provider approvals | Payments, KYC, providers | Not started | Complete UI | Sandbox | Not tested | Several sections seeded; assistant rule-based |
| Wishlist Studio | Frontend demo | Cash contributions, crowdgifts, checkout, retailer import adapters | Payments, retailer APIs | Not started | Complete UI | Sandbox | Not tested | No funding or purchase completion flow |
| Family Circle | Planned | Beneficiaries, permissions, goals, contributions, summaries | Wallet, messaging, auth | Not started | Not started | Not started | Not tested | Entire feature missing |
| Business Studio | Partial | Payroll, vendors, reconciliation, tax, roles, reporting, API/webhooks | Auth, wallet, accounting | Not started | Partial | Sandbox | Not tested | No team or multi-user controls |
| Messaging | Frontend demo | Real-time transport, attachments, voice notes, payment sharing, moderation | Messaging provider, auth | Not started | Partial | Sandbox | Not tested | Local demo conversations only |
| Adult professional workspace | Partial | Age gate, consent, provider approval, private pages, payout controls | KYC, providers, compliance | Not started | Partial | Unavailable | Not tested | Only service flags and restrictions exist |
| Premium tiers | Partial | Relay Plus, Creator Pro, Business Pro, entitlements, billing | Billing provider | Not started | Partial | Sandbox | Not tested | No account-level subscription system |
| Country availability | Partial | Country-aware entitlements, localisation, local rails | Licensing, providers | Not started | Partial | Sandbox | Not tested | Only Kenya has active financial services |
| Notifications and activity | Implemented in frontend | Server events, delivery channels, preferences enforcement | Event bus, backend | Not started | Complete UI | Sandbox | Not tested | Local state only |
| Auth, roles and permissions | Planned | Authentication, sessions, RBAC, server-side authorization | Identity provider | Not started | Partial UI | Not started | Not tested | Permissions are not enforced |
| Support and safety centre | Planned | Help centre, disputes, fraud reporting, status page | Backend, operations | Not started | Not started | Not started | Not tested | Missing |
| Admin and operations | Planned | User, verification, reconciliation, risk, provider and audit tools | Backend, RBAC | Not started | Not started | Not started | Not tested | Missing |
| Crypto and betting expansion | Planned | Authorised provider adapters, jurisdiction controls, responsible gambling | Licences, providers | Not started | Not started | Unavailable | Not tested | Must not be simulated as live |

## Preservation Risks

1. Creator Studio wallet, analytics, security and settings were previously unreachable. They are now restored as accessible sections.
2. Old `WalletPage`, `BusinessPage`, `MessagesPage` and `WishlistPage` remain unused. Do not delete without approval.
3. The settings screen exposes a fake “live” API key and reports webhook saves via toast only.
4. All saved actions reset on refresh because state is in memory.
5. Financial flows are client-only and use floating-point amounts.
6. There is no authentication, authorization, audit trail or real provider integration.

## Implementation Phases

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Audit, inventory and architecture plan | Complete |
| 1 | Restore unreachable Creator Studio capabilities and preserve legacy URLs | Complete |
| 2 | Demo persistence and repository interfaces | Partial — persistence complete, repository interfaces pending |
| 3 | Entitlements, country and age gating | Partial — pure entitlement policy and tests complete; UI enforcement pending |
| 4 | Money hardening and ledger tests | Partial — ledger tests complete, minor units pending |
| 5 | Family Circle | Planned |
| 6 | Business Studio | Planned |
| 7 | Messaging | Planned |
| 8 | Professional/adult workspace | Planned |
| 9 | Wishlist funding | Planned |
| 10 | Premium tiers | Planned |
| 11 | Pan-African access and provider expansion | Planned |

## Change Log

| Date | Change |
| --- | --- |
| 2026-11-10 | Completed Phase 1 audit and inventory. |
| 2026-11-10 | Restored Creator Studio wallet, analytics, security and settings sections. |
| 2026-11-10 | Preserved `/creator-studio` section query strings during redirect. |
| 2026-11-10 | Added demo persistence for account, money, wishlist and creator state. |
| 2026-11-10 | Added Vitest and initial ledger invariant tests. |
| 2026-11-10 | Added central service entitlement policy with country, age and provider checks. |
| 2026-11-13 | Merged the duplicate root app and nested `banking-app/` workspace into one application at the repository root. |

# Project Relay

A connected digital ecosystem for money, people and business.

This project is a **React + TypeScript** application powered by **Vite 8** and
styled with **Tailwind CSS 4**.

## Getting started

```bash
npm install
npm run dev
```

The development server runs at [http://localhost:5173](http://localhost:5173).

## Scripts

| Command           | Description                                |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Start the Vite development server.         |
| `npm run build`   | Type-check and build for production.       |
| `npm run preview` | Preview the production build locally.      |
| `npm run lint`    | Lint the project with Oxlint.              |
| `npm test`        | Run the Vitest suite once.                 |
| `npm run test:watch` | Run Vitest in watch mode.               |
| `npm run typecheck` | Run the TypeScript compiler.             |

## Project structure

```text
src/
├── app/                  # Root component, providers and router
├── assets/
│   └── styles/           # Global styles and Tailwind theme
├── components/
│   ├── layout/           # Application shell: sidebar, mobile nav, notifications
│   ├── money/            # Shared money presentation components
│   └── ui/               # Reusable, presentation-only UI primitives
├── config/               # Static application configuration (navigation, etc.)
├── domain/               # Account, money, ledger and entitlement logic
├── features/             # Feature modules, grouped by domain
│   ├── creator-studio/   # Creator Studio UI, state and data
│   ├── dashboard/        # Overview feature components
│   └── wishlist/         # Wishlist UI, state and data
├── hooks/                # Shared React hooks
├── lib/                  # Framework-agnostic helpers and utilities
├── pages/                # Route-level screens
├── types/                # Shared TypeScript types
├── main.tsx              # React root
└── vite-env.d.ts         # Vite type references
docs/                     # Architecture plan and implementation inventory
```

This repository contains a single Project Relay application. The former root
application and the nested `banking-app/` workspace have been merged into the
layout above; `src/` is the only application source tree.

### Conventions

- **Feature-first:** feature UI and feature-specific state live in
  `src/features/<feature>`. Shared domain rules live in `src/domain`, reusable
  UI in `src/components`, hooks in `src/hooks` and helpers in `src/lib`.
- **Pages compose features:** files in `src/pages` are route entry points and
  should stay thin.
- **Path aliases:** import from `@/` instead of long relative paths, e.g.
  `import { Card } from '@/components/ui/Card'`.
- **One component per file**, named exports, and colocated types/data.

## Tech stack

- [React 19](https://react.dev/)
- [Vite 8](https://vite.dev/)
- [TypeScript 7](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [React Router 7](https://reactrouter.com/)
- [Oxlint](https://oxc.rs/docs/guide/usage/linter)

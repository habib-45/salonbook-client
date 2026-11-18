# SalonBook — Salon Appointment Booking (Frontend)

A responsive, editorial salon booking experience built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**. Guests can explore a curated service menu, request appointments, and pay once the salon confirms. Customers manage their own bookings and profile, while admins run the service menu, approval queue, customer access, and transaction reporting from a dedicated dashboard.

> **Demo notice:** this repository is the frontend with a fully interactive, browser-local data layer. There is no Express/MongoDB server connected yet, so authentication, image uploads, and payments are simulated with `localStorage`. Google sign-in and Stripe checkout are clearly labeled demonstrations. The data layer is isolated behind typed actions so it can be replaced with real API calls without rewriting the UI.

## Table of contents

- [Demo accounts](#demo-accounts)
- [Features](#features)
- [Routes](#routes)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [How the demo works](#how-the-demo-works)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Quality checks](#quality-checks)
- [Limitations and backend roadmap](#limitations-and-backend-roadmap)
- [Documentation](#documentation)

## Demo accounts

The sign-in page can fill these credentials for you.

| Role | Name | Email | Password |
| --- | --- | --- | --- |
| Customer | Sofia Bennett | `customer@salonbook.com` | `Customer123` |
| Admin | Amara Chen | `admin@salonbook.com` | `Admin123` |
| Customer (Google demo) | Ava Thompson | `ava.google@salonbook.com` | _no password — use the Google demo button_ |
| Blocked customer (for testing) | Noah Williams | `noah@example.com` | `Customer123` |

The seeded database includes active and inactive services, pending, confirmed, and cancelled appointments, paid and failed transactions, and one blocked customer so every admin flow can be reviewed immediately.

## Features

### Public experience

- **Home page** with a warm, editorial hero, featured services, category discovery, salon philosophy, testimonials, visit details, and a closing booking call to action.
- **Browse services** with live search by name, category filtering, and sorting by recommended, price ascending/descending, or duration.
- **Service details** with imagery, price, duration, category, an "experience" overview, and a protected appointment request form.
- **Sign in and sign up** with inline validation, password visibility controls, live password rules, an optional profile photo, and demo-account shortcuts.
- **Simulated Google sign-in** that creates or reuses a demo Google customer account.
- **Responsive navigation** with a mobile drawer, account-aware actions, and accessible focus states.
- **Branded 404, error boundary, and loading states** at the app and dashboard levels.

### Customer dashboard

- **Overview** with total, pending, upcoming, and completed appointment counts, total spend, next visit, pending requests, outstanding payment prompts, recent activity, and service recommendations.
- **My appointments** with status and search filters, date and time details, cancellation for pending requests, and checkout for confirmed unpaid visits.
- **Booking rules** that prevent past dates, invalid slots, inactive services, admin bookings, blocked accounts, and duplicate active slots for the same customer.
- **Payment flow** for confirmed appointments with card-field validation, a demo-card filler, duplicate-payment protection, a printable receipt, and a cancellation return page.
- **Editable profile** with name, phone, compressed profile photo, account metadata, and a guarded demo-data reset.

### Admin dashboard

- **Overview** with pending approvals, today's schedule, upcoming visits, revenue, transaction count, active services, customer totals, blocked accounts, and unpaid confirmed visits.
- **Service management** with search, category and status filters, add/edit modal, service-card preview, image upload, activate/deactivate, and deletion blocked when appointment history exists.
- **Appointment management** with status and payment filters, customer/service search, confirm, cancel, and joined customer/service details.
- **Customer management** with search, blocked/active filters, visit and spend summaries, and block/unblock confirmation.
- **Transaction reporting** with paid/failed filters, customer and service joins, copyable demo Stripe session IDs, and a working CSV export of the filtered report.
- **Shared profile** for administrators, plus role-aware navigation that never exposes admin links to customers.

### Quality and UX

- Role-based gates around every protected route, including customer-only and admin-only pages.
- Blocked-account screens and sign-in rejection with clear recovery paths.
- Toast notifications for every action; no `alert()`, `confirm()`, or `prompt()`.
- Loading skeletons, disabled/submitting buttons, empty states, and inline field errors.
- Responsive layouts across mobile, tablet, and desktop.
- Accessible dialogs, labels, error messages, keyboard escape handling, and focus-visible styles.
- A single warm design system documented in [docs/design-system.md](docs/design-system.md).

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Editorial home page |
| `/services` | Public | Searchable, filterable service menu |
| `/services/[id]` | Signed-in user | Service details and appointment request |
| `/signin` | Public | Sign in with credentials or demo Google |
| `/signup` | Public | Create a customer account |
| `/dashboard` | Protected | Role-based customer or admin overview |
| `/dashboard/appointments` | Customer only | Appointment list, cancel, and pay |
| `/dashboard/profile` | Protected | Edit profile and reset demo data |
| `/dashboard/payments/[id]` | Customer only | Demo checkout for a confirmed appointment |
| `/dashboard/payments/[id]/success` | Customer only | Payment receipt |
| `/dashboard/payments/[id]/cancel` | Customer only | Checkout cancellation state |
| `/dashboard/admin` | Admin only | Redirects to `/dashboard` |
| `/dashboard/admin/services` | Admin only | Service CRUD and availability |
| `/dashboard/admin/appointments` | Admin only | Confirm and cancel appointments |
| `/dashboard/admin/users` | Admin only | Customer directory and access control |
| `/dashboard/admin/transactions` | Admin only | Transaction report and CSV export |

Unauthenticated visitors to a protected route are redirected to `/signin` with a safe `callbackUrl`. A signed-in user who opens a route for the other role is redirected to their own dashboard with a toast.

## Tech stack

- **Framework:** Next.js 16.4 (App Router, server components, metadata API)
- **UI:** React 19, Tailwind CSS v4, local design-system primitives
- **Language:** TypeScript 5 in strict mode
- **Icons:** lucide-react
- **Fonts:** Cormorant Garamond (display) and Manrope (body) via `next/font/google`
- **State:** React context + `localStorage` for the demo data layer
- **Notifications:** custom toast provider with accessible live regions
- **Images:** `next/image` for remote imagery; canvas compression for local uploads
- **Tooling:** ESLint 9, Next.js ESLint config, TypeScript `--noEmit`

No component library runtime is required beyond the local primitives in `components/ui`.

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app seeds itself on first load. No environment variables are required for the demo.

### Production build

```bash
npm run build
npm run start
```

If your environment has a stale `.next` cache or an unusual monorepo layout, remove `.next` and rebuild.

## How the demo works

1. **Seed** — `lib/seed.ts` builds a fresh database with realistic users, services, appointments, and transactions. Dates are relative to the day the database is first created.
2. **Persist** — `components/providers/store-provider.tsx` hydrates from `localStorage` after mount, then writes every change back. The database and session use versioned keys:
   - `salonbook.demo.database.v1`
   - `salonbook.demo.session.v1`
3. **Act** — the provider exposes typed actions for sign-in, sign-up, profile updates, service CRUD, booking, cancellation, confirmation, payment, and blocking. These actions enforce the same business rules the real API should enforce.
4. **Derive** — `lib/selectors.ts` joins appointments to services and customers and calculates dashboard statistics so every view is consistent.
5. **Reset** — use **Reset demo data** on the profile page, or clear the two keys above from browser storage. A private window also starts with a fresh seed.

Because the data is per-browser, changes do not sync between tabs beyond the `storage` event, devices, or users. Passwords and payment details are demo-only and must never be treated as secure.

## Environment variables

The demo runs with **no environment variables required**. `.env.example` documents the names reserved for the future integration. Copy it to `.env.local` when those services are connected:

```bash
cp .env.example .env.local
```

| Variable | Currently used | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Yes | Public origin used by metadata and future payment redirects. Defaults to `http://localhost:3000`. |
| `NEXT_PUBLIC_API_URL` | Reserved | Base URL of the Express API. |
| `NEXT_PUBLIC_IMGBB_API_KEY` | Reserved | ImgBB key for image uploads once the API proxies them. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Reserved | Stripe publishable key for Checkout. |
| `NEXT_PUBLIC_DEMO_MODE` | Reserved | Toggles demo-only messaging when the backend is introduced. |

Server-only secrets (MongoDB URI, Better Auth secret, Stripe secret key, webhook signing secret, ImgBB key if kept private) belong in the server project and must never be committed to this client.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint across the project |
| `npm run typecheck` | Run TypeScript with no emit |

## Project structure

```text
app/
  (auth)/                 Sign-in and sign-up screens
  (marketing)/            Home, service menu, and service detail
  dashboard/              Protected shell, customer pages, admin pages, payments
  error.tsx               Root error boundary
  loading.tsx             Root loading state
  not-found.tsx           Custom 404
components/
  auth/                   Auth gate, forms, demo accounts, Google button
  dashboard/              Dashboard shell, views, forms, checkout, receipts
  marketing/              Home page, navbar, footer, service browser and cards
  providers/              Store, toast, and composed app providers
  ui/                     Buttons, fields, dialogs, feedback, image upload, badges
lib/
  constants.ts            Categories, time slots, salon details, demo accounts
  seed.ts                 Seeded demo database
  selectors.ts            Joined data and dashboard statistics
  types.ts                Domain and action types
  utils.ts                Formatting, validation, date, and sorting helpers
docs/
  project-documentation.md
  design-system.md
```

The source of truth for the UI is the App Router in `app/`. Components are feature-grouped; reusable primitives do not depend on feature code.

## Quality checks

The project is verified with:

```bash
npm run typecheck
npm run lint
npm run build
```

The development smoke test covers `/`, `/services`, `/services/service_1`, `/signin`, `/signup`, `/dashboard`, and `/dashboard/admin/services`, plus a 404 route.

See [docs/project-documentation.md](docs/project-documentation.md) for the requirement map, data model, business rules, and QA checklist.

## Limitations and backend roadmap

- Demo credentials, sessions, password storage, and payments live in the browser and are **not secure**.
- Google sign-in and Stripe checkout are simulations, not live OAuth or payment integrations.
- Data is per-browser and does not survive clearing site storage.
- Uploaded images are compressed to data URLs; no image host is called.
- Admin and customer authorization is enforced client-side by the demo store. The real backend must enforce every rule independently.

The planned backend integration:

1. Replace the typed demo actions with `fetch` calls to the Express API.
2. Move authentication to Better Auth and validate sessions on the server.
3. Upload images to ImgBB (or another provider) from the API.
4. Create Stripe Checkout Sessions on the server and mark appointments paid only from a verified webhook.
5. Hash passwords, keep all secrets server-side, and enforce role, ownership, status, and duplicate-slot rules in the API.

## Documentation

- [Project documentation](docs/project-documentation.md) — requirement mapping, architecture, data model, flows, QA checklist, and integration plan.
- [Design system](docs/design-system.md) — tokens, typography, components, patterns, motion, and accessibility.

## Author

Built as part of the Programming Hero full-stack assignment series.

- **Name:** _Add your name_
- **GitHub:** _Add your GitHub profile_
- **Email:** _Add your contact email_

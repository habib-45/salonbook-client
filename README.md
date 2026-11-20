# SalonBook - Salon Appointment Booking (Client)

A responsive, editorial salon booking experience built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**. Guests discover the salon and browse the menu, customers request and manage appointments, and admins run services, approvals, customers, and payments from a dedicated dashboard.

This client is wired end-to-end to the separate **SalonBook API** (Express, MongoDB, **Better Auth**, Stripe, ImgBB). Authentication, bookings, images, and payments are handled by the server; the browser stores only the signed Better Auth JWT.

## Live links

| Service | URL |
| --- | --- |
| Live client | https://salonbook-client-sandy.vercel.app |
| Live API | https://salonbook-api-mu.vercel.app |
| API health | https://salonbook-api-mu.vercel.app/api/health |
| Client (local) | http://localhost:3000 |
| API (local) | http://localhost:5000 |

## Repositories

| Repository | URL |
| --- | --- |
| Client | https://github.com/habib-45/client-side-9 |
| Server | https://github.com/habib-45/serside-9 |

## Demo accounts

The sign-in page can fill these credentials for you. They come from the server's `npm run seed:demo` or full `npm run seed` snapshot.

| Role | Name | Email | Password |
| --- | --- | --- | --- |
| Customer | Sofia Bennett | customer@salonbook.com | Customer123 |
| Admin | Amara Chen | admin@salonbook.com | Admin123 |
| Customer (Google demo) | Ava Thompson | ava.google@salonbook.com | no password - use the Google button |
| Blocked customer | Noah Williams | noah@example.com | Customer123 |

The seed also includes active and paused services, pending, confirmed, and cancelled appointments, and paid and failed transactions so every flow can be reviewed immediately.

## Features

### Public experience

- **Home page** with an editorial hero, featured services, category discovery, salon philosophy, testimonials, visit details, and booking calls to action.
- **Browse services** with live search by name, category filters, and sorting by recommended, price ascending/descending, or duration.
- **Sign in / sign up** with validation, show-password controls, an optional profile photo on sign-up, and one-tap demo credentials.
- **Google sign-in** through Google Identity Services. If the server has no OAuth client ID, a clearly seeded Google account is available when demo mode is enabled.
- **Light and dark theme** with a one-tap toggle, system-theme detection, and no flash on first paint.
- Responsive navigation, mobile menu, accessible controls, and toast notifications.

### Customer experience

- **Overview** with total requests, pending requests, confirmed visits, cancelled requests, upcoming visits, payment reminders, and recommended services.
- **Appointments** with status and payment filters, search, request timestamps, cancellation of pending requests, and payment entry points for confirmed visits.
- **Secure Stripe checkout** for confirmed unpaid appointments. Card details are entered on Stripe, not in this app.
- **Payment receipt** that polls the API until the verified Stripe webhook marks the appointment paid.
- **Profile** update for name, phone, and photo. Images are uploaded to ImgBB by the API.
- **Protected service details** with a booking form, date limits, slot availability for the signed-in customer, and success confirmation.

### Admin experience

- **Overview** with registered customers, active services, total requests, pending requests, confirmed visits, successful payments, today's schedule, and quick actions.
- **Service management** with create, edit, activate/pause, and delete. Services with appointment history can be paused instead of deleted.
- **Appointment management** to confirm pending requests and cancel pending or confirmed visits.
- **Customer management** with search, status filters, salon history, and block/unblock controls.
- **Transactions** with paid/failed filters, search, totals, and CSV export.
- **Profile** with the same secure update flow as customers.

### Platform behavior

- **Better Auth JWT** stored in `localStorage` and verified by the API on every request.
- Role-based route protection in the UI and role verification on the server.
- Blocked accounts are signed out and blocked from every protected endpoint.
- No `alert()` or `confirm()` - all feedback uses accessible toasts and dialogs.
- Loading skeletons, empty states, inline validation, error boundaries, and an API connection banner.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Home page |
| `/services` | Public | Search, filter, and sort services |
| `/services/[id]` | Signed in | Service detail and booking |
| `/signin` | Public | Sign in |
| `/signup` | Public | Create a customer account |
| `/dashboard` | Customer/Admin | Role-aware overview |
| `/dashboard/appointments` | Customer | Customer appointment list |
| `/dashboard/payments/[id]` | Customer | Stripe checkout handoff |
| `/dashboard/payments/[id]/success` | Customer | Payment confirmation and receipt |
| `/dashboard/payments/[id]/cancel` | Customer | Checkout cancelled |
| `/dashboard/profile` | Customer/Admin | Profile settings |
| `/dashboard/admin` | Admin | Salon overview |
| `/dashboard/admin/services` | Admin | Service management |
| `/dashboard/admin/appointments` | Admin | Appointment management |
| `/dashboard/admin/users` | Admin | Customer management |
| `/dashboard/admin/transactions` | Admin | Transaction report |

## Tech stack

- Next.js 16 App Router (Turbopack)
- React 19
- TypeScript (strict)
- Tailwind CSS v4
- Lucide icons
- Google Identity Services
- Stripe Checkout (redirect flow)
- Express 5 + MongoDB API with Better Auth in the companion [`serside-9`](https://github.com/habib-45/serside-9) repository

## Getting started

### Prerequisites

- Node.js 20 or newer
- The SalonBook API running at `http://localhost:5000`
- A seeded MongoDB database (see the server README)

### Install

```bash
npm install
```

### Configure

Copy `.env.example` to `.env`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`NEXT_PUBLIC_API_URL` must include the `/api` prefix.

### Run

```bash
npm run dev
```

Open http://localhost:3000.

### Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment variables

Names only; never commit real values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the Express API, including `/api` |
| `NEXT_PUBLIC_APP_URL` | No | Public origin used for metadata |

Server-only secrets (Better Auth, MongoDB, Stripe, ImgBB, Google) live in the API repository and are never exposed to the client.

## How authentication works

1. The client posts credentials to `/api/auth/login` or `/api/auth/register`.
2. Express delegates credential verification to **Better Auth**, which checks the bcrypt hash in its MongoDB `account` collection.
3. The API returns a JWT signed by the Better Auth JWT plugin plus the safe user object.
4. The client stores the token under `salonbook.token` and sends it as `Authorization: Bearer <token>`.
5. On load, the client calls `/api/bootstrap` to hydrate the current user and role-scoped data.
6. `AuthGate` redirects unauthenticated visitors to `/signin?callbackUrl=...` and blocks role mismatches.
7. The API verifies the JWT with Better Auth, re-reads the user, and re-checks the role and blocked flag on every protected request.

Google sign-in requests an access token from Google Identity Services, sends it to `/api/auth/google`, and receives the same Better Auth-issued JWT after the API verifies the token with Google and links the account.

## Theming

The app ships with a light and dark salon palette.

- `components/providers/theme-provider.tsx` stores the preference in `localStorage` under `salonbook-theme` and supports `light`, `dark`, and `system`.
- `components/ui/theme-toggle.tsx` is available in the public navbar, auth layout, dashboard header, and mobile sidebar.
- `app/layout.tsx` runs a tiny inline script before paint to apply the stored or system theme, preventing a flash of the wrong colours.
- `app/globals.css` defines the semantic tokens (`paper`, `surface`, `accent`, `ink`, `sand`, status colours) and overrides them under `html.dark`. Components use the tokens instead of raw colours.

## How payments work

1. A confirmed, unpaid appointment shows **Pay securely**.
2. The client calls `POST /api/payments/checkout-session`.
3. The API creates a Stripe Checkout Session and returns its hosted URL.
4. The browser redirects to Stripe, where the card is entered.
5. Stripe returns the customer to `/dashboard/payments/[id]/success?session_id=...`.
6. The success page polls `/api/payments/session/:sessionId` and refreshes the dashboard until the appointment is paid.
7. Only the signature-verified Stripe webhook writes the transaction and marks the appointment paid. Refreshing or calling client endpoints cannot mark a payment complete.

Without `STRIPE_SECRET_KEY` on the server, the checkout page shows a clear configuration message instead of collecting card details.

## Project structure

```text
client-side/
  app/                        App Router pages and layouts
  components/
    auth/                     Sign in/up, AuthGate, demo accounts
    dashboard/                Customer and admin views
    marketing/                Home, services, navbar, footer
    providers/                Store, toast, theme, app providers
    ui/                       Buttons, forms, dialogs, feedback, theme toggle
  lib/
    api.ts                    Fetch wrapper and token storage
    google.ts                 Google Identity Services loader
    selectors.ts              Derived dashboard data
    types.ts                  Domain and API types
    utils.ts                  Formatting and date helpers
  docs/                       Architecture and design notes
```

## Server dependency

This client expects the API from the [`serside-9`](https://github.com/habib-45/serside-9) repository:

- Express 5 + MongoDB
- Better Auth email/password with bcrypt and the JWT plugin
- Role and blocked-user checks on every protected route
- Services, appointments, users, transactions
- Stripe Checkout + verified webhook
- ImgBB uploads

See the server README for API routes, seeding, Stripe CLI setup, Google OAuth origins, and environment variables.

## Deployment

The client and API are deployed on Vercel.

### Client

1. Import the client repository into Vercel.
2. Set `NEXT_PUBLIC_API_URL` to `https://salonbook-api-mu.vercel.app/api`.
3. Set `NEXT_PUBLIC_APP_URL` to the deployed client origin.
4. Deploy with `vercel deploy --prod`.

### API

Deploy the [`serside-9`](https://github.com/habib-45/serside-9) repository, set `CLIENT_URL` to the Vercel client origin, configure Better Auth, Stripe, ImgBB, and Google, and add the deployed Stripe webhook endpoint.

## Notes

- The demo accounts are seeded server records. Change the seed passwords before using this in a real salon.
- Google demo mode is intended for local review. Configure `GOOGLE_CLIENT_ID` for real Google authentication.
- Image uploads fall back to inline data URLs when ImgBB is not configured; configure ImgBB for production.
- Payments require Stripe keys and a webhook secret on the API; see the server README.
#   s a l o n b o o k - c l i e n t  
 #   s a l o n b o o k - c l i e n t  
 
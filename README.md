# SalonBook - Salon Appointment Booking (Client)

A responsive, editorial salon booking experience built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**. Guests discover the salon and browse the menu, customers request and manage appointments, and admins run services, approvals, customers, and payments from a dedicated dashboard.

This client is wired end-to-end to the separate **SalonBook API** (Express, MongoDB, JWT, Stripe, ImgBB). Authentication, bookings, images, and payments are handled by the server; the browser stores only the signed session token.

## Live links

| Service | URL |
| --- | --- |
| Live client | _Add your Vercel URL after deployment_ |
| Live API | _Add your deployed API URL after deployment_ |
| Client (local) | http://localhost:3000 |
| API (local) | http://localhost:5000 |
| API health | http://localhost:5000/api/health |

The local URLs work for development. Replace the two live placeholders with the deployed client and API URLs.

## Demo accounts

The sign-in page can fill these credentials for you. They come from the server seed.

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
- **Sign in / sign up** with validation, show-password controls, and one-tap demo credentials.
- **Google sign-in** through Google Identity Services. If the server has no OAuth client ID, a clearly seeded Google account is available when demo mode is enabled.
- Responsive navigation, mobile menu, accessible controls, and toast notifications.

### Customer experience

- **Overview** with upcoming visits, pending requests, payment reminders, and recommended services.
- **Appointments** with status and payment filters, search, cancellation of pending requests, and payment entry points for confirmed visits.
- **Secure Stripe checkout** for confirmed unpaid appointments. Card details are entered on Stripe, not in this app.
- **Payment receipt** that polls the API until the verified Stripe webhook marks the appointment paid.
- **Profile** update for name, phone, and photo. Images are uploaded to ImgBB by the API.
- **Protected service details** with a booking form, date limits, slot availability for the signed-in customer, and success confirmation.

### Admin experience

- **Overview** with revenue, pending approvals, today's schedule, unpaid confirmed visits, top customers, and quick actions.
- **Service management** with create, edit, activate/pause, and delete. Services with appointment history can be paused instead of deleted.
- **Appointment management** to confirm pending requests and cancel pending or confirmed visits.
- **Customer management** with search, status filters, salon history, and block/unblock controls.
- **Transactions** with paid/failed filters, search, totals, and CSV export.
- **Profile** with the same secure update flow as customers.

### Platform behavior

- JWT bearer authentication stored in `localStorage` and validated by the API on every request.
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
- Express API + MongoDB backend in the companion `serverside` repository

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

Server-only secrets (JWT, MongoDB, Stripe, ImgBB, Google) live in the API repository and are never exposed to the client.

## How authentication works

1. The client posts credentials to `/api/auth/login` or `/api/auth/register`.
2. The API returns a signed JWT and the safe user object.
3. The client stores the token under `salonbook.token` and sends it as `Authorization: Bearer <token>`.
4. On load, the client calls `/api/bootstrap` to hydrate the current user and role-scoped data.
5. `AuthGate` redirects unauthenticated visitors to `/signin?callbackUrl=...` and blocks role mismatches.
6. The API re-checks the token, role, and blocked flag from MongoDB on every protected request.

Google sign-in requests an access token from Google Identity Services, sends it to `/api/auth/google`, and receives the same SalonBook JWT after the API verifies the token with Google.

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
    providers/                Store, toast, app providers
    ui/                       Buttons, forms, dialogs, feedback
  lib/
    api.ts                    Fetch wrapper and token storage
    google.ts                 Google Identity Services loader
    selectors.ts              Derived dashboard data
    types.ts                  Domain and API types
    utils.ts                  Formatting and date helpers
  docs/                       Architecture and design notes
```

## Server dependency

This client expects the API from the `serverside` repository:

- Express 5 + MongoDB
- JWT auth with bcrypt password hashing
- Role and blocked-user checks
- Services, appointments, users, transactions
- Stripe Checkout + verified webhook
- ImgBB uploads

See the server README for API routes, seeding, Stripe CLI setup, Google OAuth origins, and environment variables.

## Deployment

### Vercel

1. Import this repository.
2. Set `NEXT_PUBLIC_API_URL` to `https://your-api-host/api`.
3. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL.
4. Deploy.

### API

Deploy the `serverside` repository, set `CLIENT_URL` to the Vercel origin, enable CORS for it, configure Stripe and Google, and add the deployed webhook endpoint in Stripe.

Update the **Live links** table above with the final URLs.

## Notes

- The demo accounts are seeded server records. Change the seed passwords before using this in a real salon.
- Google demo mode is intended for local review. Configure `GOOGLE_CLIENT_ID` for real Google authentication.
- Image uploads fall back to inline data URLs when ImgBB is not configured; configure ImgBB for production.
- Payments require Stripe keys and webhook forwarding; see the server README.

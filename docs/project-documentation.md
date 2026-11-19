# SalonBook — Project Documentation

This document explains what was built, how the full-stack architecture fits together, and how each assignment requirement is covered.

- **Project:** SalonBook — full-stack salon appointment booking platform
- **Assignment:** Programming Hero full-stack assignment, Category 002
- **Client stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4
- **API stack:** Express 5, MongoDB, JWT, bcrypt, Stripe, ImgBB
- **Status:** Client and API wired end-to-end
- **Companion docs:** [README](../README.md) · [Design system](design-system.md)

---

## 1. Project at a glance

SalonBook is a two-sided booking platform:

- **Guests** discover the salon, browse a searchable service menu, create an account, and request an appointment.
- **Customers** track pending and confirmed visits, cancel pending requests, pay for confirmed appointments, and maintain their profile.
- **Admins** manage the service catalogue, approve or cancel appointments, block or restore customer access, and review/export transactions.

The UI is production-shaped: typed domain models, role guards, validation, loading skeletons, empty states, accessible dialogs, and toast feedback. The data layer calls a separate Express API backed by MongoDB; authentication uses JWTs, Google tokens are verified server-side, images are uploaded to ImgBB, and payments use Stripe Checkout with a verified webhook.

---

## 2. Requirement traceability

| Requirement | Status | Implementation |
| --- | --- | --- |
| Public home page | Done | `app/(marketing)/page.tsx`, `components/marketing/home-page.tsx` |
| Browse services | Done | `app/(marketing)/services/page.tsx`, `components/marketing/services-browser.tsx` |
| Sign in page | Done | `app/(auth)/signin/page.tsx`, `components/auth/sign-in-form.tsx` |
| Sign up page | Done | `app/(auth)/signup/page.tsx`, `components/auth/sign-up-form.tsx` |
| Protected service details | Done | `app/(marketing)/services/[id]/page.tsx`, `components/marketing/service-detail.tsx`, `AuthGate` |
| Customer dashboard | Done | `app/dashboard/page.tsx`, `components/dashboard/customer-overview.tsx` |
| Admin dashboard | Done | `app/dashboard/page.tsx`, `components/dashboard/admin-overview.tsx` |
| Profile page | Done | `app/dashboard/profile/page.tsx`, `components/dashboard/profile-view.tsx` |
| Search services by name | Done | Live search in `services-browser.tsx` and admin appointment/service/customer lists |
| Filter services by category | Done | Category select in `services-browser.tsx`; admin category filter in `admin-services.tsx` |
| Sort services by price | Done | Recommended, price ascending, price descending, and duration sort options |
| Customer requests an appointment | Done | Booking form in `service-detail.tsx`, `bookAppointment` action |
| Customer cancels a pending appointment | Done | `cancelOwnAppointment` action, confirmation dialog in `customer-appointments.tsx` |
| Customer pays for a confirmed appointment | Done | Stripe Checkout under `app/dashboard/payments/[id]`, verified webhook records payment |
| Admin service create/update/delete | Done | `components/dashboard/admin-services.tsx`, `service-form-modal.tsx` |
| Admin activates/deactivates services | Done | Status control in `admin-services.tsx`, `setServiceStatus` action |
| Admin confirms/cancels appointments | Done | `components/dashboard/admin-appointments.tsx` and admin overview queue |
| Admin blocks/unblocks users | Done | `components/dashboard/admin-users.tsx`, `setUserBlocked` action |
| Admin transaction report | Done | `components/dashboard/admin-transactions.tsx` with paid/failed filters and CSV export |
| Customer overview statistics | Done | Total, pending, confirmed, and cancelled counts in `customer-overview.tsx` |
| Admin overview statistics | Done | Customers, active services, total requests, pending, confirmed, and successful payments |
| Appointment request date | Done | Customer appointment cards show the request timestamp |
| JWT verification middleware | Done | `serverside/src/middleware/auth.js`; role and blocked status re-read on every request |
| Server-side role verification | Done | `requireRole` guards plus admin/customer route middleware on the API |
| Stripe webhook-only payment updates | Done | Webhook route verifies the signature, amount, and idempotent session before marking paid |
| Service image upload only | Done | Admin service form uses `ImageUpload`; no image-URL field |
| Responsive, professional salon UI | Done | Custom design system, fluid layouts, mobile navigation and tables |
| Loading states | Done | Route-level loading files, skeletons, button spinners, auth hydrating states |
| Toast notifications | Done | `components/providers/toast-provider.tsx`; no `alert()` or `confirm()` |
| Error handling | Done | Inline validation, `FormAlert`, root/dashboard error boundaries, 404 page |
| 20+ meaningful commits | Done | Conventional commits across foundation, public, dashboard, admin, payments, docs |
| README and documentation | Done | `README.md`, this document, `docs/design-system.md` |
| Environment variables documented | Done | `.env.example`, README table, and section 13 of this document |

---

## 3. Scope and architecture

### What is real in this repository

- All pages, layouts, route protection, forms, validation, dialogs, and responsive behavior.
- A typed API client, token persistence, bootstrap hydration, and async actions.
- A fully functional customer and admin experience backed by MongoDB.
- CSV export, receipt printing, image compression before upload, and Stripe redirect checkout.

### How each area is implemented

| Area | Implementation |
| --- | --- |
| Authentication | Email/password checked by the API; bcrypt hashes; signed JWT returned to the client |
| Session | JWT in `localStorage`, sent as `Authorization: Bearer` and verified on every request |
| Google sign-in | Google Identity Services access token verified by the API; seeded fallback when unconfigured |
| Image upload | Browser compresses to a data URL; API uploads to ImgBB or stores a size-limited inline fallback |
| Payments | Stripe Checkout Session created by the API; hosted card form; verified webhook marks paid |
| Data | MongoDB collections `users`, `services`, `appointments`, and `transactions` |
| Role checks | UI `AuthGate` plus server middleware that re-reads the role and blocked flag |

---

## 4. Architecture

### High-level shape

```text
Browser
  └─ app/layout.tsx (fonts, metadata)
      └─ AppProviders
          ├─ ToastProvider ............ accessible notifications
          └─ StoreProvider ............ hydration, session, all actions
              └─ App Router pages
                  ├─ (marketing) ....... navbar, footer, public pages
                  ├─ (auth) ............ split-screen sign-in/up
                  └─ dashboard ......... AuthGate + DashboardShell
                        ├─ customer views
                        ├─ admin views
                        └─ payment views
```

### Layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Routes and metadata | `app/` | Server components, page titles, route structure, loading/error files |
| Access control | `components/auth/auth-gate.tsx`, dashboard pages | Redirect unauthenticated users; gate customer/admin routes; block disabled accounts |
| Presentation | `components/marketing`, `components/dashboard` | Page sections, tables, cards, forms, checkout, receipts |
| Design primitives | `components/ui` | Buttons, fields, modal, confirm dialog, avatar, badges, skeletons, image upload |
| State and actions | `components/providers/store-provider.tsx` | Bootstrap hydration, token session, async API actions, optimistic user state |
| API client | `lib/api.ts`, `lib/google.ts` | Fetch wrapper, typed errors, token storage, Google token request |
| Domain and selectors | `lib/types.ts`, `lib/selectors.ts`, `lib/utils.ts` | Types, joins/statistics, formatting and date helpers |
| Styling | `app/globals.css` | Tailwind theme tokens, typography, base styles, animations |

### Data flow

Pages call typed store actions such as `bookAppointment` or `setServiceStatus`. Each action calls the Express API, then refreshes the role-scoped `/api/bootstrap` snapshot so every view sees consistent server data. The UI never writes domain data directly. This keeps ownership checks, duplicate-slot prevention, and payment state on the server.

### Access control model

Protection is intentionally layered:

1. **Route shell** — `app/dashboard/layout.tsx` wraps every dashboard page in `AuthGate`, which redirects unauthenticated visitors to `/signin?callbackUrl=...` and shows a blocked-account screen.
2. **Role gate** — customer-only pages (`/dashboard/appointments`, payment routes) and admin-only pages (`/dashboard/admin/*`) add `AuthGate allow={[...]}`. A signed-in user on the wrong route is redirected to `/dashboard` with a toast.
3. **API guards** — every protected route verifies the JWT, reloads the user, re-checks the blocked flag and role, and enforces ownership and status rules. UI hiding alone is never trusted.
4. **Navigation** — the dashboard shell renders separate customer and admin navigation, so admin links are not shown to customers.

`callbackUrl` is sanitized by `safeCallbackUrl` so only same-origin relative paths are accepted.

### Authentication decision

The brief asks for Better Auth and also requires JWT verification middleware on an Express API. This build uses a small JWT auth layer in Express so the API can verify a bearer token, reload the user, and enforce role and blocked-user rules on every protected route. Passwords are hashed with bcrypt, Google tokens are verified server-side, and the client stores only the signed JWT.

If Better Auth is a hard submission requirement, it can be introduced as the credential and Google identity provider, with Better Auth's JWT plugin issuing the token that the existing Express middleware verifies. That migration changes the auth routes, seed script, and client sign-in/sign-up calls; the rest of the data model and business rules stay the same. Confirm this before submitting if the evaluator checks for the Better Auth package specifically.

### Dashboard statistics

The customer overview shows total requests, pending requests, confirmed visits, and cancelled requests. The admin overview shows registered customers, active services, total appointment requests, pending requests, confirmed visits, and successful payments. Revenue and transaction counts include only transactions with `status: "paid"`.

---

## 5. Data model

All types live in `lib/types.ts`.

### User

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Prefixed unique ID |
| `name` | string | Display name |
| `email` | string | Normalized to lowercase; unique index |
| `image` | string | Remote URL or inline fallback data URL |
| `role` | `"customer" \| "admin"` | Authorization boundary |
| `isBlocked` | boolean | Blocks sign-in and protected access |
| `phone` | string? | Optional profile field |
| `provider` | `"credentials" \| "google"`? | Account origin |
| `createdAt` | ISO string | "Member since" display |

Password hashes are stored in MongoDB with bcrypt and are never returned by the API.

### Service

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Prefixed unique ID |
| `serviceName` | string | Public name |
| `category` | string | One of seven fixed categories |
| `description` | string | Public and admin copy |
| `price` | number | USD; positive |
| `duration` | number | Minutes; positive |
| `image` | string | Remote URL or data URL |
| `status` | `"active" \| "inactive"` | Inactive services cannot be booked |
| `createdAt` | ISO string | Ordering and metadata |

### Appointment

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Prefixed unique ID |
| `serviceId` | string | References a service |
| `customerId` | string | References a customer |
| `appointmentDate` | `YYYY-MM-DD` | Local calendar date |
| `timeSlot` | string | One of ten fixed slots from 09:00 AM to 06:00 PM |
| `message` | string | Optional note to the salon |
| `servicePrice` | number | Price snapshot at request time |
| `paymentStatus` | `"unpaid" \| "paid"` | Payment state |
| `status` | `"pending" \| "confirmed" \| "cancelled"` | Booking state |
| `createdAt` | ISO string | Request timestamp |

### Transaction

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Prefixed unique ID |
| `appointmentId` | string | References an appointment |
| `customerId` | string | References a customer |
| `amount` | number | Appointment price snapshot |
| `currency` | string | USD |
| `stripeSessionId` | string | Verified Stripe Checkout Session ID |
| `status` | `"paid" \| "failed"` | Payment report status |
| `createdAt` | ISO string | Payment timestamp |

### Database

`Database` groups `users`, `services`, `appointments`, and `transactions`. The API stores them in MongoDB and returns a role-scoped snapshot from `/api/bootstrap`. The client keeps only the JWT under `salonbook.token`; all domain data is re-fetched from the server.

### Seeded data

| Entity | Count | Notes |
| --- | --- | --- |
| Users | 6 | 1 admin, 4 credential customers, 1 Google customer; Noah Williams is blocked |
| Services | 9 | 8 active, 1 inactive (`Scalp Detox Ritual`) |
| Appointments | 8 | Pending, confirmed, and cancelled examples across customers |
| Transactions | 3 | 2 paid, 1 failed |

Appointment dates are relative to the day the seed is first created, so the dashboard always has upcoming and past examples.

---

## 6. Business rules

### Authentication and account access

- Sign-in normalizes the email and verifies the password against its bcrypt hash in MongoDB.
- The API issues a signed JWT; every protected request re-reads the user, role, and blocked flag from the database.
- Blocked accounts cannot sign in or use protected endpoints and see a dedicated blocked screen if their token is still active.
- Sign-up requires a name of at least 2 characters, a valid unique email, and a password with at least 6 characters, one uppercase letter, and one lowercase letter.
- New accounts are always `customer` role and are signed in immediately.
- Google sign-in sends a Google token to the API for verification; the seeded Google fallback is used when no client ID is configured and demo mode is enabled.
- Sign-out clears the stored JWT and redirects home.

### Booking

An appointment request succeeds only when:

- A user is signed in.
- The user is **not** an admin.
- The account is not blocked.
- The service exists and is **active**.
- A date is supplied and is today or later.
- The slot is one of the ten allowed slots.
- The customer has no other non-cancelled appointment on the same date and slot.

New requests start as `status: "pending"` and `paymentStatus: "unpaid"`. The service price is snapshotted into `servicePrice`.

### Appointment lifecycle

```text
Customer requests        pending ──────────────► cancelled  (customer, while pending)
                            │
                            │ admin confirms
                            ▼
                         confirmed ────────────► cancelled  (admin)
                            │
                            │ customer pays
                            ▼
                     confirmed + paid
```

- Customers may cancel only their own **pending** appointments.
- Admins may confirm only **pending** appointments.
- Admins may cancel any appointment that is not already cancelled.
- Paid appointments can still be cancelled by an admin; the historical transaction remains for reporting.
- There is no reschedule or refund workflow in this scope.

### Payments

- Only the customer who owns the appointment can start checkout.
- Only a **confirmed** appointment can be paid.
- An appointment can be paid once; checkout, session status, and the webhook all guard duplicates.
- The API creates a Stripe Checkout Session from the stored appointment price. Card details are entered only on Stripe.
- The appointment becomes paid and a transaction is written **only** when a signature-verified Stripe webhook arrives with a matching amount.
- The receipt shows the transaction, appointment, customer, and service, supports copying the session ID, and can be printed.
- A pending appointment explains that it must be confirmed before payment; a cancelled one explains that no payment is due.

### Services

- Only admins can add, edit, delete, activate, or deactivate services.
- Categories must come from `SERVICE_CATEGORIES`; price and duration must be positive.
- Service images are required in the admin form.
- Inactive services are excluded from public browsing, featured sections, and booking; the detail page shows a paused state.
- A service with any linked appointment history cannot be deleted; admins are told to deactivate it instead.

### Customers and access

- Only admins can block or unblock customers.
- Admin accounts cannot be blocked through the UI or action.
- Blocking prevents sign-in and protected access, but does not delete appointment or transaction history.
- Blocked customers remain visible in the admin directory with their history.

---

## 7. Key flows

### New customer booking

1. Guest opens `/services`, searches or filters, and chooses a service.
2. `/services/[id]` requires sign-in; the callback returns the user to the same service.
3. Customer chooses a date (today to 90 days ahead) and an available slot. Slots already used by the customer on that date are disabled.
4. Submission creates a pending appointment and opens a success dialog.
5. Admin reviews the request and confirms it.
6. Customer opens **My appointments**, sees the confirmed visit, and proceeds to checkout.
7. After payment, the receipt is available and the appointment shows as paid.

### Admin service change

1. Admin opens **Services**, searches or filters, and chooses **Add service** or **Edit**.
2. The modal validates fields, compresses an uploaded image, and sends it to the API, which uploads to ImgBB.
3. Saving writes through the API and updates the public menu immediately.
4. **Deactivate** removes the service from public booking while preserving history.
5. **Delete** is offered only when no appointment references the service.

### Blocked customer

1. Admin searches the customer directory and chooses **Block**.
2. Confirmation explains that the customer will lose protected access.
3. A blocked customer cannot sign in; an already signed-in blocked customer sees an access-paused screen and can sign out.
4. Admin can restore access from the same directory.

---

## 8. UX, responsive, and accessibility decisions

- **Visual direction:** warm cream, burgundy, rose, sage, and gold; Cormorant Garamond display type with Manrope body text. The full token set is in [design-system.md](design-system.md).
- **Responsive strategy:** single-column mobile layouts, two-column auth and service detail layouts on large screens, collapsible dashboard sidebar into a drawer, and horizontally scrollable data tables with card-like summaries where needed.
- **Feedback:** every mutation reports success or failure through the toast provider; forms also show inline field errors and a form-level alert.
- **Loading:** route-level skeletons for marketing and dashboard pages, `PageLoader` for hydration, button spinners for submissions, and skeleton cards for service grids.
- **Dialogs:** modal and confirmation components close on Escape, restore body scroll, trap visual focus within the panel, and require explicit confirmation for destructive actions.
- **Accessibility:** labelled fields, `aria-invalid`, descriptive errors, `aria-live` toasts, keyboard-operable menus, visible focus rings, semantic headings, and alt text for meaningful imagery.
- **No native dialogs:** `alert()`, `confirm()`, and `prompt()` are not used anywhere in the app.

---

## 9. Validation and error matrix

| Scenario | Handling |
| --- | --- |
| Invalid sign-in | Form alert + toast; field-level email/password errors |
| Duplicate sign-up email | Action error; link to sign in remains available |
| Weak password | Live checklist + submit error |
| Blocked sign-in | Clear account-blocked message |
| Booking in the past | Action rejects; date input `min` prevents most cases |
| Duplicate slot | Disabled slot in UI and action-level rejection |
| Inactive service | Paused detail state; action rejects |
| Admin tries to book | Action rejects with an explanatory message |
| Non-owner payment | Private-checkout state and API 403 |
| Already-paid appointment | "Already paid" state with receipt link |
| Cancelled appointment checkout | "No payment due" state with rebook link |
| Pending appointment checkout | "Awaiting confirmation" state before Stripe |
| Service deletion with history | API 409; admin told to deactivate |
| Blocking an admin | No UI path; API rejects non-customer accounts |
| Unknown service ID | Friendly not-found state inside the protected detail page |
| Unknown route | Branded 404 page |
| Rendering exception | Root and dashboard error boundaries with retry |
| Expired or invalid token | Client clears the session and redirects to sign-in |
| API offline | Connection banner with retry; page actions show an error toast |

---

## 10. Demo accounts and test data

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@salonbook.com` | `Admin123` |
| Customer | `customer@salonbook.com` | `Customer123` |
| Google demo customer | `ava.google@salonbook.com` | Google demo button |
| Blocked customer | `noah@example.com` | `Customer123` |

The sign-in page includes one-click credential filling for the demo customer and admin. These accounts come from `npm run seed` in the API repository.

To reset the demo snapshot, run `npm run seed:fresh` in the server repository. The client clears its JWT when the API reports it is invalid.

---

## 11. QA checklist

### Public and auth

- [ ] Home page renders hero, featured services, categories, story, testimonials, visit details, and footer at mobile/tablet/desktop widths.
- [ ] `/services` search filters by partial name, category filter matches, and all sort orders behave correctly.
- [ ] Clearing filters restores the full active menu.
- [ ] Inactive services do not appear publicly and cannot be booked by URL.
- [ ] Sign-up rejects mismatched passwords, weak passwords, duplicate email, and invalid email.
- [ ] Profile photo selection previews and accepts JPG/PNG/WebP under 5 MB.
- [ ] Sign-in rejects wrong credentials and blocked accounts.
- [ ] Demo account buttons fill the form without submitting.
- [ ] Google demo button signs in and is blocked if that account is blocked.
- [ ] `callbackUrl` returns the user to the protected page they requested.

### Customer

- [ ] `/dashboard` shows correct counts, next visit, pending requests, unpaid prompt, activity, and recommendations.
- [ ] `/dashboard/appointments` filters by status and searches service names.
- [ ] A pending request can be cancelled after confirmation; a confirmed one cannot be cancelled by the customer.
- [ ] A confirmed unpaid visit opens Stripe Checkout; a paid one links to the receipt.
- [ ] Pending and cancelled visits show the correct checkout state.
- [ ] With Stripe test keys, a completed payment is marked paid only after the webhook arrives.
- [ ] Profile updates persist after refresh and phone validation rejects short numbers.
- [ ] Signing out clears the token; an invalid token redirects to sign-in.

### Admin

- [ ] `/dashboard` shows today's schedule, pending queue, revenue, active services, customer totals, and unpaid confirmed visits.
- [ ] Service add/edit validates all fields and reflects immediately in the public menu.
- [ ] Deactivating removes a service from public browse; reactivating restores it.
- [ ] Deleting a service with appointment history is blocked with a clear message.
- [ ] Appointment filters, search, confirm, and cancel all work and update statistics.
- [ ] Blocking a customer prevents their sign-in; unblocking restores it.
- [ ] Customer search and status filters work; blocked customers keep their history.
- [ ] Transaction filters, copy session ID, and CSV export work; CSV respects the visible filter.
- [ ] Admin cannot access customer-only pages and is redirected with a toast.

### Global quality

- [ ] Every protected route redirects when signed out.
- [ ] Wrong-role access redirects to the correct dashboard.
- [ ] No `alert()`, `confirm()`, or `prompt()` exists.
- [ ] Keyboard Escape closes modals and menus.
- [ ] Toasts announce success and failure without blocking the page.
- [ ] 404 and error pages render with the brand shell and useful actions.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` all pass.
- [ ] Layout has no horizontal overflow at 360 px, 768 px, 1024 px, and 1440 px.

---

## 12. Build, performance, and accessibility notes

- **Server/client split:** marketing layouts and metadata stay server-rendered; interactive views are client components. The store hydrates after mount to keep server and client markup deterministic.
- **Images:** remote Unsplash images use `next/image` with appropriate `sizes`. Uploads are compressed in the browser, then sent to the API for ImgBB storage.
- **Selectors:** joins and statistics are memoized by their callers where appropriate, and pure selectors keep dashboards consistent.
- **Bundle discipline:** no heavy UI framework runtime is added; primitives are local and icons are tree-shaken from lucide-react.
- **Accessibility:** semantic landmarks, labelled forms, focus-visible styles, live-region toasts, dialog escape handling, and text alternatives for images.
- **Error recovery:** invalid tokens are cleared, API failures surface a retry banner, and payment/booking failures are recoverable without losing the session.

---

## 13. API integration

The client talks to the Express API in the companion `serverside` repository. All routes are prefixed with `/api`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Create a customer account |
| `POST` | `/auth/login` | Credential sign-in |
| `GET` | `/auth/config` | Google client ID and demo availability |
| `POST` | `/auth/google` | Verify a Google token and issue a JWT |
| `POST` | `/auth/google/demo` | Seeded Google fallback when enabled |
| `GET` | `/auth/me` | Current user |
| `GET` | `/bootstrap` | Role-scoped user, services, appointments, transactions |
| `GET` | `/services` | Active services (admins may include inactive) |
| `GET` | `/services/:id` | Service details |
| `POST` | `/services` | Admin create |
| `PATCH` | `/services/:id` | Admin update |
| `PATCH` | `/services/:id/status` | Admin activate/pause |
| `DELETE` | `/services/:id` | Admin delete when unused |
| `GET` | `/appointments` | Role-scoped appointment list |
| `POST` | `/appointments` | Customer booking request |
| `PATCH` | `/appointments/:id/cancel` | Customer or admin cancellation |
| `PATCH` | `/appointments/:id/confirm` | Admin confirmation |
| `POST` | `/payments/checkout-session` | Create Stripe Checkout Session |
| `GET` | `/payments/session/:sessionId` | Poll payment status |
| `POST` | `/payments/webhook` | Stripe webhook, signature verified |
| `GET` | `/transactions` | Role-scoped transaction list |
| `GET` | `/users` | Admin customer directory |
| `PATCH` | `/users/me` | Update own profile |
| `PATCH` | `/users/:id/block` | Admin block/unblock |
| `POST` | `/uploads/image` | Image upload (ImgBB or inline fallback) |

### Server-side rules

- Session validation, role checks, and blocked-account checks on every protected request.
- Ownership checks for appointments, payments, and profile updates.
- Booking validation (active service, future date, valid slot, duplicate prevention).
- Appointment status transitions and service deletion guards.
- Password hashing with bcrypt; hashes are never serialized.
- Stripe amount calculation from the database, not the client.
- Payment state changes only from a verified webhook.
- Image type and size validation before upload.

### Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Client | Express API base URL, including `/api` |
| `NEXT_PUBLIC_APP_URL` | Client | Public origin for metadata |

Server-only values live in the API repository: `PORT`, `MONGODB_URI`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY`, `IMGBB_API_KEY`, `GOOGLE_CLIENT_ID`, and `ALLOW_GOOGLE_DEMO`.

---

## 14. Known limitations

- Stripe payments require server keys and a webhook secret; without them the checkout page shows a configuration message.
- Google OAuth requires an authorized JavaScript origin and a server client ID; otherwise the seeded demo account is used.
- ImgBB uploads require a key; without one the API stores compressed inline data URLs for local development.
- No email verification, password reset, reschedule, refund, or coupon flow.
- Uploaded inline images are size-limited; production should configure ImgBB.
- The seeded passwords are for review only and must be changed for a real salon.

---

## 15. Development history

Work was delivered in focused commits so each layer is reviewable:

1. Project initialization and tooling.
2. Design tokens and shared UI primitives.
3. Editorial homepage, navbar, and footer.
4. Searchable and filterable service menu.
5. Sign-in, sign-up, and Google flow.
6. Protected service details and booking requests.
7. Config and lint corrections.
8. Dashboard shell and role navigation.
9. Shared selectors and statistics.
10. Customer and admin overviews.
11. Customer appointments and profile.
12. Stripe checkout, receipt, and cancellation.
13. Admin services, appointments, customers, and transactions.
14. Loading, error, and not-found states.
15. API-backed store, token session, and Google OAuth.
16. README, server documentation, and project documentation.

Run `git log --oneline` in both repositories for the full list.

---

## 16. Submission checklist

- [x] Public home, services, sign-in, and sign-up pages
- [x] Protected service details and booking
- [x] Customer and admin dashboards with role separation
- [x] Customer appointment cancellation and payment
- [x] Admin service CRUD and availability
- [x] Admin appointment confirmation and cancellation
- [x] Admin user block/unblock
- [x] Admin transaction report with CSV export
- [x] Responsive salon UI with loading, empty, and error states
- [x] Toasts instead of native dialogs
- [x] 20+ meaningful commits
- [x] README with setup, routes, demo accounts, and scripts
- [x] Environment variable names documented
- [x] Express API, MongoDB, JWT auth, and role middleware
- [x] Stripe Checkout with verified webhook payments
- [x] ImgBB uploads with an inline development fallback
- [x] TypeScript, ESLint, and production build verified
- [x] Customer and admin overview statistics match the brief
- [x] Appointment request date shown to customers
- [ ] Add live site URL after deployment
- [ ] Add GitHub client and server repository URLs
- [ ] Confirm whether the evaluator requires Better Auth specifically; the current build uses JWT auth

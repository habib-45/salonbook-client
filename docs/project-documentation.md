# SalonBook — Project Documentation

This document explains what was built, how the demo works, how each assignment requirement is covered, and what changes when the real backend is connected.

- **Project:** SalonBook — salon appointment booking frontend
- **Assignment:** Programming Hero full-stack assignment, Category 002
- **Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4
- **Status:** Frontend complete with an interactive browser-local demo data layer
- **Companion docs:** [README](../README.md) · [Design system](design-system.md)

---

## 1. Project at a glance

SalonBook is a two-sided booking platform:

- **Guests** discover the salon, browse a searchable service menu, create an account, and request an appointment.
- **Customers** track pending and confirmed visits, cancel pending requests, pay for confirmed appointments, and maintain their profile.
- **Admins** manage the service catalogue, approve or cancel appointments, block or restore customer access, and review/export transactions.

The UI is production-shaped: typed domain models, role guards, validation, loading skeletons, empty states, accessible dialogs, and toast feedback. Because the API, Better Auth, ImgBB, and Stripe projects are not connected yet, the current data layer runs entirely in the browser and is clearly presented as a demo.

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
| Customer pays for a confirmed appointment | Done | Demo checkout under `app/dashboard/payments/[id]`, `completePayment` action |
| Admin service create/update/delete | Done | `components/dashboard/admin-services.tsx`, `service-form-modal.tsx` |
| Admin activates/deactivates services | Done | Status control in `admin-services.tsx`, `setServiceStatus` action |
| Admin confirms/cancels appointments | Done | `components/dashboard/admin-appointments.tsx` and admin overview queue |
| Admin blocks/unblocks users | Done | `components/dashboard/admin-users.tsx`, `setUserBlocked` action |
| Admin transaction report | Done | `components/dashboard/admin-transactions.tsx` with paid/failed filters and CSV export |
| Responsive, professional salon UI | Done | Custom design system, fluid layouts, mobile navigation and tables |
| Loading states | Done | Route-level loading files, skeletons, button spinners, auth hydrating states |
| Toast notifications | Done | `components/providers/toast-provider.tsx`; no `alert()` or `confirm()` |
| Error handling | Done | Inline validation, `FormAlert`, root/dashboard error boundaries, 404 page |
| 20+ meaningful commits | Done | Conventional commits across foundation, public, dashboard, admin, payments, docs |
| README and documentation | Done | `README.md`, this document, `docs/design-system.md` |
| Environment variables documented | Done | `.env.example`, README table, and section 13 of this document |

---

## 3. Scope and demo model

### What is real in this repository

- All pages, layouts, route protection, forms, validation, dialogs, and responsive behavior.
- Typed domain models and a complete in-browser business layer.
- A fully functional customer and admin experience backed by seeded data.
- CSV export, receipt printing, image compression, and cross-tab storage synchronization.

### What is simulated

| Area | Current behavior | Production replacement |
| --- | --- | --- |
| Authentication | Demo credentials stored in `localStorage`; session is a user ID key | Better Auth sessions validated by the API |
| Google sign-in | Creates/reuses a fixed demo Google customer | Google OAuth provider through Better Auth |
| Image upload | File is resized to max 1400 px and compressed to a JPEG data URL | Upload to ImgBB or object storage, store URL |
| Payments | Validated demo card fields, 1.1 s simulated processing, local transaction record | Stripe Checkout Session + webhook |
| Data | Per-browser `localStorage` database | MongoDB through the Express API |

The demo is intentionally explicit about this in the UI, README, checkout, receipt, and profile screens. No real card details are collected or transmitted.

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
| State and actions | `components/providers/store-provider.tsx` | Hydration, persistence, authentication, CRUD, business rules, session |
| Domain and selectors | `lib/types.ts`, `lib/seed.ts`, `lib/selectors.ts`, `lib/utils.ts` | Types, seeded database, joins/statistics, formatting and validation helpers |
| Styling | `app/globals.css` | Tailwind theme tokens, typography, base styles, animations |

### Why a client data layer

There is no backend to call yet. A client store keeps the assignment demonstrable end-to-end while preserving a clean seam: pages call typed actions such as `bookAppointment` or `setServiceStatus`; only `store-provider.tsx` knows that the implementation is `localStorage`. Replacing those action bodies with API requests is the intended migration path.

### Access control model

Protection is intentionally layered:

1. **Route shell** — `app/dashboard/layout.tsx` wraps every dashboard page in `AuthGate`, which redirects unauthenticated visitors to `/signin?callbackUrl=...` and shows a blocked-account screen.
2. **Role gate** — customer-only pages (`/dashboard/appointments`, payment routes) and admin-only pages (`/dashboard/admin/*`) add `AuthGate allow={[...]}`. A signed-in user on the wrong route is redirected to `/dashboard` with a toast.
3. **Action guards** — every mutating action re-checks session, role, ownership, status, and validation. UI hiding alone is never trusted.
4. **Navigation** — the dashboard shell renders separate customer and admin navigation, so admin links are not shown to customers.

`callbackUrl` is sanitized by `safeCallbackUrl` so only same-origin relative paths are accepted.

---

## 5. Data model

All types live in `lib/types.ts`.

### User

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Prefixed unique ID |
| `name` | string | Display name |
| `email` | string | Normalized to lowercase for comparison |
| `password` | string | Demo only; plain text in local storage |
| `image` | string | Remote URL or compressed data URL |
| `role` | `"customer" \| "admin"` | Authorization boundary |
| `isBlocked` | boolean | Blocks sign-in and protected access |
| `phone` | string? | Optional profile field |
| `provider` | `"credentials" \| "google"`? | Demo account origin |
| `createdAt` | ISO string | "Member since" display |

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
| `stripeSessionId` | string | Demo `cs_test_demo_...` reference |
| `status` | `"paid" \| "failed"` | Demo report status |
| `createdAt` | ISO string | Payment timestamp |

### Database

`Database` groups `users`, `services`, `appointments`, and `transactions`. It is seeded by `lib/seed.ts` and persisted under `salonbook.demo.database.v1`. The active user ID is stored under `salonbook.demo.session.v1`.

### Seeded data

| Entity | Count | Notes |
| --- | --- | --- |
| Users | 5 | 1 admin, 4 customers; Noah Williams is blocked |
| Services | 9 | 8 active, 1 inactive (`Scalp Detox Ritual`) |
| Appointments | 8 | Pending, confirmed, and cancelled examples across customers |
| Transactions | 3 | 2 paid, 1 failed |

Appointment dates are relative to the day the seed is first created, so the dashboard always has upcoming and past examples.

---

## 6. Business rules

### Authentication and account access

- Sign-in matches normalized email and exact demo password.
- Blocked accounts cannot sign in and see a dedicated blocked screen if their session is active.
- Sign-up requires a name of at least 2 characters, a valid email, a unique email, and a password with at least 6 characters, one uppercase letter, and one lowercase letter.
- New accounts are always `customer` role and are signed in immediately.
- Google demo sign-in reuses `ava.google@salonbook.com` or creates it once; blocked Google accounts are rejected.
- Sign-out clears the session ID and redirects home.

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
- Paid appointments can still be cancelled by an admin; the demo keeps the historical transaction for reporting.
- There is no reschedule or refund workflow in this scope.

### Payments

- Only the customer who owns the appointment can pay.
- Only a **confirmed** appointment can be paid.
- An appointment can be paid once; the checkout, success, and action layers all guard duplicates.
- Checkout validates a name, a 16-digit demo card, a future `MM/YY` expiry, and a 3–4 digit CVC. No card values are stored.
- A successful payment sets `paymentStatus: "paid"` and creates a paid transaction with a demo Stripe session ID.
- The receipt shows the transaction, appointment, customer, and service, supports copying the session ID, and can be printed.
- A cancelled appointment checkout explains that no payment is due.

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
2. The modal validates fields and compresses an uploaded image.
3. Saving writes to the store and updates the public menu immediately.
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
| Non-owner payment | Private-checkout state and action rejection |
| Already-paid appointment | "Already paid" state with receipt link |
| Cancelled appointment checkout | "No payment due" state with rebook link |
| Service deletion with history | Action error; admin told to deactivate |
| Blocking an admin | Action rejects; no UI path exposes it |
| Unknown service ID | Friendly not-found state inside the protected detail page |
| Unknown route | Branded 404 page |
| Rendering exception | Root and dashboard error boundaries with retry |
| Corrupt local storage | Store falls back to a fresh seed instead of crashing |

---

## 10. Demo accounts and test data

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@salonbook.com` | `Admin123` |
| Customer | `customer@salonbook.com` | `Customer123` |
| Google demo customer | `ava.google@salonbook.com` | Google demo button |
| Blocked customer | `noah@example.com` | `Customer123` |

The sign-in page includes one-click credential filling for the demo customer and admin.

To reset: use **Reset demo data** on `/dashboard/profile`, clear both `salonbook.demo.*` keys, or open a private window.

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
- [ ] A confirmed unpaid visit opens checkout; a paid one links to the receipt.
- [ ] Checkout rejects incomplete/expired card fields and duplicate payment.
- [ ] Successful payment updates both appointment and transaction, and the receipt prints.
- [ ] Profile updates persist after refresh and phone validation rejects short numbers.
- [ ] Reset demo data signs the user out and restores the seed.

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
- **Images:** remote Unsplash images use `next/image` with appropriate `sizes`. Local uploads are compressed client-side before storage to limit `localStorage` growth.
- **Selectors:** joins and statistics are memoized by their callers where appropriate, and pure selectors keep dashboards consistent.
- **Bundle discipline:** no heavy UI framework runtime is added; primitives are local and icons are tree-shaken from lucide-react.
- **Accessibility:** semantic landmarks, labelled forms, focus-visible styles, live-region toasts, dialog escape handling, and text alternatives for images.
- **Error recovery:** corrupt storage is ignored, error boundaries offer retry, and payment/booking failures are recoverable without losing the session.

---

## 13. Backend integration plan

The customer, admin, and payment flows are already shaped around the API that should replace the demo store.

### Recommended API surface

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/sign-up` | Create a customer account |
| `POST` | `/api/auth/sign-in` | Credential sign-in |
| `GET` | `/api/auth/session` | Current session and role |
| `POST` | `/api/auth/sign-out` | End the session |
| `GET` | `/api/services` | Public active services with search/category/sort |
| `GET` | `/api/services/:id` | Service details |
| `POST` | `/api/services` | Admin create |
| `PATCH` | `/api/services/:id` | Admin update/status |
| `DELETE` | `/api/services/:id` | Admin delete with history guard |
| `GET` | `/api/appointments` | Role-scoped appointment list |
| `POST` | `/api/appointments` | Customer booking request |
| `PATCH` | `/api/appointments/:id/cancel` | Customer or admin cancellation |
| `PATCH` | `/api/appointments/:id/confirm` | Admin confirmation |
| `POST` | `/api/payments/checkout-session` | Create Stripe Checkout Session |
| `POST` | `/api/payments/webhook` | Stripe webhook, signature verified |
| `GET` | `/api/transactions` | Admin report |
| `GET` | `/api/users` | Admin customer directory |
| `PATCH` | `/api/users/:id/block` | Admin block/unblock |
| `POST` | `/api/uploads` | Image upload (ImgBB or storage provider) |

### Rules to move server-side

- Session validation and role checks on every request.
- Ownership checks for appointments and payments.
- Booking validation (active service, future date, valid slot, duplicate prevention).
- Appointment status transitions and service deletion guards.
- Blocked-account enforcement at sign-in and in the session middleware.
- Password hashing and secure cookie settings.
- Stripe amount calculation from the database, not the client.
- Payment state changes only from a verified webhook.
- Image type and size validation, and storage quotas.

### Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Client | Public origin for metadata and redirect URLs |
| `NEXT_PUBLIC_API_URL` | Client | Express API base URL (reserved) |
| `NEXT_PUBLIC_IMGBB_API_KEY` | Client | ImgBB upload key (reserved) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Stripe.js key (reserved) |
| `NEXT_PUBLIC_DEMO_MODE` | Client | Demo messaging toggle (reserved) |

Backend-only values (not committed here): MongoDB URI, Better Auth secret and URL, Google OAuth client ID/secret, Stripe secret key and webhook signing secret, ImgBB key if uploads are proxied by the server.

### Migration sequence

1. Build the Express + MongoDB API and seed the same domain model.
2. Add Better Auth, session cookies, and role-aware middleware.
3. Replace `store-provider.tsx` action bodies with API calls while keeping the UI contracts.
4. Move image uploads behind the API and store returned URLs.
5. Add Stripe Checkout Sessions, success/cancel URLs, and the webhook.
6. Remove `NEXT_PUBLIC_DEMO_MODE` messaging and delete the local seed once the API is authoritative.

---

## 14. Known limitations

- Demo data, credentials, and payments are browser-local and not secure.
- Google sign-in and Stripe are simulations; no external service is contacted.
- Data does not sync across devices and can be lost when storage is cleared.
- Seed dates are relative to first creation; clear storage to refresh examples.
- No email verification, password reset, reschedule, refund, or coupon flow.
- Admin authorization is client-side in the demo and must be duplicated on the server.
- Uploaded data URLs can approach storage limits if many large images are added; production should use an image host.
- The production build is verified for this environment; deployment-specific cache or monorepo issues may require clearing `.next`.

---

## 15. Development history

Work was delivered in focused commits so each layer is reviewable:

1. Project initialization and tooling.
2. Design tokens and shared UI primitives.
3. Editorial homepage, navbar, and footer.
4. Searchable and filterable service menu.
5. Sign-in, sign-up, and demo Google flow.
6. Protected service details and booking requests.
7. Config and lint corrections.
8. Dashboard shell and role navigation.
9. Shared selectors and statistics.
10. Customer and admin overviews.
11. Customer appointments and profile.
12. Demo checkout, receipt, and cancellation.
13. Admin services, appointments, customers, and transactions.
14. Loading, error, and not-found states.
15. README and project documentation.

Run `git log --oneline` for the full list. The repository contains 20+ meaningful commits.

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
- [x] TypeScript, ESLint, and production build verified
- [ ] Add live site and repository URLs after deployment
- [ ] Replace demo actions with the live API, Better Auth, ImgBB, and Stripe

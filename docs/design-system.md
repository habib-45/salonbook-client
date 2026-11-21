# SalonBook — Design System

A warm, editorial system for a neighbourhood salon: cream paper, deep burgundy, muted rose, soft sage, and antique gold. The interface should feel considered and calm rather than clinical or trend-driven.

- **Display type:** Cormorant Garamond
- **Body type:** Manrope
- **Shape language:** soft, rounded, generous whitespace, thin sand borders
- **Motion:** gentle fades, small lifts, and restrained float effects
- **Voice:** warm, direct, quietly confident
- **Themes:** warm cream light mode and a deep espresso dark mode from one semantic token set

---

## 1. Colour

Tokens are defined in `app/globals.css` with Tailwind CSS v4 `@theme`. Components use semantic utilities such as `bg-surface`, `text-ink`, `text-accent`, and `border-sand`; the same markup renders in both themes because `html.dark` overrides the variable values.

### Semantic tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `paper` | `#faf5ef` | `#faf5ef` | Text and marks on fixed dark surfaces |
| `surface` | `#ffffff` | `#241d19` | Cards, panels, menus, inputs |
| `scrim` | `#1b1210` | `#0b0807` | Modal and drawer backdrops |
| `ink` | `#241c18` | `#f4ede5` | Primary text |
| `ink-soft` | `#66574e` | `#b7a89e` | Body copy and secondary labels |
| `cream` | `#faf5ef` | `#15110f` | Page background |
| `cream-deep` | `#f1e7db` | `#211a16` | Secondary surfaces, wells, hover fills |
| `sand` | `#e7d9c9` | `#352a24` | Borders, dividers, quiet outlines |
| `sand-dark` | `#d8c5b1` | `#4a3a31` | Stronger borders and decorative rules |
| `accent` | `#59243a` | `#e3a3b0` | Primary actions, links, active navigation |
| `rose` | `#c47d8b` | `#d795a4` | Highlights and italic emphasis |
| `rose-light` | `#f2dde1` | `#38232a` | Soft accent fills and selection |
| `sage` | `#778a72` | `#9cb394` | Success and calm confirmation |
| `sage-light` | `#e7eee3` | `#253024` | Success backgrounds |
| `gold` | `#b2874b` | `#d6ab69` | Ratings, premium accents, small details |
| `gold-light` | `#f1e5d1` | `#33291d` | Warm highlight surfaces |

The original `burgundy` and `burgundy-dark` tokens remain for fixed dark brand surfaces such as the footer and sidebar.

### Functional colours

Status and feedback use semantic tokens so both themes keep readable contrast:

| Meaning | Tokens |
| --- | --- |
| Success / paid / active | `success`, `success-soft`, `success-line`, `success-solid` |
| Warning / pending / unpaid | `warning`, `warning-soft`, `warning-line`, `warning-solid` |
| Danger / cancelled / blocked | `danger`, `danger-soft`, `danger-line`, `danger-solid` |
| Information | `cream-deep` or `gold-light` surface, `ink` text |
| Selected | `accent` border or fill with light text |

### Theme behavior

- `components/providers/theme-provider.tsx` reads `salonbook-theme` from `localStorage` and supports `light`, `dark`, and `system`.
- `components/ui/theme-toggle.tsx` shows a moon in light mode and a sun in dark mode.
- The toggle appears in the public navbar, auth layout, dashboard header, and mobile sidebar.
- An inline script in `app/layout.tsx` applies the theme to `<html>` before paint, preventing a flash of the wrong palette.
- `html.dark` sets `color-scheme: dark`, so native controls and scrollbars match.

### Usage rules

- Use `accent` for one primary action per view, not for every link.
- Keep large areas `cream` or `cream-deep`; fixed burgundy is reserved for navigation, footer, and dramatic bands.
- Gold is an accent for ratings and fine details, never body text.
- Use semantic tokens instead of raw hex values or `dark:` overrides wherever the token already expresses the intent.
- When a component sits on a fixed dark surface, use `text-paper` / `text-cream` explicitly rather than `text-ink`.

---

## 2. Typography

### Families

```css
font-serif  → Cormorant Garamond, weights 400–700
font-sans   → Manrope, variable weight
```

Both are loaded through `next/font/google` in `app/layout.tsx` and exposed as CSS variables.

### Scale

| Role | Classes | Notes |
| --- | --- | --- |
| Hero headline | `font-serif text-[3.6rem] sm:text-[4.8rem] lg:text-[5.45rem] xl:text-[6rem]` | Tight leading and negative tracking |
| Page title | `font-serif text-4xl tracking-[-0.03em]` | Dashboard and auth headings |
| Section title | `font-serif text-[2.5rem] sm:text-[3.2rem] tracking-[-0.04em]` | Marketing sections |
| Card title | `font-serif text-xl` to `text-2xl` | Service and panel titles |
| Eyebrow | `.eyebrow` | 11 px, 700 weight, 0.18em tracking, uppercase, accent |
| Body | `text-sm` or `text-base`, `leading-6`/`leading-7` | Ink-soft for supporting copy |
| Meta / label | `text-[0.625rem]` to `text-xs`, uppercase tracking | Timestamps, table labels, helper text |

### Principles

- Headlines are sentence case, often with one italic burgundy word for emphasis.
- Avoid all-caps for long phrases; reserve it for eyebrows, badges, and small labels.
- Use `text-wrap: balance` on headings; the base styles already apply it.
- Keep body copy between 55 and 75 characters per line.
- Use tabular or aligned numerals where prices and statistics sit in columns.

---

## 3. Layout, spacing, and shape

### Containers

| Token | Value |
| --- | --- |
| `.container-page` max width | `1320px` |
| Mobile padding | `1.25rem` |
| Tablet padding | `2rem` |
| Desktop padding | `2.5rem` |
| Section vertical rhythm | `5rem` mobile, `6rem` tablet, `7rem` desktop |

### Grid patterns

- Marketing: single column on mobile, two columns for hero and detail, three for service cards.
- Dashboard: fixed 272 px sidebar on `lg`, fluid content with a maximum comfortable reading width.
- Forms: one column, with paired fields on larger screens where the relationship is obvious.
- Tables: horizontal scroll on small screens with sticky headers where useful.

### Radius

| Element | Radius |
| --- | --- |
| Buttons and inputs | `0.85rem` to `1rem` |
| Cards and panels | `1.25rem` to `1.6rem` |
| Pills and badges | Full |
| Hero imagery | Large top arch (`13rem`–`16rem`) with soft bottom corners |
| Modal | `1.6rem` |

### Elevation

Shadows are warm and low-contrast, never neutral grey:

```text
0 18px 50px -20px rgba(47, 35, 28, 0.45)
0 30px 70px -50px rgba(45, 28, 20, 0.55)
```

Use borders (`border-sand`) for structure and shadows only to lift interactive or floating surfaces.

---

## 4. Components

### Buttons — `components/ui/button.tsx`

| Variant | Use |
| --- | --- |
| `primary` | Main action: book, save, pay, confirm |
| `secondary` | Supporting action on light surfaces |
| `outline` | Alternate action beside a primary |
| `ghost` | Low-emphasis tertiary action |
| `light` | Action on burgundy or dark surfaces |
| `destructive` | Delete, block, cancel |

Sizes: `sm`, `md`, `lg`, `icon`. All buttons support a `loading` state with a spinner and disabled styling. Links that look like buttons use `ButtonLink` so semantics stay correct.

### Form fields — `components/ui/form-field.tsx`

- `Field` supplies the label, optional marker, hint, and error message.
- `Input`, `Textarea`, and `Select` share border, focus, invalid, and disabled states.
- Errors are linked through `aria-describedby` and marked with `aria-invalid`.
- Labels sit above fields; placeholders are examples, never the only label.

### Modal and confirmation — `components/ui/modal.tsx`, `confirm-dialog.tsx`

- Modal panel uses a surface token, thin sand border, rounded top corners, and a scrim backdrop.
- Escape closes, backdrop click closes where safe, body scroll is locked while open.
- Confirmation dialogs state the consequence, use a destructive action for irreversible operations, and keep the safe action visually quieter.

### Feedback — `components/ui/feedback.tsx`

- `PageLoader` for route/session hydration.
- `DashboardSkeleton` and `ServiceGridSkeleton` for structured loading.
- `FormAlert` for form-level errors.
- `EmptyState` for no results, no appointments, and no transactions.
- `ErrorState` for recoverable panel-level failures.

### Badges — `components/ui/status-badge.tsx`

Supported statuses: `pending`, `confirmed`, `cancelled`, `paid`, `unpaid`, `active`, `inactive`. Each combines a dot, label, and tinted surface. Never rely on colour alone; the label is always present.

### Image upload — `components/ui/image-upload.tsx`

- Accepts JPG, PNG, and WebP up to 5 MB.
- Supports click, drag-and-drop, preview, replace, and remove.
- Resizes the longest side to 1400 px and compresses to JPEG at 0.84 quality.
- Reports type/size/process errors through toasts and inline error text.
- Square variant is used for avatars; landscape variant is used for service images.

### Dashboard primitives — `components/dashboard/ui.tsx`

- `PageHeader` for eyebrow, title, description, and actions.
- `StatCard` for key numbers with icon, label, and supporting note.
- `DashPanel` for grouped content with a title, action, and body.
- `SectionLabel` for quiet grouping inside panels.

### Theme toggle — `components/ui/theme-toggle.tsx`

- A circular icon button with a moon in light mode and a sun in dark mode.
- Uses `bg-surface`, `border-sand`, and `text-ink-soft`, with a visible hover and focus ring.
- Carries an accessible label, "Toggle light and dark theme", and does not rely on the icon alone for meaning.
- Sizes: `md` for headers and navbars, `sm` for compact sidebar rows.

### Navigation

- Marketing navbar: transparent over cream, sticky, with a mobile drawer, theme toggle, and account-aware actions.
- Dashboard sidebar: burgundy-dark, fixed on desktop, drawer on mobile, active item marked with a rose bar and lighter surface.
- Account menu: avatar trigger, role label, profile, view salon, and sign out.
- Footer: dark burgundy with salon details, hours, links, and social placeholders.

---

## 5. Interaction patterns

### Toasts

- Top-right, stacked, auto-dismiss after 4.8 seconds, maximum four visible.
- Variants: success, error, info.
- Every mutation reports through a toast; inline errors remain for field-level correction.
- Live region is polite and labelled "Notifications".

### Loading

- Use skeletons for content-shaped waits.
- Use button spinners for submissions and disable the action while pending.
- Use `PageLoader` when the whole session or route is hydrating.
- Never leave a button clickable while its request is in flight.

### Empty states

- Explain what is missing, why it might be missing, and the next useful action.
- Examples: no services match filters, no appointments yet, no transactions for a filter.
- Keep the illustration/icon quiet and the action primary.

### Destructive actions

- Always confirm cancellation, deletion, and blocking.
- Name the object in the dialog: "Cancel this appointment?" not "Are you sure?"
- Use `destructive` styling only on the irreversible action.

### Motion

| Token | Behavior |
| --- | --- |
| `animate-fade-up` | Content enters with a short upward fade |
| `animate-toast-in` | Toast slides in from the top-right |
| `animate-soft-float` | Decorative hero badge drifts gently |
| `animate-spin-slow` | Loading ring on auth screens |

Respect reduced motion where practical; keep essential state changes instantaneous and never rely on animation to communicate status.

---

## 6. Content and voice

- Warm, human, and concise. Prefer "Request appointment" over "Submit".
- Use "guest" and "customer" interchangeably in marketing; use "customer" in admin tables.
- Payment copy describes the Stripe hosted checkout and webhook-verified receipt.
- Errors should say what happened and what to do next.
- Avoid exclamation marks, jargon, and pressure language.
- Prices are USD and formatted without decimals when whole.
- Dates use `MMM d, yyyy`; times use the seeded 12-hour slot labels.

---

## 7. Accessibility checklist

- [ ] Every input has a visible, associated label.
- [ ] Invalid fields set `aria-invalid` and connect their error text.
- [ ] Icon-only buttons have `aria-label` or an accessible title.
- [ ] Focus is visible on all interactive elements.
- [ ] Modals and drawers close with Escape and restore body scroll.
- [ ] Colour is never the only status signal; labels accompany badges.
- [ ] Decorative images use empty alt text; meaningful images describe the content.
- [ ] Toasts announce through a polite live region.
- [ ] Headings follow a sensible order on every page.
- [ ] Text and controls remain usable at 200% zoom and 360 px width.
- [ ] Animations are subtle and do not block interaction.
- [ ] Both themes keep body text, muted labels, borders, status tints, and focus rings readable.
- [ ] The theme toggle has an accessible name and a visible focus state.
- [ ] The stored theme survives reload and a system preference change is followed while in system mode.

---

## 8. Do and don't

| Do | Don't |
| --- | --- |
| Use `cream`/`surface` as the default canvas | Fill large areas with saturated burgundy or rose |
| Pair serif display type with restrained sans body copy | Use the serif for long paragraphs |
| Keep one primary action per section | Compete with multiple filled burgundy buttons |
| Use thin sand borders and soft shadows | Use heavy drop shadows or hard grey borders |
| Confirm destructive actions with specific copy | Use native `confirm()` or vague "Are you sure?" |
| Show skeletons for structured loading | Show a blank page or a spinner for every wait |
| Preserve the warm, calm voice | Use clinical or high-pressure sales language |

---

## 9. Adding a new component

1. Check whether an existing primitive in `components/ui` can be extended.
2. Use theme tokens rather than raw colours.
3. Support hover, focus-visible, disabled, invalid, and loading states where relevant.
4. Keep the component accessible by default: labels, keyboard behavior, ARIA only when needed.
5. Document any new token or pattern here.
6. Verify at 360 px, 768 px, and 1440 px before committing.

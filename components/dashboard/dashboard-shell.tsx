"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Scissors,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Avatar } from "@/components/ui/avatar"
import { Logo } from "@/components/ui/logo"
import { SALON } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
}

const customerNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/appointments", label: "My appointments", icon: CalendarDays },
  { href: "/dashboard/profile", label: "My profile", icon: UserRound },
]

const adminNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/admin/services", label: "Services", icon: Scissors },
  { href: "/dashboard/admin/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/dashboard/admin/users", label: "Customers", icon: UsersRound },
  { href: "/dashboard/admin/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/dashboard/profile", label: "My profile", icon: UserRound },
]

function navItemActive(item: NavItem, pathname: string) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href)
}

function currentSectionLabel(nav: NavItem[], pathname: string) {
  if (pathname.startsWith("/dashboard/payments")) return "Secure checkout"
  const match = [...nav]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => navItemActive(item, pathname))
  return match?.label ?? "Dashboard"
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { currentUser, signOut } = useStore()
  const pathname = usePathname()
  const router = useRouter()
  const toast = useToast()

  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [accountOpen, setAccountOpen] = React.useState(false)
  const accountRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false)
        setMobileOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  if (!currentUser) return null

  const nav = currentUser.role === "admin" ? adminNav : customerNav
  const sectionLabel = currentSectionLabel(nav, pathname)
  const closeMobile = () => setMobileOpen(false)

  const handleSignOut = () => {
    signOut()
    setMobileOpen(false)
    setAccountOpen(false)
    toast.success("Signed out", "Come back soon for another little ritual.")
    router.push("/")
  }

  return (
    <div className="min-h-dvh bg-cream">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col overflow-hidden bg-burgundy-dark text-cream lg:flex">
        <div className="pointer-events-none absolute -top-28 -right-24 size-72 rounded-full bg-rose/15 blur-[70px]" />
        <div className="pointer-events-none absolute bottom-20 -left-24 size-64 rounded-full bg-gold/10 blur-[70px]" />

        <div className="relative flex h-[4.75rem] shrink-0 items-center px-6">
          <Logo variant="light" href="/dashboard" />
        </div>

        <div className="relative px-4">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-white/10">
                <Sparkles className="size-3 text-gold" />
              </span>
              <span className="text-[0.625rem] font-bold tracking-[0.13em] text-cream/65 uppercase">
                {currentUser.role === "admin" ? "Salon studio" : "Guest studio"}
              </span>
            </div>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.5625rem] font-semibold text-cream/55">
              Live API
            </span>
          </div>
        </div>

        <nav className="relative mt-6 flex-1 overflow-y-auto px-3" aria-label="Dashboard navigation">
          <p className="px-3 pb-2 text-[0.5625rem] font-bold tracking-[0.18em] text-cream/35 uppercase">
            {currentUser.role === "admin" ? "Manage the salon" : "Your salon"}
          </p>
          <div className="space-y-1">
            {nav.map((item) => {
              const active = navItemActive(item, pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-cream text-burgundy shadow-[0_12px_30px_-20px_rgba(0,0,0,0.8)]"
                      : "text-cream/65 hover:bg-white/[0.07] hover:text-cream"
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-[1.05rem] shrink-0",
                      active ? "text-burgundy" : "text-cream/40 group-hover:text-cream/70"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                  {active ? (
                    <span className="ml-auto size-1.5 rounded-full bg-gold" />
                  ) : null}
                </Link>
              )
            })}
          </div>

          <div className="mt-7 border-t border-white/10 pt-5">
            <Link
              href="/services"
              onClick={closeMobile}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/55 transition hover:bg-white/[0.07] hover:text-cream"
            >
              <span className="inline-flex items-center gap-3">
                <ArrowUpRight className="size-4" />
                Browse the menu
              </span>
            </Link>
            <a
              href={`tel:${SALON.phone.replace(/[^+\d]/g, "")}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-cream/40 transition hover:bg-white/[0.07] hover:text-cream/75"
            >
              <span className="size-1 rounded-full bg-gold" />
              {SALON.phone}
            </a>
          </div>
        </nav>

        <div className="relative shrink-0 border-t border-white/10 p-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
            <div className="flex items-center gap-2.5">
              <Avatar src={currentUser.image} name={currentUser.name} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-cream">{currentUser.name}</p>
                <p className="truncate text-[0.625rem] text-cream/45">{currentUser.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[0.5625rem] font-semibold tracking-[0.08em] text-cream/40 uppercase">
                <ShieldCheck className="size-3 text-gold/80" />
                {currentUser.role === "admin" ? "Administrator" : "Customer"}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.625rem] font-semibold text-cream/55 transition hover:bg-white/10 hover:text-cream"
              >
                <LogOut className="size-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b border-sand/70 bg-cream/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex size-9 items-center justify-center rounded-full border border-sand bg-white/60 text-ink-soft transition hover:text-ink lg:hidden"
                aria-label="Open dashboard menu"
                aria-expanded={mobileOpen}
              >
                <Menu className="size-4.5" />
              </button>
              <div className="min-w-0">
                <p className="hidden text-[0.5625rem] font-bold tracking-[0.15em] text-burgundy uppercase sm:block">
                  {currentUser.role === "admin" ? "Salon studio" : "Your salon"}
                </p>
                <p className="truncate text-sm font-semibold text-ink sm:mt-0.5">
                  {sectionLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-[#e6d8c4] bg-[#fffaf2] px-3 py-1.5 text-[0.5625rem] font-bold tracking-[0.1em] text-[#84612d] uppercase md:inline-flex">
                <span className="size-1.5 rounded-full bg-[#b68a45]" />
                Secure workspace
              </span>

              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  className="flex h-9 items-center gap-2 rounded-full border border-sand/90 bg-white/60 py-0.5 pr-2 pl-0.5 text-xs font-semibold transition hover:border-sand-dark hover:bg-white"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                >
                  <Avatar src={currentUser.image} name={currentUser.name} size={30} />
                  <span className="hidden max-w-[100px] truncate sm:block">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3 text-ink-soft transition",
                      accountOpen && "rotate-180"
                    )}
                  />
                </button>

                {accountOpen ? (
                  <div
                    role="menu"
                    className="animate-fade-up absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-sand/80 bg-cream p-2 shadow-[0_24px_70px_-24px_rgba(45,30,22,0.5)]"
                  >
                    <div className="rounded-xl bg-white/55 px-3 py-2.5">
                      <p className="truncate text-sm font-semibold">{currentUser.name}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-soft">
                        {currentUser.email}
                      </p>
                      <span className="mt-2 inline-flex rounded-full bg-rose-light/80 px-2 py-0.5 text-[0.5625rem] font-bold tracking-[0.1em] text-burgundy uppercase">
                        {currentUser.role}
                      </span>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink-soft transition hover:bg-white/70 hover:text-ink"
                    >
                      <UserRound className="size-4" />
                      Edit profile
                    </Link>
                    <Link
                      href="/"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink-soft transition hover:bg-white/70 hover:text-ink"
                    >
                      <ArrowUpRight className="size-4" />
                      Visit the salon
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-[#9d3c43] transition hover:bg-[#fff1f1]"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-9">
          {children}
        </main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Dashboard menu">
          <button
            type="button"
            aria-label="Close dashboard menu"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            onClick={closeMobile}
          />
          <div className="animate-fade-in absolute inset-y-0 left-0 flex w-[86%] max-w-[318px] flex-col overflow-y-auto bg-burgundy-dark text-cream shadow-2xl">
            <div className="flex items-center justify-between gap-4 px-5 py-5">
              <Logo variant="light" href="/dashboard" />
              <button
                type="button"
                onClick={closeMobile}
                className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-cream/75"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="px-5">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3">
                <Avatar src={currentUser.image} name={currentUser.name} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{currentUser.name}</p>
                  <p className="truncate text-[0.6875rem] text-cream/45">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3 py-6" aria-label="Mobile dashboard navigation">
              <div className="space-y-1">
                {nav.map((item) => {
                  const active = navItemActive(item, pathname)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobile}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm",
                        active
                          ? "bg-cream text-burgundy"
                          : "text-cream/65 hover:bg-white/[0.07] hover:text-cream"
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
              <div className="mt-6 border-t border-white/10 pt-4">
                <Link
                  href="/services"
                  onClick={closeMobile}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-cream/55 hover:bg-white/[0.07]"
                >
                  <ArrowUpRight className="size-4" />
                  Browse the menu
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm text-cream/55 hover:bg-white/[0.07]"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            </nav>

            <div className="border-t border-white/10 px-5 py-5 text-[0.625rem] leading-5 text-cream/35">
              Your salon data is stored securely and synced with the SalonBook API.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

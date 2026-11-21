"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Calendar,
  ChevronDown,
  Clock3,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Phone,
  UserRound,
  X,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Avatar } from "@/components/ui/avatar"
import { ButtonLink } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SALON } from "@/lib/constants"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/#story", label: "Our story" },
  { href: "/#visit", label: "Visit" },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  if (href === "/services") return pathname.startsWith("/services")
  return false
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, isHydrated, signOut } = useStore()
  const toast = useToast()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [accountOpen, setAccountOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const closeMenus = React.useCallback(() => {
    setMenuOpen(false)
    setAccountOpen(false)
  }, [])

  React.useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false)
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  const handleSignOut = () => {
    signOut()
    setAccountOpen(false)
    setMenuOpen(false)
    toast.success("Signed out", "Come back soon for another little ritual.")
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden border-b border-white/10 bg-burgundy-dark text-paper/85 md:block">
        <div className="container-page flex h-8 items-center justify-between gap-6 text-[0.6875rem] tracking-[0.02em]">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3 text-rose" />
              {SALON.address}
            </span>
            <span className="hidden items-center gap-1.5 lg:inline-flex">
              <Clock3 className="size-3 text-rose" />
              Mon–Fri 9–8 · Sat 9–7
            </span>
          </div>
          <a
            href={`tel:${SALON.phone.replace(/[^+\d]/g, "")}`}
            className="inline-flex items-center gap-1.5 transition hover:text-white"
          >
            <Phone className="size-3 text-rose" />
            {SALON.phone}
          </a>
        </div>
      </div>

      <div className="border-b border-ink/8 bg-cream/92 backdrop-blur-xl">
        <nav className="container-page flex h-[4.5rem] items-center justify-between gap-6" aria-label="Main navigation">
          <Logo />

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMenus}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[0.8125rem] font-medium transition-colors",
                  isActive(pathname, link.href)
                    ? "text-accent"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                {link.label}
                {isActive(pathname, link.href) ? (
                  <span className="absolute inset-x-3.5 -bottom-[0.1rem] h-px bg-burgundy" />
                ) : null}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isHydrated ? (
              <span className="skeleton hidden h-10 w-32 rounded-full sm:block" />
            ) : currentUser ? (
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  className="flex h-10 items-center gap-2.5 rounded-full border border-sand/90 bg-surface/60 py-1 pr-2.5 pl-1.5 text-sm font-semibold text-ink transition hover:border-sand-dark hover:bg-surface"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                >
                  <Avatar src={currentUser.image} name={currentUser.name} size={30} />
                  <span className="hidden max-w-[110px] truncate sm:block">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={cn("size-3.5 text-ink-soft transition", accountOpen && "rotate-180")}
                  />
                </button>

                {accountOpen ? (
                  <div
                    role="menu"
                    className="animate-fade-up absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-sand/80 bg-cream p-2 shadow-[0_24px_70px_-24px_rgba(45,30,22,0.5)]"
                  >
                    <div className="rounded-xl bg-surface/55 px-3 py-2.5">
                      <p className="truncate text-sm font-semibold">{currentUser.name}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-soft">{currentUser.email}</p>
                      <span className="mt-2 inline-flex rounded-full bg-rose-light/80 px-2 py-0.5 text-[0.625rem] font-bold tracking-[0.1em] text-accent uppercase">
                        {currentUser.role}
                      </span>
                    </div>
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      onClick={closeMenus}
                      className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink-soft transition hover:bg-surface/70 hover:text-ink"
                    >
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      role="menuitem"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink-soft transition hover:bg-surface/70 hover:text-ink"
                    >
                      <UserRound className="size-4" />
                      My profile
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-danger transition hover:bg-danger-soft"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-ink-soft transition hover:bg-surface/60 hover:text-ink sm:inline-flex"
                >
                  Sign in
                </Link>
                <ButtonLink href="/signup" size="sm" className="hidden sm:inline-flex">
                  Create account
                </ButtonLink>
              </>
            )}

            <ButtonLink
              href="/services"
              size="sm"
              variant="outline"
              className="hidden xl:inline-flex"
            >
              <Calendar className="size-3.5" />
              Book now
            </ButtonLink>

            <ThemeToggle />

            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full border border-sand/90 bg-surface/55 text-ink lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </div>

      {menuOpen ? (
        <div
          id="mobile-navigation"
          className="animate-fade-in fixed inset-x-0 top-[4.5rem] bottom-0 z-40 overflow-y-auto border-t border-sand bg-cream px-5 py-7 lg:hidden"
        >
          <div className="mx-auto flex max-w-md flex-col">
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={closeMenus}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3.5 font-serif text-2xl tracking-[-0.02em]",
                    isActive(pathname, link.href)
                      ? "bg-cream-deep text-accent"
                      : "text-ink hover:bg-surface/60"
                  )}
                >
                  {link.label}
                  <span className="font-sans text-xs font-semibold text-ink-soft">0{links.indexOf(link) + 1}</span>
                </Link>
              ))}
            </div>

            <div className="my-6 h-px bg-sand" />

            {isHydrated && currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-sand/70 bg-surface/55 p-3">
                  <Avatar src={currentUser.image} name={currentUser.name} size={44} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{currentUser.name}</p>
                    <p className="truncate text-xs text-ink-soft">{currentUser.email}</p>
                  </div>
                </div>
                <ButtonLink href="/dashboard" className="w-full" onClick={closeMenus}>
                  Go to dashboard
                </ButtonLink>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full rounded-full border border-danger-line py-3 text-sm font-semibold text-danger"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <ButtonLink href="/signin" variant="outline" className="w-full" onClick={closeMenus}>
                  Sign in
                </ButtonLink>
                <ButtonLink href="/signup" className="w-full" onClick={closeMenus}>
                  Create account
                </ButtonLink>
              </div>
            )}

            <div className="mt-8 rounded-2xl bg-burgundy px-5 py-6 text-paper">
              <p className="font-serif text-2xl leading-tight tracking-[-0.02em]">
                Your chair is waiting.
              </p>
              <p className="mt-2 text-xs leading-5 text-paper/70">
                Call us at {SALON.phone} or browse the full service menu.
              </p>
              <ButtonLink href="/services" variant="light" size="sm" className="mt-4" onClick={closeMenus}>
                Explore services
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

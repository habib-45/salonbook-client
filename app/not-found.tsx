import Link from "next/link"
import { ArrowLeft, ArrowUpRight, CalendarDays, Home, Scissors, Search } from "lucide-react"
import { ButtonLink } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="container-page flex h-[4.5rem] items-center justify-between border-b border-sand/60">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          Back home
        </Link>
      </header>

      <main className="container-page flex flex-1 items-center justify-center py-14">
        <div className="w-full max-w-2xl text-center">
          <div className="relative mx-auto flex size-20 items-center justify-center rounded-full border border-sand bg-white/60">
            <span className="font-serif text-4xl italic text-burgundy">404</span>
            <span className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-gold text-cream">
              <Scissors className="size-3.5" />
            </span>
          </div>

          <p className="eyebrow mt-7 justify-center before:hidden">A small detour</p>
          <h1 className="mt-3 font-serif text-[3rem] leading-[0.98] tracking-[-0.04em] sm:text-[4rem]">
            This page isn&apos;t on the menu.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink-soft">
            The page you were looking for may have moved, or the link might be incomplete.
            Let&apos;s get you back to something lovely.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
            <ButtonLink href="/">
              <Home className="size-4" />
              Return home
            </ButtonLink>
            <ButtonLink href="/services" variant="outline">
              <CalendarDays className="size-4" />
              Browse services
            </ButtonLink>
          </div>

          <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
            <Link
              href="/services"
              className="group rounded-2xl border border-sand/80 bg-white/45 p-4 transition hover:border-sand-dark hover:bg-white/70"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-cream-deep text-burgundy">
                <Search className="size-4" />
              </span>
              <p className="mt-3 text-sm font-semibold">Find your next ritual</p>
              <p className="mt-1 text-xs leading-5 text-ink-soft">
                Search the full menu by name, category, or price.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[0.625rem] font-bold tracking-[0.08em] text-burgundy uppercase">
                Explore the menu
                <ArrowUpRight className="size-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>

            <Link
              href="/dashboard"
              className="group rounded-2xl border border-sand/80 bg-white/45 p-4 transition hover:border-sand-dark hover:bg-white/70"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-cream-deep text-burgundy">
                <CalendarDays className="size-4" />
              </span>
              <p className="mt-3 text-sm font-semibold">Check your appointments</p>
              <p className="mt-1 text-xs leading-5 text-ink-soft">
                View requests, confirmations, and payment receipts.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[0.625rem] font-bold tracking-[0.08em] text-burgundy uppercase">
                Go to dashboard
                <ArrowUpRight className="size-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-sand/60 py-5 text-center text-[0.625rem] text-ink-soft/60">
        SalonBook · Thoughtful beauty, beautifully booked.
      </footer>
    </div>
  )
}

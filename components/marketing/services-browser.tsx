"use client"

import * as React from "react"
import { ArrowUpRight, Search, SlidersHorizontal, X } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { ButtonLink } from "@/components/ui/button"
import { EmptyState, ServiceGridSkeleton } from "@/components/ui/feedback"
import { Select } from "@/components/ui/form-field"
import { ServiceCard } from "@/components/marketing/service-card"
import { SERVICE_CATEGORIES } from "@/lib/constants"
import { cn } from "@/lib/utils"

type SortOption = "recommended" | "price-asc" | "price-desc" | "duration-asc"

const sortLabels: Record<SortOption, string> = {
  recommended: "Recommended",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "duration-asc": "Duration: shortest",
}

export function ServicesBrowser({ initialCategory }: { initialCategory: string }) {
  const { db, isHydrated } = useStore()
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState(
    SERVICE_CATEGORIES.includes(initialCategory as (typeof SERVICE_CATEGORIES)[number])
      ? initialCategory
      : "All services"
  )
  const [sort, setSort] = React.useState<SortOption>("recommended")

  const activeServices = React.useMemo(
    () => (db?.services ?? []).filter((service) => service.status === "active"),
    [db]
  )

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase()

    const results = activeServices.filter((service) => {
      const matchesQuery = !term || service.serviceName.toLowerCase().includes(term)
      const matchesCategory = category === "All services" || service.category === category
      return matchesQuery && matchesCategory
    })

    return [...results].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "duration-asc":
          return a.duration - b.duration
        default:
          return activeServices.indexOf(a) - activeServices.indexOf(b)
      }
    })
  }, [activeServices, category, query, sort])

  const hasFilters = query.trim().length > 0 || category !== "All services"

  const clearFilters = () => {
    setQuery("")
    setCategory("All services")
    setSort("recommended")
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-sand/70 bg-cream-deep">
        <div className="pointer-events-none absolute -top-32 right-[-6rem] size-[360px] rounded-full bg-rose-light/55 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-[-10rem] left-[18%] size-[280px] rounded-full bg-gold-light/80 blur-[80px]" />
        <div className="container-page relative flex flex-col gap-8 py-14 sm:py-16 lg:flex-row lg:items-end lg:justify-between lg:py-20">
          <div className="max-w-2xl animate-fade-up">
            <p className="eyebrow mb-5">The salon menu</p>
            <h1 className="font-serif text-[3rem] leading-[0.96] tracking-[-0.045em] text-ink sm:text-[4rem] lg:text-[4.6rem]">
              A ritual for
              <br />
              every <span className="italic text-accent">version of you.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-ink-soft sm:text-[0.9375rem]">
              Explore hair, skin, makeup, nail, and spa services designed to make you feel
              more like yourself. Search by name, browse by category, or sort by price.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-sand/80 bg-surface/50 p-4 pr-5 backdrop-blur-sm sm:gap-5">
            <span className="flex size-11 items-center justify-center rounded-full bg-burgundy text-paper">
              <ArrowUpRight className="size-4" />
            </span>
            <div>
              <p className="text-[0.625rem] font-bold tracking-[0.13em] text-accent uppercase">
                Not sure where to begin?
              </p>
              <p className="mt-1 text-xs leading-5 text-ink-soft">
                Call us at{" "}
                <a href="tel:+17185550184" className="font-semibold text-ink underline decoration-sand-dark underline-offset-2">
                  (718) 555-0184
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 lg:py-14">
        <div className="container-page">
          <div className="rounded-2xl border border-sand/80 bg-surface/55 p-3.5 shadow-[0_18px_50px_-42px_rgba(52,37,28,0.45)] sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Search services by name</span>
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by service name…"
                  className="input-field h-11 pl-10"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2 lg:flex">
                <div className="relative">
                  <span className="sr-only">Filter by category</span>
                  <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-ink-soft" />
                  <Select
                    aria-label="Filter by category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-11 bg-surface/70 pl-10 lg:w-[210px]"
                  >
                    <option value="All services">All categories</option>
                    {SERVICE_CATEGORIES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>

                <Select
                  aria-label="Sort services"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOption)}
                  className="h-11 bg-surface/70 lg:w-[190px]"
                >
                  {Object.entries(sortLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {["All services", ...SERVICE_CATEGORIES].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-[0.6875rem] font-semibold transition",
                    category === option
                      ? "border-accent bg-burgundy text-paper"
                      : "border-sand/80 bg-surface/45 text-ink-soft hover:border-sand-dark hover:text-ink"
                  )}
                >
                  {option === "All services" ? "All" : option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ink-soft">
              {isHydrated ? (
                <>
                  Showing <span className="font-bold text-ink">{filtered.length}</span>{" "}
                  {filtered.length === 1 ? "service" : "services"}
                  {category !== "All services" ? (
                    <>
                      {" "}
                      in <span className="font-semibold text-ink">{category}</span>
                    </>
                  ) : null}
                  {query.trim() ? (
                    <>
                      {" "}
                      for “<span className="font-semibold text-ink">{query.trim()}</span>”
                    </>
                  ) : null}
                </>
              ) : (
                "Gathering the menu…"
              )}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-surface/50 px-3 py-1.5 text-[0.6875rem] font-semibold text-ink-soft transition hover:border-sand-dark hover:text-ink"
              >
                <X className="size-3" />
                Clear filters
              </button>
            ) : null}
          </div>

          <div className="mt-7">
            {!isHydrated ? (
              <ServiceGridSkeleton count={6} />
            ) : filtered.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Search}
                title="No rituals found"
                description="Try a different service name or category, or clear your filters to see the full menu."
                action={
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-10 items-center rounded-full bg-burgundy px-5 text-sm font-semibold text-paper transition hover:bg-burgundy-dark"
                  >
                    Show all services
                  </button>
                }
                className="min-h-[310px]"
              />
            )}
          </div>

          <div className="mt-16 grid items-center gap-6 rounded-2xl bg-cream-deep px-6 py-8 sm:px-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-xl">
              <p className="text-[0.625rem] font-bold tracking-[0.15em] text-accent uppercase">
                A little guidance
              </p>
              <h2 className="mt-2 font-serif text-[2rem] leading-[1.08] tracking-[-0.03em] sm:text-[2.4rem]">
                Not sure which ritual is right for you?
              </h2>
              <p className="mt-2.5 text-sm leading-6 text-ink-soft">
                Tell us what you&apos;re hoping for and we&apos;ll help you find the perfect
                service. No pressure, just a thoughtful conversation.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <a
                href="tel:+17185550184"
                className="inline-flex h-11 items-center justify-center rounded-full bg-burgundy px-5 text-sm font-semibold text-paper transition hover:bg-burgundy-dark"
              >
                Call the salon
              </a>
              <ButtonLink href="/#visit" variant="outline">
                Visit us
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

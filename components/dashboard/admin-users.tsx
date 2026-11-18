"use client"

import * as React from "react"
import Link from "next/link"
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  UsersRound,
  X,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Avatar } from "@/components/ui/avatar"
import { Button, ButtonLink } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DashboardSkeleton, EmptyState } from "@/components/ui/feedback"
import { Select } from "@/components/ui/form-field"
import { PageHeader, StatCard } from "@/components/dashboard/ui"
import {
  getCustomerAppointmentCount,
  getCustomerSpend,
} from "@/lib/selectors"
import type { User } from "@/lib/types"
import { cn, formatCurrency, formatDate, sortByNewest } from "@/lib/utils"

type StatusFilter = "all" | "active" | "blocked"

export function AdminUsers() {
  const { db, currentUser, setUserBlocked } = useStore()
  const toast = useToast()

  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<StatusFilter>("all")
  const [blockTarget, setBlockTarget] = React.useState<User | null>(null)

  if (!db || !currentUser) return <DashboardSkeleton />

  const customers = sortByNewest(
    db.users.filter((user) => user.role === "customer")
  )
  const activeCount = customers.filter((user) => !user.isBlocked).length
  const blockedCount = customers.length - activeCount
  const repeatCount = customers.filter(
    (customer) => getCustomerAppointmentCount(db, customer.id) > 1
  ).length

  const term = query.trim().toLowerCase()
  const visible = customers.filter((customer) => {
    const matchesTerm =
      !term ||
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      (customer.phone ?? "").toLowerCase().includes(term)
    const matchesStatus =
      filter === "all" ||
      (filter === "active" && !customer.isBlocked) ||
      (filter === "blocked" && customer.isBlocked)
    return matchesTerm && matchesStatus
  })

  const hasFilters = Boolean(term) || filter !== "all"

  const clearFilters = () => {
    setQuery("")
    setFilter("all")
  }

  const handleBlockToggle = () => {
    if (!blockTarget) return
    const nextBlocked = !blockTarget.isBlocked
    const result = setUserBlocked(blockTarget.id, nextBlocked)
    if (!result.ok) {
      toast.error("Could not update customer access", result.error)
      return
    }
    toast.success(
      nextBlocked ? "Customer blocked" : "Customer unblocked",
      nextBlocked
        ? `${blockTarget.name} can no longer sign in or request appointments.`
        : `${blockTarget.name} can sign in and book appointments again.`
    )
    setBlockTarget(null)
  }

  return (
    <>
      <PageHeader
        eyebrow="Customer management"
        title="The people who make the salon."
        description="Search guests, review their salon history, and pause access when needed. Blocking prevents sign-in and new appointment requests without deleting history."
        actions={
          <ButtonLink href="/dashboard/admin/appointments" variant="outline">
            <CalendarDays className="size-4" />
            View appointments
          </ButtonLink>
        }
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={UsersRound}
          label="Total customers"
          value={customers.length}
          detail="Guest accounts in the salon"
          tone="neutral"
        />
        <StatCard
          icon={UserCheck}
          label="Active guests"
          value={activeCount}
          detail="Able to book and sign in"
          tone="sage"
        />
        <StatCard
          icon={Ban}
          label="Blocked access"
          value={blockedCount}
          detail="Cannot sign in or book"
          tone="rose"
        />
        <StatCard
          icon={CheckCircle2}
          label="Returning guests"
          value={repeatCount}
          detail="More than one appointment"
          tone="gold"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-sand/80 bg-white/55 p-3.5 shadow-[0_18px_50px_-42px_rgba(52,37,28,0.45)] sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search customers</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, or phone…"
              className="input-field h-11 pl-10"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-ink-soft transition hover:bg-cream-deep hover:text-ink"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </label>

          <Select
            aria-label="Filter customers by access"
            value={filter}
            onChange={(event) => setFilter(event.target.value as StatusFilter)}
            className="h-11 bg-white/70 sm:w-[190px]"
          >
            <option value="all">All customers</option>
            <option value="active">Active only</option>
            <option value="blocked">Blocked only</option>
          </Select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-soft">
          Showing <span className="font-bold text-ink">{visible.length}</span>{" "}
          {visible.length === 1 ? "customer" : "customers"}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-white/50 px-3 py-1.5 text-[0.6875rem] font-semibold text-ink-soft transition hover:border-sand-dark hover:text-ink"
          >
            <X className="size-3" />
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        {visible.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No customers found"
            description="Try a different name, email, phone number, or access filter."
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null
            }
            className="min-h-[320px]"
          />
        ) : (
          <>
            <div className="surface-card hidden overflow-hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-sand/80 bg-cream-deep/35">
                      {["Customer", "Contact", "Joined", "Appointments", "Spend", "Access", "Action"].map(
                        (heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className={cn(
                              "px-5 py-3 text-[0.5625rem] font-bold tracking-[0.13em] text-ink-soft uppercase",
                              heading === "Action" && "text-right"
                            )}
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/70">
                    {visible.map((customer) => {
                      const appointmentCount = getCustomerAppointmentCount(
                        db,
                        customer.id
                      )
                      const spend = getCustomerSpend(db, customer.id)
                      return (
                        <tr key={customer.id} className="transition hover:bg-white/45">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={customer.image}
                                name={customer.name}
                                size={36}
                              />
                              <div className="min-w-0">
                                <p className="max-w-[170px] truncate text-sm font-semibold">
                                  {customer.name}
                                </p>
                                <p className="text-[0.625rem] text-ink-soft">
                                  {customer.provider === "google"
                                    ? "Google-linked guest"
                                    : "Salon account"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="flex max-w-[220px] items-center gap-1.5 truncate text-[0.6875rem] text-ink-soft">
                              <Mail className="size-3 shrink-0" />
                              {customer.email}
                            </p>
                            {customer.phone ? (
                              <p className="mt-1 flex items-center gap-1.5 text-[0.625rem] text-ink-soft/80">
                                <Phone className="size-3 shrink-0" />
                                {customer.phone}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-ink-soft">
                            {formatDate(customer.createdAt.slice(0, 10))}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-semibold">
                              {appointmentCount}
                            </span>
                            <span className="ml-1 text-[0.625rem] text-ink-soft">
                              {appointmentCount === 1 ? "visit" : "visits"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs font-bold text-burgundy">
                            {formatCurrency(spend)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.625rem] font-semibold",
                                customer.isBlocked
                                  ? "border-[#e8c7c9] bg-[#fdf2f3] text-[#8f3f45]"
                                  : "border-[#ccdac5] bg-[#f2f8ee] text-[#516b48]"
                              )}
                            >
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  customer.isBlocked ? "bg-[#aa5359]" : "bg-[#718c66]"
                                )}
                              />
                              {customer.isBlocked ? "Blocked" : "Active"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                  customer.isBlocked
                                    ? "border-sage/30 text-[#516b48] hover:bg-sage-light/60"
                                    : "border-[#e2c4c4] text-[#9d3c43] hover:bg-[#fff1f1]"
                                )}
                                onClick={() => setBlockTarget(customer)}
                              >
                                {customer.isBlocked ? (
                                  <>
                                    <UserCheck className="size-3.5" />
                                    Unblock
                                  </>
                                ) : (
                                  <>
                                    <UserX className="size-3.5" />
                                    Block
                                  </>
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3.5 lg:hidden">
              {visible.map((customer) => {
                const appointmentCount = getCustomerAppointmentCount(db, customer.id)
                const spend = getCustomerSpend(db, customer.id)
                return (
                  <div key={customer.id} className="surface-card overflow-hidden p-4">
                    <div className="flex items-start gap-3.5">
                      <Avatar src={customer.image} name={customer.name} size={46} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {customer.name}
                            </p>
                            <p className="mt-0.5 truncate text-[0.625rem] text-ink-soft">
                              {customer.email}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 rounded-full border px-2 py-0.5 text-[0.5625rem] font-semibold",
                              customer.isBlocked
                                ? "border-[#e8c7c9] bg-[#fdf2f3] text-[#8f3f45]"
                                : "border-[#ccdac5] bg-[#f2f8ee] text-[#516b48]"
                            )}
                          >
                            {customer.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.625rem] text-ink-soft">
                          <span>
                            {appointmentCount}{" "}
                            {appointmentCount === 1 ? "appointment" : "appointments"}
                          </span>
                          <span className="font-semibold text-burgundy">
                            {formatCurrency(spend)} spent
                          </span>
                          <span>Joined {formatDate(customer.createdAt.slice(0, 10))}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-sand/70 pt-3.5">
                      <Link
                        href="/dashboard/admin/appointments"
                        className="text-[0.625rem] font-semibold text-ink-soft underline decoration-sand-dark underline-offset-2 hover:text-ink"
                      >
                        View salon activity
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          customer.isBlocked
                            ? "border-sage/30 text-[#516b48] hover:bg-sage-light/60"
                            : "border-[#e2c4c4] text-[#9d3c43] hover:bg-[#fff1f1]"
                        )}
                        onClick={() => setBlockTarget(customer)}
                      >
                        {customer.isBlocked ? (
                          <>
                            <UserCheck className="size-3.5" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <UserX className="size-3.5" />
                            Block
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[0.625rem] leading-5 text-ink-soft/75">
        <ShieldCheck className="size-3" />
        Administrator accounts are excluded from customer access controls.
      </p>

      <ConfirmDialog
        open={Boolean(blockTarget)}
        onOpenChange={(open) => {
          if (!open) setBlockTarget(null)
        }}
        title={blockTarget?.isBlocked ? "Restore this customer's access?" : "Block this customer?"}
        description={
          blockTarget
            ? blockTarget.isBlocked
              ? `${blockTarget.name} will be able to sign in, request appointments, and make payments again. Their history is unchanged.`
              : `${blockTarget.name} will be signed out and unable to sign in, request appointments, or make payments. Existing appointments and records stay intact.`
            : ""
        }
        confirmLabel={blockTarget?.isBlocked ? "Unblock customer" : "Block customer"}
        cancelLabel={blockTarget?.isBlocked ? "Keep blocked" : "Keep access"}
        tone={blockTarget?.isBlocked ? "default" : "danger"}
        onConfirm={handleBlockToggle}
      />
    </>
  )
}

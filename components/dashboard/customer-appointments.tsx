"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  Clock3,
  CreditCard,
  MessageSquareText,
  ReceiptText,
  Scissors,
  Search,
  X,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Button, ButtonLink } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DashboardSkeleton, EmptyState } from "@/components/ui/feedback"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/dashboard/ui"
import { getCustomerAppointments } from "@/lib/selectors"
import type { AppointmentStatus, AppointmentWithDetails } from "@/lib/types"
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatWeekday,
  todayInputValue,
} from "@/lib/utils"

type Filter = "all" | AppointmentStatus

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
]

function appointmentRank(appointment: AppointmentWithDetails) {
  const today = todayInputValue()
  if (appointment.status === "pending") return 0
  if (appointment.status === "confirmed" && appointment.appointmentDate >= today) return 1
  if (appointment.status === "confirmed") return 2
  return 3
}

export function CustomerAppointments() {
  const { db, currentUser, cancelOwnAppointment } = useStore()
  const toast = useToast()
  const [filter, setFilter] = React.useState<Filter>("all")
  const [query, setQuery] = React.useState("")
  const [cancelTarget, setCancelTarget] = React.useState<AppointmentWithDetails | null>(
    null
  )

  if (!db || !currentUser) return <DashboardSkeleton />

  const appointments = getCustomerAppointments(db, currentUser.id)
  const counts: Record<Filter, number> = {
    all: appointments.length,
    pending: appointments.filter((appointment) => appointment.status === "pending").length,
    confirmed: appointments.filter((appointment) => appointment.status === "confirmed")
      .length,
    cancelled: appointments.filter((appointment) => appointment.status === "cancelled")
      .length,
  }

  const term = query.trim().toLowerCase()
  const visible = appointments
    .filter(
      (appointment) =>
        (filter === "all" || appointment.status === filter) &&
        (!term ||
          appointment.service?.serviceName.toLowerCase().includes(term) ||
          appointment.service?.category.toLowerCase().includes(term))
    )
    .sort((a, b) => {
      const rank = appointmentRank(a) - appointmentRank(b)
      if (rank !== 0) return rank
      const direction = appointmentRank(a) <= 1 ? 1 : -1
      return (
        direction *
        (a.appointmentDate.localeCompare(b.appointmentDate) ||
          a.timeSlot.localeCompare(b.timeSlot))
      )
    })

  const confirmCancellation = async () => {
    if (!cancelTarget) return
    const result = await cancelOwnAppointment(cancelTarget.id)
    if (!result.ok) {
      toast.error("Could not cancel appointment", result.error)
      return
    }
    toast.success("Request cancelled", "You can request a new time whenever you're ready.")
    setCancelTarget(null)
  }

  const clearSearch = () => setQuery("")

  return (
    <>
      <PageHeader
        eyebrow="Your appointments"
        title="Every moment, in one place."
        description="Track requests, view confirmations, cancel pending appointments, and complete payment for confirmed visits."
        actions={
          <ButtonLink href="/services">
            <Scissors className="size-4" />
            Book a new ritual
          </ButtonLink>
        }
      />

      <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-sand/80 bg-white/55 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar" role="tablist" aria-label="Filter appointments">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.6875rem] font-semibold transition",
                filter === option.value
                  ? "border-burgundy bg-burgundy text-cream"
                  : "border-sand/80 bg-white/50 text-ink-soft hover:border-sand-dark hover:text-ink"
              )}
            >
              {option.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[0.5625rem] font-bold",
                  filter === option.value
                    ? "bg-white/15 text-cream"
                    : "bg-cream-deep text-ink-soft"
                )}
              >
                {counts[option.value]}
              </span>
            </button>
          ))}
        </div>

        <label className="relative block sm:w-64">
          <span className="sr-only">Search your appointments</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search service or category…"
            className="input-field h-10 pr-9 pl-9 text-xs"
          />
          {query ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-ink-soft transition hover:bg-cream-deep hover:text-ink"
              aria-label="Clear search"
            >
              <X className="size-3" />
            </button>
          ) : null}
        </label>
      </div>

      <div className="mt-5 space-y-3.5">
        {visible.length > 0 ? (
          visible.map((appointment) => (
            <CustomerAppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={() => setCancelTarget(appointment)}
            />
          ))
        ) : (
          <EmptyState
            icon={Search}
            title={term ? "No matching appointments" : "Nothing here just yet"}
            description={
              term
                ? "Try a different service name or category, or clear the search to see everything."
                : filter === "all"
                  ? "When you request an appointment, it will appear here with its latest status."
                  : `You have no ${filter} appointments right now. Try another filter.`
            }
            action={
              term ? (
                <Button variant="outline" onClick={clearSearch}>
                  Clear search
                </Button>
              ) : (
                <ButtonLink href="/services">Browse the menu</ButtonLink>
              )
            }
            className="min-h-[320px]"
          />
        )}
      </div>

      <p className="mt-6 text-center text-[0.625rem] leading-5 text-ink-soft/75">
        Appointments can be cancelled by you while pending. To change a confirmed visit,
        please call the salon.
      </p>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null)
        }}
        title="Withdraw this request?"
        description={
          cancelTarget
            ? `${cancelTarget.service?.serviceName ?? "This appointment"} on ${formatDate(
                cancelTarget.appointmentDate
              )} at ${cancelTarget.timeSlot} will be cancelled. This cannot be undone, but you can request another time.`
            : ""
        }
        confirmLabel="Cancel appointment"
        cancelLabel="Keep it"
        tone="danger"
        onConfirm={confirmCancellation}
      />
    </>
  )
}

function CustomerAppointmentCard({
  appointment,
  onCancel,
}: {
  appointment: AppointmentWithDetails
  onCancel: () => void
}) {
  const today = todayInputValue()
  const isPast =
    appointment.status === "confirmed" && appointment.appointmentDate < today

  return (
    <article className="surface-card overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-32 w-full shrink-0 bg-cream-deep sm:h-auto sm:w-44 lg:w-52">
          {appointment.service ? (
            <Image
              src={appointment.service.image}
              alt={appointment.service.serviceName}
              fill
              sizes="(max-width: 640px) 100vw, 208px"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/25 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-ink/10" />
          <div className="absolute bottom-2.5 left-2.5">
            <StatusBadge status={appointment.status} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[0.5625rem] font-bold tracking-[0.13em] text-burgundy uppercase">
              {appointment.service?.category ?? "Salon ritual"}
            </p>
            <h2 className="mt-1 font-serif text-[1.55rem] leading-tight tracking-[-0.025em]">
              {appointment.service?.serviceName ?? "Salon service"}
            </h2>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.6875rem] text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-gold" />
                {formatWeekday(appointment.appointmentDate)},{" "}
                {formatDate(appointment.appointmentDate)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5 text-gold" />
                {appointment.timeSlot}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CreditCard className="size-3.5 text-gold" />
                {formatCurrency(appointment.servicePrice)}
              </span>
            </div>

            {appointment.message ? (
              <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-cream-deep/55 px-2.5 py-2 text-[0.6875rem] leading-5 text-ink-soft">
                <MessageSquareText className="mt-0.5 size-3 shrink-0 text-burgundy" />
                <span className="line-clamp-2">{appointment.message}</span>
              </p>
            ) : null}

            <p className="mt-2.5 inline-flex items-center gap-1.5 text-[0.625rem] text-ink-soft/75">
              <CalendarClock className="size-3" />
              Requested {formatDateTime(appointment.createdAt)}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 border-t border-sand/70 pt-4 sm:flex-row sm:items-center lg:w-[180px] lg:shrink-0 lg:flex-col lg:items-stretch lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
            <div className="flex items-center justify-between gap-2 lg:justify-start">
              {appointment.status === "confirmed" ? (
                <StatusBadge
                  status={appointment.paymentStatus}
                  label={isPast && appointment.paymentStatus === "paid" ? "Paid · Completed" : undefined}
                />
              ) : appointment.status === "pending" ? (
                <span className="text-[0.625rem] leading-5 text-ink-soft">
                  Awaiting confirmation
                </span>
              ) : (
                <span className="text-[0.625rem] leading-5 text-ink-soft">
                  No payment due
                </span>
              )}
            </div>

            {appointment.status === "pending" ? (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel request
              </Button>
            ) : appointment.status === "confirmed" &&
              appointment.paymentStatus === "unpaid" ? (
              <ButtonLink href={`/dashboard/payments/${appointment.id}`} size="sm">
                <CreditCard className="size-3.5" />
                Pay now
              </ButtonLink>
            ) : appointment.status === "confirmed" ? (
              <span className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-sage/25 bg-sage-light/60 px-3 text-[0.6875rem] font-semibold text-[#516b48]">
                <ReceiptText className="size-3.5" />
                Payment complete
              </span>
            ) : (
              <ButtonLink
                href={`/services/${appointment.serviceId}`}
                variant="outline"
                size="sm"
              >
                Book again
                <ArrowUpRight className="size-3.5" />
              </ButtonLink>
            )}

            {appointment.status === "confirmed" && appointment.paymentStatus === "paid" ? (
              <Link
                href={`/services/${appointment.serviceId}`}
                className="inline-flex items-center justify-center gap-1 text-[0.625rem] font-semibold text-ink-soft transition hover:text-burgundy"
              >
                View ritual
                <ArrowUpRight className="size-3" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

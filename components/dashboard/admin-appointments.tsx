"use client"

import * as React from "react"
import {
  CalendarCheck2,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  ReceiptText,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Avatar } from "@/components/ui/avatar"
import { Button, ButtonLink } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DashboardSkeleton, EmptyState } from "@/components/ui/feedback"
import { Select } from "@/components/ui/form-field"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader, StatCard } from "@/components/dashboard/ui"
import { withAppointmentDetails } from "@/lib/selectors"
import type {
  AppointmentStatus,
  AppointmentWithDetails,
  PaymentStatus,
} from "@/lib/types"
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatWeekday,
  sortByNewest,
} from "@/lib/utils"

type StatusFilter = "all" | AppointmentStatus
type PaymentFilter = "all" | PaymentStatus

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
]

export function AdminAppointments() {
  const { db, confirmAppointment, adminCancelAppointment } = useStore()
  const toast = useToast()
  const [filter, setFilter] = React.useState<StatusFilter>("all")
  const [paymentFilter, setPaymentFilter] = React.useState<PaymentFilter>("all")
  const [query, setQuery] = React.useState("")
  const [cancelTarget, setCancelTarget] = React.useState<AppointmentWithDetails | null>(
    null
  )

  if (!db) return <DashboardSkeleton />

  const appointments = sortByNewest(db.appointments).map((appointment) =>
    withAppointmentDetails(db, appointment)
  )

  const counts: Record<StatusFilter, number> = {
    all: appointments.length,
    pending: appointments.filter((appointment) => appointment.status === "pending").length,
    confirmed: appointments.filter((appointment) => appointment.status === "confirmed")
      .length,
    cancelled: appointments.filter((appointment) => appointment.status === "cancelled")
      .length,
  }
  const paidCount = appointments.filter(
    (appointment) => appointment.paymentStatus === "paid"
  ).length
  const pendingValue = appointments
    .filter((appointment) => appointment.status === "pending")
    .reduce((total, appointment) => total + appointment.servicePrice, 0)

  const term = query.trim().toLowerCase()
  const visible = appointments
    .filter((appointment) => {
      const matchesStatus = filter === "all" || appointment.status === filter
      const matchesPayment =
        paymentFilter === "all" || appointment.paymentStatus === paymentFilter
      const matchesTerm =
        !term ||
        appointment.customer?.name.toLowerCase().includes(term) ||
        appointment.customer?.email.toLowerCase().includes(term) ||
        appointment.service?.serviceName.toLowerCase().includes(term) ||
        appointment.service?.category.toLowerCase().includes(term)
      return matchesStatus && matchesPayment && matchesTerm
    })
    .sort((a, b) => {
      if (filter === "pending") {
        return (
          b.createdAt.localeCompare(a.createdAt) ||
          a.appointmentDate.localeCompare(b.appointmentDate)
        )
      }
      return b.createdAt.localeCompare(a.createdAt)
    })

  const hasFilters = filter !== "all" || paymentFilter !== "all" || Boolean(term)

  const clearFilters = () => {
    setFilter("all")
    setPaymentFilter("all")
    setQuery("")
  }

  const handleConfirm = (appointment: AppointmentWithDetails) => {
    const result = confirmAppointment(appointment.id)
    if (!result.ok) {
      toast.error("Could not confirm appointment", result.error)
      return
    }
    toast.success(
      "Appointment confirmed",
      `${appointment.customer?.name ?? "The customer"} can now pay for this visit.`
    )
  }

  const handleCancel = () => {
    if (!cancelTarget) return
    const result = adminCancelAppointment(cancelTarget.id)
    if (!result.ok) {
      toast.error("Could not cancel appointment", result.error)
      return
    }
    toast.success(
      "Appointment cancelled",
      cancelTarget.paymentStatus === "paid"
        ? "The visit is cancelled. The demo payment record is retained for reporting."
        : "The customer will see the updated appointment status."
    )
    setCancelTarget(null)
  }

  return (
    <>
      <PageHeader
        eyebrow="Appointment management"
        title="Keep the calendar beautifully in hand."
        description="Review every request, confirm the times that work, and cancel visits when plans change. Confirming an appointment unlocks payment for the customer."
        actions={
          <>
            <ButtonLink href="/dashboard/admin/transactions" variant="outline">
              <ReceiptText className="size-4" />
              Transactions
            </ButtonLink>
            <ButtonLink href="/dashboard/admin/services">
              <Sparkles className="size-4" />
              Manage services
            </ButtonLink>
          </>
        }
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="All appointments"
          value={appointments.length}
          detail="Every request and visit"
          tone="neutral"
        />
        <StatCard
          icon={Clock3}
          label="Pending requests"
          value={counts.pending}
          detail={`${formatCurrency(pendingValue)} in requested services`}
          tone="gold"
        />
        <StatCard
          icon={CalendarCheck2}
          label="Confirmed visits"
          value={counts.confirmed}
          detail={`${paidCount} ${paidCount === 1 ? "payment" : "payments"} recorded`}
          tone="sage"
        />
        <StatCard
          icon={X}
          label="Cancelled"
          value={counts.cancelled}
          detail="Retained for your records"
          tone="rose"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-sand/80 bg-white/55 p-3.5 shadow-[0_18px_50px_-42px_rgba(52,37,28,0.45)] sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div
            className="flex gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar"
            role="tablist"
            aria-label="Filter appointments by status"
          >
            {statusFilters.map((option) => (
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

          <div className="flex flex-col gap-3 sm:flex-row xl:ml-auto">
            <label className="relative flex-1 xl:w-64">
              <span className="sr-only">Search appointments</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customer or service…"
                className="input-field h-11 pl-10"
              />
            </label>
            <Select
              aria-label="Filter by payment status"
              value={paymentFilter}
              onChange={(event) =>
                setPaymentFilter(event.target.value as PaymentFilter)
              }
              className="h-11 bg-white/70 sm:w-[165px]"
            >
              <option value="all">All payments</option>
              <option value="paid">Paid only</option>
              <option value="unpaid">Unpaid only</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-soft">
          Showing <span className="font-bold text-ink">{visible.length}</span>{" "}
          {visible.length === 1 ? "appointment" : "appointments"}
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
            title="No appointments match"
            description="Try another status, payment filter, or search term to find the appointment you need."
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <ButtonLink href="/dashboard/admin/services">Manage services</ButtonLink>
              )
            }
            className="min-h-[320px]"
          />
        ) : (
          <>
            <div className="surface-card hidden overflow-hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[940px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-sand/80 bg-cream-deep/35">
                      {["Customer", "Service", "Appointment", "Payment", "Status", "Actions"].map(
                        (heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className={cn(
                              "px-5 py-3 text-[0.5625rem] font-bold tracking-[0.13em] text-ink-soft uppercase",
                              heading === "Actions" && "text-right"
                            )}
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/70">
                    {visible.map((appointment) => (
                      <tr key={appointment.id} className="transition hover:bg-white/45">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={appointment.customer?.image}
                              name={appointment.customer?.name ?? "Customer"}
                              size={34}
                            />
                            <div className="min-w-0">
                              <p className="flex items-center gap-1.5 text-sm font-semibold">
                                <span className="max-w-[150px] truncate">
                                  {appointment.customer?.name ?? "Customer"}
                                </span>
                                {appointment.customer?.isBlocked ? (
                                  <ShieldAlert
                                    className="size-3.5 shrink-0 text-[#9d3c43]"
                                    aria-label="Blocked customer"
                                  />
                                ) : null}
                              </p>
                              <p className="max-w-[180px] truncate text-[0.625rem] text-ink-soft">
                                {appointment.customer?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="max-w-[190px] truncate text-xs font-semibold">
                            {appointment.service?.serviceName ?? "Salon service"}
                          </p>
                          <p className="mt-0.5 text-[0.625rem] text-ink-soft">
                            {appointment.service?.category}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-xs font-semibold">
                            {formatDate(appointment.appointmentDate)}
                          </p>
                          <p className="mt-0.5 text-[0.625rem] text-ink-soft">
                            {appointment.timeSlot} · requested{" "}
                            {formatDateTime(appointment.createdAt)}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-xs font-bold text-burgundy">
                            {formatCurrency(appointment.servicePrice)}
                          </p>
                          <StatusBadge
                            status={appointment.paymentStatus}
                            className="mt-1 px-2 py-0.5 text-[0.5625rem]"
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={appointment.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            {appointment.status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleConfirm(appointment)}
                                >
                                  <Check className="size-3.5" />
                                  Confirm
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCancelTarget(appointment)}
                                >
                                  <X className="size-3.5" />
                                  Cancel
                                </Button>
                              </>
                            ) : appointment.status === "confirmed" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#e2c4c4] text-[#9d3c43] hover:bg-[#fff1f1]"
                                onClick={() => setCancelTarget(appointment)}
                              >
                                <X className="size-3.5" />
                                Cancel visit
                              </Button>
                            ) : (
                              <span className="text-[0.6875rem] text-ink-soft/60">
                                No actions
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3.5 lg:hidden">
              {visible.map((appointment) => (
                <div key={appointment.id} className="surface-card overflow-hidden p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar
                        src={appointment.customer?.image}
                        name={appointment.customer?.name ?? "Customer"}
                        size={38}
                      />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                          {appointment.customer?.name ?? "Customer"}
                          {appointment.customer?.isBlocked ? (
                            <ShieldAlert
                              className="size-3.5 shrink-0 text-[#9d3c43]"
                              aria-label="Blocked customer"
                            />
                          ) : null}
                        </p>
                        <p className="truncate text-[0.625rem] text-ink-soft">
                          {appointment.customer?.email}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={appointment.status} className="shrink-0" />
                  </div>

                  <div className="mt-3.5 rounded-xl bg-cream-deep/50 px-3 py-2.5">
                    <p className="text-xs font-semibold">
                      {appointment.service?.serviceName ?? "Salon service"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[0.625rem] text-ink-soft">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3 text-gold" />
                        {formatWeekday(appointment.appointmentDate)},{" "}
                        {formatDate(appointment.appointmentDate)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="size-3 text-gold" />
                        {appointment.timeSlot}
                      </span>
                    </div>
                    {appointment.message ? (
                      <p className="mt-2 line-clamp-2 text-[0.625rem] leading-5 text-ink-soft/80">
                        “{appointment.message}”
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-burgundy">
                        {formatCurrency(appointment.servicePrice)}
                      </p>
                      <StatusBadge
                        status={appointment.paymentStatus}
                        className="mt-1 px-2 py-0.5 text-[0.5rem]"
                      />
                    </div>
                    <div className="flex gap-2">
                      {appointment.status === "pending" ? (
                        <>
                          <Button size="sm" onClick={() => handleConfirm(appointment)}>
                            <Check className="size-3.5" />
                            Confirm
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCancelTarget(appointment)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : appointment.status === "confirmed" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#e2c4c4] text-[#9d3c43] hover:bg-[#fff1f1]"
                          onClick={() => setCancelTarget(appointment)}
                        >
                          <X className="size-3.5" />
                          Cancel visit
                        </Button>
                      ) : (
                        <span className="text-[0.625rem] text-ink-soft/60">
                          No actions needed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[0.625rem] leading-5 text-ink-soft/75">
        <CreditCard className="size-3" />
        Payments are simulated in this demo. Real refunds and Stripe records arrive with
        the backend.
      </p>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null)
        }}
        title="Cancel this appointment?"
        description={
          cancelTarget
            ? `${cancelTarget.customer?.name ?? "This customer"}'s ${
                cancelTarget.service?.serviceName ?? "appointment"
              } on ${formatDate(cancelTarget.appointmentDate)} at ${
                cancelTarget.timeSlot
              } will be cancelled. ${
                cancelTarget.paymentStatus === "paid"
                  ? "The existing demo payment record will be kept for reporting."
                  : "No payment is attached to this visit."
              }`
            : ""
        }
        confirmLabel="Cancel appointment"
        cancelLabel="Keep appointment"
        tone="danger"
        onConfirm={handleCancel}
      />
    </>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  ReceiptText,
  Scissors,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Avatar } from "@/components/ui/avatar"
import { Button, ButtonLink } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DashboardSkeleton } from "@/components/ui/feedback"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashPanel, PageHeader, StatCard } from "@/components/dashboard/ui"
import {
  getAdminStats,
  getCustomerSpend,
  getTransactionsNewest,
  getUpcomingAppointments,
  withAppointmentDetails,
} from "@/lib/selectors"
import type { AppointmentWithDetails } from "@/lib/types"
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatWeekday,
  sortByNewest,
  todayInputValue,
} from "@/lib/utils"

export function AdminOverview() {
  const { db, currentUser, confirmAppointment, adminCancelAppointment } = useStore()
  const toast = useToast()
  const [cancelTarget, setCancelTarget] = React.useState<AppointmentWithDetails | null>(
    null
  )

  if (!db || !currentUser) return <DashboardSkeleton />

  const stats = getAdminStats(db)
  const today = todayInputValue()

  const pending = sortByNewest(
    db.appointments
      .filter((appointment) => appointment.status === "pending")
      .map((appointment) => withAppointmentDetails(db, appointment))
  )
  const todaySchedule = db.appointments
    .filter(
      (appointment) =>
        appointment.appointmentDate === today && appointment.status !== "cancelled"
    )
    .map((appointment) => withAppointmentDetails(db, appointment))
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
  const upcoming = getUpcomingAppointments(db, undefined, 4)
  const transactions = getTransactionsNewest(db).slice(0, 4)
  const topCustomers = db.users
    .filter((user) => user.role === "customer")
    .map((customer) => ({
      customer,
      spend: getCustomerSpend(db, customer.id),
      appointments: db.appointments.filter(
        (appointment) => appointment.customerId === customer.id
      ).length,
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 3)
  const inactiveServices = db.services.filter((service) => service.status === "inactive")

  const handleConfirm = async (appointment: AppointmentWithDetails) => {
    const result = await confirmAppointment(appointment.id)
    if (!result.ok) {
      toast.error("Could not confirm appointment", result.error)
      return
    }
    toast.success(
      "Appointment confirmed",
      `${appointment.customer?.name ?? "The customer"} can now complete payment.`
    )
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    const result = await adminCancelAppointment(cancelTarget.id)
    if (!result.ok) {
      toast.error("Could not cancel appointment", result.error)
      return
    }
    toast.success("Appointment cancelled", "The customer will see the updated status.")
    setCancelTarget(null)
  }

  return (
    <>
      <PageHeader
        eyebrow="Salon overview"
        title={`A clear view of the day, ${currentUser.name.split(" ")[0]}.`}
        description="Review new requests, keep today's schedule moving, and stay close to the numbers that matter."
        actions={
          <>
            <ButtonLink href="/dashboard/admin/appointments" variant="outline">
              <CalendarDays className="size-4" />
              All appointments
            </ButtonLink>
            <ButtonLink href="/dashboard/admin/services">
              <Scissors className="size-4" />
              Manage services
            </ButtonLink>
          </>
        }
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={UsersRound}
          label="Registered customers"
          value={stats.customers}
          detail={`${stats.blockedCustomers} blocked`}
          tone="sage"
        />
        <StatCard
          icon={Scissors}
          label="Active services"
          value={`${stats.activeServices}/${stats.totalServices}`}
          detail={
            inactiveServices.length > 0
              ? `${inactiveServices.length} currently paused`
              : "The full menu is live"
          }
          tone="rose"
        />
        <StatCard
          icon={CalendarDays}
          label="Appointment requests"
          value={stats.totalAppointments}
          detail={`${stats.today} visits today`}
          tone="gold"
        />
        <StatCard
          icon={Clock3}
          label="Pending requests"
          value={stats.pending}
          detail={stats.pending ? "Waiting for your review" : "The queue is clear"}
          tone="gold"
        />
        <StatCard
          icon={CalendarCheck2}
          label="Confirmed visits"
          value={stats.confirmed}
          detail={`${stats.upcoming} upcoming`}
          tone="sage"
        />
        <StatCard
          icon={CircleDollarSign}
          label="Successful payments"
          value={stats.transactionCount}
          detail={`${formatCurrency(stats.revenue)} collected`}
          tone="burgundy"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-5">
          <DashPanel
            title="Requests to review"
            description="Confirm a request to unlock payment, or cancel it if the time no longer works."
            action={
              pending.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf4e5] px-2.5 py-1 text-[0.625rem] font-semibold text-[#84612d]">
                  <Clock3 className="size-3" />
                  {pending.length} waiting
                </span>
              ) : null
            }
            flush
          >
            {pending.length > 0 ? (
              <ul className="divide-y divide-sand/70">
                {pending.slice(0, 4).map((appointment) => (
                  <li key={appointment.id} className="px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <Avatar
                          src={appointment.customer?.image}
                          name={appointment.customer?.name ?? "Customer"}
                          size={38}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="text-sm font-semibold">
                              {appointment.customer?.name ?? "Customer"}
                            </p>
                            <span className="text-[0.625rem] text-ink-soft/70">
                              requested
                            </span>
                            <StatusBadge status="pending" />
                          </div>
                          <p className="mt-1 text-xs text-ink-soft">
                            {appointment.service?.serviceName ?? "Salon service"} ·{" "}
                            {formatDate(appointment.appointmentDate)} at{" "}
                            {appointment.timeSlot}
                          </p>
                          {appointment.message ? (
                            <p className="mt-1 line-clamp-1 text-[0.6875rem] text-ink-soft/75">
                              “{appointment.message}”
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 pl-[50px] lg:pl-0">
                        <span className="mr-1 hidden text-xs font-bold text-burgundy sm:block">
                          {formatCurrency(appointment.servicePrice)}
                        </span>
                        <Button size="sm" onClick={() => handleConfirm(appointment)}>
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
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center">
                <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-sage-light text-sage">
                  <CalendarCheck2 className="size-5" />
                </span>
                <p className="mt-3 font-serif text-2xl tracking-[-0.02em]">
                  Everything is reviewed.
                </p>
                <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-ink-soft">
                  New appointment requests will appear here as soon as customers send them.
                </p>
              </div>
            )}
            {pending.length > 4 ? (
              <div className="border-t border-sand/70 px-5 py-3.5 sm:px-6">
                <Link
                  href="/dashboard/admin/appointments"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy hover:underline"
                >
                  View all {pending.length} requests
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : null}
          </DashPanel>

          <DashPanel
            title={todaySchedule.length > 0 ? "Today at the salon" : "Coming up next"}
            description={
              todaySchedule.length > 0
                ? formatDate(new Date(), {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "No visits are scheduled today. Here is what's next."
            }
            action={
              <Link
                href="/dashboard/admin/appointments"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy hover:underline"
              >
                Manage
                <ArrowRight className="size-3.5" />
              </Link>
            }
            flush
          >
            <ul className="divide-y divide-sand/70">
              {(todaySchedule.length > 0 ? todaySchedule : upcoming).length > 0 ? (
                (todaySchedule.length > 0 ? todaySchedule : upcoming).map((appointment) => (
                  <li
                    key={appointment.id}
                    className="flex items-center gap-3.5 px-5 py-3.5 sm:px-6"
                  >
                    <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-cream-deep/70 px-2 py-2">
                      <span className="text-[0.625rem] font-bold text-burgundy">
                        {appointment.timeSlot}
                      </span>
                    </div>
                    <Avatar
                      src={appointment.customer?.image}
                      name={appointment.customer?.name ?? "Customer"}
                      size={34}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {appointment.customer?.name ?? "Customer"}
                      </p>
                      <p className="truncate text-[0.6875rem] text-ink-soft">
                        {appointment.service?.serviceName ?? "Salon service"} ·{" "}
                        {appointment.appointmentDate === today
                          ? "Today"
                          : formatWeekday(appointment.appointmentDate)}
                      </p>
                    </div>
                    <StatusBadge
                      status={appointment.paymentStatus}
                      className="hidden sm:inline-flex"
                    />
                  </li>
                ))
              ) : (
                <li className="px-6 py-10 text-center text-xs text-ink-soft">
                  No upcoming appointments on the calendar.
                </li>
              )}
            </ul>
          </DashPanel>
        </div>

        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-[1.35rem] border border-burgundy-dark/20 bg-burgundy-dark p-5 text-cream shadow-[0_24px_60px_-36px_rgba(64,25,42,0.7)] sm:p-6">
            <div className="pointer-events-none absolute -top-16 -right-14 size-44 rounded-full bg-rose/25 blur-[50px]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.5625rem] font-bold tracking-[0.15em] text-cream/45 uppercase">
                    Revenue at a glance
                  </p>
                  <p className="mt-3 font-serif text-[2.5rem] leading-none tracking-[-0.035em]">
                    {formatCurrency(stats.revenue)}
                  </p>
                  <p className="mt-1.5 text-[0.6875rem] text-cream/50">
                    From {stats.transactionCount} paid{" "}
                    {stats.transactionCount === 1 ? "appointment" : "appointments"}
                  </p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/10">
                  <ReceiptText className="size-4 text-gold" />
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5 text-[0.6875rem]">
                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5">
                  <p className="text-cream/40">Payment due</p>
                  <p className="mt-1 font-semibold text-cream">{stats.unpaidConfirmed}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5">
                  <p className="text-cream/40">Upcoming</p>
                  <p className="mt-1 font-semibold text-cream">{stats.upcoming}</p>
                </div>
              </div>

              <Link
                href="/dashboard/admin/transactions"
                className="mt-4 inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-cream/65 transition hover:text-cream"
              >
                Open transaction report
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </div>

          <DashPanel
            title="Recent payments"
            action={
              <Link
                href="/dashboard/admin/transactions"
                className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-burgundy hover:underline"
              >
                View all
                <ArrowRight className="size-3" />
              </Link>
            }
            flush
          >
            {transactions.length > 0 ? (
              <ul className="divide-y divide-sand/70">
                {transactions.map((transaction) => (
                  <li
                    key={transaction.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">
                        {transaction.customer?.name ?? "Customer"}
                      </p>
                      <p className="mt-0.5 truncate text-[0.625rem] text-ink-soft">
                        {transaction.service?.serviceName ?? "Salon service"}
                      </p>
                      <p className="mt-0.5 text-[0.5625rem] text-ink-soft/65">
                        {formatDateTime(transaction.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-bold text-burgundy">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <StatusBadge
                        status={transaction.status}
                        className="mt-1.5 px-2 py-0.5 text-[0.5625rem]"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-6 py-10 text-center text-xs text-ink-soft">
                No payments recorded yet.
              </p>
            )}
          </DashPanel>

          <DashPanel
            title="Salon guests"
            description={`${stats.customers} customers · ${stats.blockedCustomers} blocked`}
            action={
              <Link
                href="/dashboard/admin/users"
                className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-burgundy hover:underline"
              >
                Manage
                <ArrowRight className="size-3" />
              </Link>
            }
            bodyClassName="space-y-3"
          >
            {topCustomers.map(({ customer, spend, appointments }) => (
              <div key={customer.id} className="flex items-center gap-3">
                <Avatar src={customer.image} name={customer.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-xs font-semibold">
                    {customer.name}
                    {customer.isBlocked ? (
                      <ShieldCheck className="size-3 shrink-0 text-[#9d3c43]" />
                    ) : null}
                  </p>
                  <p className="truncate text-[0.625rem] text-ink-soft">
                    {appointments} {appointments === 1 ? "appointment" : "appointments"}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold text-burgundy">
                  {formatCurrency(spend)}
                </span>
              </div>
            ))}
            <Link
              href="/dashboard/admin/users"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-sand/70 bg-white/45 py-2.5 text-[0.6875rem] font-semibold text-ink-soft transition hover:border-sand-dark hover:text-ink"
            >
              <UsersRound className="size-3.5" />
              View all customers
            </Link>
          </DashPanel>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null)
        }}
        title="Cancel this appointment?"
        description={
          cancelTarget
            ? `The request from ${cancelTarget.customer?.name ?? "this customer"} for ${
                cancelTarget.service?.serviceName ?? "a salon service"
              } on ${formatDate(cancelTarget.appointmentDate)} at ${
                cancelTarget.timeSlot
              } will be cancelled. The customer will see the updated status.`
            : ""
        }
        confirmLabel="Cancel appointment"
        cancelLabel="Keep request"
        tone="danger"
        onConfirm={handleCancel}
      />
    </>
  )
}

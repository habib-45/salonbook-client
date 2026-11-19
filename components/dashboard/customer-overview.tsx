"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  CalendarDays,
  Clock3,
  CreditCard,
  MapPin,
  Phone,
  ReceiptText,
  Scissors,
  XCircle,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Button, ButtonLink } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DashboardSkeleton, EmptyState } from "@/components/ui/feedback"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashPanel, PageHeader, StatCard } from "@/components/dashboard/ui"
import { SALON } from "@/lib/constants"
import {
  getCustomerAppointments,
  getCustomerStats,
  getUpcomingAppointments,
} from "@/lib/selectors"
import type { AppointmentWithDetails } from "@/lib/types"
import {
  formatCurrency,
  formatDate,
  formatWeekday,
  sortByNewest,
  todayInputValue,
} from "@/lib/utils"

export function CustomerOverview() {
  const { db, currentUser, cancelOwnAppointment } = useStore()
  const toast = useToast()
  const [cancelTarget, setCancelTarget] = React.useState<AppointmentWithDetails | null>(
    null
  )

  if (!db || !currentUser) return <DashboardSkeleton />

  const stats = getCustomerStats(db, currentUser.id)
  const appointments = getCustomerAppointments(db, currentUser.id)
  const upcoming = getUpcomingAppointments(db, currentUser.id)
  const nextAppointment = upcoming[0]
  const pending = appointments
    .filter((appointment) => appointment.status === "pending")
    .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate))
  const recent = sortByNewest(appointments).slice(0, 4)
  const paymentsDue = appointments.filter(
    (appointment) =>
      appointment.status === "confirmed" &&
      appointment.paymentStatus === "unpaid" &&
      appointment.appointmentDate >= todayInputValue()
  )
  const dueTotal = paymentsDue.reduce(
    (total, appointment) => total + appointment.servicePrice,
    0
  )
  const transactions = sortByNewest(
    db.transactions.filter((transaction) => transaction.customerId === currentUser.id)
  )
  const bookedServiceIds = new Set(appointments.map((appointment) => appointment.serviceId))
  const recommended = db.services
    .filter(
      (service) => service.status === "active" && !bookedServiceIds.has(service.id)
    )
    .slice(0, 3)
  const suggestions =
    recommended.length > 0
      ? recommended
      : db.services.filter((service) => service.status === "active").slice(0, 3)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const firstName = currentUser.name.split(" ")[0]

  const confirmCancellation = async () => {
    if (!cancelTarget) return
    const result = await cancelOwnAppointment(cancelTarget.id)
    if (!result.ok) {
      toast.error("Could not cancel appointment", result.error)
      return
    }
    toast.success("Request cancelled", "Your appointment request has been withdrawn.")
    setCancelTarget(null)
  }

  return (
    <>
      <PageHeader
        eyebrow={formatDate(new Date(), {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
        title={`${greeting}, ${firstName}.`}
        description="A quiet look at what's ahead, what needs your attention, and a little inspiration for your next visit."
        actions={
          <>
            <ButtonLink href="/dashboard/appointments" variant="outline">
              <CalendarDays className="size-4" />
              My appointments
            </ButtonLink>
            <ButtonLink href="/services">
              <Scissors className="size-4" />
              Book a ritual
            </ButtonLink>
          </>
        }
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Total requests"
          value={stats.total}
          detail={
            nextAppointment
              ? `Next visit ${formatDate(nextAppointment.appointmentDate)}`
              : "Nothing on the calendar yet"
          }
          tone="sage"
        />
        <StatCard
          icon={Clock3}
          label="Pending requests"
          value={stats.pending}
          detail={stats.pending ? "Awaiting salon confirmation" : "All caught up"}
          tone="gold"
        />
        <StatCard
          icon={CalendarCheck2}
          label="Confirmed visits"
          value={stats.confirmed}
          detail={`${stats.completed} completed`}
          tone="rose"
        />
        <StatCard
          icon={XCircle}
          label="Cancelled requests"
          value={stats.cancelled}
          detail="Requests you withdrew"
          tone="burgundy"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-5">
          <section className="relative overflow-hidden rounded-[1.35rem] border border-burgundy-dark/20 bg-burgundy-dark text-cream shadow-[0_24px_60px_-36px_rgba(64,25,42,0.7)]">
            <Image
              src={
                nextAppointment?.service?.image ??
                "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80"
              }
              alt={nextAppointment?.service?.serviceName ?? "SalonBook interior"}
              fill
              sizes="(max-width: 1280px) 100vw, 700px"
              className="object-cover object-center opacity-45 sm:opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-burgundy-dark via-burgundy-dark/90 to-burgundy-dark/35" />
            <div className="relative p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[0.625rem] font-bold tracking-[0.16em] text-cream/55 uppercase">
                  {nextAppointment ? "Your next appointment" : "Your next moment"}
                </p>
                {nextAppointment ? (
                  <StatusBadge status={nextAppointment.status} className="border-white/15 bg-white/10 text-cream" />
                ) : null}
              </div>

              {nextAppointment ? (
                <>
                  <h2 className="mt-4 max-w-lg font-serif text-[2.2rem] leading-[1.02] tracking-[-0.035em] sm:text-[2.7rem]">
                    {nextAppointment.service?.serviceName}
                  </h2>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-cream/65">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-rose" />
                      {formatWeekday(nextAppointment.appointmentDate)},{" "}
                      {formatDate(nextAppointment.appointmentDate)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-3.5 text-rose" />
                      {nextAppointment.timeSlot}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Scissors className="size-3.5 text-rose" />
                      {nextAppointment.service?.category}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {nextAppointment.paymentStatus === "unpaid" ? (
                      <ButtonLink
                        href={`/dashboard/payments/${nextAppointment.id}`}
                        variant="light"
                        size="sm"
                      >
                        <CreditCard className="size-3.5" />
                        Complete payment
                      </ButtonLink>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[0.6875rem] font-semibold text-cream/80">
                        <ReceiptText className="size-3.5 text-gold" />
                        Paid · {formatCurrency(nextAppointment.servicePrice)}
                      </span>
                    )}
                    <Link
                      href={`/services/${nextAppointment.serviceId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cream/70 transition hover:text-cream"
                    >
                      View ritual
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="mt-4 max-w-md font-serif text-[2.2rem] leading-[1.02] tracking-[-0.035em] sm:text-[2.6rem]">
                    There&apos;s room for a little ritual.
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-cream/60">
                    Browse the menu and choose a moment that feels like yours. We&apos;ll take
                    care of the rest.
                  </p>
                  <ButtonLink href="/services" variant="light" size="sm" className="mt-6">
                    Explore the menu
                    <ArrowUpRight className="size-3.5" />
                  </ButtonLink>
                </>
              )}
            </div>
          </section>

          <DashPanel
            title="Appointment requests"
            description="Requests stay pending until the salon confirms your date and time."
            action={
              <Link
                href="/dashboard/appointments"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy hover:underline"
              >
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            }
            flush
          >
            {pending.length > 0 ? (
              <ul className="divide-y divide-sand/70">
                {pending.slice(0, 3).map((appointment) => (
                  <li
                    key={appointment.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="relative hidden size-12 shrink-0 overflow-hidden rounded-xl bg-cream-deep sm:block">
                        {appointment.service ? (
                          <Image
                            src={appointment.service.image}
                            alt={appointment.service.serviceName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {appointment.service?.serviceName ?? "Salon service"}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {formatDate(appointment.appointmentDate)} ·{" "}
                          {appointment.timeSlot} ·{" "}
                          {formatCurrency(appointment.servicePrice)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:shrink-0">
                      <StatusBadge status="pending" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCancelTarget(appointment)}
                      >
                        Cancel request
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-10 text-center sm:px-6">
                <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-sage-light text-sage">
                  <CalendarCheck2 className="size-4.5" />
                </span>
                <p className="mt-3 font-serif text-xl tracking-[-0.02em]">All caught up.</p>
                <p className="mt-1 text-xs leading-5 text-ink-soft">
                  You have no pending appointment requests right now.
                </p>
              </div>
            )}
          </DashPanel>

          <DashPanel
            title="Recent activity"
            description="A quick look at your latest appointments and payments."
            action={
              paymentsDue.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf4e5] px-2.5 py-1 text-[0.625rem] font-semibold text-[#84612d]">
                  <CreditCard className="size-3" />
                  {formatCurrency(dueTotal)} due
                </span>
              ) : null
            }
            flush
          >
            {recent.length > 0 ? (
              <ul className="divide-y divide-sand/70">
                {recent.map((appointment) => {
                  const transaction = transactions.find(
                    (item) => item.appointmentId === appointment.id
                  )
                  return (
                    <li
                      key={appointment.id}
                      className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {appointment.service?.serviceName ?? "Salon service"}
                        </p>
                        <p className="mt-0.5 text-[0.6875rem] text-ink-soft">
                          {formatDate(appointment.appointmentDate)} ·{" "}
                          {appointment.timeSlot}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <StatusBadge status={appointment.status} />
                        {appointment.status === "confirmed" ? (
                          appointment.paymentStatus === "paid" ? (
                            <span className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-sage">
                              <ReceiptText className="size-3" />
                              {transaction ? formatCurrency(transaction.amount) : "Paid"}
                            </span>
                          ) : (
                            <Link
                              href={`/dashboard/payments/${appointment.id}`}
                              className="text-[0.6875rem] font-semibold text-burgundy hover:underline"
                            >
                              Pay now
                            </Link>
                          )
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No appointments yet"
                description="Your appointment history will appear here after your first booking."
                action={<ButtonLink href="/services" size="sm">Browse services</ButtonLink>}
                className="m-5 sm:m-6"
              />
            )}
          </DashPanel>
        </div>

        <div className="space-y-5">
          <DashPanel
            title="Payment due"
            description={
              paymentsDue.length > 0
                ? "Confirmed visits ready for secure checkout."
                : "Nothing waiting to be paid."
            }
          >
            {paymentsDue.length > 0 ? (
              <div className="space-y-3">
                {paymentsDue.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-xl border border-[#ead7b3] bg-[#fbf7ec] p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {appointment.service?.serviceName}
                        </p>
                        <p className="mt-1 text-[0.625rem] text-ink-soft">
                          {formatDate(appointment.appointmentDate)} ·{" "}
                          {appointment.timeSlot}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-burgundy">
                        {formatCurrency(appointment.servicePrice)}
                      </span>
                    </div>
                    <ButtonLink
                      href={`/dashboard/payments/${appointment.id}`}
                      size="sm"
                      className="mt-3 w-full"
                    >
                      <CreditCard className="size-3.5" />
                      Pay securely
                    </ButtonLink>
                  </div>
                ))}
                <p className="text-center text-[0.625rem] leading-5 text-ink-soft">
                  Secure Stripe checkout. Card details never touch SalonBook.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-sage-light/60 px-4 py-5 text-center">
                <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-white/70 text-sage">
                  <ReceiptText className="size-4" />
                </span>
                <p className="mt-2.5 text-xs font-semibold text-[#516b48]">
                  Everything is settled.
                </p>
                <p className="mt-1 text-[0.625rem] leading-5 text-[#516b48]/75">
                  Payments become available once the salon confirms an appointment.
                </p>
              </div>
            )}
          </DashPanel>

          <DashPanel
            title="Chosen for you"
            description="A few rituals you haven't tried yet."
            action={
              <Link
                href="/services"
                className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-burgundy hover:underline"
              >
                See all
                <ArrowUpRight className="size-3" />
              </Link>
            }
            bodyClassName="space-y-3"
          >
            {suggestions.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="group flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-white/60"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                  <Image
                    src={service.image}
                    alt={service.serviceName}
                    fill
                    sizes="56px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{service.serviceName}</p>
                  <p className="mt-0.5 text-[0.625rem] text-ink-soft">
                    {service.category}
                  </p>
                  <p className="mt-1 text-[0.6875rem] font-bold text-burgundy">
                    {formatCurrency(service.price)}
                  </p>
                </div>
                <ArrowUpRight className="size-3.5 shrink-0 text-ink-soft/50 transition group-hover:text-burgundy" />
              </Link>
            ))}
          </DashPanel>

          <div className="rounded-[1.35rem] border border-sand/80 bg-[#f1e7db] p-5">
            <p className="text-[0.5625rem] font-bold tracking-[0.15em] text-burgundy uppercase">
              Visit us
            </p>
            <p className="mt-2 font-serif text-[1.6rem] leading-tight tracking-[-0.025em]">
              A little pause in Brooklyn.
            </p>
            <div className="mt-3 space-y-2 text-[0.6875rem] leading-5 text-ink-soft">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-burgundy" />
                {SALON.address}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-3.5 shrink-0 text-burgundy" />
                {SALON.phone}
              </p>
            </div>
            <Link
              href="/#visit"
              className="mt-4 inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-burgundy hover:underline"
            >
              Hours & directions
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null)
        }}
        title="Cancel this request?"
        description={
          cancelTarget
            ? `${cancelTarget.service?.serviceName ?? "This appointment"} on ${formatDate(
                cancelTarget.appointmentDate
              )} at ${cancelTarget.timeSlot} will be withdrawn. You can always request a new time.`
            : ""
        }
        confirmLabel="Cancel request"
        cancelLabel="Keep appointment"
        tone="danger"
        onConfirm={confirmCancellation}
      />
    </>
  )
}

"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Leaf,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react"
import { AuthGate } from "@/components/auth/auth-gate"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Button, ButtonLink } from "@/components/ui/button"
import { FormAlert, PageLoader } from "@/components/ui/feedback"
import { Field, Textarea } from "@/components/ui/form-field"
import { Modal } from "@/components/ui/modal"
import { StatusBadge } from "@/components/ui/status-badge"
import { TIME_SLOTS } from "@/lib/constants"
import type { Appointment } from "@/lib/types"
import {
  addDays,
  cn,
  formatCurrency,
  formatDate,
  formatDuration,
  formatWeekday,
  toDateInputValue,
  todayInputValue,
} from "@/lib/utils"

export function ServiceDetail() {
  return (
    <AuthGate>
      <ServiceDetailContent />
    </AuthGate>
  )
}

function ServiceDetailContent() {
  const params = useParams<{ id: string }>()
  const { db, currentUser, isHydrated, bookAppointment } = useStore()
  const toast = useToast()

  const [date, setDate] = React.useState("")
  const [timeSlot, setTimeSlot] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [error, setError] = React.useState("")
  const [fieldErrors, setFieldErrors] = React.useState<{ date?: string; timeSlot?: string }>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [successOpen, setSuccessOpen] = React.useState(false)
  const [createdAppointment, setCreatedAppointment] = React.useState<Appointment | null>(null)

  const service = db?.services.find((item) => item.id === params.id)
  const currentUserId = currentUser?.id

  const unavailableSlots = React.useMemo(() => {
    if (!db || !currentUserId || !date) return []
    return db.appointments
      .filter(
        (appointment) =>
          appointment.customerId === currentUserId &&
          appointment.appointmentDate === date &&
          appointment.status !== "cancelled"
      )
      .map((appointment) => appointment.timeSlot)
  }, [currentUserId, date, db])

  if (!isHydrated) {
    return (
      <div className="container-page py-16">
        <PageLoader />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-cream-deep text-burgundy">
          <Scissors className="size-6" />
        </span>
        <p className="eyebrow mt-6">Not found</p>
        <h1 className="mt-3 font-serif text-4xl tracking-[-0.03em]">
          This ritual isn&apos;t on the menu.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft">
          The service you&apos;re looking for may have been moved or removed. Explore the
          full menu to find your next moment.
        </p>
        <ButtonLink href="/services" className="mt-6">
          Browse all services
          <ArrowUpRight className="size-4" />
        </ButtonLink>
      </div>
    )
  }

  if (service.status !== "active") {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <StatusBadge status="inactive" />
        <h1 className="mt-5 max-w-lg font-serif text-4xl leading-tight tracking-[-0.03em]">
          This ritual is taking a little pause.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft">
          {service.serviceName} isn&apos;t accepting appointments right now. Explore our
          current menu — we&apos;d love to find something lovely for you.
        </p>
        <ButtonLink href="/services" className="mt-6">
          Explore active services
        </ButtonLink>
      </div>
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const nextErrors: typeof fieldErrors = {}
    if (!date) nextErrors.date = "Choose an appointment date."
    if (!timeSlot) nextErrors.timeSlot = "Choose an available time."
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    const result = await bookAppointment({
      serviceId: service.id,
      appointmentDate: date,
      timeSlot,
      message,
    })

    if (!result.ok) {
      setError(result.error)
      toast.error("Could not request appointment", result.error)
      setIsSubmitting(false)
      return
    }

    setCreatedAppointment(result.data)
    setSuccessOpen(true)
    setDate("")
    setTimeSlot("")
    setMessage("")
    setIsSubmitting(false)
    toast.success("Appointment requested", "We'll confirm your appointment shortly.")
  }

  const inputMin = todayInputValue()
  const inputMax = toDateInputValue(addDays(90))

  return (
    <>
      <div className="container-page py-7 sm:py-9">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft transition hover:text-burgundy"
        >
          <ArrowLeft className="size-3.5" />
          Back to all services
        </Link>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 xl:gap-16">
          <div className="min-w-0">
            <div className="relative aspect-[4/4.4] overflow-hidden rounded-[1.6rem] border border-sand/80 bg-cream-deep shadow-[0_30px_70px_-50px_rgba(45,28,20,0.55)] sm:aspect-[4/3.6] lg:aspect-[4/4.3]">
              <Image
                src={service.image}
                alt={service.serviceName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/30 bg-cream/90 px-3 py-1.5 text-[0.625rem] font-bold tracking-[0.1em] text-burgundy uppercase backdrop-blur">
                  {service.category}
                </span>
                <span className="rounded-full border border-white/20 bg-ink/30 px-3 py-1.5 text-[0.625rem] font-semibold text-cream backdrop-blur">
                  Signature ritual
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Clock3, label: "Duration", value: formatDuration(service.duration) },
                { icon: CalendarDays, label: "Booking", value: "Date & time of choice" },
                { icon: ShieldCheck, label: "Payment", value: "Only after confirmation" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-sand/80 bg-white/45 px-4 py-3.5"
                >
                  <item.icon className="size-4 text-burgundy" />
                  <p className="mt-2.5 text-[0.625rem] font-bold tracking-[0.1em] text-ink-soft uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-ink">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-sand/70 bg-white/35 p-5 sm:p-6">
              <h2 className="font-serif text-2xl tracking-[-0.02em]">The experience</h2>
              <p className="mt-3 text-sm leading-7 text-ink-soft">{service.description}</p>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {[
                  "A personal consultation",
                  "Thoughtful, skin-kind products",
                  "A finish you can recreate",
                  "Time to slow down and exhale",
                ].map((point) => (
                  <span
                    key={point}
                    className="flex items-start gap-2 text-[0.75rem] leading-5 text-ink-soft"
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-sage-light text-sage">
                      <Check className="size-2.5" />
                    </span>
                    {point}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
            <p className="text-[0.625rem] font-bold tracking-[0.15em] text-burgundy uppercase">
              {service.category}
            </p>
            <h1 className="mt-2 font-serif text-[2.9rem] leading-[0.96] tracking-[-0.04em] sm:text-[3.6rem]">
              {service.serviceName}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-3 fill-current" />
                  ))}
                </span>
                <span className="font-semibold text-ink">4.9</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" />
                {formatDuration(service.duration)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Leaf className="size-3.5 text-sage" />
                Senior artist
              </span>
            </div>

            <p className="mt-5 text-[0.9375rem] leading-7 text-ink-soft">{service.description}</p>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-serif text-[2.3rem] leading-none tracking-[-0.03em] text-burgundy">
                {formatCurrency(service.price)}
              </span>
              <span className="text-xs text-ink-soft">total · no deposit required</span>
            </div>

            <div className="mt-6 rounded-2xl border border-sand/80 bg-white/55 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-serif text-[1.6rem] tracking-[-0.02em]">Request appointment</h2>
                <Sparkles className="size-4 text-gold" />
              </div>
              <p className="mt-1 text-xs leading-5 text-ink-soft">
                Choose a date and time. We&apos;ll review your request and confirm shortly.
              </p>

              {currentUser?.role === "admin" ? (
                <div className="mt-4 rounded-xl border border-[#e6d8c4] bg-[#fffaf2] p-4">
                  <p className="text-sm font-semibold text-[#725b36]">You&apos;re signed in as an admin</p>
                  <p className="mt-1 text-xs leading-5 text-[#725b36]/80">
                    Appointment requests are made by customers. You can manage this service
                    and upcoming appointments from the admin dashboard.
                  </p>
                  <ButtonLink href="/dashboard/admin/services" size="sm" className="mt-3">
                    Manage services
                  </ButtonLink>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
                  {error ? <FormAlert>{error}</FormAlert> : null}

                  <Field label="Appointment date" htmlFor="appointment-date" error={fieldErrors.date}>
                    <input
                      id="appointment-date"
                      type="date"
                      min={inputMin}
                      max={inputMax}
                      value={date}
                      onChange={(event) => {
                        setDate(event.target.value)
                        setTimeSlot("")
                        setFieldErrors((current) => ({ ...current, date: undefined }))
                      }}
                      className="input-field"
                      aria-invalid={Boolean(fieldErrors.date)}
                    />
                  </Field>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-xs font-semibold">Time slot</span>
                      {date ? (
                        <span className="text-[0.625rem] text-ink-soft">
                          {formatWeekday(date)}, {formatDate(date)}
                        </span>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                      {TIME_SLOTS.map((slot) => {
                        const unavailable = unavailableSlots.includes(slot)
                        const selected = timeSlot === slot
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={!date || unavailable}
                            onClick={() => {
                              setTimeSlot(slot)
                              setFieldErrors((current) => ({ ...current, timeSlot: undefined }))
                            }}
                            className={cn(
                              "rounded-lg border px-1.5 py-2 text-[0.625rem] font-semibold transition",
                              selected
                                ? "border-burgundy bg-burgundy text-cream"
                                : "border-sand/80 bg-white/60 text-ink-soft hover:border-sand-dark hover:text-ink",
                              !date && "cursor-not-allowed opacity-45",
                              unavailable && "cursor-not-allowed border-dashed opacity-35 line-through"
                            )}
                            title={
                              unavailable
                                ? "You already have an appointment in this time slot"
                                : !date
                                  ? "Choose a date first"
                                  : slot
                            }
                          >
                            {slot}
                          </button>
                        )
                      })}
                    </div>
                    {fieldErrors.timeSlot ? (
                      <p className="text-xs text-[#9d3c43]" role="alert">
                        {fieldErrors.timeSlot}
                      </p>
                    ) : null}
                  </div>

                  <Field label="A note for your artist" htmlFor="appointment-message" optional>
                    <Textarea
                      id="appointment-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      maxLength={500}
                      placeholder="Anything we should know? Allergies, inspiration, or a simple hello…"
                      className="min-h-[92px]"
                    />
                  </Field>

                  <div className="flex items-start gap-2 rounded-xl bg-cream-deep/65 px-3 py-2.5 text-[0.625rem] leading-5 text-ink-soft">
                    <CreditCard className="mt-0.5 size-3.5 shrink-0 text-burgundy" />
                    Payment isn&apos;t due now. You can pay securely from your dashboard once
                    the salon confirms your appointment.
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    loading={isSubmitting}
                    disabled={!date || !timeSlot}
                  >
                    Request this appointment
                  </Button>

                  <p className="text-center text-[0.625rem] text-ink-soft/70">
                    Requests are pending until confirmed by the salon.
                  </p>
                </form>
              )}
            </div>

            <div className="mt-5 flex items-center justify-center gap-4 text-[0.625rem] text-ink-soft/75">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="size-3" />
                Secure booking
              </span>
              <span aria-hidden="true">·</span>
              <span>Free cancellation while pending</span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Your request is in."
        description="We'll review your appointment and send a confirmation soon."
        eyebrow="Appointment requested"
        footer={
          <>
            <Button variant="outline" onClick={() => setSuccessOpen(false)}>
              Keep browsing
            </Button>
            <ButtonLink href="/dashboard/appointments">View my appointments</ButtonLink>
          </>
        }
      >
        {createdAppointment ? (
          <div className="rounded-2xl border border-sand/80 bg-white/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.625rem] font-bold tracking-[0.12em] text-burgundy uppercase">
                  {service.category}
                </p>
                <p className="mt-1 font-serif text-2xl tracking-[-0.02em]">{service.serviceName}</p>
              </div>
              <StatusBadge status="pending" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-sand/70 pt-4 text-xs">
              <div>
                <p className="text-[0.625rem] text-ink-soft uppercase">Date</p>
                <p className="mt-1 font-semibold">{formatDate(createdAppointment.appointmentDate)}</p>
              </div>
              <div>
                <p className="text-[0.625rem] text-ink-soft uppercase">Time</p>
                <p className="mt-1 font-semibold">{createdAppointment.timeSlot}</p>
              </div>
              <div>
                <p className="text-[0.625rem] text-ink-soft uppercase">Service price</p>
                <p className="mt-1 font-semibold">{formatCurrency(createdAppointment.servicePrice)}</p>
              </div>
              <div>
                <p className="text-[0.625rem] text-ink-soft uppercase">Payment</p>
                <p className="mt-1 font-semibold">Due after confirmation</p>
              </div>
            </div>
          </div>
        ) : null}
        <p className="mt-4 text-xs leading-5 text-ink-soft">
          You can cancel this request while it is pending. Once confirmed, you&apos;ll be
          able to complete payment from your dashboard.
        </p>
      </Modal>
    </>
  )
}

"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Info,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Button, ButtonLink } from "@/components/ui/button"
import { DashboardSkeleton, FormAlert } from "@/components/ui/feedback"
import { Field, Input } from "@/components/ui/form-field"
import { PageHeader } from "@/components/dashboard/ui"
import { PAYMENT_CLIENT_MESSAGE } from "@/lib/constants"
import { getAppointmentTransaction, getService } from "@/lib/selectors"
import {
  formatCurrency,
  formatDate,
  formatDuration,
  formatWeekday,
} from "@/lib/utils"

export function PaymentCheckout() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { db, currentUser, completePayment } = useStore()
  const toast = useToast()

  const [cardName, setCardName] = React.useState("")
  const [cardNumber, setCardNumber] = React.useState("")
  const [expiry, setExpiry] = React.useState("")
  const [cvc, setCvc] = React.useState("")
  const [error, setError] = React.useState("")
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = React.useState(false)
  const timerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  if (!db || !currentUser) return <DashboardSkeleton />

  const appointment = db.appointments.find((item) => item.id === params.id)
  const service = appointment ? getService(db, appointment.serviceId) : undefined

  if (!appointment) {
    return (
      <PaymentState
        icon={CreditCard}
        eyebrow="Payment link"
        title="We couldn't find this checkout."
        description="The appointment may have been removed, or the payment link is incomplete."
        primary={{ href: "/dashboard/appointments", label: "Back to appointments" }}
        secondary={{ href: "/dashboard", label: "Go to dashboard" }}
      />
    )
  }

  if (appointment.customerId !== currentUser.id) {
    return (
      <PaymentState
        icon={LockKeyhole}
        eyebrow="Private checkout"
        title="This payment link belongs to another guest."
        description="For privacy, only the customer attached to an appointment can complete its payment."
        primary={{ href: "/dashboard/appointments", label: "My appointments" }}
        secondary={{ href: "/dashboard", label: "Go to dashboard" }}
      />
    )
  }

  if (appointment.status === "pending") {
    return (
      <PaymentState
        icon={Clock3}
        eyebrow="Not ready yet"
        title="Your appointment is still pending."
        description="Payment becomes available as soon as the salon confirms your date and time. We'll keep your request safe until then."
        primary={{ href: "/dashboard/appointments", label: "View appointment" }}
        secondary={{ href: "/services", label: "Browse services" }}
        tone="gold"
      />
    )
  }

  if (appointment.status === "cancelled") {
    return (
      <PaymentState
        icon={Info}
        eyebrow="Appointment cancelled"
        title="This visit has been cancelled."
        description="There is no payment due for a cancelled appointment. You can request a new time whenever you're ready."
        primary={{ href: "/dashboard/appointments", label: "My appointments" }}
        secondary={{ href: `/services/${appointment.serviceId}`, label: "Book again" }}
      />
    )
  }

  const existingTransaction = getAppointmentTransaction(db, appointment.id)

  if (appointment.paymentStatus === "paid" || existingTransaction) {
    return (
      <PaymentState
        icon={Check}
        eyebrow="Payment complete"
        title="This appointment is already paid."
        description="Your payment has been recorded. You can view the receipt or head back to your appointments."
        primary={{
          href: `/dashboard/payments/${appointment.id}/success`,
          label: "View receipt",
        }}
        secondary={{ href: "/dashboard/appointments", label: "My appointments" }}
        tone="sage"
      />
    )
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (cardName.trim().length < 2) {
      nextErrors.cardName = "Enter the name shown on the card."
    }
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      nextErrors.cardNumber = "Enter a 16-digit demo card number."
    }
    const expiryMatch = expiry.match(/^(\d{2})\/(\d{2})$/)
    if (!expiryMatch) {
      nextErrors.expiry = "Use MM/YY format."
    } else {
      const month = Number(expiryMatch[1])
      const year = 2000 + Number(expiryMatch[2])
      const expiryDate = new Date(year, month, 0, 23, 59, 59)
      if (month < 1 || month > 12) {
        nextErrors.expiry = "Enter a valid month."
      } else if (expiryDate < new Date()) {
        nextErrors.expiry = "This demo card has expired."
      }
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      nextErrors.cvc = "Enter 3 or 4 digits."
    }
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    if (!validate()) return

    setIsProcessing(true)
    timerRef.current = window.setTimeout(() => {
      const result = completePayment(appointment.id)
      if (!result.ok) {
        setError(result.error)
        toast.error("Payment could not be completed", result.error)
        setIsProcessing(false)
        return
      }

      toast.success("Payment complete", "Your demo receipt is ready to view.")
      router.push(`/dashboard/payments/${appointment.id}/success`)
    }, 1100)
  }

  const fillDemoCard = () => {
    setCardName(currentUser.name)
    setCardNumber("4242 4242 4242 4242")
    setExpiry("12/30")
    setCvc("123")
    setFieldErrors({})
    toast.info("Demo card filled", "No real card details are collected or stored.")
  }

  return (
    <>
      <Link
        href="/dashboard/appointments"
        className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft transition hover:text-burgundy"
      >
        <ArrowLeft className="size-3.5" />
        Back to appointments
      </Link>

      <PageHeader
        eyebrow="Secure checkout"
        title="Complete your appointment."
        description="This is a front-end demo of the Stripe checkout flow. Your card values never leave this page."
        className="mt-5"
      />

      <div className="mt-7 grid items-start gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card overflow-hidden">
          <div className="flex items-start gap-3 border-b border-sand/70 bg-[#fffaf2] px-5 py-4 text-[#725b36] sm:px-6">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-light">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-xs font-bold tracking-[0.04em]">
                Demo checkout — no real payment
              </p>
              <p className="mt-1 text-[0.6875rem] leading-5 text-[#725b36]/85">
                {PAYMENT_CLIENT_MESSAGE}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5 p-5 sm:p-6">
            {error ? <FormAlert>{error}</FormAlert> : null}

            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-[1.6rem] tracking-[-0.02em]">
                  Payment details
                </h2>
                <p className="mt-1 text-xs text-ink-soft">
                  Use any validly formatted demo card.
                </p>
              </div>
              <button
                type="button"
                onClick={fillDemoCard}
                className="shrink-0 rounded-full border border-sand bg-white/60 px-3 py-1.5 text-[0.625rem] font-semibold text-ink-soft transition hover:border-sand-dark hover:text-ink"
              >
                Use demo card
              </button>
            </div>

            <Field label="Name on card" htmlFor="card-name" error={fieldErrors.cardName}>
              <Input
                id="card-name"
                value={cardName}
                onChange={(event) => {
                  setCardName(event.target.value)
                  setFieldErrors((current) => ({ ...current, cardName: "" }))
                }}
                placeholder="Sofia Bennett"
                autoComplete="cc-name"
                aria-invalid={Boolean(fieldErrors.cardName)}
              />
            </Field>

            <Field
              label="Card number"
              htmlFor="card-number"
              error={fieldErrors.cardNumber}
              hint="Demo only"
            >
              <div className="relative">
                <Input
                  id="card-number"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 16)
                    setCardNumber(digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim())
                    setFieldErrors((current) => ({ ...current, cardNumber: "" }))
                  }}
                  placeholder="4242 4242 4242 4242"
                  autoComplete="cc-number"
                  className="pr-12"
                  aria-invalid={Boolean(fieldErrors.cardNumber)}
                />
                <CreditCard className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-soft" />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Expiry" htmlFor="card-expiry" error={fieldErrors.expiry}>
                <Input
                  id="card-expiry"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 4)
                    setExpiry(
                      digits.length > 2
                        ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                        : digits
                    )
                    setFieldErrors((current) => ({ ...current, expiry: "" }))
                  }}
                  placeholder="MM/YY"
                  autoComplete="cc-exp"
                  aria-invalid={Boolean(fieldErrors.expiry)}
                />
              </Field>

              <Field label="CVC" htmlFor="card-cvc" error={fieldErrors.cvc}>
                <Input
                  id="card-cvc"
                  inputMode="numeric"
                  value={cvc}
                  onChange={(event) => {
                    setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))
                    setFieldErrors((current) => ({ ...current, cvc: "" }))
                  }}
                  placeholder="123"
                  autoComplete="cc-csc"
                  aria-invalid={Boolean(fieldErrors.cvc)}
                />
              </Field>
            </div>

            <div className="rounded-xl bg-cream-deep/60 px-3.5 py-3 text-[0.625rem] leading-5 text-ink-soft">
              <p className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-sage" />
                This demo never stores, sends, or validates card details against a payment
                processor. Fields are cleared when you leave this page.
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={isProcessing}>
              {isProcessing ? (
                "Processing demo payment…"
              ) : (
                <>
                  <LockKeyhole className="size-4" />
                  Pay {formatCurrency(appointment.servicePrice)}
                </>
              )}
            </Button>

            <div className="flex items-center justify-between gap-3 text-[0.625rem] text-ink-soft/75">
              <Link
                href={`/dashboard/payments/${appointment.id}/cancel`}
                className="transition hover:text-ink"
              >
                Cancel payment
              </Link>
              <span className="inline-flex items-center gap-1">
                <LockKeyhole className="size-3" />
                Simulated secure checkout
              </span>
            </div>
          </form>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="surface-card overflow-hidden">
            <div className="relative aspect-[16/8] w-full bg-cream-deep">
              {service ? (
                <Image
                  src={service.image}
                  alt={service.serviceName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full border border-white/30 bg-cream/90 px-2.5 py-1 text-[0.5625rem] font-bold tracking-[0.1em] text-burgundy uppercase backdrop-blur">
                {service?.category ?? "Salon ritual"}
              </span>
            </div>

            <div className="p-5">
              <p className="text-[0.5625rem] font-bold tracking-[0.14em] text-burgundy uppercase">
                Order summary
              </p>
              <h2 className="mt-1.5 font-serif text-[1.7rem] leading-tight tracking-[-0.025em]">
                {service?.serviceName ?? "Salon service"}
              </h2>

              <div className="mt-4 space-y-2.5 border-y border-sand/70 py-4 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-ink-soft">
                    <CalendarDays className="size-3.5 text-gold" />
                    Date
                  </span>
                  <span className="font-semibold">
                    {formatWeekday(appointment.appointmentDate)},{" "}
                    {formatDate(appointment.appointmentDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-ink-soft">
                    <Clock3 className="size-3.5 text-gold" />
                    Time
                  </span>
                  <span className="font-semibold">{appointment.timeSlot}</span>
                </div>
                {service ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-ink-soft">
                      <Wallet className="size-3.5 text-gold" />
                      Duration
                    </span>
                    <span className="font-semibold">{formatDuration(service.duration)}</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-3 text-ink-soft">
                  <span>Service</span>
                  <span>{formatCurrency(appointment.servicePrice)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-ink-soft">
                  <span>Demo processing</span>
                  <span>$0.00</span>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-sand/70 pt-3">
                  <span className="text-sm font-semibold">Total due</span>
                  <span className="font-serif text-[1.9rem] leading-none tracking-[-0.03em] text-burgundy">
                    {formatCurrency(appointment.servicePrice)}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-sage-light/60 px-3 py-2.5 text-[0.625rem] leading-5 text-[#516b48]">
                <p className="flex items-start gap-1.5">
                  <Check className="mt-0.5 size-3 shrink-0" />
                  Your appointment is confirmed. Payment secures the booking in this demo.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sand/80 bg-white/40 p-4 text-[0.625rem] leading-5 text-ink-soft">
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <ShieldCheck className="size-3.5 text-sage" />
              About this checkout
            </p>
            <p className="mt-1.5">
              In production, this page would create a Stripe Checkout session on the
              server, redirect to Stripe, and confirm the payment through a webhook. This
              build demonstrates the client experience only.
            </p>
            <ButtonLink
              href="/dashboard/appointments"
              variant="ghost"
              size="sm"
              className="mt-2 -ml-2 h-8 text-[0.625rem]"
            >
              Return without paying
            </ButtonLink>
          </div>
        </aside>
      </div>
    </>
  )
}

function PaymentState({
  icon: Icon,
  eyebrow,
  title,
  description,
  primary,
  secondary,
  tone = "neutral",
}: {
  icon: React.ElementType
  eyebrow: string
  title: string
  description: string
  primary: { href: string; label: string }
  secondary: { href: string; label: string }
  tone?: "neutral" | "gold" | "sage"
}) {
  const toneClasses = {
    neutral: "bg-cream-deep text-burgundy",
    gold: "bg-gold-light text-[#84612d]",
    sage: "bg-sage-light text-sage",
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-lg text-center">
        <span
          className={`mx-auto flex size-14 items-center justify-center rounded-full ${toneClasses[tone]}`}
        >
          <Icon className="size-6" />
        </span>
        <p className="eyebrow mt-6 justify-center before:hidden">{eyebrow}</p>
        <h1 className="mt-3 font-serif text-[2.3rem] leading-tight tracking-[-0.03em]">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft">{description}</p>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <ButtonLink href={primary.href}>{primary.label}</ButtonLink>
          <ButtonLink href={secondary.href} variant="outline">
            {secondary.label}
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}

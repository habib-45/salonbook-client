"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  LoaderCircle,
  Mail,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Button, ButtonLink } from "@/components/ui/button"
import { DashboardSkeleton } from "@/components/ui/feedback"
import { StatusBadge } from "@/components/ui/status-badge"
import { apiRequest, messageFromError } from "@/lib/api"
import { getAppointmentTransaction, getService } from "@/lib/selectors"
import type { CheckoutSessionStatus } from "@/lib/types"
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatWeekday,
  truncateMiddle,
} from "@/lib/utils"

type ConfirmationState = "checking" | "verified" | "pending" | "error"

export function PaymentSuccess() {
  const params = useParams<{ id: string }>()
  const { db, currentUser, refreshData } = useStore()
  const toast = useToast()

  const [sessionId] = React.useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("session_id")
  )
  const [confirmation, setConfirmation] = React.useState<ConfirmationState>("checking")
  const [confirmationError, setConfirmationError] = React.useState("")

  const appointment = db?.appointments.find((item) => item.id === params.id)
  const transaction = db && appointment
    ? getAppointmentTransaction(db, appointment.id)
    : undefined
  const alreadyPaid = appointment?.paymentStatus === "paid"

  const checkPayment = React.useCallback(async () => {
    if (!sessionId) return
    try {
      const status = await apiRequest<CheckoutSessionStatus>(
        `/payments/session/${encodeURIComponent(sessionId)}`,
        { signal: AbortSignal.timeout(10_000) }
      )
      setConfirmationError("")
      if (status.appointmentPaymentStatus === "paid") {
        await refreshData()
        setConfirmation("verified")
        return "verified" as const
      }
      return "pending" as const
    } catch (error) {
      setConfirmationError(messageFromError(error))
      return "error" as const
    }
  }, [refreshData, sessionId])

  React.useEffect(() => {
    if (!currentUser || alreadyPaid || !sessionId) return

    let cancelled = false
    let attempts = 0

    const poll = async () => {
      while (!cancelled && attempts < 20) {
        attempts += 1
        const result = await checkPayment()
        if (cancelled) return
        if (result === "verified") {
          setConfirmation("verified")
          return
        }
        if (result === "error" && attempts >= 4) {
          setConfirmation("error")
          return
        }
        await new Promise((resolve) => setTimeout(resolve, 2_500))
      }
      if (!cancelled) setConfirmation("pending")
    }

    void poll()
    return () => {
      cancelled = true
    }
  }, [alreadyPaid, checkPayment, currentUser, sessionId])

  if (!db || !currentUser) return <DashboardSkeleton />

  const service = appointment ? getService(db, appointment.serviceId) : undefined

  if (!appointment || appointment.customerId !== currentUser.id) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-center">
        <div className="max-w-md">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-cream-deep text-burgundy">
            <ReceiptText className="size-6" />
          </span>
          <h1 className="mt-5 font-serif text-[2.3rem] leading-tight tracking-[-0.03em]">
            Receipt not found.
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            We couldn&apos;t find this appointment in your account. It may have been removed
            or the link may be incomplete.
          </p>
          <ButtonLink href="/dashboard/appointments" className="mt-6">
            My appointments
          </ButtonLink>
        </div>
      </div>
    )
  }

  if (!transaction) {
    const stillChecking = confirmation === "checking" && Boolean(sessionId)
    const needsAttention = confirmation === "pending" || confirmation === "error"
    const Icon = stillChecking ? ShieldCheck : needsAttention ? RefreshCcw : ReceiptText

    return (
      <div className="flex min-h-[70vh] items-center justify-center text-center">
        <div className="max-w-md">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gold-light text-[#84612d]">
            {stillChecking ? (
              <LoaderCircle className="size-6 animate-spin" />
            ) : (
              <Icon className="size-6" />
            )}
          </span>
          <h1 className="mt-5 font-serif text-[2.3rem] leading-tight tracking-[-0.03em]">
            {stillChecking
              ? "Confirming your payment."
              : needsAttention
                ? "Payment is still processing."
                : "No payment recorded yet."}
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            {stillChecking
              ? "Stripe has sent you back to SalonBook. We're waiting for the payment confirmation to reach our server — this usually takes a few seconds."
              : needsAttention
                ? confirmationError ||
                  "Stripe has not confirmed this payment yet. If you completed the payment, give it a moment and check again."
                : "This appointment does not have a completed payment yet. You can return to checkout whenever you're ready."}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            {needsAttention ? (
              <Button
                onClick={async () => {
                  setConfirmation("checking")
                  setConfirmationError("")
                  const result = await checkPayment()
                  if (result === "verified") {
                    toast.success("Payment confirmed", "Your receipt is ready.")
                  } else if (result === "error") {
                    toast.error("Still processing", "Stripe has not confirmed this payment yet.")
                  }
                }}
              >
                <RefreshCcw className="size-4" />
                Check again
              </Button>
            ) : null}
            {!stillChecking ? (
              <ButtonLink
                href={`/dashboard/payments/${appointment.id}`}
                variant={needsAttention ? "outline" : "primary"}
              >
                Complete payment
              </ButtonLink>
            ) : null}
            <ButtonLink
              href="/dashboard/appointments"
              variant={needsAttention ? "ghost" : "outline"}
            >
              My appointments
            </ButtonLink>
          </div>
          {stillChecking ? (
            <p className="mt-5 text-[0.625rem] leading-5 text-ink-soft/70">
              You can safely close this page. Your appointment will update as soon as
              Stripe&apos;s webhook is verified.
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  const copySession = async () => {
    try {
      await navigator.clipboard.writeText(transaction.stripeSessionId)
      toast.success("Session ID copied", "The Stripe session ID is on your clipboard.")
    } catch {
      toast.error("Could not copy", "Please select and copy the session ID manually.")
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="animate-fade-up text-center">
        <span className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-sage-light text-sage">
          <span className="absolute inset-0 animate-ping rounded-full bg-sage/10" />
          <Check className="size-7" strokeWidth={2.4} />
        </span>
        <p className="eyebrow mt-6 justify-center before:hidden">Payment complete</p>
        <h1 className="mt-3 font-serif text-[2.6rem] leading-[1] tracking-[-0.04em] sm:text-[3.2rem]">
          Beautifully done.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft">
          Stripe confirmed your payment. Your appointment is paid, and this receipt is saved
          in your SalonBook account.
        </p>
      </div>

      <div className="animate-fade-up delay-75 mt-7 overflow-hidden rounded-[1.35rem] border border-sand/80 bg-white/70 shadow-[0_24px_70px_-45px_rgba(52,37,28,0.5)]">
        <div className="flex flex-col gap-4 bg-burgundy-dark px-5 py-5 text-cream sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[0.5625rem] font-bold tracking-[0.16em] text-cream/45 uppercase">
              SalonBook · Payment receipt
            </p>
            <p className="mt-1 font-serif text-[1.8rem] leading-tight tracking-[-0.025em]">
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge
              status="paid"
              className="border-white/15 bg-white/10 text-cream"
            />
            <span className="text-[0.625rem] text-cream/45">
              {formatDateTime(transaction.createdAt)}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-light text-[#84612d]">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-[0.5625rem] font-bold tracking-[0.12em] text-burgundy uppercase">
                {service?.category ?? "Salon ritual"}
              </p>
              <h2 className="mt-0.5 font-serif text-[1.6rem] leading-tight tracking-[-0.025em]">
                {service?.serviceName ?? "Salon service"}
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 rounded-xl bg-cream-deep/50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-[0.5625rem] font-bold tracking-[0.1em] text-ink-soft uppercase">
                Guest
              </p>
              <p className="mt-1 text-xs font-semibold">{currentUser.name}</p>
              <p className="mt-0.5 text-[0.625rem] text-ink-soft">{currentUser.email}</p>
            </div>
            <div>
              <p className="text-[0.5625rem] font-bold tracking-[0.1em] text-ink-soft uppercase">
                Appointment
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold">
                <CalendarDays className="size-3.5 text-gold" />
                {formatWeekday(appointment.appointmentDate)},{" "}
                {formatDate(appointment.appointmentDate)}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-[0.625rem] text-ink-soft">
                <Clock3 className="size-3 text-gold" />
                {appointment.timeSlot}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2.5 border-t border-sand/70 pt-4 text-xs">
            <div className="flex items-center justify-between gap-3 text-ink-soft">
              <span>Service</span>
              <span>{formatCurrency(transaction.amount, transaction.currency)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-ink-soft">
              <span>Processing</span>
              <span>$0.00</span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-sand/70 pt-3">
              <span className="font-semibold">Total paid</span>
              <span className="font-serif text-2xl leading-none tracking-[-0.03em] text-burgundy">
                {formatCurrency(transaction.amount, transaction.currency)}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-2 rounded-xl border border-sand/70 bg-white/45 p-3.5 text-[0.625rem] text-ink-soft">
            <div className="flex items-center justify-between gap-3">
              <span>Transaction</span>
              <span className="truncate font-semibold text-ink">{transaction.id}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Stripe session</span>
              <button
                type="button"
                onClick={copySession}
                className="inline-flex items-center gap-1.5 font-semibold text-ink transition hover:text-burgundy"
                title="Copy session ID"
              >
                {truncateMiddle(transaction.stripeSessionId, 16, 5)}
                <Copy className="size-2.5" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Status</span>
              <span className="font-semibold text-[#516b48]">Paid · Stripe</span>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-up delay-150 mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
        <ButtonLink href="/dashboard/appointments">
          View my appointments
          <ArrowRight className="size-4" />
        </ButtonLink>
        <ButtonLink href="/services" variant="outline">
          Book another ritual
        </ButtonLink>
        <Button variant="ghost" size="sm" onClick={() => window.print()} className="hidden sm:inline-flex">
          Print receipt
        </Button>
      </div>

      <div className="animate-fade-up delay-225 mt-7 rounded-2xl border border-sand/70 bg-white/35 p-4 text-center">
        <p className="inline-flex items-center gap-1.5 text-[0.625rem] leading-5 text-ink-soft">
          <Mail className="size-3 text-gold" />
          Stripe emails a payment receipt to the address used at checkout. You can also
          return to this page from your appointment history.
        </p>
        <p className="mt-1 text-[0.625rem] text-ink-soft/60">
          Questions?{" "}
          <Link href="/#visit" className="font-semibold text-burgundy hover:underline">
            Contact the salon
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

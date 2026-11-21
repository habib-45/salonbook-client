"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  CreditCard,
  ShieldCheck,
  X,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { ButtonLink } from "@/components/ui/button"
import { DashboardSkeleton } from "@/components/ui/feedback"
import { StatusBadge } from "@/components/ui/status-badge"
import { getService } from "@/lib/selectors"
import { formatCurrency, formatDate, formatWeekday } from "@/lib/utils"

export function PaymentCancelled() {
  const params = useParams<{ id: string }>()
  const { db, currentUser } = useStore()

  if (!db || !currentUser) return <DashboardSkeleton />

  const appointment = db.appointments.find((item) => item.id === params.id)
  const service = appointment ? getService(db, appointment.serviceId) : undefined

  if (!appointment || appointment.customerId !== currentUser.id) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-center">
        <div className="max-w-md">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-cream-deep text-accent">
            <CreditCard className="size-6" />
          </span>
          <h1 className="mt-5 font-serif text-[2.3rem] leading-tight tracking-[-0.03em]">
            Checkout not found.
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            We couldn&apos;t find this appointment in your account. Your appointments are
            always available from the dashboard.
          </p>
          <ButtonLink href="/dashboard/appointments" className="mt-6">
            My appointments
          </ButtonLink>
        </div>
      </div>
    )
  }

  const canPay = appointment.status === "confirmed" && appointment.paymentStatus === "unpaid"

  return (
    <div className="mx-auto max-w-xl">
      <div className="animate-fade-up text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-gold-light text-warning">
          <X className="size-7" strokeWidth={2.2} />
        </span>
        <p className="eyebrow mt-6 justify-center before:hidden">Checkout closed</p>
        <h1 className="mt-3 font-serif text-[2.6rem] leading-[1] tracking-[-0.04em] sm:text-[3.1rem]">
          No payment was taken.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft">
          You left Stripe checkout before completing payment. Your appointment is
          unchanged and you can come back to it whenever you&apos;re ready.
        </p>
      </div>

      <div className="animate-fade-up delay-75 mt-7 overflow-hidden rounded-[1.35rem] border border-sand/80 bg-surface/70">
        <div className="flex items-center gap-3 border-b border-sand/70 px-5 py-4">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
            {service ? (
              <Image
                src={service.image}
                alt={service.serviceName}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.5625rem] font-bold tracking-[0.12em] text-accent uppercase">
              {service?.category ?? "Salon ritual"}
            </p>
            <h2 className="mt-0.5 truncate font-serif text-[1.4rem] leading-tight tracking-[-0.02em]">
              {service?.serviceName ?? "Salon service"}
            </h2>
          </div>
          <StatusBadge
            status={appointment.status === "cancelled" ? "cancelled" : "confirmed"}
            className="shrink-0"
          />
        </div>

        <div className="space-y-3 p-5 text-xs">
          <div className="flex items-center justify-between gap-3 text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-3.5 text-gold" />
              Date
            </span>
            <span className="font-semibold text-ink">
              {formatWeekday(appointment.appointmentDate)},{" "}
              {formatDate(appointment.appointmentDate)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="size-3.5 text-gold" />
              Time
            </span>
            <span className="font-semibold text-ink">{appointment.timeSlot}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-sand/70 pt-3">
            <span className="text-ink-soft">Outstanding payment</span>
            <span className="font-serif text-xl leading-none tracking-[-0.02em] text-accent">
              {formatCurrency(appointment.servicePrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="animate-fade-up delay-150 mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
        {canPay ? (
          <ButtonLink href={`/dashboard/payments/${appointment.id}`}>
            <CreditCard className="size-4" />
            Return to checkout
          </ButtonLink>
        ) : (
          <ButtonLink href="/dashboard/appointments">View appointment</ButtonLink>
        )}
        <ButtonLink href="/dashboard" variant="outline">
          <ArrowLeft className="size-4" />
          Back to dashboard
        </ButtonLink>
      </div>

      <p className="animate-fade-up delay-225 mt-7 flex items-center justify-center gap-1.5 text-center text-[0.625rem] leading-5 text-ink-soft/70">
        <ShieldCheck className="size-3" />
        No card details were shared with SalonBook.{" "}
        <Link href="/dashboard/appointments" className="font-semibold text-accent hover:underline">
          Manage your appointments
        </Link>
      </p>
    </div>
  )
}

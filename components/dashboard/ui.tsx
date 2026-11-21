import * as React from "react"
import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h1 className="font-serif text-[2.1rem] leading-[1.02] tracking-[-0.035em] text-ink sm:text-[2.65rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2.5 text-sm leading-6 text-ink-soft">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>
      ) : null}
    </div>
  )
}

const tones = {
  burgundy: "bg-burgundy text-paper",
  rose: "bg-rose-light text-accent",
  sage: "bg-sage-light text-sage",
  gold: "bg-gold-light text-warning",
  neutral: "bg-cream-deep text-ink-soft",
} as const

export type StatTone = keyof typeof tones

export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "burgundy",
  className,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  detail?: string
  tone?: StatTone
  className?: string
}) {
  return (
    <div
      className={cn(
        "surface-card flex flex-col justify-between gap-5 p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-surface/80",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-[0.625rem] font-bold tracking-[0.13em] text-ink-soft uppercase">
          {label}
        </p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            tones[tone]
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div>
        <p className="font-serif text-[2rem] leading-none tracking-[-0.035em] text-ink">
          {value}
        </p>
        {detail ? (
          <p className="mt-1.5 text-[0.6875rem] leading-5 text-ink-soft">{detail}</p>
        ) : null}
      </div>
    </div>
  )
}

export function DashPanel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  flush = false,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  flush?: boolean
}) {
  return (
    <section className={cn("surface-card overflow-hidden", className)}>
      <div className="flex flex-col gap-3 border-b border-sand/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h2 className="font-serif text-[1.55rem] leading-tight tracking-[-0.025em]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-ink-soft">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn(!flush && "p-5 sm:p-6", bodyClassName)}>{children}</div>
    </section>
  )
}

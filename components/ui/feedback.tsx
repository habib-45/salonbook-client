import * as React from "react"
import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      className={cn("size-5 animate-spin text-burgundy", className)}
      aria-hidden="true"
    />
  )
}

export function PageLoader({
  label = "Preparing your moment…",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn("flex min-h-[55vh] flex-col items-center justify-center gap-4", className)}
      role="status"
    >
      <span className="relative flex size-14 items-center justify-center rounded-full border border-sand bg-white/70">
        <span className="absolute inset-0 animate-spin-slow rounded-full border-t border-burgundy" />
        <span className="font-serif text-xl italic text-burgundy">S</span>
      </span>
      <p className="text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase">{label}</p>
    </div>
  )
}

export function InlineLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-soft" role="status">
      <Spinner className="size-4" />
      <span>{label}</span>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} aria-hidden="true" />
}

export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading services">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-sand/70 bg-white/50">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex items-center justify-between pt-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand-dark/80 bg-white/40 px-6 py-14 text-center",
        className
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-cream-deep text-burgundy">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-serif text-2xl tracking-[-0.02em]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-ink-soft">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function FormAlert({
  children,
  tone = "error",
}: {
  children: React.ReactNode
  tone?: "error" | "info" | "success"
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-3.5 py-3 text-sm leading-5",
        tone === "error" && "border-[#e9c9c8] bg-[#fff7f6] text-[#8b3337]",
        tone === "info" && "border-[#e6d8c4] bg-[#fffaf2] text-[#725b36]",
        tone === "success" && "border-[#cddbc7] bg-[#f7fbf4] text-[#3f5837]"
      )}
    >
      {children}
    </div>
  )
}

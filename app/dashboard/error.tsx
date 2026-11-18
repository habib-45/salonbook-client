"use client"

import * as React from "react"
import Link from "next/link"
import { CircleAlert, LayoutDashboard, RefreshCcw } from "lucide-react"
import { Button, ButtonLink } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("SalonBook dashboard encountered an unexpected error.", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-8">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#f7e4e4] text-[#9d3c43]">
          <CircleAlert className="size-6" />
        </span>
        <p className="eyebrow mt-5 justify-center before:hidden">Dashboard error</p>
        <h1 className="mt-2.5 font-serif text-[2.4rem] leading-tight tracking-[-0.035em]">
          We hit a small snag.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft">
          This section couldn&apos;t be loaded, but the rest of your dashboard is still
          here. Try again, or return to the overview.
        </p>
        {error.digest ? (
          <p className="mt-3 inline-flex rounded-full bg-cream-deep px-3 py-1 text-[0.625rem] text-ink-soft">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button onClick={reset}>
            <RefreshCcw className="size-4" />
            Try again
          </Button>
          <ButtonLink href="/dashboard" variant="outline">
            <LayoutDashboard className="size-4" />
            Dashboard overview
          </ButtonLink>
        </div>
        <p className="mt-5 text-[0.625rem] text-ink-soft/65">
          Still stuck?{" "}
          <Link href="/dashboard/profile" className="font-semibold text-burgundy hover:underline">
            Reset the demo data
          </Link>{" "}
          from your profile.
        </p>
      </div>
    </div>
  )
}

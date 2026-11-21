"use client"

import * as React from "react"
import { CircleAlert, Home, RefreshCcw } from "lucide-react"
import { Button, ButtonLink } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("SalonBook encountered an unexpected error.", error)
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-5 py-14 text-center">
      <Logo />
      <span className="mt-10 flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <CircleAlert className="size-6" />
      </span>
      <p className="eyebrow mt-6 justify-center before:hidden">Something interrupted us</p>
      <h1 className="mt-3 max-w-lg font-serif text-[2.8rem] leading-[1.02] tracking-[-0.04em]">
        A small pause in the salon.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft">
        Something unexpected happened while loading this page. Your saved appointments and
        profile are safe in your SalonBook account.
      </p>
      {error.digest ? (
        <p className="mt-3 rounded-full bg-cream-deep px-3 py-1 text-[0.625rem] text-ink-soft">
          Reference: {error.digest}
        </p>
      ) : null}
      <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
        <Button onClick={reset}>
          <RefreshCcw className="size-4" />
          Try again
        </Button>
        <ButtonLink href="/" variant="outline">
          <Home className="size-4" />
          Return home
        </ButtonLink>
      </div>
      <p className="mt-8 text-[0.625rem] leading-5 text-ink-soft/60">
        If this keeps happening, refresh the page or contact the salon for help.
      </p>
    </div>
  )
}

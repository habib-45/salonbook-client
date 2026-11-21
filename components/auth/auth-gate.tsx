"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Ban, LoaderCircle, LogOut, ShieldCheck } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Button, ButtonLink } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import type { Role } from "@/lib/types"

export function AuthGate({
  children,
  allow,
}: {
  children: React.ReactNode
  allow?: Role[]
}) {
  const { currentUser, isHydrated, isSigningOut, signOut } = useStore()
  const pathname = usePathname()
  const router = useRouter()
  const toast = useToast()
  const redirected = React.useRef(false)
  const roleBlocked = Boolean(currentUser && allow && !allow.includes(currentUser.role))

  React.useEffect(() => {
    if (!isHydrated || currentUser || isSigningOut || redirected.current) return
    redirected.current = true
    router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
  }, [currentUser, isHydrated, isSigningOut, pathname, router])

  React.useEffect(() => {
    if (!isHydrated || !roleBlocked || redirected.current) return
    redirected.current = true
    toast.error("That area is not available", "You have been taken to your own dashboard.")
    router.replace("/dashboard")
  }, [isHydrated, roleBlocked, router, toast])

  if (!isHydrated) {
    return <AuthLoading />
  }

  if (!currentUser) {
    return <AuthLoading label={isSigningOut ? "Signing you out…" : undefined} />
  }

  if (currentUser.isBlocked) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-cream px-5 text-center">
        <Logo />
        <div className="mt-10 flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <Ban className="size-6" />
        </div>
        <h1 className="mt-5 font-serif text-4xl tracking-[-0.03em]">Your access is paused</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft">
          This account has been blocked and can no longer access protected salon features.
          Please contact SalonBook at hello@salonbook.com if you believe this is a mistake.
        </p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <Button
            variant="primary"
            onClick={() => {
              signOut()
              router.replace("/signin")
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
          <ButtonLink href="/" variant="outline">
            Return home
          </ButtonLink>
        </div>
      </div>
    )
  }

  if (roleBlocked) {
    return <AuthLoading label="Taking you to your dashboard…" />
  }

  return <>{children}</>
}

function AuthLoading({ label = "Opening your salon…" }: { label?: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-cream px-5" role="status">
      <span className="relative flex size-14 items-center justify-center rounded-full border border-sand bg-surface/70">
        <span className="absolute inset-0 animate-spin-slow rounded-full border-t border-accent" />
        <span className="font-serif text-xl italic text-accent">S</span>
      </span>
      <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-ink-soft uppercase">
        <LoaderCircle className="size-3.5 animate-spin" />
        {label}
      </p>
    </div>
  )
}

export function RoleHint({ allow }: { allow: Role }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-deep px-2.5 py-1 text-[0.625rem] font-semibold text-ink-soft">
      <ShieldCheck className="size-3" />
      {allow === "admin" ? "Administrators only" : "Customers only"}
    </span>
  )
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { currentUser, isHydrated } = useStore()
  const router = useRouter()

  React.useEffect(() => {
    if (isHydrated && currentUser) {
      router.replace("/dashboard")
    }
  }, [currentUser, isHydrated, router])

  if (!isHydrated || currentUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="size-5 animate-spin text-accent" />
      </div>
    )
  }

  return <>{children}</>
}

export function AccountLink({ children }: { children: React.ReactNode }) {
  return <Link href="/dashboard">{children}</Link>
}

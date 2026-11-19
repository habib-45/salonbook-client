"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { DemoAccounts } from "@/components/auth/demo-accounts"
import { GoogleButton } from "@/components/auth/google-button"
import { Button } from "@/components/ui/button"
import { FormAlert } from "@/components/ui/feedback"
import { Field, Input } from "@/components/ui/form-field"
import { isValidEmail, safeCallbackUrl } from "@/lib/utils"

export function SignInForm() {
  const { signIn, signInWithGoogle, isHydrated } = useStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState("")
  const [fieldErrors, setFieldErrors] = React.useState<{ email?: string; password?: string }>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)

  const destination = safeCallbackUrl(searchParams.get("callbackUrl"))

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const nextErrors: typeof fieldErrors = {}
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address."
    if (!password) nextErrors.password = "Enter your password."
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    const result = await signIn({ email, password })

    if (!result.ok) {
      setError(result.error)
      toast.error("Could not sign in", result.error)
      setIsSubmitting(false)
      return
    }

    toast.success(`Welcome back, ${result.data.name.split(" ")[0]}`, "Your salon is ready for you.")
    router.replace(destination)
  }

  const handleGoogle = async () => {
    setError("")
    setGoogleLoading(true)
    const result = await signInWithGoogle()

    if (!result.ok) {
      setError(result.error)
      toast.error("Google sign-in failed", result.error)
      setGoogleLoading(false)
      return
    }

    toast.success("Signed in with Google", "Welcome back to SalonBook.")
    router.replace(destination)
  }

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-4">Welcome back</p>
        <h1 className="font-serif text-[2.9rem] leading-[0.98] tracking-[-0.04em] text-ink sm:text-[3.25rem]">
          Your chair is
          <br />
          <span className="italic text-burgundy">waiting.</span>
        </h1>
        <p className="mt-4 text-sm leading-6 text-ink-soft">
          Sign in to manage your appointments, payments, and profile.
        </p>
      </div>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Continue with Google" />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-sand" />
        <span className="text-[0.625rem] font-semibold tracking-[0.1em] text-ink-soft/70 uppercase">
          or with email
        </span>
        <span className="h-px flex-1 bg-sand" />
      </div>

      {error ? <div className="mb-4"><FormAlert>{error}</FormAlert></div> : null}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="Email address" htmlFor="signin-email" error={fieldErrors.email}>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
            <Input
              id="signin-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              className="pl-10"
              disabled={isSubmitting || googleLoading || !isHydrated}
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="signin-password" error={fieldErrors.password}>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
            <Input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              className="pr-11 pl-10"
              disabled={isSubmitting || googleLoading || !isHydrated}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft transition hover:bg-ink/5 hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <Button
          type="submit"
          size="lg"
          className="mt-1 w-full"
          loading={isSubmitting}
          disabled={googleLoading || !isHydrated}
        >
          Sign in to SalonBook
        </Button>
      </form>

      <DemoAccounts
        onSelect={(demoEmail, demoPassword) => {
          setEmail(demoEmail)
          setPassword(demoPassword)
          setFieldErrors({})
          setError("")
          toast.info("Demo credentials filled", "Press “Sign in to SalonBook” to continue.")
        }}
      />

      <p className="mt-5 text-center text-sm text-ink-soft">
        New to SalonBook?{" "}
        <Link
          href="/signup"
          className="font-semibold text-burgundy underline decoration-rose/50 underline-offset-4 transition hover:decoration-burgundy"
        >
          Create an account
        </Link>
      </p>

      <p className="mt-6 border-t border-sand/70 pt-5 text-center text-[0.625rem] leading-5 text-ink-soft/75">
        Passwords are hashed with bcrypt and your session is protected by a signed token.
        Google sign-in uses OAuth when configured.
      </p>
    </div>
  )
}

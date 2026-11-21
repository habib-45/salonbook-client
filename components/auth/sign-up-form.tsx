"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, Eye, EyeOff, LockKeyhole, Mail, UserRound, X } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { GoogleButton } from "@/components/auth/google-button"
import { Button } from "@/components/ui/button"
import { FormAlert } from "@/components/ui/feedback"
import { Field, Input } from "@/components/ui/form-field"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  isValidEmail,
  passwordChecks,
  safeCallbackUrl,
} from "@/lib/utils"

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  image?: string
}

export function SignUpForm() {
  const { signUp, signInWithGoogle, isHydrated } = useStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [image, setImage] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState("")
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)

  const destination = safeCallbackUrl(searchParams.get("callbackUrl"))
  const checks = passwordChecks(password)
  const passwordValid = Object.values(checks).every(Boolean)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const nextErrors: FormErrors = {}
    if (name.trim().length < 2) nextErrors.name = "Please enter your full name."
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address."
    if (!passwordValid) nextErrors.password = "Your password does not meet all the requirements."
    if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    const result = await signUp({ name, email, password, image })

    if (!result.ok) {
      setError(result.error)
      toast.error("Could not create your account", result.error)
      setIsSubmitting(false)
      return
    }

    toast.success(`Welcome to SalonBook, ${result.data.name.split(" ")[0]}`, "Your account is ready.")
    router.replace(destination)
  }

  const handleGoogle = async () => {
    setError("")
    setGoogleLoading(true)
    const result = await signInWithGoogle()

    if (!result.ok) {
      setError(result.error)
      toast.error("Google sign-up failed", result.error)
      setGoogleLoading(false)
      return
    }

    toast.success("Welcome to SalonBook", "Your Google account is connected.")
    router.replace(destination)
  }

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-4">Begin your ritual</p>
        <h1 className="font-serif text-[2.9rem] leading-[0.98] tracking-[-0.04em] text-ink sm:text-[3.25rem]">
          Make a little room
          <br />
          for <span className="italic text-accent">yourself.</span>
        </h1>
        <p className="mt-4 text-sm leading-6 text-ink-soft">
          Create your account to request appointments and keep every ritual in one place.
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
        <Field label="Full name" htmlFor="signup-name" error={errors.name}>
          <div className="relative">
            <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
            <Input
              id="signup-name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(errors.name)}
              className="pl-10"
              disabled={isSubmitting || googleLoading || !isHydrated}
            />
          </div>
        </Field>

        <Field label="Email address" htmlFor="signup-email" error={errors.email}>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.email)}
              className="pl-10"
              disabled={isSubmitting || googleLoading || !isHydrated}
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="signup-password" error={errors.password}>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
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
          <div className="grid gap-1.5 pt-1 sm:grid-cols-3">
            {[
              { label: "6+ characters", met: checks.length },
              { label: "One uppercase", met: checks.uppercase },
              { label: "One lowercase", met: checks.lowercase },
            ].map((rule) => (
              <span
                key={rule.label}
                className={`inline-flex items-center gap-1 text-[0.625rem] ${
                  rule.met ? "text-success" : "text-ink-soft/65"
                }`}
              >
                {rule.met ? <Check className="size-3" /> : <X className="size-3" />}
                {rule.label}
              </span>
            ))}
          </div>
        </Field>

        <Field
          label="Confirm password"
          htmlFor="signup-confirm"
          error={errors.confirmPassword}
        >
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
            <Input
              id="signup-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
              className="pl-10"
              disabled={isSubmitting || googleLoading || !isHydrated}
            />
          </div>
        </Field>

        <ImageUpload
          value={image}
          onChange={setImage}
          label="Profile image (optional)"
          hint="JPG, PNG, or WebP · small file"
          error={errors.image}
          aspect="square"
          disabled={isSubmitting || googleLoading}
        />

        <Button
          type="submit"
          size="lg"
          className="mt-1 w-full"
          loading={isSubmitting}
          disabled={googleLoading || !isHydrated}
        >
          Create my account
        </Button>
      </form>

      <p className="mt-4 text-[0.625rem] leading-5 text-ink-soft/70">
        By creating an account you agree to SalonBook&apos;s booking and cancellation terms.
        Admin access is invitation-only and cannot be created through this form.
      </p>

      <p className="mt-5 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-semibold text-accent underline decoration-rose/50 underline-offset-4 transition hover:decoration-accent"
        >
          Sign in
        </Link>
      </p>

      <p className="mt-5 border-t border-sand/70 pt-4 text-center text-[0.625rem] leading-5 text-ink-soft/75">
        Better Auth stores your credential hash in the SalonBook database, and your profile
        never lives in this browser.
      </p>
    </div>
  )
}

"use client"

import * as React from "react"
import {
  CalendarDays,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DashboardSkeleton, FormAlert } from "@/components/ui/feedback"
import { Field, Input } from "@/components/ui/form-field"
import { ImageUpload } from "@/components/ui/image-upload"
import { DashPanel, PageHeader } from "@/components/dashboard/ui"
import { formatDate } from "@/lib/utils"

export function ProfileView() {
  const {
    db,
    currentUser,
    updateProfile,
    resetDemoData,
    signOut,
  } = useStore()
  const toast = useToast()
  const router = useRouter()

  const [name, setName] = React.useState(currentUser?.name ?? "")
  const [phone, setPhone] = React.useState(currentUser?.phone ?? "")
  const [image, setImage] = React.useState(currentUser?.image ?? "")
  const [error, setError] = React.useState("")
  const [fieldError, setFieldError] = React.useState("")
  const [resetOpen, setResetOpen] = React.useState(false)
  const [signOutOpen, setSignOutOpen] = React.useState(false)

  if (!db || !currentUser) return <DashboardSkeleton />

  const dirty =
    name !== currentUser.name ||
    phone !== (currentUser.phone ?? "") ||
    image !== currentUser.image

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setFieldError("")

    if (name.trim().length < 2) {
      setFieldError("Please enter your full name.")
      return
    }

    const digits = phone.replace(/\D/g, "")
    if (phone.trim() && digits.length < 7) {
      setFieldError("Please enter a valid phone number, or leave it blank.")
      return
    }

    const result = updateProfile({ name, phone, image })
    if (!result.ok) {
      setError(result.error)
      toast.error("Could not save profile", result.error)
      return
    }

    setName(result.data.name)
    setPhone(result.data.phone ?? "")
    setImage(result.data.image)
    toast.success("Profile updated", "Your details have been saved in this browser.")
  }

  const handleReset = () => {
    resetDemoData()
    toast.info("Demo data restored", "You have been signed out. Sign back in to explore.")
    router.push("/signin")
  }

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="A profile that feels like you."
        description="Keep your contact details and photo up to date. Your email is used to sign in and cannot be changed in the demo."
      />

      <div className="mt-7 grid items-start gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="relative overflow-hidden rounded-[1.35rem] border border-burgundy-dark/25 bg-burgundy-dark p-5 text-cream shadow-[0_24px_60px_-40px_rgba(64,25,42,0.65)] sm:p-6">
          <div className="pointer-events-none absolute -top-20 -right-16 size-52 rounded-full bg-rose/20 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-52 rounded-full bg-gold/10 blur-[60px]" />

          <div className="relative flex items-center gap-4">
            <span className="rounded-full ring-2 ring-white/15 ring-offset-2 ring-offset-burgundy-dark">
              <Avatar src={image || currentUser.image} name={name || currentUser.name} size={64} />
            </span>
            <div className="min-w-0">
              <p className="text-[0.5625rem] font-bold tracking-[0.14em] text-cream/45 uppercase">
                {currentUser.role === "admin" ? "Salon administrator" : "Salon guest"}
              </p>
              <h2 className="mt-1 truncate font-serif text-[1.8rem] leading-tight tracking-[-0.025em]">
                {name || currentUser.name}
              </h2>
              <p className="mt-0.5 truncate text-xs text-cream/55">{currentUser.email}</p>
            </div>
          </div>

          <div className="relative mt-6 space-y-3 border-t border-white/10 pt-5 text-xs text-cream/65">
            <p className="flex items-center gap-2.5">
              <Mail className="size-3.5 shrink-0 text-rose" />
              <span className="truncate">{currentUser.email}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="size-3.5 shrink-0 text-rose" />
              {phone || "No phone number added"}
            </p>
            <p className="flex items-center gap-2.5">
              <CalendarDays className="size-3.5 shrink-0 text-rose" />
              Member since {formatDate(currentUser.createdAt.slice(0, 10))}
            </p>
            <p className="flex items-center gap-2.5">
              <ShieldCheck className="size-3.5 shrink-0 text-rose" />
              {currentUser.provider === "google" ? "Google-linked demo account" : "Email & password demo account"}
            </p>
          </div>

          <div className="relative mt-6 rounded-xl border border-white/10 bg-white/[0.06] p-3.5">
            <p className="flex items-center gap-1.5 text-[0.5625rem] font-bold tracking-[0.12em] text-gold uppercase">
              <Sparkles className="size-3" />
              Demo workspace
            </p>
            <p className="mt-1.5 text-[0.6875rem] leading-5 text-cream/50">
              Your profile and salon data are stored only in this browser. This build is
              ready to be connected to the real authentication API.
            </p>
          </div>

          <div className="relative mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setSignOutOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 text-xs font-semibold text-cream/70 transition hover:bg-white/10 hover:text-cream"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <DashPanel
            title="Personal details"
            description="This information appears on your appointments and payment receipts."
          >
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {error ? <FormAlert>{error}</FormAlert> : null}

              <ImageUpload
                value={image}
                onChange={setImage}
                label="Profile photo"
                hint="Square images work best"
                aspect="square"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" htmlFor="profile-name" error={fieldError}>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value)
                      setFieldError("")
                    }}
                    placeholder="Your full name"
                    autoComplete="name"
                    aria-invalid={Boolean(fieldError)}
                  />
                </Field>

                <Field label="Phone number" htmlFor="profile-phone" optional>
                  <Input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value)
                      setFieldError("")
                    }}
                    placeholder="+1 (555) 000-0000"
                    autoComplete="tel"
                  />
                </Field>
              </div>

              <Field
                label="Email address"
                htmlFor="profile-email"
                hint="Used for sign in"
              >
                <Input
                  id="profile-email"
                  type="email"
                  value={currentUser.email}
                  readOnly
                  disabled
                  className="cursor-not-allowed bg-cream-deep/40 opacity-80"
                />
              </Field>

              <div className="flex flex-col-reverse gap-2.5 border-t border-sand/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.625rem] leading-5 text-ink-soft">
                  {dirty ? "You have unsaved changes." : "Everything is up to date."}
                </p>
                <Button type="submit" disabled={!dirty}>
                  <UserRound className="size-4" />
                  Save changes
                </Button>
              </div>
            </form>
          </DashPanel>

          <DashPanel
            title="Security & demo data"
            description="Authentication and payments are simulated in this front-end build."
          >
            <div className="space-y-3">
              <div className="flex flex-col gap-3 rounded-xl border border-sand/80 bg-white/45 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cream-deep text-burgundy">
                    <KeyRound className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">Password</p>
                    <p className="mt-1 text-[0.6875rem] leading-5 text-ink-soft">
                      Password changes arrive with the real auth integration.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-cream-deep px-2.5 py-1 text-[0.5625rem] font-bold tracking-[0.08em] text-ink-soft uppercase">
                  Demo only
                </span>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-[#e8c7c9] bg-[#fdf7f7] p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f7e4e4] text-[#9d3c43]">
                    <RefreshCcw className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">Reset sample data</p>
                    <p className="mt-1 text-[0.6875rem] leading-5 text-ink-soft">
                      Restores the original demo services, appointments, and accounts. You
                      will be signed out.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-[#e2c4c4] text-[#9d3c43] hover:bg-[#fff1f1]"
                  onClick={() => setResetOpen(true)}
                >
                  Reset demo
                </Button>
              </div>
            </div>
          </DashPanel>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset all demo data?"
        description="Every service, appointment, payment, profile change, and account created in this browser will be replaced with the original sample data."
        confirmLabel="Reset and sign out"
        cancelLabel="Keep my data"
        tone="danger"
        onConfirm={handleReset}
      />

      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out of SalonBook?"
        description="Your demo data will stay saved in this browser. You can sign back in at any time."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        onConfirm={() => {
          signOut()
          toast.success("Signed out", "Come back soon for another little ritual.")
          router.push("/")
        }}
      />
    </>
  )
}

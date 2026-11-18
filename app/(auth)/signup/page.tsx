import type { Metadata } from "next"
import { Suspense } from "react"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { PageLoader } from "@/components/ui/feedback"

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create your free SalonBook account to request appointments and manage your beauty rituals.",
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<PageLoader label="Preparing your welcome…" />}>
      <SignUpForm />
    </Suspense>
  )
}

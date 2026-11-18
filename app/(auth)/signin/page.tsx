import type { Metadata } from "next"
import { Suspense } from "react"
import { SignInForm } from "@/components/auth/sign-in-form"
import { PageLoader } from "@/components/ui/feedback"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your SalonBook account to manage appointments and payments.",
}

export default function SignInPage() {
  return (
    <Suspense fallback={<PageLoader label="Opening the salon…" />}>
      <SignInForm />
    </Suspense>
  )
}

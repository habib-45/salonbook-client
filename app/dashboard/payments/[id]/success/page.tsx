import type { Metadata } from "next"
import { AuthGate } from "@/components/auth/auth-gate"
import { PaymentSuccess } from "@/components/dashboard/payment-success"

export const metadata: Metadata = {
  title: "Payment receipt",
  description: "Your SalonBook payment receipt and appointment details.",
}

export default function PaymentSuccessPage() {
  return (
    <AuthGate allow={["customer"]}>
      <PaymentSuccess />
    </AuthGate>
  )
}

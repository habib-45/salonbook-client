import type { Metadata } from "next"
import { AuthGate } from "@/components/auth/auth-gate"
import { PaymentCheckout } from "@/components/dashboard/payment-checkout"

export const metadata: Metadata = {
  title: "Secure checkout",
  description: "Complete payment for your confirmed SalonBook appointment.",
}

export default function PaymentCheckoutPage() {
  return (
    <AuthGate allow={["customer"]}>
      <PaymentCheckout />
    </AuthGate>
  )
}

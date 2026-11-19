import type { Metadata } from "next"
import { AuthGate } from "@/components/auth/auth-gate"
import { PaymentCancelled } from "@/components/dashboard/payment-cancelled"

export const metadata: Metadata = {
  title: "Checkout cancelled",
  description: "Your SalonBook checkout was closed without taking payment.",
}

export default function PaymentCancelledPage() {
  return (
    <AuthGate allow={["customer"]}>
      <PaymentCancelled />
    </AuthGate>
  )
}

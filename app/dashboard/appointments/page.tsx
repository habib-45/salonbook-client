import type { Metadata } from "next"
import { AuthGate } from "@/components/auth/auth-gate"
import { CustomerAppointments } from "@/components/dashboard/customer-appointments"

export const metadata: Metadata = {
  title: "My appointments",
  description:
    "View, cancel, and pay for your SalonBook appointments in one place.",
}

export default function AppointmentsPage() {
  return (
    <AuthGate allow={["customer"]}>
      <CustomerAppointments />
    </AuthGate>
  )
}

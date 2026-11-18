import type { Metadata } from "next"
import { AuthGate } from "@/components/auth/auth-gate"
import { AdminAppointments } from "@/components/dashboard/admin-appointments"

export const metadata: Metadata = {
  title: "Appointment management",
  description:
    "Confirm, cancel, and review every SalonBook appointment request from the admin dashboard.",
}

export default function AdminAppointmentsPage() {
  return (
    <AuthGate allow={["admin"]}>
      <AdminAppointments />
    </AuthGate>
  )
}

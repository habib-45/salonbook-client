import type { Metadata } from "next"
import { AuthGate } from "@/components/auth/auth-gate"
import { AdminServices } from "@/components/dashboard/admin-services"

export const metadata: Metadata = {
  title: "Service management",
  description:
    "Add, edit, pause, and remove SalonBook services from the admin dashboard.",
}

export default function AdminServicesPage() {
  return (
    <AuthGate allow={["admin"]}>
      <AdminServices />
    </AuthGate>
  )
}

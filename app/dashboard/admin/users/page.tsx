import type { Metadata } from "next"
import { AuthGate } from "@/components/auth/auth-gate"
import { AdminUsers } from "@/components/dashboard/admin-users"

export const metadata: Metadata = {
  title: "Customers",
  description:
    "Search SalonBook customers, review their history, and manage account access.",
}

export default function AdminUsersPage() {
  return (
    <AuthGate allow={["admin"]}>
      <AdminUsers />
    </AuthGate>
  )
}

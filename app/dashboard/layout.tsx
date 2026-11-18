import type { Metadata } from "next"
import { AuthGate } from "@/components/auth/auth-gate"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your SalonBook appointments, profile, and payments.",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <DashboardShell>{children}</DashboardShell>
    </AuthGate>
  )
}

import type { Metadata } from "next"
import { AuthGate } from "@/components/auth/auth-gate"
import { AdminTransactions } from "@/components/dashboard/admin-transactions"

export const metadata: Metadata = {
  title: "Transactions",
  description:
    "Review SalonBook payment records and export transaction reports from the admin dashboard.",
}

export default function AdminTransactionsPage() {
  return (
    <AuthGate allow={["admin"]}>
      <AdminTransactions />
    </AuthGate>
  )
}

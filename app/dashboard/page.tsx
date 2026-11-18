import type { Metadata } from "next"
import { DashboardHome } from "@/components/dashboard/dashboard-home"

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your SalonBook overview: upcoming appointments, pending requests, payments, and salon activity.",
}

export default function DashboardPage() {
  return <DashboardHome />
}

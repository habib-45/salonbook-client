"use client"

import { useStore } from "@/components/providers/store-provider"
import { AdminOverview } from "@/components/dashboard/admin-overview"
import { CustomerOverview } from "@/components/dashboard/customer-overview"
import { DashboardSkeleton } from "@/components/ui/feedback"

export function DashboardHome() {
  const { currentUser, isHydrated } = useStore()

  if (!isHydrated) return <DashboardSkeleton />
  if (!currentUser) return <DashboardSkeleton />

  return currentUser.role === "admin" ? <AdminOverview /> : <CustomerOverview />
}

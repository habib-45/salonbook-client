"use client"

import { StoreProvider } from "@/components/providers/store-provider"
import { ToastProvider } from "@/components/providers/toast-provider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <StoreProvider>{children}</StoreProvider>
    </ToastProvider>
  )
}

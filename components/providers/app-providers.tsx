"use client"

import { StoreProvider } from "@/components/providers/store-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ToastProvider } from "@/components/providers/toast-provider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <StoreProvider>{children}</StoreProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

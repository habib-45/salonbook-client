"use client"

import * as React from "react"
import { CircleAlert, CircleCheck, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastVariant = "success" | "error" | "info"

interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastApi {
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastApi | null>(null)

const icons = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
}

const styles = {
  success: "border-[#cddbc7] bg-[#f7fbf4] text-[#3f5837]",
  error: "border-[#e9c9c8] bg-[#fff7f6] text-[#8b3337]",
  info: "border-[#e6d8c4] bg-[#fffaf2] text-[#725b36]",
}

const iconStyles = {
  success: "bg-[#e3eedd] text-[#54784a]",
  error: "bg-[#f5dedd] text-[#a24043]",
  info: "bg-[#f3e7d6] text-[#9b7132]",
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const timers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = React.useCallback(
    (variant: ToastVariant, title: string, description?: string) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`

      setToasts((current) => [...current.slice(-3), { id, title, description, variant }])
      const timer = setTimeout(() => dismiss(id), 4800)
      timers.current.set(id, timer)
    },
    [dismiss]
  )

  const api = React.useMemo<ToastApi>(
    () => ({
      success: (title, description) => push("success", title, description),
      error: (title, description) => push("error", title, description),
      info: (title, description) => push("info", title, description),
      dismiss,
    }),
    [dismiss, push]
  )

  React.useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed top-4 right-3 z-[120] flex w-[calc(100%-1.5rem)] max-w-sm flex-col gap-2.5 sm:top-5 sm:right-5"
      >
        {toasts.map((toast) => {
          const Icon = icons[toast.variant]
          return (
            <div
              key={toast.id}
              className={cn(
                "animate-toast-in pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-[0_18px_50px_-20px_rgba(47,35,28,0.45)] backdrop-blur",
                styles[toast.variant]
              )}
              role="status"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                  iconStyles[toast.variant]
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold tracking-[-0.01em]">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-xs leading-5 opacity-80">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="mt-0.5 rounded-full p-1 opacity-50 transition hover:bg-black/5 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider")
  }
  return context
}

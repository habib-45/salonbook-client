"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  eyebrow?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: keyof typeof sizes
  className?: string
  bodyClassName?: string
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  eyebrow,
  children,
  footer,
  size = "md",
  className,
  bodyClassName,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()
  const descriptionId = React.useId()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const previousActive = document.activeElement as HTMLElement | null
    document.body.style.overflow = "hidden"

    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 20)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onOpenChange(false)
        return
      }

      if (event.key !== "Tab" || !panelRef.current) return

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.offsetParent !== null)

      if (focusable.length === 0) {
        event.preventDefault()
        panelRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
      previousActive?.focus?.()
    }
  }, [open, onOpenChange])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false)
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "animate-fade-up max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-white/70 bg-cream shadow-[0_30px_120px_-30px_rgba(33,24,19,0.65)] outline-none sm:rounded-3xl",
          sizes[size],
          className
        )}
      >
        <div className="flex items-start justify-between gap-5 border-b border-sand/80 px-5 py-5 sm:px-6">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="mb-1.5 text-[0.625rem] font-bold tracking-[0.16em] text-burgundy uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h2 id={titleId} className="font-serif text-[1.65rem] leading-tight tracking-[-0.025em]">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1.5 text-sm leading-5 text-ink-soft">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-sand/80 bg-white/60 text-ink-soft transition hover:bg-white hover:text-ink focus-visible:ring-2 focus-visible:ring-rose focus-visible:outline-none"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className={cn("px-5 py-5 sm:px-6", bodyClassName)}>{children}</div>
        {footer ? (
          <div className="flex flex-col-reverse gap-2.5 border-t border-sand/80 bg-white/35 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  )
}

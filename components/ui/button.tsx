import * as React from "react"
import Link from "next/link"
import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "light" | "destructive"
type ButtonSize = "sm" | "md" | "lg" | "icon"

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[-0.01em] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50 active:translate-y-px"

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-burgundy text-paper shadow-[0_10px_24px_-14px_rgba(64,25,42,0.7)] hover:bg-burgundy-dark hover:shadow-[0_14px_28px_-14px_rgba(64,25,42,0.55)]",
  secondary:
    "bg-cream-deep text-ink hover:bg-sand border border-sand/70",
  outline:
    "border border-ink/20 bg-transparent text-ink hover:border-ink/45 hover:bg-surface/60",
  ghost: "text-ink-soft hover:bg-ink/5 hover:text-ink",
  light:
    "bg-paper text-burgundy shadow-[0_10px_24px_-16px_rgba(0,0,0,0.55)] hover:bg-white",
  destructive:
    "bg-danger-solid text-white hover:bg-danger-solid-hover shadow-[0_10px_24px_-14px_rgba(132,49,56,0.7)]",
}

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
  icon: "size-10 p-0",
}

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn(base, variants[variant], sizes[size], className)
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={buttonStyles({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonLinkProps) {
  return <Link className={buttonStyles({ variant, size, className })} {...props} />
}

export { base as buttonBase }

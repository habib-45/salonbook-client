import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FieldProps {
  label: string
  htmlFor: string
  children: React.ReactNode
  hint?: string
  error?: string
  optional?: boolean
  className?: string
}

export function Field({
  label,
  htmlFor,
  children,
  hint,
  error,
  optional,
  className,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-xs font-semibold text-ink">
          {label}
          {optional ? <span className="ml-1.5 font-normal text-ink-soft">(optional)</span> : null}
        </label>
        {hint ? <span className="text-[0.6875rem] text-ink-soft">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="text-xs leading-5 text-[#9d3c43]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("input-field", className)} {...props} />
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("textarea-field", className)} {...props} />
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn("input-field appearance-none pr-9", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-soft"
        aria-hidden="true"
      />
    </div>
  )
}

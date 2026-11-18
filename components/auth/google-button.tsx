"use client"

import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GoogleIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.05v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.9a6 6 0 0 1 0-3.8V7.51H3.05a10 10 0 0 0 0 8.98L6.4 13.9Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.97c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.95 5.51L6.4 10.1c.79-2.37 3-4.13 5.6-4.13Z"
      />
    </svg>
  )
}

export function GoogleButton({
  onClick,
  loading,
  label,
}: {
  onClick: () => void
  loading: boolean
  label: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full bg-white/55 text-sm"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : <GoogleIcon />}
      {label}
    </Button>
  )
}

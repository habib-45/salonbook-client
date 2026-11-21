"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"

export function ThemeToggle({
  className,
  size = "md",
}: {
  className?: string
  size?: "sm" | "md"
}) {
  const { toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      title="Toggle light and dark theme"
      className={cn(
        "group relative flex shrink-0 items-center justify-center rounded-full border border-sand/90 bg-surface/55 text-ink-soft transition-colors hover:border-sand-dark hover:text-ink",
        size === "md" ? "size-10" : "size-9",
        className
      )}
    >
      <Sun
        className={cn(
          "hidden transition-transform duration-300 group-hover:rotate-45 dark:block",
          size === "md" ? "size-[1.05rem]" : "size-4"
        )}
        aria-hidden="true"
      />
      <Moon
        className={cn(
          "transition-transform duration-300 group-hover:-rotate-12 dark:hidden",
          size === "md" ? "size-[1.05rem]" : "size-4"
        )}
        aria-hidden="true"
      />
    </button>
  )
}

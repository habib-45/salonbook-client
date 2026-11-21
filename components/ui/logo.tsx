import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "dark" | "light"
  className?: string
  href?: string
}

export function Logo({ variant = "dark", className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="SalonBook home"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose",
        className
      )}
    >
      <span
        className={cn(
          "relative flex size-10 items-center justify-center rounded-full border transition-transform duration-300 group-hover:-rotate-6",
          variant === "dark"
            ? "border-accent/10 bg-burgundy text-paper"
            : "border-white/15 bg-paper text-burgundy"
        )}
      >
        <span className="font-serif text-[1.45rem] leading-none italic">S</span>
        <span
          className={cn(
            "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2",
            variant === "dark" ? "bg-gold ring-cream" : "bg-gold ring-burgundy-dark"
          )}
        />
      </span>
      <span
        className={cn(
          "font-serif text-[1.65rem] leading-none tracking-[-0.035em]",
          variant === "dark" ? "text-ink" : "text-paper"
        )}
      >
        Salon<span className="italic">Book</span>
      </span>
    </Link>
  )
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex size-10 items-center justify-center rounded-full bg-burgundy text-paper",
        className
      )}
    >
      <span className="font-serif text-[1.45rem] leading-none italic">S</span>
      <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-gold ring-2 ring-cream" />
    </span>
  )
}

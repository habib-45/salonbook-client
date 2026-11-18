import Image from "next/image"
import { cn, getInitials } from "@/lib/utils"

interface AvatarProps {
  src?: string
  name: string
  size?: number
  className?: string
}

export function Avatar({ src, name, size = 40, className }: AvatarProps) {
  if (!src) {
    return (
      <span
        aria-label={name}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-cream-deep font-semibold text-burgundy",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.32 }}
      >
        {getInitials(name)}
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      unoptimized={src.startsWith("data:")}
      className={cn("shrink-0 rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  )
}

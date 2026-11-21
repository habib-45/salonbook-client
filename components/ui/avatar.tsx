"use client"

import * as React from "react"
import Image from "next/image"
import { cn, getInitials } from "@/lib/utils"

interface AvatarProps {
  src?: string
  name: string
  size?: number
  className?: string
}

export function Avatar({ src, name, size = 40, className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null)
  const hasImage = Boolean(src) && failedSrc !== src

  if (!hasImage) {
    return (
      <span
        aria-label={name}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-cream-deep font-semibold text-accent",
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
      src={src as string}
      alt={name}
      width={size}
      height={size}
      // Remote profile images can come from Cloudinary, ImgBB, Google, or a
      // data URL. Loading them directly avoids host configuration failures and
      // keeps the avatar working when the image service is unavailable.
      unoptimized
      onError={() => setFailedSrc(src ?? null)}
      className={cn("shrink-0 rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  )
}

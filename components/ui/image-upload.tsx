"use client"

import * as React from "react"
import { ImagePlus, Trash2, Upload, LoaderCircle } from "lucide-react"
import { useToast } from "@/components/providers/toast-provider"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  label?: string
  hint?: string
  error?: string
  className?: string
  aspect?: "square" | "landscape"
  disabled?: boolean
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Could not read that image."))
    reader.readAsDataURL(file)
  })
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("That image could not be processed."))
    image.src = source
  })
}

async function optimizeImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a JPG, PNG, or WebP image.")
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Please choose an image smaller than 5 MB.")
  }

  const source = await readFile(file)
  const image = await loadImage(source)
  const maxDimension = 1400
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)
  const context = canvas.getContext("2d")

  if (!context) return source

  context.fillStyle = "#faf5ef"
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL("image/jpeg", 0.84)
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  hint = "JPG, PNG, or WebP · up to 5 MB",
  error,
  className,
  aspect = "landscape",
  disabled,
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const toast = useToast()

  const processFile = async (file: File | undefined) => {
    if (!file) return
    setIsProcessing(true)
    try {
      const optimized = await optimizeImage(file)
      onChange(optimized)
      toast.success("Image ready", "Your photo has been added.")
    } catch (uploadError) {
      toast.error(
        "Could not add image",
        uploadError instanceof Error ? uploadError.message : "Please try another image."
      )
    } finally {
      setIsProcessing(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-semibold text-ink">{label}</span>
          <span className="text-[0.6875rem] text-ink-soft">{hint}</span>
        </div>
      ) : null}

      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-dashed transition",
          aspect === "square" ? "aspect-square max-w-[220px]" : "aspect-[16/9]",
          isDragging
            ? "border-accent bg-rose-light/40"
            : error
              ? "border-danger-solid bg-danger-soft"
              : "border-sand-dark bg-surface/45 hover:border-accent/45 hover:bg-surface/70"
        )}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          if (!disabled) void processFile(event.dataTransfer.files[0])
        }}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Selected upload preview"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-ink/60 via-transparent to-transparent p-3 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || isProcessing}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface/90 px-3 text-xs font-semibold text-ink shadow-sm backdrop-blur transition hover:bg-surface"
              >
                <Upload className="size-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={disabled}
                className="inline-flex size-8 items-center justify-center rounded-full bg-surface/90 text-danger shadow-sm backdrop-blur transition hover:bg-surface"
                aria-label="Remove image"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isProcessing}
            className="flex size-full flex-col items-center justify-center gap-2.5 px-5 text-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-cream-deep text-accent transition group-hover:bg-rose-light">
              {isProcessing ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <ImagePlus className="size-5" aria-hidden="true" />
              )}
            </span>
            <span className="text-sm font-semibold text-ink">
              {isProcessing ? "Preparing image…" : "Upload a photo"}
            </span>
            <span className="max-w-[240px] text-xs leading-5 text-ink-soft">
              Click to browse or drag and drop your image here.
            </span>
          </button>
        )}

        {isProcessing && value ? (
          <span className="absolute inset-0 flex items-center justify-center bg-cream/70 backdrop-blur-sm">
            <LoaderCircle className="size-6 animate-spin text-accent" />
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs leading-5 text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => void processFile(event.target.files?.[0])}
        disabled={disabled}
      />
    </div>
  )
}

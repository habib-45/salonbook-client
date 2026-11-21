"use client"

import * as React from "react"
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FormAlert } from "@/components/ui/feedback"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const ACCEPT_ATTRIBUTE = "image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"

function validateImage(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return "Choose a JPG, PNG, or WebP image."
  }
  if (file.size === 0) {
    return "That image is empty. Please choose another file."
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Choose an image that is 5 MB or smaller."
  }
  return ""
}

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("That image could not be read. Please choose another file."))
    reader.readAsDataURL(file)
  })
}

export function AdminProfilePhoto({ user }: { user: User }) {
  const { updateProfilePhoto } = useStore()
  const toast = useToast()
  const galleryInputRef = React.useRef<HTMLInputElement>(null)
  const cameraInputRef = React.useRef<HTMLInputElement>(null)

  const [preview, setPreview] = React.useState("")
  const [fileName, setFileName] = React.useState("")
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const [isReading, setIsReading] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isRemoving, setIsRemoving] = React.useState(false)
  const [removeOpen, setRemoveOpen] = React.useState(false)

  const busy = isReading || isUploading || isRemoving
  const displayedImage = preview || user.image

  const resetFileInputs = () => {
    if (galleryInputRef.current) galleryInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const selectFile = async (file: File | undefined) => {
    if (!file) return

    setError("")
    setSuccess("")

    const validationError = validateImage(file)
    if (validationError) {
      resetFileInputs()
      setError(validationError)
      toast.error("Photo not selected", validationError)
      return
    }

    setIsReading(true)
    try {
      const dataUrl = await readImage(file)
      setPreview(dataUrl)
      setFileName(file.name)
    } catch (readError) {
      setError(
        readError instanceof Error
          ? readError.message
          : "That image could not be read. Please choose another file."
      )
    } finally {
      setIsReading(false)
      resetFileInputs()
    }
  }

  const cancelPreview = () => {
    if (isUploading) return
    setPreview("")
    setFileName("")
    setError("")
    setSuccess("")
  }

  const uploadPreview = async () => {
    if (!preview || busy) return

    setError("")
    setSuccess("")
    setIsUploading(true)
    const result = await updateProfilePhoto(preview)
    setIsUploading(false)

    if (!result.ok) {
      setError(result.error)
      toast.error("Could not update photo", result.error)
      return
    }

    setPreview("")
    setFileName("")
    setSuccess("Profile photo updated and saved to your account.")
    toast.success("Profile photo updated", "Your new photo is now visible across your dashboard.")
  }

  const removePhoto = async () => {
    if (busy) return

    setError("")
    setSuccess("")
    setIsRemoving(true)
    const result = await updateProfilePhoto("")
    setIsRemoving(false)
    setRemoveOpen(false)

    if (!result.ok) {
      setError(result.error)
      toast.error("Could not remove photo", result.error)
      return
    }

    setPreview("")
    setFileName("")
    setSuccess("Profile photo removed. Your initials are shown instead.")
    toast.success("Profile photo removed", "Your initials now appear on your account.")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <span
            className={cn(
              "block rounded-full ring-2 ring-sand ring-offset-2 ring-offset-cream",
              preview && "ring-accent"
            )}
          >
            <Avatar src={displayedImage} name={user.name} size={96} />
          </span>
          {busy ? (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-cream/75 backdrop-blur-[1px]">
              <LoaderCircle className="size-6 animate-spin text-accent" aria-hidden="true" />
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-cream-deep px-2.5 py-1 text-[0.5625rem] font-bold tracking-[0.1em] text-ink-soft uppercase">
            {preview ? "Preview ready" : user.image ? "Profile photo" : "Initials fallback"}
          </p>
          <p className="mt-2 truncate font-serif text-2xl tracking-[-0.02em]">{user.name}</p>
          <p className="truncate text-xs text-ink-soft">{user.email}</p>
          <p className="mt-1.5 text-[0.6875rem] leading-5 text-ink-soft">
            JPG, JPEG, PNG, or WebP · Maximum 5 MB. Choose a file, or take a photo on
            mobile.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              size="sm"
              onClick={() => galleryInputRef.current?.click()}
              disabled={busy}
            >
              <ImagePlus className="size-4" aria-hidden="true" />
              Change Profile Photo
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              disabled={busy}
            >
              <Camera className="size-4" aria-hidden="true" />
              Take Photo
            </Button>
          </div>
        </div>
      </div>

      {preview ? (
        <div className="rounded-2xl border border-accent/25 bg-rose-light/20 p-3.5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-cream text-accent">
              <Upload className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">Photo selected</p>
              <p className="mt-0.5 truncate text-[0.6875rem] text-ink-soft" title={fileName}>
                {fileName || "Your selected image"} is ready to upload.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="sm"
              onClick={() => void uploadPreview()}
              loading={isUploading}
              disabled={busy}
              className="sm:flex-1"
            >
              <Upload className="size-3.5" aria-hidden="true" />
              Upload photo
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={cancelPreview}
              disabled={busy}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : user.image ? (
        <button
          type="button"
          onClick={() => setRemoveOpen(true)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-[0.6875rem] font-semibold text-danger transition hover:text-danger-solid disabled:opacity-50"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Remove profile photo
        </button>
      ) : null}

      {error ? <FormAlert>{error}</FormAlert> : null}
      {success ? (
        <FormAlert tone="success">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            {success}
          </span>
        </FormAlert>
      ) : null}

      <p className="text-[0.625rem] leading-5 text-ink-soft" aria-live="polite">
        Only the secure Cloudinary image URL is saved to MongoDB — never the image
        binary.
      </p>

      <input
        ref={galleryInputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="sr-only"
        onChange={(event) => void selectFile(event.target.files?.[0])}
        disabled={busy}
        aria-label="Choose a profile photo from your device"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        capture="user"
        className="sr-only"
        onChange={(event) => void selectFile(event.target.files?.[0])}
        disabled={busy}
        aria-label="Take a profile photo with your camera"
      />

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title="Remove your profile photo?"
        description="Your current photo will be removed from your profile and your initials will be shown instead. You can upload a new photo at any time."
        confirmLabel="Remove photo"
        cancelLabel="Keep photo"
        tone="danger"
        loading={isRemoving}
        onConfirm={() => void removePhoto()}
      />
    </div>
  )
}

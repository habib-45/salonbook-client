"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Button } from "@/components/ui/button"
import { FormAlert } from "@/components/ui/feedback"
import { Field, Input, Select, Textarea } from "@/components/ui/form-field"
import { ImageUpload } from "@/components/ui/image-upload"
import { Modal } from "@/components/ui/modal"
import { SERVICE_CATEGORIES } from "@/lib/constants"
import type { Service, ServiceStatus } from "@/lib/types"

export function ServiceFormModal({
  service,
  onClose,
}: {
  service?: Service
  onClose: () => void
}) {
  const { addService, updateService } = useStore()
  const toast = useToast()

  const [serviceName, setServiceName] = React.useState(service?.serviceName ?? "")
  const [category, setCategory] = React.useState(service?.category ?? SERVICE_CATEGORIES[0])
  const [description, setDescription] = React.useState(service?.description ?? "")
  const [price, setPrice] = React.useState(service ? String(service.price) : "")
  const [duration, setDuration] = React.useState(
    service ? String(service.duration) : ""
  )
  const [image, setImage] = React.useState(service?.image ?? "")
  const [status, setStatus] = React.useState<ServiceStatus>(service?.status ?? "active")
  const [error, setError] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const nextErrors: Record<string, string> = {}
    if (serviceName.trim().length < 2) nextErrors.serviceName = "Enter a service name."
    if (description.trim().length < 10) {
      nextErrors.description = "Add a short description of at least 10 characters."
    }
    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      nextErrors.price = "Enter a price greater than zero."
    }
    if (!Number.isFinite(Number(duration)) || Number(duration) <= 0) {
      nextErrors.duration = "Enter a duration greater than zero."
    }
    if (!image) nextErrors.image = "Upload a service image."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const input = {
      serviceName: serviceName.trim(),
      category,
      description: description.trim(),
      price: Number(price),
      duration: Number(duration),
      image,
      status,
    }

    const result = service ? updateService(service.id, input) : addService(input)
    if (!result.ok) {
      setError(result.error)
      toast.error(
        service ? "Could not update service" : "Could not add service",
        result.error
      )
      return
    }

    toast.success(
      service ? "Service updated" : "Service added",
      `${input.serviceName} is now ${status === "active" ? "live on the menu" : "paused"}.`
    )
    onClose()
  }

  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={service ? "Edit service" : "Add a new service"}
      description={
        service
          ? "Refine the details guests see on the salon menu."
          : "Create a ritual for the menu. You can pause it at any time."
      }
      eyebrow="Salon menu"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="service-form">
            <Sparkles className="size-4" />
            {service ? "Save changes" : "Add service"}
          </Button>
        </>
      }
    >
      <form id="service-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        {error ? <FormAlert>{error}</FormAlert> : null}

        <ImageUpload
          value={image}
          onChange={(value) => {
            setImage(value)
            setErrors((current) => ({ ...current, image: "" }))
          }}
          label="Service image"
          hint="JPG, PNG, or WebP · up to 5 MB"
          error={errors.image}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Service name"
            htmlFor="service-name"
            error={errors.serviceName}
            className="sm:col-span-2"
          >
            <Input
              id="service-name"
              value={serviceName}
              onChange={(event) => {
                setServiceName(event.target.value)
                setErrors((current) => ({ ...current, serviceName: "" }))
              }}
              placeholder="e.g. Signature Cut & Style"
              maxLength={80}
              aria-invalid={Boolean(errors.serviceName)}
            />
          </Field>

          <Field label="Category" htmlFor="service-category">
            <Select
              id="service-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {SERVICE_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Availability" htmlFor="service-status">
            <Select
              id="service-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as ServiceStatus)}
            >
              <option value="active">Active — visible & bookable</option>
              <option value="inactive">Inactive — paused</option>
            </Select>
          </Field>

          <Field label="Price (USD)" htmlFor="service-price" error={errors.price}>
            <Input
              id="service-price"
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              value={price}
              onChange={(event) => {
                setPrice(event.target.value)
                setErrors((current) => ({ ...current, price: "" }))
              }}
              placeholder="65"
              aria-invalid={Boolean(errors.price)}
            />
          </Field>

          <Field
            label="Duration (minutes)"
            htmlFor="service-duration"
            error={errors.duration}
          >
            <Input
              id="service-duration"
              type="number"
              inputMode="numeric"
              min="5"
              step="5"
              value={duration}
              onChange={(event) => {
                setDuration(event.target.value)
                setErrors((current) => ({ ...current, duration: "" }))
              }}
              placeholder="60"
              aria-invalid={Boolean(errors.duration)}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="service-description"
            error={errors.description}
            hint={`${description.length}/500`}
            className="sm:col-span-2"
          >
            <Textarea
              id="service-description"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                setErrors((current) => ({ ...current, description: "" }))
              }}
              maxLength={500}
              placeholder="Describe the experience, the finish, and what makes this ritual special…"
              className="min-h-[112px]"
              aria-invalid={Boolean(errors.description)}
            />
          </Field>
        </div>
      </form>
    </Modal>
  )
}

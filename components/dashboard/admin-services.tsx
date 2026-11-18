"use client"

import * as React from "react"
import Image from "next/image"
import {
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Scissors,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Button, ButtonLink } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DashboardSkeleton, EmptyState } from "@/components/ui/feedback"
import { Select } from "@/components/ui/form-field"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader, StatCard } from "@/components/dashboard/ui"
import { ServiceFormModal } from "@/components/dashboard/service-form-modal"
import { SERVICE_CATEGORIES } from "@/lib/constants"
import { getServiceAppointmentCount } from "@/lib/selectors"
import type { Service, ServiceStatus } from "@/lib/types"
import {
  cn,
  formatCurrency,
  formatDuration,
  sortByNewest,
} from "@/lib/utils"

export function AdminServices() {
  const { db, deleteService, setServiceStatus } = useStore()
  const toast = useToast()

  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState("All categories")
  const [status, setStatus] = React.useState<"all" | ServiceStatus>("all")
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Service | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Service | null>(null)
  const [statusTarget, setStatusTarget] = React.useState<Service | null>(null)

  if (!db) return <DashboardSkeleton />

  const services = sortByNewest(db.services)
  const activeCount = services.filter((service) => service.status === "active").length
  const appointmentLinks = db.appointments.length
  const pausedCount = services.length - activeCount
  const term = query.trim().toLowerCase()

  const filtered = services.filter((service) => {
    const matchesTerm =
      !term ||
      service.serviceName.toLowerCase().includes(term) ||
      service.category.toLowerCase().includes(term) ||
      service.description.toLowerCase().includes(term)
    const matchesCategory =
      category === "All categories" || service.category === category
    const matchesStatus = status === "all" || service.status === status
    return matchesTerm && matchesCategory && matchesStatus
  })

  const hasFilters = Boolean(term) || category !== "All categories" || status !== "all"

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (service: Service) => {
    setEditing(service)
    setFormOpen(true)
  }

  const clearFilters = () => {
    setQuery("")
    setCategory("All categories")
    setStatus("all")
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    const result = deleteService(deleteTarget.id)
    if (!result.ok) {
      toast.error("Could not delete service", result.error)
      return
    }
    toast.success("Service deleted", `${deleteTarget.serviceName} has been removed.`)
    setDeleteTarget(null)
  }

  const handleStatusChange = () => {
    if (!statusTarget) return
    const nextStatus: ServiceStatus =
      statusTarget.status === "active" ? "inactive" : "active"
    const result = setServiceStatus(statusTarget.id, nextStatus)
    if (!result.ok) {
      toast.error("Could not update availability", result.error)
      return
    }
    toast.success(
      nextStatus === "active" ? "Service activated" : "Service paused",
      nextStatus === "active"
        ? `${statusTarget.serviceName} is bookable again.`
        : `${statusTarget.serviceName} is hidden from new bookings.`
    )
    setStatusTarget(null)
  }

  return (
    <>
      <PageHeader
        eyebrow="Service management"
        title="The salon menu, in your hands."
        description="Add new rituals, refine the details, and pause services when you need to. Services with appointment history can be deactivated rather than deleted."
        actions={
          <>
            <ButtonLink href="/services" variant="outline">
              <Eye className="size-4" />
              Preview menu
            </ButtonLink>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              New service
            </Button>
          </>
        }
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Scissors}
          label="Total services"
          value={services.length}
          detail="Across every category"
          tone="neutral"
        />
        <StatCard
          icon={CheckCircle2}
          label="Live on the menu"
          value={activeCount}
          detail="Visible and accepting requests"
          tone="sage"
        />
        <StatCard
          icon={Clock3}
          label="Paused services"
          value={pausedCount}
          detail={`${appointmentLinks} appointment records remain`}
          tone="gold"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-sand/80 bg-white/55 p-3.5 shadow-[0_18px_50px_-42px_rgba(52,37,28,0.45)] sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search services</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search service name, category, or description…"
              className="input-field h-11 pl-10"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-ink-soft transition hover:bg-cream-deep hover:text-ink"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:flex">
            <Select
              aria-label="Filter by category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 bg-white/70 lg:w-[210px]"
            >
              <option value="All categories">All categories</option>
              {SERVICE_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>

            <Select
              aria-label="Filter by availability"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "all" | ServiceStatus)
              }
              className="h-11 bg-white/70 lg:w-[170px]"
            >
              <option value="all">All availability</option>
              <option value="active">Active only</option>
              <option value="inactive">Paused only</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-soft">
          Showing <span className="font-bold text-ink">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "service" : "services"}
          {category !== "All categories" ? ` in ${category}` : ""}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-white/50 px-3 py-1.5 text-[0.6875rem] font-semibold text-ink-soft transition hover:border-sand-dark hover:text-ink"
          >
            <X className="size-3" />
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No services found"
            description="Try a different name, category, or availability filter."
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={openCreate}>
                  <Plus className="size-4" />
                  Add your first service
                </Button>
              )
            }
            className="min-h-[320px]"
          />
        ) : (
          <>
            <div className="surface-card hidden overflow-hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-sand/80 bg-cream-deep/35">
                      {["Service", "Price", "Duration", "Bookings", "Status", "Actions"].map(
                        (heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className={cn(
                              "px-5 py-3 text-[0.5625rem] font-bold tracking-[0.13em] text-ink-soft uppercase",
                              heading === "Actions" && "text-right"
                            )}
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/70">
                    {filtered.map((service) => {
                      const bookingCount = getServiceAppointmentCount(db, service.id)
                      return (
                        <tr key={service.id} className="transition hover:bg-white/45">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                                <Image
                                  src={service.image}
                                  alt={service.serviceName}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="max-w-[230px] truncate text-sm font-semibold">
                                  {service.serviceName}
                                </p>
                                <p className="mt-0.5 text-[0.625rem] text-ink-soft">
                                  {service.category}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-burgundy">
                            {formatCurrency(service.price)}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-ink-soft">
                            {formatDuration(service.duration)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-semibold">{bookingCount}</span>
                            <span className="ml-1 text-[0.625rem] text-ink-soft">
                              {bookingCount === 1 ? "appointment" : "appointments"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={service.status} />
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <ServiceAction
                                label="Edit service"
                                onClick={() => openEdit(service)}
                              >
                                <Pencil className="size-3.5" />
                              </ServiceAction>
                              <ServiceAction
                                label={
                                  service.status === "active"
                                    ? "Pause service"
                                    : "Activate service"
                                }
                                onClick={() => setStatusTarget(service)}
                              >
                                {service.status === "active" ? (
                                  <EyeOff className="size-3.5" />
                                ) : (
                                  <Eye className="size-3.5" />
                                )}
                              </ServiceAction>
                              <ServiceAction
                                label={
                                  bookingCount > 0
                                    ? "Delete unavailable: service has appointment history"
                                    : "Delete service"
                                }
                                disabled={bookingCount > 0}
                                onClick={() => setDeleteTarget(service)}
                                danger
                              >
                                <Trash2 className="size-3.5" />
                              </ServiceAction>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3.5 lg:hidden">
              {filtered.map((service) => {
                const bookingCount = getServiceAppointmentCount(db, service.id)
                return (
                  <div key={service.id} className="surface-card overflow-hidden p-4">
                    <div className="flex items-start gap-3.5">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                        <Image
                          src={service.image}
                          alt={service.serviceName}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-serif text-xl leading-tight tracking-[-0.02em]">
                              {service.serviceName}
                            </p>
                            <p className="mt-0.5 text-[0.625rem] text-ink-soft">
                              {service.category}
                            </p>
                          </div>
                          <StatusBadge status={service.status} className="shrink-0" />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.6875rem] text-ink-soft">
                          <span className="font-bold text-burgundy">
                            {formatCurrency(service.price)}
                          </span>
                          <span>{formatDuration(service.duration)}</span>
                          <span>
                            {bookingCount} {bookingCount === 1 ? "booking" : "bookings"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5 flex gap-2 border-t border-sand/70 pt-3.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEdit(service)}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setStatusTarget(service)}
                      >
                        {service.status === "active" ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                        {service.status === "active" ? "Pause" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={bookingCount > 0}
                        onClick={() => setDeleteTarget(service)}
                        className="text-[#9d3c43] hover:bg-[#fff1f1]"
                        aria-label={
                          bookingCount > 0
                            ? "Delete unavailable: service has appointment history"
                            : "Delete service"
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <p className="mt-5 text-center text-[0.625rem] leading-5 text-ink-soft/75">
        Services linked to appointment history are protected from deletion. Pause them
        instead to keep past records intact.
      </p>

      {formOpen ? (
        <ServiceFormModal
          key={editing?.id ?? "new-service"}
          service={editing ?? undefined}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete this service?"
        description={
          deleteTarget
            ? `${deleteTarget.serviceName} will be permanently removed from the salon menu. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete service"
        cancelLabel="Keep service"
        tone="danger"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null)
        }}
        title={
          statusTarget?.status === "active" ? "Pause this service?" : "Activate this service?"
        }
        description={
          statusTarget
            ? statusTarget.status === "active"
              ? `${statusTarget.serviceName} will be hidden from the public menu and will no longer accept new appointment requests. Existing appointments are unaffected.`
              : `${statusTarget.serviceName} will reappear on the public menu and accept new appointment requests.`
            : ""
        }
        confirmLabel={
          statusTarget?.status === "active" ? "Pause service" : "Activate service"
        }
        cancelLabel="Leave as is"
        tone={statusTarget?.status === "active" ? "danger" : "default"}
        onConfirm={handleStatusChange}
      />
    </>
  )
}

function ServiceAction({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-full border border-sand/80 bg-white/55 text-ink-soft transition",
        danger
          ? "hover:border-[#e2c4c4] hover:bg-[#fff1f1] hover:text-[#9d3c43]"
          : "hover:border-sand-dark hover:bg-white hover:text-ink",
        disabled && "cursor-not-allowed opacity-35 hover:border-sand/80 hover:bg-white/55 hover:text-ink-soft"
      )}
    >
      {children}
    </button>
  )
}

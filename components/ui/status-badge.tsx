import { cn } from "@/lib/utils"

type Status =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "paid"
  | "unpaid"
  | "active"
  | "inactive"
  | "failed"

const styles: Record<Status, { badge: string; dot: string; label: string }> = {
  pending: {
    badge: "border-warning-line bg-warning-soft text-warning",
    dot: "bg-warning-solid",
    label: "Pending",
  },
  confirmed: {
    badge: "border-success-line bg-success-soft text-success",
    dot: "bg-success-solid",
    label: "Confirmed",
  },
  cancelled: {
    badge: "border-danger-line bg-danger-soft text-danger",
    dot: "bg-danger-solid",
    label: "Cancelled",
  },
  paid: {
    badge: "border-success-line bg-success-soft text-success",
    dot: "bg-success-solid",
    label: "Paid",
  },
  unpaid: {
    badge: "border-warning-line bg-warning-soft text-warning",
    dot: "bg-warning-solid",
    label: "Unpaid",
  },
  active: {
    badge: "border-success-line bg-success-soft text-success",
    dot: "bg-success-solid",
    label: "Active",
  },
  inactive: {
    badge: "border-sand bg-cream-deep text-ink-soft",
    dot: "bg-ink-soft",
    label: "Inactive",
  },
  failed: {
    badge: "border-danger-line bg-danger-soft text-danger",
    dot: "bg-danger-solid",
    label: "Failed",
  },
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: Status
  label?: string
  className?: string
}) {
  const style = styles[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.01em]",
        style.badge,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden="true" />
      {label ?? style.label}
    </span>
  )
}

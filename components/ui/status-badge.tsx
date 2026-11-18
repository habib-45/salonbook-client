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
    badge: "border-[#ead7b3] bg-[#fbf4e5] text-[#84612d]",
    dot: "bg-[#b68a45]",
    label: "Pending",
  },
  confirmed: {
    badge: "border-[#ccdac5] bg-[#f2f8ee] text-[#516b48]",
    dot: "bg-[#718c66]",
    label: "Confirmed",
  },
  cancelled: {
    badge: "border-[#e8c7c9] bg-[#fdf2f3] text-[#8f3f45]",
    dot: "bg-[#aa5359]",
    label: "Cancelled",
  },
  paid: {
    badge: "border-[#ccdac5] bg-[#f2f8ee] text-[#516b48]",
    dot: "bg-[#718c66]",
    label: "Paid",
  },
  unpaid: {
    badge: "border-[#ead7b3] bg-[#fbf4e5] text-[#84612d]",
    dot: "bg-[#b68a45]",
    label: "Unpaid",
  },
  active: {
    badge: "border-[#ccdac5] bg-[#f2f8ee] text-[#516b48]",
    dot: "bg-[#718c66]",
    label: "Active",
  },
  inactive: {
    badge: "border-[#ddd6cf] bg-[#f6f2ed] text-[#786e65]",
    dot: "bg-[#968c83]",
    label: "Inactive",
  },
  failed: {
    badge: "border-[#e8c7c9] bg-[#fdf2f3] text-[#8f3f45]",
    dot: "bg-[#aa5359]",
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

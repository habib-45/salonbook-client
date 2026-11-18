import { clsx, type ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60

  return remaining ? `${hours}h ${remaining}m` : `${hours}h`
}

export function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
) {
  const date = typeof value === "string" ? parseDateOnly(value) : value
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", options).format(date)
}

export function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function formatWeekday(value: string | Date) {
  const date = typeof value === "string" ? parseDateOnly(value) : value
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date)
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function addDays(days: number) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date
}

export function todayInputValue() {
  return toDateInputValue(new Date())
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function passwordChecks(password: string) {
  return {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
  }
}

export function isValidPassword(password: string) {
  return Object.values(passwordChecks(password)).every(Boolean)
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function uid(prefix = "id") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function safeCallbackUrl(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard"
  }
  return value
}

export function truncateMiddle(value: string, start = 8, end = 6) {
  if (value.length <= start + end + 3) return value
  return `${value.slice(0, start)}…${value.slice(-end)}`
}

export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`
}

export function timeSlotMinutes(slot: string) {
  const match = slot.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i)
  if (!match) return 0

  const [, hours, minutes, meridiem] = match
  let hour = Number(hours) % 12
  if (meridiem.toUpperCase() === "PM") hour += 12
  return hour * 60 + Number(minutes)
}

export function sortByAppointmentDate<
  T extends { appointmentDate: string; timeSlot: string },
>(items: T[]) {
  return [...items].sort(
    (a, b) =>
      a.appointmentDate.localeCompare(b.appointmentDate) ||
      timeSlotMinutes(a.timeSlot) - timeSlotMinutes(b.timeSlot)
  )
}

export function sortByNewest<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

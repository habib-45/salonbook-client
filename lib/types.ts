export type Role = "customer" | "admin"

export type ServiceStatus = "active" | "inactive"

export type AppointmentStatus = "pending" | "confirmed" | "cancelled"

export type PaymentStatus = "unpaid" | "paid"

export type TransactionStatus = "paid" | "failed"

export interface User {
  id: string
  name: string
  email: string
  /** Demo-only credential storage. Never store passwords in the browser in production. */
  password: string
  image: string
  role: Role
  isBlocked: boolean
  phone?: string
  provider?: "credentials" | "google"
  createdAt: string
}

export interface Service {
  id: string
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status: ServiceStatus
  createdAt: string
}

export interface Appointment {
  id: string
  serviceId: string
  customerId: string
  appointmentDate: string
  timeSlot: string
  message: string
  servicePrice: number
  paymentStatus: PaymentStatus
  status: AppointmentStatus
  createdAt: string
}

export interface Transaction {
  id: string
  appointmentId: string
  customerId: string
  amount: number
  currency: string
  stripeSessionId: string
  status: TransactionStatus
  createdAt: string
}

export interface Database {
  users: User[]
  services: Service[]
  appointments: Appointment[]
  transactions: Transaction[]
}

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput {
  name: string
  email: string
  password: string
  image: string
}

export interface ProfileInput {
  name: string
  phone: string
  image: string
}

export interface ServiceInput {
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status: ServiceStatus
}

export interface AppointmentInput {
  serviceId: string
  appointmentDate: string
  timeSlot: string
  message: string
}

export type AppointmentWithDetails = Appointment & {
  service?: Service
  customer?: User
}

export type TransactionWithDetails = Transaction & {
  appointment?: Appointment
  service?: Service
  customer?: User
}

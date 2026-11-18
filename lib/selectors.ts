import type {
  Appointment,
  AppointmentWithDetails,
  Database,
  Service,
  Transaction,
  TransactionWithDetails,
  User,
} from "@/lib/types"
import { sortByAppointmentDate, sortByNewest, todayInputValue } from "@/lib/utils"

export function getService(db: Database, serviceId: string): Service | undefined {
  return db.services.find((service) => service.id === serviceId)
}

export function getCustomer(db: Database, customerId: string): User | undefined {
  return db.users.find((user) => user.id === customerId)
}

export function withAppointmentDetails(
  db: Database,
  appointment: Appointment
): AppointmentWithDetails {
  return {
    ...appointment,
    service: getService(db, appointment.serviceId),
    customer: getCustomer(db, appointment.customerId),
  }
}

export function withTransactionDetails(
  db: Database,
  transaction: Transaction
): TransactionWithDetails {
  const appointment = db.appointments.find(
    (item) => item.id === transaction.appointmentId
  )

  return {
    ...transaction,
    appointment,
    service: appointment ? getService(db, appointment.serviceId) : undefined,
    customer: getCustomer(db, transaction.customerId),
  }
}

export function getCustomerAppointments(db: Database, customerId: string) {
  return db.appointments
    .filter((appointment) => appointment.customerId === customerId)
    .map((appointment) => withAppointmentDetails(db, appointment))
}

export function getCustomerTransactions(db: Database, customerId: string) {
  return sortByNewest(
    db.transactions.filter((transaction) => transaction.customerId === customerId)
  )
}

export function getAppointmentTransaction(db: Database, appointmentId: string) {
  return db.transactions.find(
    (transaction) =>
      transaction.appointmentId === appointmentId && transaction.status === "paid"
  )
}

export function getUpcomingAppointments(
  db: Database,
  customerId?: string,
  limit?: number
) {
  const today = todayInputValue()
  const upcoming = sortByAppointmentDate(
    db.appointments
      .filter(
        (appointment) =>
          appointment.status === "confirmed" &&
          appointment.appointmentDate >= today &&
          (!customerId || appointment.customerId === customerId)
      )
      .map((appointment) => withAppointmentDetails(db, appointment))
  )

  return typeof limit === "number" ? upcoming.slice(0, limit) : upcoming
}

export function getCustomerStats(db: Database, customerId: string) {
  const today = todayInputValue()
  const appointments = db.appointments.filter(
    (appointment) => appointment.customerId === customerId
  )
  const transactions = db.transactions.filter(
    (transaction) =>
      transaction.customerId === customerId && transaction.status === "paid"
  )

  return {
    total: appointments.length,
    pending: appointments.filter((appointment) => appointment.status === "pending")
      .length,
    upcoming: appointments.filter(
      (appointment) =>
        appointment.status === "confirmed" && appointment.appointmentDate >= today
    ).length,
    completed: appointments.filter(
      (appointment) =>
        appointment.status === "confirmed" && appointment.appointmentDate < today
    ).length,
    spent: transactions.reduce((total, transaction) => total + transaction.amount, 0),
    paidVisits: transactions.length,
  }
}

export function getAdminStats(db: Database) {
  const today = todayInputValue()
  const transactions = db.transactions.filter(
    (transaction) => transaction.status === "paid"
  )
  const customers = db.users.filter((user) => user.role === "customer")

  return {
    revenue: transactions.reduce((total, transaction) => total + transaction.amount, 0),
    transactionCount: transactions.length,
    pending: db.appointments.filter((appointment) => appointment.status === "pending")
      .length,
    today: db.appointments.filter(
      (appointment) =>
        appointment.appointmentDate === today && appointment.status !== "cancelled"
    ).length,
    upcoming: getUpcomingAppointments(db).length,
    activeServices: db.services.filter((service) => service.status === "active").length,
    totalServices: db.services.length,
    customers: customers.length,
    blockedCustomers: customers.filter((customer) => customer.isBlocked).length,
    unpaidConfirmed: db.appointments.filter(
      (appointment) =>
        appointment.status === "confirmed" && appointment.paymentStatus === "unpaid"
    ).length,
  }
}

export function getCustomerSpend(db: Database, customerId: string) {
  return db.transactions
    .filter(
      (transaction) =>
        transaction.customerId === customerId && transaction.status === "paid"
    )
    .reduce((total, transaction) => total + transaction.amount, 0)
}

export function getCustomerAppointmentCount(db: Database, customerId: string) {
  return db.appointments.filter(
    (appointment) => appointment.customerId === customerId
  ).length
}

export function getServiceAppointmentCount(db: Database, serviceId: string) {
  return db.appointments.filter(
    (appointment) => appointment.serviceId === serviceId
  ).length
}

export function getTransactionsNewest(db: Database) {
  return sortByNewest(db.transactions).map((transaction) =>
    withTransactionDetails(db, transaction)
  )
}

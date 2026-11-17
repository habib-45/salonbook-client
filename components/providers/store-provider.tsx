"use client"

import * as React from "react"
import {
  CURRENCY,
  GOOGLE_DEMO_ACCOUNT,
  SERVICE_CATEGORIES,
  STORAGE_KEYS,
  TIME_SLOTS,
} from "@/lib/constants"
import { seedDatabase } from "@/lib/seed"
import type {
  ActionResult,
  Appointment,
  AppointmentInput,
  Database,
  ProfileInput,
  Role,
  Service,
  ServiceInput,
  ServiceStatus,
  SignInInput,
  SignUpInput,
  Transaction,
  User,
} from "@/lib/types"
import { isValidEmail, isValidPassword, parseDateOnly, uid } from "@/lib/utils"

interface StoreContextValue {
  db: Database | null
  currentUser: User | null
  isHydrated: boolean
  signIn: (input: SignInInput) => ActionResult<User>
  signUp: (input: SignUpInput) => ActionResult<User>
  signInWithGoogle: () => ActionResult<User>
  signOut: () => void
  updateProfile: (input: ProfileInput) => ActionResult<User>
  addService: (input: ServiceInput) => ActionResult<Service>
  updateService: (serviceId: string, input: ServiceInput) => ActionResult<Service>
  deleteService: (serviceId: string) => ActionResult
  setServiceStatus: (serviceId: string, status: ServiceStatus) => ActionResult
  bookAppointment: (input: AppointmentInput) => ActionResult<Appointment>
  cancelOwnAppointment: (appointmentId: string) => ActionResult
  confirmAppointment: (appointmentId: string) => ActionResult
  adminCancelAppointment: (appointmentId: string) => ActionResult
  completePayment: (appointmentId: string) => ActionResult<Transaction>
  setUserBlocked: (userId: string, isBlocked: boolean) => ActionResult
  resetDemoData: () => void
  isEmailTaken: (email: string) => boolean
}

const StoreContext = React.createContext<StoreContextValue | null>(null)

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function validServiceValues(price: number, duration: number) {
  return Number.isFinite(price) && price > 0 && Number.isFinite(duration) && duration > 0
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = React.useState<Database | null>(null)
  const [sessionUserId, setSessionUserId] = React.useState<string | null>(null)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    let storedDb: Database | null = null
    let storedSession: string | null = null

    try {
      const rawDb = window.localStorage.getItem(STORAGE_KEYS.database)
      if (rawDb) {
        const parsed = JSON.parse(rawDb) as Database
        if (
          Array.isArray(parsed.users) &&
          Array.isArray(parsed.services) &&
          Array.isArray(parsed.appointments) &&
          Array.isArray(parsed.transactions)
        ) {
          storedDb = parsed
        }
      }
      storedSession = window.localStorage.getItem(STORAGE_KEYS.session)
    } catch {
      storedDb = null
      storedSession = null
    }

    setDb(storedDb ?? seedDatabase())
    setSessionUserId(storedSession)
    setIsHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!isHydrated || !db) return
    try {
      window.localStorage.setItem(STORAGE_KEYS.database, JSON.stringify(db))
    } catch (error) {
      console.error("SalonBook demo data could not be saved.", error)
    }
  }, [db, isHydrated])

  React.useEffect(() => {
    if (!isHydrated) return
    try {
      if (sessionUserId) {
        window.localStorage.setItem(STORAGE_KEYS.session, sessionUserId)
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.session)
      }
    } catch (error) {
      console.error("SalonBook session could not be saved.", error)
    }
  }, [isHydrated, sessionUserId])

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.database && event.newValue) {
        try {
          setDb(JSON.parse(event.newValue) as Database)
        } catch {
          // Ignore malformed cross-tab updates.
        }
      }
      if (event.key === STORAGE_KEYS.session) {
        setSessionUserId(event.newValue)
      }
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const currentUser = React.useMemo(
    () => db?.users.find((user) => user.id === sessionUserId) ?? null,
    [db, sessionUserId]
  )

  const isEmailTaken = React.useCallback(
    (email: string) => {
      if (!db) return false
      return db.users.some((user) => normalizeEmail(user.email) === normalizeEmail(email))
    },
    [db]
  )

  const signIn = React.useCallback<StoreContextValue["signIn"]>(
    ({ email, password }) => {
      if (!db) return { ok: false, error: "The application is still loading. Please try again." }
      if (!email.trim() || !password) {
        return { ok: false, error: "Enter your email and password to continue." }
      }

      const user = db.users.find(
        (candidate) => normalizeEmail(candidate.email) === normalizeEmail(email)
      )

      if (!user || user.password !== password) {
        return { ok: false, error: "The email or password you entered is incorrect." }
      }

      if (user.isBlocked) {
        return {
          ok: false,
          error: "This account has been blocked. Please contact the salon for assistance.",
        }
      }

      setSessionUserId(user.id)
      return { ok: true, data: user }
    },
    [db]
  )

  const signUp = React.useCallback<StoreContextValue["signUp"]>(
    ({ name, email, password, image }) => {
      if (!db) return { ok: false, error: "The application is still loading. Please try again." }
      if (name.trim().length < 2) return { ok: false, error: "Please enter your full name." }
      if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email address." }
      if (!isValidPassword(password)) {
        return {
          ok: false,
          error:
            "Your password needs at least 6 characters, one uppercase letter, and one lowercase letter.",
        }
      }
      if (isEmailTaken(email)) {
        return { ok: false, error: "An account with this email already exists. Try signing in." }
      }

      const user: User = {
        id: uid("customer"),
        name: name.trim(),
        email: normalizeEmail(email),
        password,
        image: image.trim(),
        role: "customer",
        isBlocked: false,
        provider: "credentials",
        createdAt: new Date().toISOString(),
      }

      setDb({ ...db, users: [...db.users, user] })
      setSessionUserId(user.id)
      return { ok: true, data: user }
    },
    [db, isEmailTaken]
  )

  const signInWithGoogle = React.useCallback<StoreContextValue["signInWithGoogle"]>(() => {
    if (!db) return { ok: false, error: "The application is still loading. Please try again." }

    const existing = db.users.find(
      (user) => normalizeEmail(user.email) === normalizeEmail(GOOGLE_DEMO_ACCOUNT.email)
    )

    if (existing) {
      if (existing.isBlocked) {
        return { ok: false, error: "This Google-linked account has been blocked." }
      }
      setSessionUserId(existing.id)
      return { ok: true, data: existing }
    }

    const user: User = {
      id: uid("google"),
      name: GOOGLE_DEMO_ACCOUNT.name,
      email: GOOGLE_DEMO_ACCOUNT.email,
      password: "",
      image: GOOGLE_DEMO_ACCOUNT.image,
      role: "customer",
      isBlocked: false,
      provider: "google",
      createdAt: new Date().toISOString(),
    }

    setDb({ ...db, users: [...db.users, user] })
    setSessionUserId(user.id)
    return { ok: true, data: user }
  }, [db])

  const signOut = React.useCallback(() => {
    setSessionUserId(null)
  }, [])

  const updateProfile = React.useCallback<StoreContextValue["updateProfile"]>(
    ({ name, phone, image }) => {
      if (!db || !currentUser) return { ok: false, error: "You need to sign in to continue." }
      if (name.trim().length < 2) return { ok: false, error: "Please enter your full name." }

      const updatedUser: User = {
        ...currentUser,
        name: name.trim(),
        phone: phone.trim(),
        image: image.trim(),
      }

      setDb({
        ...db,
        users: db.users.map((user) => (user.id === currentUser.id ? updatedUser : user)),
      })

      return { ok: true, data: updatedUser }
    },
    [currentUser, db]
  )

  const addService = React.useCallback<StoreContextValue["addService"]>(
    (input) => {
      if (!db || currentUser?.role !== "admin") {
        return { ok: false, error: "Only salon administrators can add services." }
      }
      if (!input.serviceName.trim()) {
        return { ok: false, error: "Please enter a service name." }
      }
      if (!SERVICE_CATEGORIES.includes(input.category as (typeof SERVICE_CATEGORIES)[number])) {
        return { ok: false, error: "Please choose a valid service category." }
      }
      if (!validServiceValues(input.price, input.duration)) {
        return { ok: false, error: "Price and duration must both be positive numbers." }
      }
      if (!input.image) {
        return { ok: false, error: "Please upload a service image." }
      }

      const service: Service = {
        id: uid("service"),
        serviceName: input.serviceName.trim(),
        category: input.category,
        description: input.description.trim(),
        price: Number(input.price),
        duration: Number(input.duration),
        image: input.image,
        status: input.status,
        createdAt: new Date().toISOString(),
      }

      setDb({ ...db, services: [service, ...db.services] })
      return { ok: true, data: service }
    },
    [currentUser, db]
  )

  const updateService = React.useCallback<StoreContextValue["updateService"]>(
    (serviceId, input) => {
      if (!db || currentUser?.role !== "admin") {
        return { ok: false, error: "Only salon administrators can update services." }
      }
      const existing = db.services.find((service) => service.id === serviceId)
      if (!existing) return { ok: false, error: "That service could not be found." }
      if (!input.serviceName.trim()) {
        return { ok: false, error: "Please enter a service name." }
      }
      if (!validServiceValues(input.price, input.duration)) {
        return { ok: false, error: "Price and duration must both be positive numbers." }
      }
      if (!input.image) {
        return { ok: false, error: "Please upload a service image." }
      }

      const updated: Service = {
        ...existing,
        serviceName: input.serviceName.trim(),
        category: input.category,
        description: input.description.trim(),
        price: Number(input.price),
        duration: Number(input.duration),
        image: input.image,
        status: input.status,
      }

      setDb({
        ...db,
        services: db.services.map((service) => (service.id === serviceId ? updated : service)),
      })

      return { ok: true, data: updated }
    },
    [currentUser, db]
  )

  const deleteService = React.useCallback<StoreContextValue["deleteService"]>(
    (serviceId) => {
      if (!db || currentUser?.role !== "admin") {
        return { ok: false, error: "Only salon administrators can delete services." }
      }
      const service = db.services.find((item) => item.id === serviceId)
      if (!service) return { ok: false, error: "That service could not be found." }

      const linkedAppointments = db.appointments.some(
        (appointment) => appointment.serviceId === serviceId
      )
      if (linkedAppointments) {
        return {
          ok: false,
          error:
            "This service is linked to appointment history. Set it to inactive instead of deleting it.",
        }
      }

      setDb({ ...db, services: db.services.filter((item) => item.id !== serviceId) })
      return { ok: true, data: undefined }
    },
    [currentUser, db]
  )

  const setServiceStatus = React.useCallback<StoreContextValue["setServiceStatus"]>(
    (serviceId, status) => {
      if (!db || currentUser?.role !== "admin") {
        return { ok: false, error: "Only salon administrators can update service availability." }
      }

      const exists = db.services.some((service) => service.id === serviceId)
      if (!exists) return { ok: false, error: "That service could not be found." }

      setDb({
        ...db,
        services: db.services.map((service) =>
          service.id === serviceId ? { ...service, status } : service
        ),
      })

      return { ok: true, data: undefined }
    },
    [currentUser, db]
  )

  const bookAppointment = React.useCallback<StoreContextValue["bookAppointment"]>(
    (input) => {
      if (!db || !currentUser) {
        return { ok: false, error: "You need to sign in to request an appointment." }
      }
      if (currentUser.isBlocked) {
        return { ok: false, error: "Blocked accounts cannot request appointments." }
      }
      if (currentUser.role !== "customer") {
        return { ok: false, error: "Administrator accounts cannot book customer appointments." }
      }

      const service = db.services.find((item) => item.id === input.serviceId)
      if (!service) return { ok: false, error: "This service could not be found." }
      if (service.status !== "active") {
        return { ok: false, error: "This service is not currently accepting appointments." }
      }
      if (!input.appointmentDate) {
        return { ok: false, error: "Please choose an appointment date." }
      }
      if (!TIME_SLOTS.includes(input.timeSlot as (typeof TIME_SLOTS)[number])) {
        return { ok: false, error: "Please choose an available time slot." }
      }

      const chosenDate = parseDateOnly(input.appointmentDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (Number.isNaN(chosenDate.getTime()) || chosenDate < today) {
        return { ok: false, error: "Please choose today or a future date." }
      }

      const duplicate = db.appointments.some(
        (appointment) =>
          appointment.customerId === currentUser.id &&
          appointment.appointmentDate === input.appointmentDate &&
          appointment.timeSlot === input.timeSlot &&
          appointment.status !== "cancelled"
      )

      if (duplicate) {
        return {
          ok: false,
          error: "You already have an active appointment in this time slot. Please choose another.",
        }
      }

      const appointment: Appointment = {
        id: uid("appointment"),
        serviceId: service.id,
        customerId: currentUser.id,
        appointmentDate: input.appointmentDate,
        timeSlot: input.timeSlot,
        message: input.message.trim(),
        servicePrice: service.price,
        paymentStatus: "unpaid",
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      setDb({ ...db, appointments: [appointment, ...db.appointments] })
      return { ok: true, data: appointment }
    },
    [currentUser, db]
  )

  const cancelOwnAppointment = React.useCallback<StoreContextValue["cancelOwnAppointment"]>(
    (appointmentId) => {
      if (!db || !currentUser) return { ok: false, error: "You need to sign in to continue." }

      const appointment = db.appointments.find((item) => item.id === appointmentId)
      if (!appointment) return { ok: false, error: "That appointment could not be found." }
      if (appointment.customerId !== currentUser.id) {
        return { ok: false, error: "You can only manage your own appointments." }
      }
      if (appointment.status !== "pending") {
        return {
          ok: false,
          error: "Only pending appointment requests can be cancelled by customers.",
        }
      }

      setDb({
        ...db,
        appointments: db.appointments.map((item) =>
          item.id === appointmentId ? { ...item, status: "cancelled" } : item
        ),
      })

      return { ok: true, data: undefined }
    },
    [currentUser, db]
  )

  const confirmAppointment = React.useCallback<StoreContextValue["confirmAppointment"]>(
    (appointmentId) => {
      if (!db || currentUser?.role !== "admin") {
        return { ok: false, error: "Only salon administrators can confirm appointments." }
      }

      const appointment = db.appointments.find((item) => item.id === appointmentId)
      if (!appointment) return { ok: false, error: "That appointment could not be found." }
      if (appointment.status !== "pending") {
        return { ok: false, error: "Only pending appointments can be confirmed." }
      }

      setDb({
        ...db,
        appointments: db.appointments.map((item) =>
          item.id === appointmentId ? { ...item, status: "confirmed" } : item
        ),
      })

      return { ok: true, data: undefined }
    },
    [currentUser, db]
  )

  const adminCancelAppointment = React.useCallback<StoreContextValue["adminCancelAppointment"]>(
    (appointmentId) => {
      if (!db || currentUser?.role !== "admin") {
        return { ok: false, error: "Only salon administrators can cancel appointments." }
      }

      const appointment = db.appointments.find((item) => item.id === appointmentId)
      if (!appointment) return { ok: false, error: "That appointment could not be found." }
      if (appointment.status === "cancelled") {
        return { ok: false, error: "This appointment is already cancelled." }
      }

      setDb({
        ...db,
        appointments: db.appointments.map((item) =>
          item.id === appointmentId ? { ...item, status: "cancelled" } : item
        ),
      })

      return { ok: true, data: undefined }
    },
    [currentUser, db]
  )

  const completePayment = React.useCallback<StoreContextValue["completePayment"]>(
    (appointmentId) => {
      if (!db || !currentUser) return { ok: false, error: "You need to sign in to continue." }

      const appointment = db.appointments.find((item) => item.id === appointmentId)
      if (!appointment) return { ok: false, error: "That appointment could not be found." }
      if (appointment.customerId !== currentUser.id) {
        return { ok: false, error: "You can only pay for your own appointments." }
      }
      if (appointment.status !== "confirmed") {
        return { ok: false, error: "Only confirmed appointments can be paid for." }
      }
      if (appointment.paymentStatus === "paid") {
        return { ok: false, error: "This appointment has already been paid." }
      }

      const transaction: Transaction = {
        id: uid("transaction"),
        appointmentId: appointment.id,
        customerId: currentUser.id,
        amount: appointment.servicePrice,
        currency: CURRENCY,
        stripeSessionId: `cs_test_demo_${uid().slice(-12)}`,
        status: "paid",
        createdAt: new Date().toISOString(),
      }

      setDb({
        ...db,
        appointments: db.appointments.map((item) =>
          item.id === appointmentId ? { ...item, paymentStatus: "paid" } : item
        ),
        transactions: [transaction, ...db.transactions],
      })

      return { ok: true, data: transaction }
    },
    [currentUser, db]
  )

  const setUserBlocked = React.useCallback<StoreContextValue["setUserBlocked"]>(
    (userId, isBlocked) => {
      if (!db || currentUser?.role !== "admin") {
        return { ok: false, error: "Only salon administrators can manage customer access." }
      }
      const target = db.users.find((user) => user.id === userId)
      if (!target) return { ok: false, error: "That customer could not be found." }
      if (target.role !== "customer") {
        return { ok: false, error: "Administrator accounts cannot be blocked." }
      }

      setDb({
        ...db,
        users: db.users.map((user) => (user.id === userId ? { ...user, isBlocked } : user)),
      })

      return { ok: true, data: undefined }
    },
    [currentUser, db]
  )

  const resetDemoData = React.useCallback(() => {
    const fresh = seedDatabase()
    setDb(fresh)
    setSessionUserId(null)
  }, [])

  const value = React.useMemo<StoreContextValue>(
    () => ({
      db,
      currentUser,
      isHydrated,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      updateProfile,
      addService,
      updateService,
      deleteService,
      setServiceStatus,
      bookAppointment,
      cancelOwnAppointment,
      confirmAppointment,
      adminCancelAppointment,
      completePayment,
      setUserBlocked,
      resetDemoData,
      isEmailTaken,
    }),
    [
      addService,
      adminCancelAppointment,
      bookAppointment,
      cancelOwnAppointment,
      completePayment,
      confirmAppointment,
      currentUser,
      db,
      deleteService,
      isEmailTaken,
      isHydrated,
      resetDemoData,
      setServiceStatus,
      setUserBlocked,
      signIn,
      signInWithGoogle,
      signOut,
      signUp,
      updateProfile,
      updateService,
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = React.useContext(StoreContext)
  if (!context) {
    throw new Error("useStore must be used inside a StoreProvider")
  }
  return context
}

export function useCurrentUser() {
  return useStore().currentUser
}

export function hasRole(user: User | null, role: Role) {
  return user?.role === role
}

"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { LoaderCircle, RefreshCcw, WifiOff } from "lucide-react"
import { ApiError, apiRequest, messageFromError, setStoredToken } from "@/lib/api"
import { requestGoogleAccessToken } from "@/lib/google"
import type {
  ActionResult,
  Appointment,
  AppointmentInput,
  AuthConfig,
  AuthResponse,
  BootstrapData,
  CheckoutSession,
  Database,
  ProfileInput,
  Role,
  Service,
  ServiceInput,
  ServiceStatus,
  SignInInput,
  SignUpInput,
  User,
} from "@/lib/types"

interface StoreContextValue {
  db: Database | null
  currentUser: User | null
  isHydrated: boolean
  isSigningOut: boolean
  signIn: (input: SignInInput) => Promise<ActionResult<User>>
  signUp: (input: SignUpInput) => Promise<ActionResult<User>>
  signInWithGoogle: () => Promise<ActionResult<User>>
  signOut: () => void
  refreshData: () => Promise<void>
  updateProfile: (input: ProfileInput) => Promise<ActionResult<User>>
  addService: (input: ServiceInput) => Promise<ActionResult<Service>>
  updateService: (serviceId: string, input: ServiceInput) => Promise<ActionResult<Service>>
  deleteService: (serviceId: string) => Promise<ActionResult>
  setServiceStatus: (serviceId: string, status: ServiceStatus) => Promise<ActionResult>
  bookAppointment: (input: AppointmentInput) => Promise<ActionResult<Appointment>>
  cancelOwnAppointment: (appointmentId: string) => Promise<ActionResult>
  confirmAppointment: (appointmentId: string) => Promise<ActionResult>
  adminCancelAppointment: (appointmentId: string) => Promise<ActionResult>
  startCheckout: (appointmentId: string) => Promise<ActionResult<CheckoutSession>>
  setUserBlocked: (userId: string, isBlocked: boolean) => Promise<ActionResult>
}

const StoreContext = React.createContext<StoreContextValue | null>(null)

const emptyDatabase: Database = {
  users: [],
  services: [],
  appointments: [],
  transactions: [],
}

function toDatabase(data: BootstrapData): Database {
  return {
    users: Array.isArray(data.users) ? data.users : [],
    services: Array.isArray(data.services) ? data.services : [],
    appointments: Array.isArray(data.appointments) ? data.appointments : [],
    transactions: Array.isArray(data.transactions) ? data.transactions : [],
  }
}

async function run<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await work() }
  } catch (error) {
    return { ok: false, error: messageFromError(error) }
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [db, setDb] = React.useState<Database | null>(null)
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)
  const [isHydrated, setIsHydrated] = React.useState(false)
  const [isSigningOut, setIsSigningOut] = React.useState(false)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const googleConfigRef = React.useRef<AuthConfig | null>(null)

  const applyBootstrap = React.useCallback((data: BootstrapData) => {
    setDb(toDatabase(data))
    setCurrentUser(data.user)
  }, [])

  const refreshData = React.useCallback(async () => {
    try {
      const data = await apiRequest<BootstrapData>("/bootstrap")
      applyBootstrap(data)
      setLoadError(null)
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setStoredToken(null)
        try {
          const publicData = await apiRequest<BootstrapData>("/bootstrap", { token: null })
          applyBootstrap(publicData)
          setLoadError(null)
          return
        } catch (publicError) {
          setLoadError(messageFromError(publicError))
        }
      } else {
        setLoadError(messageFromError(error))
      }
      setDb((current) => current ?? emptyDatabase)
    }
  }, [applyBootstrap])

  React.useEffect(() => {
    let active = true

    apiRequest<AuthConfig>("/auth/config", { token: null })
      .then((config) => {
        if (active) googleConfigRef.current = config
      })
      .catch(() => {
        // The API status banner already reports connection failures.
      })

    async function hydrate() {
      await refreshData()
      if (active) setIsHydrated(true)
    }
    void hydrate()

    return () => {
      active = false
    }
  }, [refreshData])

  React.useEffect(() => {
    if (!isSigningOut) return
    const atSignedOutDestination =
      pathname === "/" || pathname.startsWith("/signin") || pathname.startsWith("/signup")
    if (!atSignedOutDestination) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Clears the transition flag once the sign-out navigation lands.
    setIsSigningOut(false)
  }, [isSigningOut, pathname])

  const completeAuth = React.useCallback(
    async (result: AuthResponse) => {
      setStoredToken(result.token)
      setIsSigningOut(false)
      setCurrentUser(result.user)
      setDb((current) => {
        const base = current ?? emptyDatabase
        return {
          ...base,
          users: [...base.users.filter((user) => user.id !== result.user.id), result.user],
        }
      })
      await refreshData()
      return result.user
    },
    [refreshData]
  )

  const signIn = React.useCallback<StoreContextValue["signIn"]>(
    async ({ email, password }) =>
      run(async () => {
        const result = await apiRequest<AuthResponse>("/auth/login", {
          method: "POST",
          body: { email, password },
          token: null,
        })
        return completeAuth(result)
      }),
    [completeAuth]
  )

  const signUp = React.useCallback<StoreContextValue["signUp"]>(
    async ({ name, email, password, image }) =>
      run(async () => {
        const result = await apiRequest<AuthResponse>("/auth/register", {
          method: "POST",
          body: { name, email, password, image },
          token: null,
        })
        return completeAuth(result)
      }),
    [completeAuth]
  )

  const signInWithGoogle = React.useCallback<StoreContextValue["signInWithGoogle"]>(
    async () => {
      try {
        let config = googleConfigRef.current
        if (!config) {
          config = await apiRequest<AuthConfig>("/auth/config", { token: null })
          googleConfigRef.current = config
        }

        let result: AuthResponse
        if (config.googleClientId) {
          const accessToken = await requestGoogleAccessToken(config.googleClientId)
          result = await apiRequest<AuthResponse>("/auth/google", {
            method: "POST",
            body: { accessToken },
            token: null,
          })
        } else if (config.googleDemoEnabled) {
          result = await apiRequest<AuthResponse>("/auth/google/demo", {
            method: "POST",
            body: {},
            token: null,
          })
        } else {
          return {
            ok: false,
            error:
              "Google sign-in is not configured yet. Use your email and password to continue.",
          }
        }

        const user = await completeAuth(result)
        return { ok: true, data: user }
      } catch (error) {
        return {
          ok: false,
          error: messageFromError(error, "Google sign-in could not be completed."),
        }
      }
    },
    [completeAuth]
  )

  const signOut = React.useCallback(() => {
    setStoredToken(null)
    setIsSigningOut(true)
    setCurrentUser(null)
    setDb((current) => ({
      users: [],
      appointments: [],
      transactions: [],
      services: (current?.services ?? []).filter((service) => service.status === "active"),
    }))
    void apiRequest<BootstrapData>("/bootstrap", { token: null })
      .then(applyBootstrap)
      .catch(() => {
        // The public menu is already shown from the cached snapshot.
      })
  }, [applyBootstrap])

  const updateProfile = React.useCallback<StoreContextValue["updateProfile"]>(
    async (input) =>
      run(async () => {
        const { user } = await apiRequest<{ user: User }>("/users/me", {
          method: "PATCH",
          body: input,
        })
        setCurrentUser(user)
        await refreshData()
        return user
      }),
    [refreshData]
  )

  const addService = React.useCallback<StoreContextValue["addService"]>(
    async (input) =>
      run(async () => {
        const { service } = await apiRequest<{ service: Service }>("/services", {
          method: "POST",
          body: input,
        })
        await refreshData()
        return service
      }),
    [refreshData]
  )

  const updateService = React.useCallback<StoreContextValue["updateService"]>(
    async (serviceId, input) =>
      run(async () => {
        const { service } = await apiRequest<{ service: Service }>(
          `/services/${encodeURIComponent(serviceId)}`,
          { method: "PATCH", body: input }
        )
        await refreshData()
        return service
      }),
    [refreshData]
  )

  const deleteService = React.useCallback<StoreContextValue["deleteService"]>(
    async (serviceId) =>
      run(async () => {
        await apiRequest<{ ok: boolean }>(`/services/${encodeURIComponent(serviceId)}`, {
          method: "DELETE",
        })
        await refreshData()
        return undefined
      }),
    [refreshData]
  )

  const setServiceStatus = React.useCallback<StoreContextValue["setServiceStatus"]>(
    async (serviceId, status) =>
      run(async () => {
        await apiRequest<{ service: Service }>(
          `/services/${encodeURIComponent(serviceId)}/status`,
          { method: "PATCH", body: { status } }
        )
        await refreshData()
        return undefined
      }),
    [refreshData]
  )

  const bookAppointment = React.useCallback<StoreContextValue["bookAppointment"]>(
    async (input) =>
      run(async () => {
        const { appointment } = await apiRequest<{ appointment: Appointment }>(
          "/appointments",
          { method: "POST", body: input }
        )
        await refreshData()
        return appointment
      }),
    [refreshData]
  )

  const cancelOwnAppointment = React.useCallback<
    StoreContextValue["cancelOwnAppointment"]
  >(
    async (appointmentId) =>
      run(async () => {
        await apiRequest<{ appointment: Appointment }>(
          `/appointments/${encodeURIComponent(appointmentId)}/cancel`,
          { method: "PATCH" }
        )
        await refreshData()
        return undefined
      }),
    [refreshData]
  )

  const confirmAppointment = React.useCallback<StoreContextValue["confirmAppointment"]>(
    async (appointmentId) =>
      run(async () => {
        await apiRequest<{ appointment: Appointment }>(
          `/appointments/${encodeURIComponent(appointmentId)}/confirm`,
          { method: "PATCH" }
        )
        await refreshData()
        return undefined
      }),
    [refreshData]
  )

  const adminCancelAppointment = React.useCallback<
    StoreContextValue["adminCancelAppointment"]
  >(
    async (appointmentId) =>
      run(async () => {
        await apiRequest<{ appointment: Appointment }>(
          `/appointments/${encodeURIComponent(appointmentId)}/cancel`,
          { method: "PATCH" }
        )
        await refreshData()
        return undefined
      }),
    [refreshData]
  )

  const startCheckout = React.useCallback<StoreContextValue["startCheckout"]>(
    async (appointmentId) =>
      run(async () => {
        const session = await apiRequest<CheckoutSession>("/payments/checkout-session", {
          method: "POST",
          body: { appointmentId },
        })
        if (!session.url) {
          throw new Error("Stripe did not return a checkout link. Please try again.")
        }
        return session
      }),
    []
  )

  const setUserBlocked = React.useCallback<StoreContextValue["setUserBlocked"]>(
    async (userId, isBlocked) =>
      run(async () => {
        await apiRequest<{ user: User }>(
          `/users/${encodeURIComponent(userId)}/block`,
          { method: "PATCH", body: { isBlocked } }
        )
        await refreshData()
        return undefined
      }),
    [refreshData]
  )

  const value = React.useMemo<StoreContextValue>(
    () => ({
      db,
      currentUser,
      isHydrated,
      isSigningOut,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshData,
      updateProfile,
      addService,
      updateService,
      deleteService,
      setServiceStatus,
      bookAppointment,
      cancelOwnAppointment,
      confirmAppointment,
      adminCancelAppointment,
      startCheckout,
      setUserBlocked,
    }),
    [
      addService,
      adminCancelAppointment,
      bookAppointment,
      cancelOwnAppointment,
      confirmAppointment,
      currentUser,
      db,
      deleteService,
      isHydrated,
      isSigningOut,
      refreshData,
      setServiceStatus,
      setUserBlocked,
      signIn,
      signInWithGoogle,
      signOut,
      signUp,
      startCheckout,
      updateProfile,
      updateService,
    ]
  )

  return (
    <StoreContext.Provider value={value}>
      {children}
      {loadError ? (
        <ConnectionBanner
          message={loadError}
          onRetry={async () => {
            await refreshData()
          }}
        />
      ) : null}
    </StoreContext.Provider>
  )
}

function ConnectionBanner({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => Promise<void>
}) {
  const [isRetrying, setIsRetrying] = React.useState(false)

  return (
    <div
      role="status"
      className="fixed right-4 bottom-4 z-[300] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-danger-line bg-danger-soft p-4 shadow-[0_24px_70px_-30px_rgba(64,25,42,0.55)]"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
          <WifiOff className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-ink">The salon service is unreachable</p>
          <p className="mt-1 text-[0.6875rem] leading-5 text-ink-soft">{message}</p>
          <button
            type="button"
            onClick={async () => {
              setIsRetrying(true)
              try {
                await onRetry()
              } finally {
                setIsRetrying(false)
              }
            }}
            disabled={isRetrying}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-sand bg-surface/70 px-3 py-1.5 text-[0.625rem] font-semibold text-ink-soft transition hover:border-sand-dark hover:text-ink disabled:opacity-60"
          >
            {isRetrying ? (
              <LoaderCircle className="size-3 animate-spin" />
            ) : (
              <RefreshCcw className="size-3" />
            )}
            Try again
          </button>
        </div>
      </div>
    </div>
  )
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

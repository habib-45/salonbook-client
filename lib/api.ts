export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "")

export const TOKEN_STORAGE_KEY = "salonbook.token"

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status = 0, code?: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // Storage can be unavailable in private browsing; the in-memory session still works.
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  token?: string | null
  signal?: AbortSignal
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, token, signal }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" }
  const authToken = token === undefined ? getStoredToken() : token

  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error
    throw new ApiError(
      "We can't reach the SalonBook service right now. Check your connection and try again.",
      0,
      "NETWORK_ERROR"
    )
  }

  const contentType = response.headers.get("content-type") || ""
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null

  if (!response.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      "Something went wrong. Please try again."
    throw new ApiError(message, response.status, data?.code)
  }

  return data as T
}

export function messageFromError(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}

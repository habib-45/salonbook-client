interface GoogleTokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

interface GoogleErrorResponse {
  type?: string
  message?: string
}

interface GoogleTokenClient {
  requestAccessToken: () => void
}

interface GoogleOAuth2 {
  initTokenClient: (config: {
    client_id: string
    scope: string
    callback: (response: GoogleTokenResponse) => void
    error_callback?: (error: GoogleErrorResponse) => void
  }) => GoogleTokenClient
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: GoogleOAuth2
      }
    }
  }
}

const SCRIPT_ID = "google-identity-services"
let loadingPromise: Promise<void> | null = null

function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in is only available in the browser."))
  }
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (loadingPromise) return loadingPromise

  loadingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener(
        "error",
        () => reject(new Error("Google sign-in could not be loaded.")),
        { once: true }
      )
      return
    }

    const script = document.createElement("script")
    script.id = SCRIPT_ID
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Google sign-in could not be loaded."))
    document.head.appendChild(script)
  })

  return loadingPromise
}

export async function requestGoogleAccessToken(clientId: string): Promise<string> {
  await loadGoogleScript()
  const oauth2 = window.google?.accounts?.oauth2
  if (!oauth2) throw new Error("Google sign-in is not available in this browser.")

  return new Promise<string>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description ||
                response.error ||
                "Google sign-in was not completed."
            )
          )
          return
        }
        resolve(response.access_token)
      },
      error_callback: (error) => {
        reject(new Error(error?.message || "Google sign-in was cancelled."))
      },
    })
    client.requestAccessToken()
  })
}

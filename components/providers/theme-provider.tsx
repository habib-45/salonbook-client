"use client"

import * as React from "react"

export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

interface ThemeState {
  theme: Theme
  resolvedTheme: ResolvedTheme
}

interface ThemeContextValue extends ThemeState {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = "salonbook-theme"

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function readTheme(): Theme {
  if (typeof window === "undefined") return "system"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system"
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
  root.style.colorScheme = resolved
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ThemeState>(() => {
    const theme = readTheme()
    return { theme, resolvedTheme: resolveTheme(theme) }
  })

  React.useEffect(() => {
    applyTheme(state.resolvedTheme)
  }, [state.resolvedTheme])

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      setState((current) =>
        current.theme === "system"
          ? { ...current, resolvedTheme: getSystemTheme() }
          : current
      )
    }

    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  const setTheme = React.useCallback((theme: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, theme)
    setState({ theme, resolvedTheme: resolveTheme(theme) })
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(state.resolvedTheme === "dark" ? "light" : "dark")
  }, [setTheme, state.resolvedTheme])

  const value = React.useMemo(
    () => ({ ...state, setTheme, toggleTheme }),
    [state, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used inside a ThemeProvider")
  }
  return context
}

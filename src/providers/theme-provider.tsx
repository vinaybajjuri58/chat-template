"use client"

import { createContext, useContext, useEffect, useState } from "react"

type TTheme = "light" | "dark"

type TThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: TTheme
  storageKey?: string
}

type TThemeProviderState = {
  theme: TTheme
  setTheme: (theme: TTheme) => void
}

const initialState: TThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<TThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "theme",
  ...props
}: TThemeProviderProps) {
  const [theme, setTheme] = useState<TTheme>(defaultTheme)

  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as TTheme | null

    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setTheme(savedTheme)
    }
  }, [defaultTheme, storageKey])

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: TTheme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import en from "@/locales/en.json"
import pcm from "@/locales/pcm.json"

type Locale = "en" | "pcm"
type Translations = typeof en

const TRANSLATIONS: Record<Locale, Translations> = { en, pcm }

type LocaleContextType = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Translations
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en")

  useEffect(() => {
    const saved = localStorage.getItem("ap_locale") as Locale
    if (saved === "en" || saved === "pcm") setLocale(saved)
  }, [])

  const handleSetLocale = (l: Locale) => {
    setLocale(l)
    localStorage.setItem("ap_locale", l)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale, t: TRANSLATIONS[locale] }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider")
  return ctx
}

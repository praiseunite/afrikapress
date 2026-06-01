"use client"

import { useEffect } from "react"

export function ServiceWorkerCleaner() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "development"
    ) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister()
          console.log("Unregistered stale service worker in dev mode.")
        }
      })
    }
  }, [])

  return null
}

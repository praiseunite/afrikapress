"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLocale } from "@/components/shared/LocaleProvider"
import { loadSession, clearSession } from "@/lib/auth/session"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t, locale, setLocale } = useLocale()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Re-check auth state when pathname changes
  useEffect(() => {
    setIsLoggedIn(!!loadSession())
  }, [pathname])

  const links = [
    { href: "/feed", label: t.nav.feed },
    { href: "/write", label: t.nav.write },
    { href: "/elections", label: "Elections" },
    { href: "/verify", label: t.nav.verify },
  ]

  const toggleLocale = () => setLocale(locale === "en" ? "pcm" : "en")

  const handleLogout = () => {
    clearSession()
    setIsLoggedIn(false)
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-emerald-500">
            AfrikaPress
          </Link>
          
          <div className="hidden items-center gap-4 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLocale}
            className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            {locale === "en" ? "EN" : "PCM"}
          </button>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="rounded-full bg-zinc-800 px-4 py-1.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-700"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              {t.nav.login}
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile nav row */}
      <div className="flex border-t border-zinc-900 sm:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 py-3 text-center text-xs font-medium ${
              pathname.startsWith(link.href)
                ? "bg-zinc-900 text-white"
                : "text-zinc-500"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

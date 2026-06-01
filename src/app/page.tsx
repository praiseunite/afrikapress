"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useLocale } from "@/components/shared/LocaleProvider"

const BACKGROUNDS = [
  "/bg-1.png", // Journalists working
  "/bg-2.png", // People voting
  "/bg-3.png", // People on phones
]

export default function LandingPage() {
  const { t } = useLocale()
  const [currentImage, setCurrentImage] = useState(0)

  // Carousel timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % BACKGROUNDS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-black text-white lg:flex-row">
      
      {/* LEFT SIDE: Copy & Call to Actions */}
      <main className="flex w-full flex-col justify-center px-8 py-16 lg:w-1/2 lg:px-16 xl:px-24">
        
        <div className="animate-fade-in-up mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
            </span>
            Free & Unstoppable Voice
          </span>
        </div>

        <h1 className="animate-fade-in-up text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl" style={{ animationDelay: "100ms" }}>
          Speak Your Truth.<br />
          <span className="text-emerald-500">Nobody Can Stop You.</span>
        </h1>

        <p className="animate-fade-in-up mt-6 max-w-lg text-lg text-zinc-400 sm:text-xl leading-relaxed" style={{ animationDelay: "200ms" }}>
          Write your stories and share them directly with the world. 
          We protect your words so that no government, corporation, or hacker can ever delete them. 
          No bans. No takedowns. Just truth.
        </p>

        <div className="animate-fade-in-up mt-10 flex flex-col gap-4 sm:flex-row" style={{ animationDelay: "300ms" }}>
          <Link
            href="/auth/create"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-8 py-4 font-bold text-black shadow-lg transition-transform hover:scale-105 hover:bg-emerald-400 active:scale-95"
          >
            Start Writing Now
          </Link>
          <Link
            href="/feed"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-8 py-4 font-bold text-white transition-colors hover:bg-zinc-800"
          >
            Read the News
          </Link>
        </div>

        {/* Features / Social Proof area */}
        <div className="animate-fade-in-up mt-16 grid grid-cols-1 gap-8 border-t border-zinc-800 pt-12 sm:grid-cols-2" style={{ animationDelay: "400ms" }}>
          <div>
            <div className="mb-2 text-2xl">🔏</div>
            <h3 className="mb-1 font-bold text-white">Iron-Clad Proof</h3>
            <p className="text-sm text-zinc-400">Every article is permanently stamped, proving exactly when you wrote it.</p>
          </div>
          <div>
            <div className="mb-2 text-2xl">🧠</div>
            <h3 className="mb-1 font-bold text-white">Simple, Safe Login</h3>
            <p className="text-sm text-zinc-400">No passwords. Just answer 4 personal questions only you know.</p>
          </div>
          <div className="sm:col-span-2">
            <div className="mb-2 text-2xl">🌍</div>
            <h3 className="mb-1 font-bold text-white">Cannot Be Banned</h3>
            <p className="text-sm text-zinc-400">Your articles live everywhere at once. There is no central server for anyone to shut down.</p>
          </div>
        </div>
      </main>

      {/* RIGHT SIDE: Image Carousel */}
      <aside className="relative hidden w-full overflow-hidden bg-zinc-900 lg:block lg:w-1/2">
        {BACKGROUNDS.map((bg, index) => (
          <div
            key={bg}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url('${bg}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
        {/* Soft inner shadow/gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/20" />
      </aside>
    </div>
  )
}

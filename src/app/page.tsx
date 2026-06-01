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
  const [currentBg, setCurrentBg] = useState(0)

  // Carousel timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUNDS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background Carousel */}
      {BACKGROUNDS.map((bg, index) => (
        <div
          key={bg}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentBg ? "opacity-40" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url('${bg}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />

      {/* Dynamic Background Gradients (Accent) */}
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-600/20 blur-[120px] filter" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] filter" />

      <main className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-6 pt-32 text-center sm:pt-48">
        <div className="animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-4 py-1.5 text-sm font-medium text-emerald-400 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Live on Bitcoin & Nostr
          </span>
        </div>

        <h1 className="animate-fade-in-up mt-8 max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl drop-shadow-lg" style={{ animationDelay: "100ms" }}>
          Uncensorable Journalism for Africa.
        </h1>

        <p className="animate-fade-in-up mt-8 max-w-2xl text-lg text-zinc-300 sm:text-xl drop-shadow-md" style={{ animationDelay: "200ms" }}>
          Publish your stories directly to the Nostr protocol. 
          Seal your evidence into the Bitcoin blockchain forever. 
          No servers. No bans. No takedowns.
        </p>

        <div className="animate-fade-in-up mt-10 flex flex-col gap-4 sm:flex-row" style={{ animationDelay: "300ms" }}>
          <Link
            href="/auth/create"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-emerald-500 px-8 py-4 font-semibold text-black shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] transition-transform duration-500 group-hover:translate-x-[100%]" />
            Start Publishing Now
          </Link>
          <Link
            href="/feed"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/40 px-8 py-4 font-semibold text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/60"
          >
            Read the Feed
          </Link>
        </div>

        {/* Feature Cards / Glassmorphism */}
        <div className="animate-fade-in-up mt-24 grid w-full grid-cols-1 gap-6 pb-24 sm:grid-cols-3" style={{ animationDelay: "400ms" }}>
          <FeatureCard
            icon="🔏"
            title="OpenSeal Technology"
            desc="Every article can be anchored into the Bitcoin blockchain, proving mathematically it existed before a specific block."
          />
          <FeatureCard
            icon="🧠"
            title="Brain Wallet"
            desc="No passwords or seed phrases required. Login securely using 4 personal questions only you know the answers to."
          />
          <FeatureCard
            icon="🌍"
            title="Decentralized Storage"
            desc="Articles live on public Nostr relays. There is no central server to hack, pressure, or shut down."
          />
        </div>
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 text-left shadow-2xl backdrop-blur-xl transition-all hover:border-emerald-500/50 hover:bg-black/60">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl transition-opacity group-hover:bg-emerald-500/40" />
      <div className="mb-4 text-3xl">{icon}</div>
      <h3 className="mb-2 text-lg font-bold text-white drop-shadow">{title}</h3>
      <p className="text-sm text-zinc-300 leading-relaxed drop-shadow-sm">{desc}</p>
    </div>
  )
}

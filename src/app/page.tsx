"use client"

import Link from "next/link"
import { useLocale } from "@/components/shared/LocaleProvider"

export default function LandingPage() {
  const { t } = useLocale()

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-600/20 blur-[120px] filter" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] filter" />

      <main className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-6 pt-32 text-center sm:pt-48">
        <div className="animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Live on Bitcoin & Nostr
          </span>
        </div>

        <h1 className="animate-fade-in-up mt-8 max-w-4xl text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl bg-gradient-to-br from-white via-white to-zinc-500 bg-clip-text" style={{ animationDelay: "100ms" }}>
          Uncensorable Journalism for Africa.
        </h1>

        <p className="animate-fade-in-up mt-8 max-w-2xl text-lg text-zinc-400 sm:text-xl" style={{ animationDelay: "200ms" }}>
          Publish your stories directly to the Nostr protocol. 
          Seal your evidence into the Bitcoin blockchain forever. 
          No servers. No bans. No takedowns.
        </p>

        <div className="animate-fade-in-up mt-10 flex flex-col gap-4 sm:flex-row" style={{ animationDelay: "300ms" }}>
          <Link
            href="/auth/create"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-emerald-500 px-8 py-4 font-semibold text-black transition-transform hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] transition-transform duration-500 group-hover:translate-x-[100%]" />
            Start Publishing Now
          </Link>
          <Link
            href="/feed"
            className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/50 px-8 py-4 font-semibold text-white backdrop-blur-md transition-colors hover:bg-zinc-800"
          >
            Read the Feed
          </Link>
        </div>

        {/* Feature Cards / Glassmorphism */}
        <div className="animate-fade-in-up mt-24 grid w-full grid-cols-1 gap-6 sm:grid-cols-3" style={{ animationDelay: "400ms" }}>
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
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-left backdrop-blur-xl transition-all hover:border-emerald-500/30 hover:bg-zinc-800/50">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-opacity group-hover:bg-emerald-500/20" />
      <div className="mb-4 text-3xl">{icon}</div>
      <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  )
}

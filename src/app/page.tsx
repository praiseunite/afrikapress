"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useLocale } from "@/components/shared/LocaleProvider"

const BACKGROUNDS = [
  { src: "/bg-1.png", alt: "Journalists working" },
  { src: "/bg-2.png", alt: "People voting" },
  { src: "/bg-3.png", alt: "People on phones" },
]

export default function LandingPage() {
  const { t } = useLocale()
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % BACKGROUNDS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-black text-white">

      {/* FULL-SCREEN CAROUSEL BACKGROUND */}
      <div className="absolute inset-0 z-0">
        {BACKGROUNDS.map((bg, index) => (
          <div
            key={bg.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={bg.src}
              alt={bg.alt}
              fill
              priority={index === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        ))}
        {/* Dark overlay — enough to read text but still shows the image */}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* CONTENT (FLOATING ON TOP) */}
      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col justify-center px-8 py-16 lg:px-16 xl:px-24">
        <div className="mx-auto max-w-4xl">
          <div className="animate-fade-in-up mb-6 text-center sm:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-900/60 px-4 py-1.5 text-sm font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Free &amp; Unstoppable Voice
            </span>
          </div>

          <h1
            className="animate-fade-in-up text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl text-center sm:text-left"
            style={{ animationDelay: "100ms" }}
          >
            Speak Your Truth.<br />
            <span className="text-emerald-400">Nobody Can Stop You.</span>
          </h1>

          <p
            className="animate-fade-in-up mt-6 max-w-2xl text-lg text-zinc-200 sm:text-xl leading-relaxed text-center sm:text-left mx-auto sm:mx-0 drop-shadow"
            style={{ animationDelay: "200ms" }}
          >
            Write your stories and share them directly with the world.
            We protect your words so that no government, corporation, or hacker can ever delete them.
            No bans. No takedowns. Just truth.
          </p>

          <div
            className="animate-fade-in-up mt-10 flex flex-col gap-4 sm:flex-row justify-center sm:justify-start"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/auth/create"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-8 py-4 font-bold text-black shadow-lg transition-transform hover:scale-105 hover:bg-emerald-400 active:scale-95"
            >
              Start Writing Now
            </Link>
            <Link
              href="/feed"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/20 px-8 py-4 font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Read the News
            </Link>
          </div>

          {/* Carousel dots */}
          <div className="mt-8 flex justify-center sm:justify-start gap-2" style={{ animationDelay: "350ms" }}>
            {BACKGROUNDS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentImage ? "w-6 bg-emerald-500" : "w-2 bg-white/40"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Features */}
          <div
            className="animate-fade-in-up mt-16 grid grid-cols-1 gap-8 border-t border-white/20 pt-12 sm:grid-cols-3 text-center sm:text-left"
            style={{ animationDelay: "400ms" }}
          >
            <div>
              <div className="mb-2 text-3xl">🔏</div>
              <h3 className="mb-1 text-lg font-bold text-white">Iron-Clad Proof</h3>
              <p className="text-sm text-zinc-300">Every article is permanently stamped, proving exactly when you wrote it.</p>
            </div>
            <div>
              <div className="mb-2 text-3xl">🧠</div>
              <h3 className="mb-1 text-lg font-bold text-white">Simple, Safe Login</h3>
              <p className="text-sm text-zinc-300">No passwords. Just answer 4 personal questions only you know.</p>
            </div>
            <div>
              <div className="mb-2 text-3xl">🌍</div>
              <h3 className="mb-1 text-lg font-bold text-white">Cannot Be Banned</h3>
              <p className="text-sm text-zinc-300">Your articles live everywhere at once. There is no central server for anyone to shut down.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

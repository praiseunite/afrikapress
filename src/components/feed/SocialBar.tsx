"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadSession } from "@/lib/auth/session"
import { getPublicKey } from "nostr-tools"
import {
  witnessArticle,
  amplifyArticle,
  fetchWitnessCount,
  getWatchList,
  setWatching,
} from "@/lib/nostr/social"

type Props = {
  articleId: string
  authorPubkey: string
  articleContent: string
  lightningAddress?: string
}

export function SocialBar({ articleId, authorPubkey, articleContent, lightningAddress }: Props) {
  const router = useRouter()
  const [keyHex, setKeyHex] = useState<string | null>(null)
  const [userPubkey, setUserPubkey] = useState<string | null>(null)

  // Witness (react)
  const [witnessCount, setWitnessCount] = useState(0)
  const [hasWitnessed, setHasWitnessed] = useState(false)
  const [isWitnessing, setIsWitnessing] = useState(false)

  // Amplify (repost)
  const [amplified, setAmplified] = useState(false)
  const [isAmplifying, setIsAmplifying] = useState(false)

  // Watch (bookmark)
  const [isWatching, setIsWatching] = useState(false)
  const [watchList, setWatchList] = useState<string[]>([])
  const [isTogglingWatch, setIsTogglingWatch] = useState(false)

  // Protect (Lightning Zap modal state — controlled here for article view)
  const [zapOpen, setZapOpen] = useState(false)

  useEffect(() => {
    const key = loadSession()
    if (key) {
      setKeyHex(key)
      const pub = getPublicKey(new Uint8Array(Buffer.from(key, "hex")))
      setUserPubkey(pub)
    }

    // Fetch witness count (async, non-blocking)
    fetchWitnessCount(articleId).then(setWitnessCount)

    // Load watch list to check if already watched
    if (key) {
      const pub = getPublicKey(new Uint8Array(Buffer.from(key, "hex")))
      getWatchList(pub).then((list) => {
        setWatchList(list)
        setIsWatching(list.includes(articleId))
      })
    }

    // Restore local state
    const witnessed = localStorage.getItem(`witnessed_${articleId}`) === "1"
    const amplifiedSaved = localStorage.getItem(`amplified_${articleId}`) === "1"
    setHasWitnessed(witnessed)
    setAmplified(amplifiedSaved)
  }, [articleId])

  async function handleWitness(e: React.MouseEvent) {
    e.stopPropagation()
    if (!keyHex) { router.push("/auth/login"); return }
    if (isOwnArticle || hasWitnessed || isWitnessing) return
    setIsWitnessing(true)
    const res = await witnessArticle(articleId, authorPubkey, keyHex)
    if (res.ok) {
      setHasWitnessed(true)
      setWitnessCount((n) => n + 1)
      localStorage.setItem(`witnessed_${articleId}`, "1")
    }
    setIsWitnessing(false)
  }

  async function handleAmplify(e: React.MouseEvent) {
    e.stopPropagation()
    if (!keyHex) { router.push("/auth/login"); return }
    if (isOwnArticle || amplified || isAmplifying) return
    setIsAmplifying(true)
    const res = await amplifyArticle(articleId, authorPubkey, articleContent, keyHex)
    if (res.ok) {
      setAmplified(true)
      localStorage.setItem(`amplified_${articleId}`, "1")
    }
    setIsAmplifying(false)
  }

  async function handleWatch(e: React.MouseEvent) {
    e.stopPropagation()
    if (!keyHex) { router.push("/auth/login"); return }
    if (isTogglingWatch) return
    setIsTogglingWatch(true)
    const next = !isWatching
    const res = await setWatching(articleId, next, watchList, keyHex)
    if (res.ok) {
      setIsWatching(next)
      setWatchList(next ? [...watchList, articleId] : watchList.filter((id) => id !== articleId))
    }
    setIsTogglingWatch(false)
  }

  const isOwnArticle = userPubkey === authorPubkey

  return (
    <div className="mt-3 flex items-center gap-1.5 border-t border-zinc-800/50 pt-3" onClick={(e) => e.stopPropagation()}>

      {/* Witness — redirects to login if not logged in */}
      <button
        onClick={handleWitness}
        disabled={isOwnArticle || isWitnessing}
        title={
          !keyHex ? "Log in to Witness this story"
          : isOwnArticle ? "Cannot Witness your own story"
          : hasWitnessed ? "You have witnessed this"
          : "Witness this truth"
        }
        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
          hasWitnessed
            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
            : !keyHex
            ? "border border-zinc-800 text-zinc-600 hover:border-violet-500/40 hover:text-violet-500 cursor-pointer"
            : "border border-zinc-800 text-zinc-500 hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-400"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <span>👁️</span>
        <span>{!keyHex ? "Witness" : "Witness"}</span>
        {witnessCount > 0 && <span className="ml-0.5 text-[10px] opacity-70">{witnessCount}</span>}
      </button>

      {/* Amplify — redirects to login if not logged in */}
      <button
        onClick={handleAmplify}
        disabled={isOwnArticle || isAmplifying}
        title={
          !keyHex ? "Log in to Amplify this story"
          : isOwnArticle ? "Cannot Amplify your own story"
          : amplified ? "Already amplified"
          : "Amplify this story"
        }
        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
          amplified
            ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
            : !keyHex
            ? "border border-zinc-800 text-zinc-600 hover:border-sky-500/40 hover:text-sky-500 cursor-pointer"
            : "border border-zinc-800 text-zinc-500 hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-400"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <span>🔊</span>
        <span>{isAmplifying ? "Amplifying…" : amplified ? "Amplified" : "Amplify"}</span>
      </button>

      {/* Watch — full toggle, redirects to login if not logged in */}
      <button
        onClick={handleWatch}
        disabled={isTogglingWatch}
        title={
          !keyHex ? "Log in to Watch this story"
          : isWatching ? "Click to Unwatch"
          : "Watch this story"
        }
        className={`group inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
          isWatching
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
            : !keyHex
            ? "border border-zinc-800 text-zinc-600 hover:border-amber-500/40 hover:text-amber-500 cursor-pointer"
            : "border border-zinc-800 text-zinc-500 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <span>{isWatching ? "🔖" : "🔖"}</span>
        <span>
          {isTogglingWatch ? "…" : isWatching ? (
            <>
              <span className="group-hover:hidden">Watching</span>
              <span className="hidden group-hover:inline">Unwatch</span>
            </>
          ) : "Watch"}
        </span>
      </button>

      {/* Protect (Lightning) — no login required, anyone can protect */}
      {lightningAddress && (
        <button
          onClick={(e) => { e.stopPropagation(); setZapOpen(true) }}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
          title="Protect this journalist with Bitcoin"
        >
          <span>🛡️</span>
          <span>Protect</span>
        </button>
      )}

      {/* Protect modal */}
      {zapOpen && lightningAddress && (
        <ProtectModal
          lightningAddress={lightningAddress}
          authorPubkey={authorPubkey}
          onClose={() => setZapOpen(false)}
        />
      )}
    </div>
  )
}

// ─── Protect Modal (renamed Zap) ─────────────────────────────────────────────

import { resolveLightningAddress, requestInvoice, ZAP_AMOUNTS_SATS } from "@/lib/lightning/lnurl"

type ProtectModalProps = {
  lightningAddress: string
  authorPubkey: string
  onClose: () => void
}

type ZapState = "idle" | "loading" | "invoice" | "copied" | "error"

function ProtectModal({ lightningAddress, onClose }: ProtectModalProps) {
  const [state, setState] = useState<ZapState>("idle")
  const [invoice, setInvoice] = useState("")
  const [selectedSats, setSelectedSats] = useState(21)
  const [errorMsg, setErrorMsg] = useState("")

  async function handleProtect(sats: number) {
    setSelectedSats(sats)
    setState("loading")
    setErrorMsg("")

    const payInfo = await resolveLightningAddress(lightningAddress)
    if (!payInfo.ok) {
      setState("error")
      setErrorMsg("Could not reach this journalist's Lightning wallet. Please try again.")
      return
    }

    const amountMsats = sats * 1000
    if (amountMsats < payInfo.value.minSendable || amountMsats > payInfo.value.maxSendable) {
      setState("error")
      setErrorMsg(`Amount must be between ${payInfo.value.minSendable / 1000} and ${payInfo.value.maxSendable / 1000} sats.`)
      return
    }

    const inv = await requestInvoice(payInfo.value.callback, amountMsats)
    if (!inv.ok) {
      setState("error")
      setErrorMsg("Failed to generate invoice. Please try again.")
      return
    }

    setInvoice(inv.value.pr)
    setState("invoice")
  }

  async function copyInvoice() {
    await navigator.clipboard.writeText(invoice).catch(() => {})
    setState("copied")
    setTimeout(() => setState("invoice"), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-2xl border border-zinc-800 bg-zinc-950 p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">🛡️ Protect this Journalist</h2>
            <p className="mt-0.5 font-mono text-xs text-zinc-500">{lightningAddress}</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">✕</button>
        </div>

        {state === "idle" && (
          <>
            <p className="mb-4 text-sm text-zinc-400">
              Send Bitcoin directly to this journalist. Instant. No bank. Your protection keeps them reporting.
            </p>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Choose an amount</p>
            <div className="grid grid-cols-5 gap-2">
              {ZAP_AMOUNTS_SATS.map((sats) => (
                <button
                  key={sats}
                  onClick={() => handleProtect(sats)}
                  className="flex flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-center transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10"
                >
                  <span className="text-xs font-bold text-white">{sats}</span>
                  <span className="text-[10px] text-zinc-600">sats</span>
                </button>
              ))}
            </div>
          </>
        )}

        {state === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-emerald-500" />
            <p className="text-sm text-zinc-400">Generating protection for {selectedSats} sats…</p>
          </div>
        )}

        {(state === "invoice" || state === "copied") && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Copy this invoice and paste it into any Lightning wallet (Alby, Zeus, Phoenix, Blink, etc.)
            </p>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <p className="break-all font-mono text-[10px] leading-relaxed text-zinc-500">
                {invoice.slice(0, 80)}…
              </p>
            </div>
            <button
              onClick={copyInvoice}
              className={`w-full rounded-xl py-3 font-bold transition-colors ${
                state === "copied" ? "bg-emerald-500 text-black" : "bg-emerald-600 text-white hover:bg-emerald-500"
              }`}
            >
              {state === "copied" ? "✓ Copied!" : "Copy Invoice"}
            </button>
            <a
              href={`lightning:${invoice}`}
              className="block text-center text-sm text-zinc-500 transition-colors hover:text-emerald-400"
            >
              Open in Lightning Wallet →
            </a>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm text-red-400">{errorMsg}</div>
            <button
              onClick={() => setState("idle")}
              className="w-full rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
            >
              Try Again
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-[10px] text-zinc-700">
          Powered by Lightning Network · Bitcoin · AfrikaPress takes no fees
        </p>
      </div>
    </div>
  )
}

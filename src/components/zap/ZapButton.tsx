"use client"

import { useState } from "react"
import { resolveLightningAddress, requestInvoice, ZAP_AMOUNTS_SATS } from "@/lib/lightning/lnurl"

type Props = {
  lightningAddress?: string
  authorPubkey: string
}

type ZapState = "idle" | "loading" | "invoice" | "copied" | "error"

export function ZapButton({ lightningAddress, authorPubkey }: Props) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<ZapState>("idle")
  const [invoice, setInvoice] = useState("")
  const [selectedSats, setSelectedSats] = useState(21)
  const [errorMsg, setErrorMsg] = useState("")

  // Don't render if the author has no lightning address
  if (!lightningAddress) return null

  async function handleZap(sats: number) {
    setSelectedSats(sats)
    setState("loading")
    setErrorMsg("")

    const payInfo = await resolveLightningAddress(lightningAddress!)
    if (!payInfo.ok) {
      setState("error")
      setErrorMsg("Could not reach this journalist's Lightning wallet. Please try again later.")
      return
    }

    const amountMsats = sats * 1000
    if (
      amountMsats < payInfo.value.minSendable ||
      amountMsats > payInfo.value.maxSendable
    ) {
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
    try {
      await navigator.clipboard.writeText(invoice)
      setState("copied")
      setTimeout(() => setState("invoice"), 2000)
    } catch {
      // Fallback: select the text
    }
  }

  function close() {
    setOpen(false)
    setState("idle")
    setInvoice("")
    setErrorMsg("")
  }

  return (
    <>
      {/* Zap button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
        title="Send a Bitcoin tip to this journalist"
      >
        ⚡ Zap
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          onClick={close}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl border border-zinc-800 bg-zinc-950 p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">⚡ Zap this Journalist</h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {lightningAddress}
                </p>
              </div>
              <button onClick={close} className="text-zinc-600 hover:text-zinc-400">✕</button>
            </div>

            {state === "idle" && (
              <>
                <p className="mb-4 text-sm text-zinc-400">
                  Send Bitcoin directly to this journalist via the Lightning Network.
                  Instant. No bank. No middleman.
                </p>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Choose an amount
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {ZAP_AMOUNTS_SATS.map((sats) => (
                    <button
                      key={sats}
                      onClick={() => handleZap(sats)}
                      className="flex flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-center transition-colors hover:border-amber-500/50 hover:bg-amber-500/10"
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
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-amber-500" />
                <p className="text-sm text-zinc-400">Generating invoice for {selectedSats} sats…</p>
              </div>
            )}

            {(state === "invoice" || state === "copied") && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-400">
                  Copy this invoice and paste it into any Lightning wallet (Alby, Zeus, Phoenix, Wallet of Satoshi, etc.)
                </p>

                {/* Invoice string */}
                <div className="relative rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                  <p className="break-all font-mono text-[10px] text-zinc-500 leading-relaxed">
                    {invoice.slice(0, 80)}…
                  </p>
                </div>

                <button
                  onClick={copyInvoice}
                  className={`w-full rounded-xl py-3 font-bold transition-colors ${
                    state === "copied"
                      ? "bg-emerald-500 text-black"
                      : "bg-amber-500 text-black hover:bg-amber-400"
                  }`}
                >
                  {state === "copied" ? "✓ Copied!" : "Copy Invoice"}
                </button>

                {/* Open in wallet link (works on mobile) */}
                <a
                  href={`lightning:${invoice}`}
                  className="block text-center text-sm text-zinc-500 hover:text-amber-400 transition-colors"
                >
                  Open in Lightning Wallet →
                </a>
              </div>
            )}

            {state === "error" && (
              <div className="space-y-4">
                <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm text-red-400">
                  {errorMsg}
                </div>
                <button
                  onClick={() => setState("idle")}
                  className="w-full rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
                >
                  Try Again
                </button>
              </div>
            )}

            <p className="mt-4 text-center text-[10px] text-zinc-700">
              Powered by the Lightning Network · Bitcoin · No fees to AfrikaPress
            </p>
          </div>
        </div>
      )}
    </>
  )
}

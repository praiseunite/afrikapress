"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { verifyTimestamp } from "@/lib/openseal/verify"

type VerifyState = "idle" | "loading" | "verified" | "pending" | "error"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const [ticket, setTicket] = useState("")
  const [state, setState] = useState<VerifyState>("idle")
  const [blockHeight, setBlockHeight] = useState<number | null>(null)
  const [calendarUrl, setCalendarUrl] = useState("")
  const [errMsg, setErrMsg] = useState("")

  // Pre-fill from URL query parameter (?ticket=...)
  useEffect(() => {
    const t = searchParams.get("ticket")
    if (t) {
      setTicket(t)
    }
  }, [searchParams])

  async function handleVerify() {
    if (!ticket.trim()) return
    setState("loading")
    setErrMsg("")
    setBlockHeight(null)
    setCalendarUrl("")

    const res = await verifyTimestamp(ticket.trim())

    if (!res.ok) {
      setState("error")
      setErrMsg(
        res.error === "invalid_ticket"
          ? "That does not look like a valid OTS proof. Make sure you copied the full proof from the article."
          : "Could not reach the Bitcoin calendar servers. Please try again in a moment."
      )
      return
    }

    if (res.value.status === "pending") {
      setState("pending")
    } else {
      setState("verified")
      setBlockHeight(res.value.blockHeight ?? null)
      setCalendarUrl(res.value.calendarUrl ?? "")
    }
  }

  // Auto-verify if ticket was passed in URL
  useEffect(() => {
    const t = searchParams.get("ticket")
    if (t && t.length > 20) {
      setTicket(t)
      // Small delay to let state settle before verifying
      setTimeout(() => {
        setState("loading")
        verifyTimestamp(t.trim()).then((res) => {
          if (!res.ok) {
            setState("error")
            setErrMsg("Could not verify this proof. The calendars may be temporarily unreachable.")
            return
          }
          if (res.value.status === "pending") {
            setState("pending")
          } else {
            setState("verified")
            setBlockHeight(res.value.blockHeight ?? null)
            setCalendarUrl(res.value.calendarUrl ?? "")
          }
        })
      }, 300)
    }
  }, [])  // eslint-disable-line

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Verify Evidence</h1>
        <p className="mt-2 text-zinc-400">
          Paste an OTS proof from any article to confirm when it was anchored to the Bitcoin blockchain.
          This works independently of AfrikaPress — you are checking directly against Bitcoin.
        </p>
      </div>

      {/* Input area */}
      <div className="flex flex-col gap-3">
        <textarea
          value={ticket}
          onChange={(e) => setTicket(e.target.value)}
          placeholder="Paste the base64 OTS proof here…"
          rows={4}
          className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 font-mono text-xs text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
        <button
          onClick={handleVerify}
          disabled={!ticket.trim() || state === "loading"}
          className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-40"
        >
          {state === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              Checking Bitcoin calendar servers…
            </span>
          ) : (
            "Verify Bitcoin Timestamp"
          )}
        </button>
      </div>

      {/* Result panels */}
      <div className="mt-8">
        {state === "verified" && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl">
              ✓
            </div>
            <h2 className="text-center text-lg font-bold text-emerald-400">
              Cryptographically Verified
            </h2>
            {blockHeight && (
              <p className="mt-2 text-center text-sm font-mono text-emerald-500/80">
                Bitcoin Block #{blockHeight.toLocaleString()}
              </p>
            )}
            <p className="mt-3 text-center text-sm text-emerald-500/70">
              This content existed before Bitcoin block #{blockHeight?.toLocaleString() ?? "confirmed"}.
              It is mathematically impossible for this text to have been altered after that block was mined.
            </p>
            {calendarUrl && (
              <p className="mt-3 text-center text-xs text-zinc-600">
                Verified via {calendarUrl}
              </p>
            )}
          </div>
        )}

        {state === "pending" && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-500 text-2xl text-amber-500">
              ⏳
            </div>
            <h2 className="text-lg font-bold text-amber-400">Timestamp Pending</h2>
            <p className="mt-2 text-sm text-amber-500/80">
              This proof has been submitted to the Bitcoin calendar but has not yet been included in a block.
              Bitcoin blocks are mined roughly every 10 minutes. Check back in a few hours.
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="text-center text-sm font-medium text-red-400">{errMsg}</p>
          </div>
        )}
      </div>

      {/* Explainer */}
      <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 text-sm text-zinc-500">
        <p className="mb-2 font-semibold text-zinc-400">How this works</p>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>When an article is published on AfrikaPress, its SHA-256 hash is submitted to the OpenTimestamps network</li>
          <li>The calendar aggregates thousands of these hashes into a single Bitcoin transaction</li>
          <li>Once mined into a block, the proof is permanently part of the Bitcoin blockchain</li>
          <li>This page checks the live Bitcoin calendar servers — AfrikaPress is not involved in the verification</li>
        </ol>
      </div>
    </div>
  )
}

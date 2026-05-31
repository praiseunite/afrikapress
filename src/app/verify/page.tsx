"use client"

import { useState } from "react"
import { verifyTimestamp } from "@/lib/openseal/verify"

type VerifyState = "idle" | "loading" | "verified" | "pending" | "error"

export default function VerifyPage() {
  const [ticket, setTicket] = useState("")
  const [state, setState] = useState<VerifyState>("idle")
  const [blockHeight, setBlockHeight] = useState<number | null>(null)
  const [errMsg, setErrMsg] = useState("")

  async function handleVerify() {
    if (!ticket.trim()) return
    
    setState("loading")
    setErrMsg("")
    setBlockHeight(null)

    const res = await verifyTimestamp(ticket.trim())
    
    if (!res.ok) {
      setState("error")
      setErrMsg(res.error === "invalid_ticket" ? "That doesn't look like a valid OpenSeal ticket." : "Could not connect to verification server.")
      return
    }

    if (res.value.status === "pending") {
      setState("pending")
    } else {
      setState("verified")
      setBlockHeight(res.value.blockHeight || null)
    }
  }

  return (
    <div className="mx-auto max-w-xl p-4 pt-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Verify Evidence</h1>
        <p className="mt-2 text-zinc-400">
          Paste an OpenSeal ticket to prove when this content was published on the Bitcoin blockchain.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <textarea
          value={ticket}
          onChange={(e) => setTicket(e.target.value)}
          placeholder="Paste base64 OpenSeal ticket here..."
          rows={4}
          className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        />

        <button
          onClick={handleVerify}
          disabled={!ticket.trim() || state === "loading"}
          className="w-full rounded-xl bg-zinc-100 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {state === "loading" ? "Verifying with Bitcoin Network..." : "Verify Timestamp"}
        </button>
      </div>

      <div className="mt-8">
        {state === "verified" && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-2xl">
              ✓
            </div>
            <h2 className="text-lg font-bold text-emerald-400">Cryptographically Verified</h2>
            <p className="mt-1 text-sm text-emerald-500/80">
              This content existed before Bitcoin Block #{blockHeight}. It is mathematically impossible to have been altered.
            </p>
          </div>
        )}

        {state === "pending" && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-500 text-2xl text-amber-500">
              ⏳
            </div>
            <h2 className="text-lg font-bold text-amber-400">Timestamp Pending</h2>
            <p className="mt-1 text-sm text-amber-500/80">
              This ticket has been submitted to the calendar server but hasn't been anchored in a Bitcoin block yet. Check back in a few hours.
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
            <p className="text-sm font-medium text-red-400">{errMsg}</p>
          </div>
        )}
      </div>
    </div>
  )
}

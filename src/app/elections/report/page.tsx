"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadSession } from "@/lib/auth/session"
import { publishElectionResult } from "@/lib/nostr/publish-result"

type Party = { id: number; name: string; votes: string }

export default function ReportPage() {
  const router = useRouter()
  const [keyHex, setKeyHex] = useState<string | null>(null)

  // Form state
  const [country, setCountry] = useState("")
  const [region, setRegion] = useState("")
  const [ward, setWard] = useState("")
  const [pollingUnit, setPollingUnit] = useState("")
  const [parties, setParties] = useState<Party[]>([
    { id: 1, name: "", votes: "" },
    { id: 2, name: "", votes: "" },
  ])
  const [sealOnBitcoin, setSealOnBitcoin] = useState(true)

  // Submission state
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const key = loadSession()
    if (!key) {
      router.push("/auth/login")
    } else {
      setKeyHex(key)
    }
  }, [router])

  function addParty() {
    setParties((prev) => [...prev, { id: Date.now(), name: "", votes: "" }])
  }

  function removeParty(id: number) {
    if (parties.length <= 2) return
    setParties((prev) => prev.filter((p) => p.id !== id))
  }

  function updateParty(id: number, field: "name" | "votes", value: string) {
    setParties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!keyHex) return

    const parsedParties = parties
      .filter((p) => p.name.trim())
      .map((p) => ({ party: p.name.trim(), votes: parseInt(p.votes || "0", 10) }))

    if (!country.trim() || !region.trim() || !pollingUnit.trim() || parsedParties.length < 1) {
      setErrorMsg("Please fill in Country, Region, Polling Unit, and at least one party.")
      setStatus("error")
      return
    }

    setStatus("submitting")
    setErrorMsg("")

    const res = await publishElectionResult({
      country,
      region,
      ward,
      pollingUnit,
      parties: parsedParties,
      keyHex,
      sealOnBitcoin,
    })

    if (res.ok) {
      setStatus("success")
      setTimeout(() => router.push("/elections"), 2500)
    } else {
      setStatus("error")
      setErrorMsg(
        res.error === "relay_unreachable"
          ? "Could not connect to the network. Please try again."
          : res.error === "seal_failed"
          ? "Result submitted but Bitcoin sealing failed. Try again with sealing unchecked."
          : "Missing required fields."
      )
    }
  }

  if (!keyHex) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="mb-6">
          <button
            onClick={() => router.push("/elections")}
            className="mb-4 text-sm text-zinc-500 hover:text-emerald-500 transition-colors"
          >
            ← Back to Election Watch
          </button>
          <h1 className="text-2xl font-extrabold text-white">Submit Polling Unit Result</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Your submission will be permanently signed with your key and anchored to the Bitcoin blockchain.
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl">✓</div>
            <h2 className="text-xl font-bold text-emerald-400">Result Submitted!</h2>
            <p className="mt-2 text-sm text-emerald-400/80">
              {sealOnBitcoin
                ? "Your result has been signed and anchored to the Bitcoin blockchain. It can never be altered."
                : "Your result has been published to the decentralised network."}
            </p>
            <p className="mt-3 text-xs text-zinc-500">Redirecting to Election Watch…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Location fields */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Location</h2>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">Country *</label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Nigeria"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">State / Region *</label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Lagos"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">Ward</label>
                <input
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="e.g. Ward 3"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">Polling Unit Number *</label>
                <input
                  value={pollingUnit}
                  onChange={(e) => setPollingUnit(e.target.value)}
                  placeholder="e.g. PU/01/12/08/025"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Party results */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Party Results</h2>

              {parties.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-2">
                  <input
                    value={p.name}
                    onChange={(e) => updateParty(p.id, "name", e.target.value)}
                    placeholder={`Party ${idx + 1} (e.g. LP)`}
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                  />
                  <input
                    value={p.votes}
                    onChange={(e) => updateParty(p.id, "votes", e.target.value.replace(/\D/g, ""))}
                    placeholder="Votes"
                    className="w-24 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                  />
                  {parties.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeParty(p.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addParty}
                className="w-full rounded-lg border border-dashed border-zinc-700 py-2 text-sm text-zinc-500 hover:border-emerald-500 hover:text-emerald-500 transition-colors"
              >
                + Add another party
              </button>
            </div>

            {/* Bitcoin seal option */}
            <div
              onClick={() => setSealOnBitcoin(!sealOnBitcoin)}
              className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${
                sealOnBitcoin
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-zinc-700 bg-zinc-900"
              }`}
            >
              <div
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  sealOnBitcoin ? "border-emerald-500 bg-emerald-500" : "border-zinc-600"
                }`}
              >
                {sealOnBitcoin && <span className="text-xs font-bold text-black">✓</span>}
              </div>
              <div>
                <p className="font-semibold text-white">🔒 Seal on Bitcoin</p>
                <p className="text-xs text-zinc-400">
                  Anchors a cryptographic proof of this result to the Bitcoin blockchain via OpenTimestamps. 
                  Free. Cannot be reversed. Makes tampering mathematically impossible.
                </p>
              </div>
            </div>

            {/* Error message */}
            {status === "error" && (
              <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{errorMsg}</div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-xl bg-emerald-500 py-3.5 font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-50"
            >
              {status === "submitting"
                ? sealOnBitcoin
                  ? "Signing & Anchoring to Bitcoin…"
                  : "Publishing to Network…"
                : "Submit Result"}
            </button>

            <p className="text-center text-xs text-zinc-600">
              Your submission is cryptographically signed with your private key.
              No personal data is stored.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

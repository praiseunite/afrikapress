"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchElectionResults, type ElectionResult } from "@/lib/nostr/fetch-results"
import { ResultCard } from "@/components/elections/ResultCard"

export default function ElectionsPage() {
  const [results, setResults] = useState<ElectionResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const res = await fetchElectionResults(50)
      if (res.ok) {
        setResults(res.value)
      } else {
        setError("Could not fetch results from the network. Please try again.")
      }
      setIsLoading(false)
    }
    load()
  }, [])

  // Aggregate totals across all submitted results by party
  const aggregated: Record<string, number> = {}
  results.forEach((r) => {
    r.parties.forEach((p) => {
      aggregated[p.party] = (aggregated[p.party] ?? 0) + p.votes
    })
  })
  const sortedParties = Object.entries(aggregated).sort((a, b) => b[1] - a[1])
  const grandTotal = sortedParties.reduce((s, [, v]) => s + v, 0)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-10">

        {/* Page header */}
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live · Decentralised · Bitcoin-Anchored
          </div>
          <h1 className="text-3xl font-extrabold text-white">Election Watch</h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Every result submitted by citizens is cryptographically signed and permanently
            anchored to the Bitcoin blockchain. No government or court can alter these records.
          </p>
        </div>

        {/* Call to action */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/elections/report"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black transition-transform hover:scale-105 hover:bg-emerald-400"
          >
            🗳️ Submit a Polling Unit Result
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Aggregated tally panel */}
        {sortedParties.length > 0 && (
          <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">
              📊 Aggregated Tally ({results.length} Polling Units Reported)
            </h2>
            <div className="space-y-3">
              {sortedParties.map(([party, votes], idx) => {
                const pct = grandTotal > 0 ? Math.round((votes / grandTotal) * 100) : 0
                return (
                  <div key={party}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className={`font-bold ${idx === 0 ? "text-emerald-400" : "text-zinc-300"}`}>
                        {idx === 0 && "🏆 "}{party}
                      </span>
                      <span className="text-zinc-400">
                        {votes.toLocaleString()} votes ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0 ? "bg-emerald-500" : "bg-zinc-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-xs text-zinc-600">
              Total votes across all reported polling units: {grandTotal.toLocaleString()} ·
              All results independently verifiable on the Bitcoin blockchain
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-emerald-500" />
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="rounded-xl bg-red-500/10 p-4 text-center text-red-400">{error}</div>
        )}

        {/* Empty state */}
        {!isLoading && !error && results.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <p className="text-2xl">🗳️</p>
            <p className="mt-2 font-semibold text-white">No results submitted yet</p>
            <p className="mt-1 text-sm text-zinc-400">
              Be the first to submit a polling unit result. Every submission is permanent and Bitcoin-anchored.
            </p>
            <Link
              href="/elections/report"
              className="mt-4 inline-block rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-black hover:bg-emerald-400"
            >
              Submit First Result →
            </Link>
          </div>
        )}

        {/* Results grid */}
        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {results.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        )}

        {/* How it works footer */}
        <div className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-3 font-bold text-white">How This Cannot Be Falsified</h3>
          <div className="grid grid-cols-1 gap-4 text-sm text-zinc-400 sm:grid-cols-3">
            <div>
              <p className="mb-1 font-semibold text-emerald-400">1. Citizen Signs It</p>
              <p>Every result is signed with the submitter's cryptographic private key. Forgeries are mathematically detectable.</p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-emerald-400">2. Bitcoin Anchors It</p>
              <p>The content hash is permanently embedded in the Bitcoin blockchain. No court order can alter a confirmed block.</p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-emerald-400">3. World Can Verify It</p>
              <p>Anyone with internet access can independently recalculate the result from raw data. No trust required.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

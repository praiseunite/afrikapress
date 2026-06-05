import type { ElectionResult } from "@/lib/nostr/fetch-results"

const timeAgo = (unix: number): string => {
  const seconds = Math.floor(Date.now() / 1000) - unix
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const totalVotes = (parties: { votes: number }[]) =>
  parties.reduce((sum, p) => sum + p.votes, 0)

type Props = { result: ElectionResult }

export function ResultCard({ result }: Props) {
  const total = totalVotes(result.parties)
  const leading = result.parties.reduce(
    (best, p) => (p.votes > best.votes ? p : best),
    result.parties[0] ?? { party: "N/A", votes: 0 }
  )

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-500">
            {result.country} · {result.region}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-white">
            PU: {result.pollingUnit}
          </p>
          {result.ward && (
            <p className="text-xs text-zinc-500">Ward: {result.ward}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {result.isSealed ? (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-medium text-emerald-500 border border-emerald-500/20">
              🔒 Bitcoin Sealed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
              Pending Seal
            </span>
          )}
          <span className="text-xs text-zinc-600">{timeAgo(result.created_at)}</span>
        </div>
      </div>

      {/* Party results */}
      {result.parties.length > 0 && (
        <div className="space-y-2">
          {result.parties.map((p) => {
            const pct = total > 0 ? Math.round((p.votes / total) * 100) : 0
            const isLeading = p.party === leading.party
            return (
              <div key={p.party}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isLeading ? "text-emerald-400" : "text-zinc-300"}`}>
                    {p.party} {isLeading && "🏆"}
                  </span>
                  <span className="text-zinc-400">
                    {p.votes.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isLeading ? "bg-emerald-500" : "bg-zinc-600"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
          <p className="mt-2 text-right text-xs text-zinc-600">
            Total votes counted: {total.toLocaleString()}
          </p>
        </div>
      )}

      {/* Reporter pubkey */}
      <p className="mt-3 font-mono text-xs text-zinc-700">
        Reported by: {result.pubkey.slice(0, 12)}…
      </p>
    </div>
  )
}

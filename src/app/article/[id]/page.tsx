"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchArticleById } from "@/lib/nostr/fetch-article"
import { hashContent } from "@/lib/openseal/stamp"
import type { ArticleEvent } from "@/lib/types/nostr"
import Link from "next/link"

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [article, setArticle] = useState<ArticleEvent | null>(null)
  const [contentHash, setContentHash] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Evidence modal
  const [showEvidence, setShowEvidence] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedProof, setCopiedProof] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id) return
      const res = await fetchArticleById(id)
      if (res.ok) {
        setArticle(res.value)
        setContentHash(hashContent(res.value.content))
      } else {
        setError("Could not find this article. It may have been deleted or the network is unreachable.")
      }
      setIsLoading(false)
    }
    load()
  }, [id])

  // Close modal on Escape key
  useEffect(() => {
    if (!showEvidence) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowEvidence(false) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [showEvidence])

  async function copy(text: string, which: "hash" | "proof") {
    await navigator.clipboard.writeText(text).catch(() => {})
    if (which === "hash") {
      setCopiedHash(true)
      setTimeout(() => setCopiedHash(false), 2000)
    } else {
      setCopiedProof(true)
      setTimeout(() => setCopiedProof(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-emerald-500" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-2xl p-4 pt-12 text-center">
        <div className="rounded-xl bg-red-500/10 p-6 text-red-400">{error}</div>
        <button onClick={() => router.push("/feed")} className="mt-6 font-semibold text-emerald-500 hover:text-emerald-400">
          ← Back to Feed
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-zinc-300">
      <Link href="/feed" className="mb-8 inline-block font-semibold text-zinc-500 hover:text-emerald-500 transition-colors">
        ← Back to News
      </Link>

      <article>
        {/* Header */}
        <header className="mb-10">
          <h1 className="mb-4 text-4xl font-extrabold leading-tight text-white">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <time dateTime={new Date(article.created_at * 1000).toISOString()}>
              {new Date(article.created_at * 1000).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </time>
            <span>·</span>
            <Link href={`/profile/${article.pubkey}`} className="truncate font-mono hover:text-emerald-400 transition-colors">
              {article.pubkey.slice(0, 12)}…
            </Link>
            {article.isSealed && (
              <span className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs text-emerald-500">
                🔒 Sealed on Bitcoin
              </span>
            )}
          </div>
        </header>

        {/* Article body */}
        <div className="prose prose-invert prose-emerald max-w-none text-lg leading-relaxed">
          {article.content.split("\n").map((paragraph, idx) =>
            paragraph.trim() ? <p key={idx} className="mb-6">{paragraph}</p> : null
          )}
        </div>

        {/* ── Footer bar ────────────────────────────────────────────────── */}
        <footer className="mt-16 flex items-center justify-between border-t border-zinc-800 pt-6">
          <Link href="/feed" className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
            ← Back to News
          </Link>

          {/* Evidence button */}
          <button
            onClick={() => setShowEvidence(true)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
              article.isSealed
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                : "border-zinc-700 bg-zinc-900 text-zinc-500 hover:bg-zinc-800"
            }`}
            title="View cryptographic evidence"
          >
            {article.isSealed ? "🔒" : "🔍"}
            <span>{article.isSealed ? "Bitcoin Proof" : "Content Hash"}</span>
            <span className="opacity-50">↗</span>
          </button>
        </footer>
      </article>

      {/* ── Evidence Modal ────────────────────────────────────────────────── */}
      {showEvidence && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center p-4"
          onClick={() => setShowEvidence(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Cryptographic Evidence</h2>
                <p className="mt-0.5 text-xs text-zinc-500">Verify this article has not been altered</p>
              </div>
              <button
                onClick={() => setShowEvidence(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* SHA-256 hash */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="mb-1 text-xs font-semibold text-zinc-400">SHA-256 Content Hash</p>
                <p className="mb-3 text-[11px] text-zinc-600">
                  Fingerprint of this article. Changes if even one character is altered.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 overflow-x-auto rounded-lg border border-zinc-800 bg-black px-3 py-2">
                    <p className="whitespace-nowrap font-mono text-[11px] text-emerald-400">{contentHash}</p>
                  </div>
                  <button
                    onClick={() => copy(contentHash, "hash")}
                    className={`flex-shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                      copiedHash ? "bg-emerald-500 text-black" : "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {copiedHash ? "✓" : "Copy"}
                  </button>
                </div>
              </div>

              {/* OTS proof */}
              {article.isSealed && article.otsProof ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/40 p-4">
                  <p className="mb-1 text-xs font-semibold text-emerald-400">🔒 Bitcoin Timestamp Proof (OTS)</p>
                  <p className="mb-3 text-[11px] text-zinc-500">
                    Links the hash above to a specific Bitcoin block.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 overflow-x-auto rounded-lg border border-emerald-500/20 bg-black px-3 py-2">
                      <p className="whitespace-nowrap font-mono text-[11px] text-emerald-600">
                        {article.otsProof.slice(0, 80)}…
                      </p>
                    </div>
                    <button
                      onClick={() => copy(article.otsProof!, "proof")}
                      className={`flex-shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                        copiedProof ? "bg-emerald-500 text-black" : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {copiedProof ? "✓" : "Copy"}
                    </button>
                  </div>

                  {/* Verify buttons */}
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={`/verify?ticket=${encodeURIComponent(article.otsProof)}`}
                      onClick={() => setShowEvidence(false)}
                      className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-center text-sm font-bold text-black hover:bg-emerald-400 transition-colors"
                    >
                      ✓ Verify on Bitcoin →
                    </Link>
                    <a
                      href="https://opentimestamps.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-center text-sm font-semibold text-zinc-400 hover:bg-zinc-800 transition-colors"
                    >
                      opentimestamps.org ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-center text-xs text-zinc-500">
                  This article was published without a Bitcoin seal. The content hash above still proves the text has not changed.
                </div>
              )}

              {/* How it works — collapsible */}
              <details className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                <summary className="cursor-pointer text-xs font-semibold text-zinc-500 hover:text-zinc-300">
                  How to verify without trusting AfrikaPress
                </summary>
                <ol className="mt-3 list-inside list-decimal space-y-1.5 text-xs text-zinc-600">
                  <li>Copy the article text and run <code className="rounded bg-zinc-800 px-1 text-emerald-500">sha256sum</code> on it</li>
                  <li>The result must match the hash above — any difference means the text was altered</li>
                  <li>Copy the OTS proof and paste it into the Verify page or opentimestamps.org</li>
                  <li>The result shows the Bitcoin block — that block date proves when this article existed</li>
                </ol>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedProof, setCopiedProof] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id) return
      setIsLoading(true)
      const res = await fetchArticleById(id)
      if (res.ok) {
        setArticle(res.value)
        // Compute the SHA-256 hash of the article content right in the browser
        setContentHash(hashContent(res.value.content))
      } else {
        setError("Could not find this article. It may have been deleted or the network is unreachable.")
      }
      setIsLoading(false)
    }
    load()
  }, [id])

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
        <button
          onClick={() => router.push("/feed")}
          className="mt-6 font-semibold text-emerald-500 hover:text-emerald-400"
        >
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
              {new Date(article.created_at * 1000).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span>·</span>
            <Link
              href={`/profile/${article.pubkey}`}
              className="truncate font-mono hover:text-emerald-400 transition-colors"
            >
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

        {/* ── Cryptographic Evidence Panel ───────────────────────────────── */}
        <div className="mt-16 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
              Cryptographic Evidence
            </p>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* SHA-256 Content Hash */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="mb-1 font-semibold text-white">SHA-256 Content Hash</p>
            <p className="mb-3 text-xs text-zinc-500">
              This is the fingerprint of this article. If even one character is changed,
              this hash will be completely different. Anyone can recalculate it and check it matches.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-x-auto rounded-lg border border-zinc-800 bg-black p-3">
                <p className="break-all font-mono text-xs text-emerald-400">{contentHash}</p>
              </div>
              <button
                onClick={() => copy(contentHash, "hash")}
                className={`flex-shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  copiedHash
                    ? "bg-emerald-500 text-black"
                    : "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {copiedHash ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* OTS Bitcoin Timestamp Proof */}
          {article.isSealed && article.otsProof ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-5">
              <p className="mb-1 font-semibold text-white">🔒 Bitcoin Timestamp Proof (OTS)</p>
              <p className="mb-3 text-xs text-zinc-500">
                This proof links the content hash above to a specific Bitcoin block.
                Copy it and paste it on the Verify page to confirm the exact block and timestamp.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 overflow-x-auto rounded-lg border border-emerald-500/20 bg-black p-3">
                  <p className="break-all font-mono text-[10px] leading-relaxed text-emerald-600">
                    {article.otsProof.slice(0, 120)}
                    {article.otsProof.length > 120 && "…"}
                  </p>
                </div>
                <button
                  onClick={() => copy(article.otsProof!, "proof")}
                  className={`flex-shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    copiedProof
                      ? "bg-emerald-500 text-black"
                      : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  {copiedProof ? "✓ Copied" : "Copy"}
                </button>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/verify?ticket=${encodeURIComponent(article.otsProof)}`}
                  className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-center text-sm font-bold text-black transition-colors hover:bg-emerald-400"
                >
                  ✓ Verify on Bitcoin →
                </Link>
                <a
                  href="https://opentimestamps.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-center text-sm font-semibold text-zinc-400 transition-colors hover:bg-zinc-800"
                >
                  Verify at opentimestamps.org ↗
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 text-center">
              <p className="text-sm text-zinc-500">
                This article was published without a Bitcoin seal. The content hash above can still
                be used to verify that the text has not been altered since you read it.
              </p>
            </div>
          )}

          {/* Manual verification guide */}
          <details className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-zinc-400 hover:text-zinc-200">
              How to verify this without trusting AfrikaPress
            </summary>
            <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-zinc-500">
              <li>Copy the article text exactly as written above</li>
              <li>
                Run{" "}
                <code className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-xs text-emerald-400">
                  sha256sum
                </code>{" "}
                on it, or paste it into any SHA-256 calculator online
              </li>
              <li>
                The result must exactly match the hash shown above — any difference means the text was altered
              </li>
              <li>Copy the OTS proof and paste it into the Verify page or opentimestamps.org</li>
              <li>
                The result will show which Bitcoin block this hash was anchored to — that block&apos;s date
                proves when this article existed, permanently
              </li>
            </ol>
          </details>
        </div>
      </article>
    </div>
  )
}

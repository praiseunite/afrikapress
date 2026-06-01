"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchArticleById } from "@/lib/nostr/fetch-article"
import type { ArticleEvent } from "@/lib/types/nostr"
import Link from "next/link"

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [article, setArticle] = useState<ArticleEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      if (!id) return
      setIsLoading(true)
      const res = await fetchArticleById(id)
      if (res.ok) {
        setArticle(res.value)
      } else {
        setError("Could not find this article. It may have been deleted or the network is unreachable.")
      }
      setIsLoading(false)
    }
    load()
  }, [id])

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
        <header className="mb-10">
          <h1 className="mb-4 text-4xl font-extrabold text-white leading-tight">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <time dateTime={new Date(article.created_at * 1000).toISOString()}>
              {new Date(article.created_at * 1000).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            <span>•</span>
            <span className="truncate font-mono">By {article.pubkey.slice(0, 8)}...</span>
            
            {article.isSealed && (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-xs text-emerald-500 border border-emerald-500/20">
                🔒 Sealed on Bitcoin
              </span>
            )}
          </div>
        </header>

        <div className="prose prose-invert prose-emerald max-w-none text-lg leading-relaxed">
          {/* We are rendering plain text for now, but preserving newlines */}
          {article.content.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-6">{paragraph}</p>
          ))}
        </div>
        
        {article.isSealed && article.otsProof && (
          <div className="mt-16 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-sm">
            <h3 className="mb-2 font-bold text-white">Cryptographic Proof</h3>
            <p className="mb-4 text-zinc-400">
              This article was cryptographically anchored to the Bitcoin blockchain via OpenTimestamps. 
              The raw `.ots` proof signature is provided below. You can verify this independently at opentimestamps.org.
            </p>
            <div className="overflow-x-auto rounded border border-zinc-800 bg-black p-3 font-mono text-xs text-zinc-500">
              {article.otsProof}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}

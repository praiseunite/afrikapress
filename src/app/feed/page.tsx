"use client"

import { useEffect, useState } from "react"
import { fetchLatestArticles } from "@/lib/nostr/fetch-feed"
import { ArticleCard } from "@/components/feed/ArticleCard"
import type { ArticleEvent } from "@/lib/types/nostr"

export default function FeedPage() {
  const [articles, setArticles] = useState<ArticleEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadFeed() {
      setIsLoading(true)
      const res = await fetchLatestArticles(20)
      if (res.ok) {
        setArticles(res.value)
      } else {
        setError("Failed to load stories. Are you offline?")
      }
      setIsLoading(false)
    }

    loadFeed()
  }, [])

  return (
    <div className="mx-auto max-w-2xl p-4 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Latest Stories</h1>
      </div>

      {isLoading && (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-emerald-500" />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-center text-red-400">
          {error}
        </div>
      )}

      {!isLoading && !error && articles.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-zinc-400">No stories yet. Be the first to publish.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => {
              // Navigation to a specific article is a future feature, 
              // for the demo, just log it.
              console.log("Clicked article:", article.id)
            }}
          />
        ))}
      </div>
    </div>
  )
}

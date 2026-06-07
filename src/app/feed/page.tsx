"use client"

import { useEffect, useState } from "react"
import { useLocale } from "@/components/shared/LocaleProvider"
import { fetchLatestArticles } from "@/lib/nostr/fetch-feed"
import { fetchTrackingFeed, getTrackingList } from "@/lib/nostr/social"
import { ArticleCard } from "@/components/feed/ArticleCard"
import { loadSession } from "@/lib/auth/session"
import { getPublicKey } from "nostr-tools"
import type { ArticleEvent } from "@/lib/types/nostr"
import { useRouter } from "next/navigation"

type Tab = "all" | "tracking"

export default function FeedPage() {
  const { t } = useLocale()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("all")
  const [allArticles, setAllArticles] = useState<ArticleEvent[]>([])
  const [trackingArticles, setTrackingArticles] = useState<ArticleEvent[]>([])
  const [trackingList, setTrackingList] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTracking, setIsLoadingTracking] = useState(false)
  const [error, setError] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Load general feed immediately
  useEffect(() => {
    const key = loadSession()
    setIsLoggedIn(!!key)

    if (key) {
      const pub = getPublicKey(new Uint8Array(Buffer.from(key, "hex")))
      getTrackingList(pub).then(setTrackingList)
    }

    fetchLatestArticles(20).then((res) => {
      if (res.ok) setAllArticles(res.value)
      else setError(t.feed.error)
      setIsLoading(false)
    })
  }, [])

  // Load tracking feed when tab switches to "tracking"
  useEffect(() => {
    if (tab !== "tracking" || trackingArticles.length > 0) return

    setIsLoadingTracking(true)
    fetchTrackingFeed(trackingList).then((articles) => {
      setTrackingArticles(articles)
      setIsLoadingTracking(false)
    })
  }, [tab, trackingList])

  const activeArticles = tab === "all" ? allArticles : trackingArticles
  const activeLoading = tab === "all" ? isLoading : isLoadingTracking

  return (
    <div className="mx-auto max-w-2xl p-4 pt-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{t.feed.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Uncensorable stories from journalists worldwide · Sealed on Bitcoin
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
        <button
          onClick={() => setTab("all")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
            tab === "all"
              ? "bg-emerald-500 text-black shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          🌍 All Stories
        </button>
        <button
          onClick={() => {
            if (!isLoggedIn) {
              router.push("/auth/login")
              return
            }
            setTab("tracking")
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
            tab === "tracking"
              ? "bg-emerald-500 text-black shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          📡 Tracking
          {trackingList.length > 0 && (
            <span className="ml-1.5 rounded-full bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-300">
              {trackingList.length}
            </span>
          )}
        </button>
      </div>

      {/* Loading */}
      {activeLoading && (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-emerald-500" />
        </div>
      )}

      {/* Error */}
      {!activeLoading && error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-center text-red-400">
          {error}
        </div>
      )}

      {/* Empty — Tracking tab with no tracked journalists */}
      {!activeLoading && tab === "tracking" && trackingList.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
          <p className="text-2xl">📡</p>
          <p className="mt-2 font-semibold text-white">Not tracking anyone yet</p>
          <p className="mt-1 text-sm text-zinc-400">
            Click on an author's name in any article, then tap <strong>Track</strong> on their profile.
          </p>
        </div>
      )}

      {/* Empty — Tracking tab, journalists tracked but no articles */}
      {!activeLoading && tab === "tracking" && trackingList.length > 0 && trackingArticles.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
          <p className="text-2xl">🔍</p>
          <p className="mt-2 font-semibold text-white">No stories yet</p>
          <p className="mt-1 text-sm text-zinc-400">
            The {trackingList.length} journalist{trackingList.length !== 1 ? "s" : ""} you are tracking
            {trackingList.length !== 1 ? " have" : " has"} not published on AfrikaPress yet.
          </p>
        </div>
      )}

      {/* Empty — general feed */}
      {!activeLoading && !error && tab === "all" && allArticles.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-zinc-400">{t.feed.empty}</p>
        </div>
      )}

      {/* Articles */}
      {!activeLoading && activeArticles.length > 0 && (
        <div className="flex flex-col gap-4">
          {activeArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => { window.location.href = "/article/" + article.id }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

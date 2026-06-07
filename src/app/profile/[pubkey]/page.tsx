"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { loadSession } from "@/lib/auth/session"
import { getPublicKey } from "nostr-tools"
import {
  fetchJournalistProfile,
  fetchTrackerCount,
  getTrackingList,
  setTracking,
  type JournalistProfile,
} from "@/lib/nostr/social"
import { fetchLatestArticles } from "@/lib/nostr/fetch-feed"
import { ArticleCard } from "@/components/feed/ArticleCard"
import { ZapButton } from "@/components/zap/ZapButton"
import type { ArticleEvent } from "@/lib/types/nostr"

export default function JournalistProfilePage() {
  const params = useParams()
  const router = useRouter()
  const pubkey = params?.pubkey as string

  const [profile, setProfile] = useState<JournalistProfile | null>(null)
  const [articles, setArticles] = useState<ArticleEvent[]>([])
  const [trackerCount, setTrackerCount] = useState(0)
  const [isTracking, setIsTracking] = useState(false)
  const [trackingList, setTrackingList] = useState<string[]>([])
  const [isTogglingTrack, setIsTogglingTrack] = useState(false)
  const [keyHex, setKeyHex] = useState<string | null>(null)
  const [userPubkey, setUserPubkey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [zapOpen, setZapOpen] = useState(false)

  useEffect(() => {
    if (!pubkey) return

    const key = loadSession()
    if (key) {
      setKeyHex(key)
      const pub = getPublicKey(new Uint8Array(Buffer.from(key, "hex")))
      setUserPubkey(pub)

      // Load current tracking list
      getTrackingList(pub).then((list) => {
        setTrackingList(list)
        setIsTracking(list.includes(pubkey))
      })
    }

    // Load profile, articles, and tracker count in parallel
    Promise.all([
      fetchJournalistProfile(pubkey),
      fetchLatestArticles(20).then((res) =>
        res.ok ? res.value.filter((a) => a.pubkey === pubkey) : []
      ),
      fetchTrackerCount(pubkey),
    ]).then(([prof, arts, count]) => {
      setProfile(prof)
      setArticles(arts)
      setTrackerCount(count)
      setIsLoading(false)
    })
  }, [pubkey])

  async function handleTrackToggle() {
    if (!keyHex) { router.push("/auth/login"); return }
    if (isTogglingTrack) return
    setIsTogglingTrack(true)
    const next = !isTracking
    const res = await setTracking(pubkey, next, trackingList, keyHex)
    if (res.ok) {
      setIsTracking(next)
      setTrackerCount((c) => c + (next ? 1 : -1))
      setTrackingList(
        next ? [...trackingList, pubkey] : trackingList.filter((p) => p !== pubkey)
      )
    }
    setIsTogglingTrack(false)
  }

  const isOwnProfile = userPubkey === pubkey

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-2xl px-4 py-8">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-sm text-zinc-500 hover:text-emerald-500 transition-colors"
        >
          ← Back
        </button>

        {/* Profile header */}
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-zinc-700 bg-zinc-800">
              {profile?.picture ? (
                <Image
                  src={profile.picture}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">
                  🧑‍💼
                </div>
              )}
            </div>

            {/* Name + bio */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">
                {profile?.name}
              </h1>
              {profile?.nip05 && (
                <p className="text-xs text-emerald-400 mt-0.5">{profile.nip05}</p>
              )}
              {profile?.about && (
                <p className="mt-2 text-sm text-zinc-400 line-clamp-3">{profile.about}</p>
              )}

              {/* Stats row */}
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span>
                  <span className="font-bold text-white">{articles.length}</span>
                  <span className="ml-1 text-zinc-500">stories</span>
                </span>
                <span>
                  <span className="font-bold text-white">{trackerCount.toLocaleString()}</span>
                  <span className="ml-1 text-zinc-500">trackers</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {!isOwnProfile && (
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleTrackToggle}
                disabled={isTogglingTrack}
                className={`group flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                  isTracking
                    ? "border border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                    : !keyHex
                    ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-emerald-500 text-black hover:bg-emerald-400"
                } disabled:opacity-40`}
              >
                {isTogglingTrack ? "…" : isTracking ? (
                  <>
                    <span className="group-hover:hidden">📡 Tracking ✓</span>
                    <span className="hidden group-hover:inline">✕ Untrack</span>
                  </>
                ) : "📡 Track"}
              </button>

              {profile?.lightningAddress && (
                <button
                  onClick={() => setZapOpen(true)}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  🛡️ Protect
                </button>
              )}
            </div>
          )}

          {isOwnProfile && (
            <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-center text-xs text-zinc-500">
              This is your public journalist profile
            </div>
          )}

          {/* Public key */}
          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-2">
            <p className="break-all font-mono text-[10px] text-zinc-600">{pubkey}</p>
          </div>
        </div>

        {/* Articles section */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-white">
            Stories by {profile?.name}
          </h2>

          {articles.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-10 text-center">
              <p className="text-zinc-500">No stories published yet on AfrikaPress.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => router.push(`/article/${article.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Protect (Zap) modal */}
      {zapOpen && profile?.lightningAddress && (
        <ZapButton
          lightningAddress={profile.lightningAddress}
          authorPubkey={pubkey}
        />
      )}
    </div>
  )
}

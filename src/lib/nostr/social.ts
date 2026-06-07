import { NDKEvent } from "@nostr-dev-kit/ndk"
import { getNdk, connectToRelays } from "./relay-pool"
import { err, ok, type Result } from "@/lib/types/result"

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type SocialCounts = {
  witnesses: number   // kind 7 reactions
  amplifies: number   // kind 6 reposts
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

async function getSigner(keyHex: string) {
  const { NDKPrivateKeySigner } = await import("@nostr-dev-kit/ndk")
  const ndk = getNdk()
  const signer = new NDKPrivateKeySigner(keyHex)
  ndk.signer = signer
  return signer
}

async function publishEvent(
  kind: number,
  content: string,
  tags: string[][],
  keyHex: string
): Promise<Result<string, "relay_unreachable">> {
  await getSigner(keyHex)
  try {
    await connectToRelays()
  } catch {
    return err("relay_unreachable")
  }
  const ndk = getNdk()
  const event = new NDKEvent(ndk)
  event.kind = kind
  event.content = content
  event.tags = tags
  try {
    await Promise.race([
      event.publish(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
    ])
    return ok(event.id ?? "")
  } catch {
    return err("relay_unreachable")
  }
}

// ─── TRACK (Follow) — Kind 3 ──────────────────────────────────────────────────

/**
 * Returns the list of pubkeys the logged-in user currently tracks.
 */
export async function getTrackingList(userPubkey: string): Promise<string[]> {
  try {
    await connectToRelays()
    const ndk = getNdk()
    const events = await ndk.fetchEvents(
      { kinds: [3], authors: [userPubkey], limit: 1 },
      { groupable: false }
    )
    const latest = Array.from(events).sort((a, b) =>
      (b.created_at ?? 0) - (a.created_at ?? 0)
    )[0]
    if (!latest) return []
    return latest.tags
      .filter((t) => t[0] === "p")
      .map((t) => t[1])
      .filter(Boolean)
  } catch {
    return []
  }
}

/**
 * Adds or removes a journalist pubkey from the user's Track list.
 * Publishes a new Kind 3 event with the updated list.
 */
export async function setTracking(
  targetPubkey: string,
  isTracking: boolean,
  currentList: string[],
  keyHex: string
): Promise<Result<string, "relay_unreachable">> {
  const newList = isTracking
    ? [...new Set([...currentList, targetPubkey])]
    : currentList.filter((p) => p !== targetPubkey)

  const tags = newList.map((p) => ["p", p])
  return publishEvent(3, "", tags, keyHex)
}

// ─── WITNESS (React/Like) — Kind 7 ───────────────────────────────────────────

/**
 * Publishes a Kind 7 "Witness" reaction to an article event.
 */
export async function witnessArticle(
  articleId: string,
  articleAuthorPubkey: string,
  keyHex: string
): Promise<Result<string, "relay_unreachable">> {
  return publishEvent(
    7,
    "👁️",  // Custom AfrikaPress reaction emoji
    [
      ["e", articleId],
      ["p", articleAuthorPubkey],
    ],
    keyHex
  )
}

/**
 * Fetches the number of Witnesses (kind 7 reactions) for an article.
 */
export async function fetchWitnessCount(articleId: string): Promise<number> {
  try {
    await connectToRelays()
    const ndk = getNdk()
    const events = await Promise.race([
      ndk.fetchEvents({ kinds: [7], "#e": [articleId] }, { groupable: false }),
      new Promise<Set<NDKEvent>>((resolve) => setTimeout(() => resolve(new Set()), 3000)),
    ])
    return (events as Set<NDKEvent>).size
  } catch {
    return 0
  }
}

// ─── AMPLIFY (Repost) — Kind 6 ───────────────────────────────────────────────

/**
 * Publishes a Kind 6 "Amplify" repost of an article.
 * The content includes the original event JSON for relay compatibility.
 */
export async function amplifyArticle(
  articleId: string,
  articleAuthorPubkey: string,
  articleContent: string,
  keyHex: string
): Promise<Result<string, "relay_unreachable">> {
  return publishEvent(
    6,
    articleContent,
    [
      ["e", articleId, "", "mention"],
      ["p", articleAuthorPubkey],
    ],
    keyHex
  )
}

// ─── WATCH (Bookmark) — Kind 10003 ───────────────────────────────────────────

/**
 * Returns the list of article IDs the user has bookmarked (Watching).
 */
export async function getWatchList(userPubkey: string): Promise<string[]> {
  try {
    await connectToRelays()
    const ndk = getNdk()
    const events = await ndk.fetchEvents(
      { kinds: [10003], authors: [userPubkey], limit: 1 },
      { groupable: false }
    )
    const latest = Array.from(events).sort((a, b) =>
      (b.created_at ?? 0) - (a.created_at ?? 0)
    )[0]
    if (!latest) return []
    return latest.tags
      .filter((t) => t[0] === "e")
      .map((t) => t[1])
      .filter(Boolean)
  } catch {
    return []
  }
}

/**
 * Adds or removes an article from the user's Watch (bookmark) list.
 */
export async function setWatching(
  articleId: string,
  isWatching: boolean,
  currentList: string[],
  keyHex: string
): Promise<Result<string, "relay_unreachable">> {
  const newList = isWatching
    ? [...new Set([...currentList, articleId])]
    : currentList.filter((id) => id !== articleId)
  const tags = newList.map((id) => ["e", id])
  return publishEvent(10003, "", tags, keyHex)
}

// ─── FETCH TRACKING FEED ──────────────────────────────────────────────────────

/**
 * Fetches articles published by journalists the user is tracking.
 */
export async function fetchTrackingFeed(
  trackingList: string[],
  limit = 20
): Promise<import("@/lib/types/nostr").ArticleEvent[]> {
  if (trackingList.length === 0) return []
  try {
    await connectToRelays()
    const ndk = getNdk()
    const events = await Promise.race([
      ndk.fetchEvents(
        { kinds: [30023], authors: trackingList, "#t": ["afrikapress"], limit },
        { groupable: false }
      ),
      new Promise<Set<NDKEvent>>((resolve) => setTimeout(() => resolve(new Set()), 4000)),
    ])

    return Array.from(events as Set<NDKEvent>)
      .map((e) => {
        const titleTag = e.tags.find((t) => t[0] === "title")
        const otsTag = e.tags.find((t) => t[0] === "ots")
        return {
          id: e.id ?? "",
          pubkey: e.pubkey ?? "",
          created_at: e.created_at ?? 0,
          kind: 30023 as const,
          tags: e.tags ?? [],
          content: e.content ?? "",
          sig: "",
          title: titleTag ? titleTag[1] : "Untitled",
          isSealed: !!otsTag,
          otsProof: otsTag ? otsTag[1] : undefined,
        }
      })
      .sort((a, b) => b.created_at - a.created_at)
  } catch {
    return []
  }
}

// ─── JOURNALIST PROFILE ───────────────────────────────────────────────────────

export type JournalistProfile = {
  pubkey: string
  name: string
  about: string
  picture: string
  lightningAddress?: string
  nip05?: string
}

/**
 * Fetches a journalist's Kind 0 metadata profile from Nostr.
 */
export async function fetchJournalistProfile(
  pubkey: string
): Promise<JournalistProfile> {
  const fallback: JournalistProfile = {
    pubkey,
    name: `${pubkey.slice(0, 8)}…`,
    about: "",
    picture: "",
  }
  try {
    await connectToRelays()
    const ndk = getNdk()
    const events = await Promise.race([
      ndk.fetchEvents({ kinds: [0], authors: [pubkey], limit: 1 }, { groupable: false }),
      new Promise<Set<NDKEvent>>((resolve) => setTimeout(() => resolve(new Set()), 3000)),
    ])
    const event = Array.from(events as Set<NDKEvent>)[0]
    if (!event) return fallback
    const meta = JSON.parse(event.content || "{}")
    return {
      pubkey,
      name: meta.name || fallback.name,
      about: meta.about || "",
      picture: meta.picture || "",
      lightningAddress: meta.lud16 || meta.lud06 || undefined,
      nip05: meta.nip05 || undefined,
    }
  } catch {
    return fallback
  }
}

/**
 * Fetches the number of people tracking (following) a journalist.
 */
export async function fetchTrackerCount(pubkey: string): Promise<number> {
  try {
    await connectToRelays()
    const ndk = getNdk()
    const events = await Promise.race([
      ndk.fetchEvents({ kinds: [3], "#p": [pubkey] }, { groupable: false }),
      new Promise<Set<NDKEvent>>((resolve) => setTimeout(() => resolve(new Set()), 3000)),
    ])
    return (events as Set<NDKEvent>).size
  } catch {
    return 0
  }
}

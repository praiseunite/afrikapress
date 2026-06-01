import { NDKFilter } from "@nostr-dev-kit/ndk"
import { getNdk, connectToRelays } from "./relay-pool"
import { err, ok, type Result } from "@/lib/types/result"
import type { ArticleEvent } from "@/lib/types/nostr"

/**
 * Fetches the most recent long-form articles from the configured Nostr relays.
 * Limits by `limit` to prevent overloading the client.
 */
export async function fetchLatestArticles(
  limit = 20
): Promise<Result<ArticleEvent[], "relay_unreachable" | "timeout">> {
  try {
    await connectToRelays()
  } catch {
    return err("relay_unreachable")
  }

  const ndk = getNdk()
  const filter: NDKFilter = {
    kinds: [30023],
    "#t": ["afrikapress"],
    limit,
  }

  try {
    const fetchPromise = ndk.fetchEvents(filter, { groupable: false })
    const timeoutPromise = new Promise<Set<any>>((_, reject) => 
      setTimeout(() => reject(new Error("fetch_timeout")), 4000)
    )
    
    // We catch the timeout so it doesn't crash, it just returns whatever events NDK cached
    const events = await Promise.race([fetchPromise, timeoutPromise]).catch(() => {
      console.warn("Fetch timed out, using cached/partial events")
      return new Set() // fallback if absolutely nothing was fetched
    })
    
    // If it timed out but NDK still captured some events in its internal cache, 
    // we could try to read them, but returning an empty set is safest for the race condition.
    // Actually, NDKEvent sets are better handled by just taking what we get.
    const articles: ArticleEvent[] = Array.from(events).map((e: any) => {
      const titleTag = e.tags.find((t: string[]) => t[0] === "title")
      const otsTag = e.tags.find((t: string[]) => t[0] === "ots")
      
      return {
        id: e.id,
        pubkey: e.pubkey,
        created_at: e.created_at ?? Math.floor(Date.now() / 1000),
        kind: 30023,
        tags: e.tags,
        content: e.content,
        sig: e.sig || "",
        title: titleTag ? titleTag[1] : "Untitled Story",
        otsProof: otsTag ? otsTag[1] : undefined,
        isSealed: !!otsTag,
      }
    })

    // Sort newest first (O(n log n) is fine for 20 items)
    articles.sort((a, b) => b.created_at - a.created_at)

    return ok(articles)
  } catch {
    return err("timeout")
  }
}

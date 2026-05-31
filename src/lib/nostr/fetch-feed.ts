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
    limit,
  }

  try {
    const events = await ndk.fetchEvents(filter, { groupable: false })
    
    const articles: ArticleEvent[] = Array.from(events).map((e) => {
      const titleTag = e.tags.find((t) => t[0] === "title")
      const otsTag = e.tags.find((t) => t[0] === "ots")
      
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

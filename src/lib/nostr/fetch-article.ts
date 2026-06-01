import { NDKFilter } from "@nostr-dev-kit/ndk"
import { getNdk, connectToRelays } from "./relay-pool"
import { err, ok, type Result } from "@/lib/types/result"
import type { ArticleEvent } from "@/lib/types/nostr"

export async function fetchArticleById(
  id: string
): Promise<Result<ArticleEvent, "not_found" | "relay_unreachable">> {
  try {
    await connectToRelays()
  } catch {
    return err("relay_unreachable")
  }

  const ndk = getNdk()
  const filter: NDKFilter = {
    ids: [id],
    kinds: [30023],
  }

  try {
    const fetchPromise = ndk.fetchEvents(filter, { groupable: false })
    const timeoutPromise = new Promise<Set<any>>((_, reject) => 
      setTimeout(() => reject(new Error("fetch_timeout")), 4000)
    )

    const events = await Promise.race([fetchPromise, timeoutPromise]).catch(() => new Set())
    
    if (events.size === 0) return err("not_found")
    
    const e = Array.from(events)[0]
    const titleTag = e.tags.find((t: string[]) => t[0] === "title")
    const otsTag = e.tags.find((t: string[]) => t[0] === "ots")
    
    return ok({
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
    })
  } catch {
    return err("not_found")
  }
}

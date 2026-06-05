import { NDKFilter } from "@nostr-dev-kit/ndk"
import { getNdk, connectToRelays } from "./relay-pool"
import { err, ok, type Result } from "@/lib/types/result"

export type ElectionResult = {
  id: string
  pubkey: string
  created_at: number
  country: string
  region: string
  ward: string
  pollingUnit: string
  parties: { party: string; votes: number }[]
  isSealed: boolean
  otsProof?: string
  content: string
}

/**
 * Fetches election results submitted by citizens from AfrikaPress Nostr relays.
 * Filters by the "afrikapress-election" topic tag.
 */
export async function fetchElectionResults(
  limit = 50
): Promise<Result<ElectionResult[], "relay_unreachable" | "timeout">> {
  try {
    await connectToRelays()
  } catch {
    return err("relay_unreachable")
  }

  const ndk = getNdk()
  const filter: NDKFilter = {
    kinds: [1],
    "#t": ["afrikapress-election"],
    limit,
  }

  try {
    const fetchPromise = ndk.fetchEvents(filter, { groupable: false })
    const timeoutPromise = new Promise<Set<any>>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 4000)
    )

    const events = await Promise.race([fetchPromise, timeoutPromise]).catch(() => new Set())

    const results: ElectionResult[] = Array.from(events).map((e: any) => {
      const getTag = (name: string) => {
        const tag = e.tags.find((t: string[]) => t[0] === name)
        return tag ? tag[1] : ""
      }

      const partyTags = e.tags
        .filter((t: string[]) => t[0] === "party")
        .map((t: string[]) => ({ party: t[1] ?? "Unknown", votes: parseInt(t[2] ?? "0", 10) }))

      const otsTag = e.tags.find((t: string[]) => t[0] === "ots")

      return {
        id: e.id,
        pubkey: e.pubkey,
        created_at: e.created_at ?? Math.floor(Date.now() / 1000),
        country: getTag("country"),
        region: getTag("region"),
        ward: getTag("ward"),
        pollingUnit: getTag("pu"),
        parties: partyTags,
        isSealed: !!otsTag,
        otsProof: otsTag ? otsTag[1] : undefined,
        content: e.content,
      }
    })

    results.sort((a, b) => b.created_at - a.created_at)
    return ok(results)
  } catch {
    return err("timeout")
  }
}

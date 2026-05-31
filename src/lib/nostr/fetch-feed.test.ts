import { describe, it, expect, vi } from "vitest"
import { fetchLatestArticles } from "@/lib/nostr/fetch-feed"
import type { ArticleEvent } from "@/lib/types/nostr"

// Mock NDK pool
vi.mock("@/lib/nostr/relay-pool", () => ({
  getNdk: () => ({
    fetchEvents: async () => {
      return new Set([
        {
          id: "1",
          pubkey: "pk1",
          created_at: 1000,
          kind: 30023,
          tags: [["title", "Test Article 1"]],
          content: "Content 1",
          sig: "sig1"
        },
        {
          id: "2",
          pubkey: "pk2",
          created_at: 2000,
          kind: 30023,
          tags: [["title", "Test Article 2"], ["ots", "ticket123"]],
          content: "Content 2",
          sig: "sig2"
        }
      ])
    }
  }),
  connectToRelays: async () => {}
}))

describe("fetchLatestArticles", () => {
  it("fetches and parses articles correctly, sorted by newest first", async () => {
    const result = await fetchLatestArticles(10)
    
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.length).toBe(2)
    
    // Should be sorted by created_at descending
    expect(result.value[0].id).toBe("2")
    expect(result.value[1].id).toBe("1")

    // Check OpenSeal status parsing
    expect(result.value[0].isSealed).toBe(true)
    expect(result.value[0].otsProof).toBe("ticket123")
    
    expect(result.value[1].isSealed).toBe(false)
    expect(result.value[1].otsProof).toBeUndefined()
    
    // Check title parsing
    expect(result.value[0].title).toBe("Test Article 2")
  })
})

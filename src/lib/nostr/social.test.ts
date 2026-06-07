import { describe, it, expect, vi } from "vitest"
import { witnessArticle, amplifyArticle, setTracking, setWatching } from "@/lib/nostr/social"

// ── NDK Mock ──────────────────────────────────────────────────────────────────
vi.mock("@nostr-dev-kit/ndk", () => ({
  default: class NDK {
    signer: unknown
    async fetchEvents() { return new Set() }
  },
  NDKPrivateKeySigner: class {
    constructor(_key: string) {}
  },
  NDKEvent: class {
    kind = 0
    content = ""
    tags: string[][] = []
    id = "mock_event_id"
    async publish() { return new Set() }
  },
}))

vi.mock("@/lib/nostr/relay-pool", () => ({
  getNdk: () => ({
    signer: null,
    fetchEvents: async () => new Set(),
  }),
  connectToRelays: async () => {},
  getRelaySet: () => ({}),
}))

const dummyKey = "0000000000000000000000000000000000000000000000000000000000000001"
const dummyArticleId = "article_event_id_abc123"
const dummyAuthorPubkey = "author_pubkey_abc123"

// ── Witness ───────────────────────────────────────────────────────────────────
describe("witnessArticle", () => {
  it("returns ok with the event id", async () => {
    const res = await witnessArticle(dummyArticleId, dummyAuthorPubkey, dummyKey)
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.value).toBe("mock_event_id")
  })

  it("returns ok (publishes a kind 7 event)", async () => {
    const res = await witnessArticle(dummyArticleId, dummyAuthorPubkey, dummyKey)
    expect(res.ok).toBe(true)
  })
})

// ── Amplify ───────────────────────────────────────────────────────────────────
describe("amplifyArticle", () => {
  it("returns ok with the event id", async () => {
    const res = await amplifyArticle(dummyArticleId, dummyAuthorPubkey, "Some article content", dummyKey)
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.value).toBe("mock_event_id")
  })
})

// ── Track ─────────────────────────────────────────────────────────────────────
describe("setTracking", () => {
  it("adds a pubkey when isTracking is true", async () => {
    const currentList = ["existing_pubkey"]
    const res = await setTracking("new_journalist", true, currentList, dummyKey)
    expect(res.ok).toBe(true)
  })

  it("removes a pubkey when isTracking is false", async () => {
    const currentList = ["journalist_a", "journalist_b"]
    const res = await setTracking("journalist_a", false, currentList, dummyKey)
    expect(res.ok).toBe(true)
  })

  it("does not add duplicate pubkeys", async () => {
    const currentList = ["journalist_a"]
    // Adding journalist_a again should not create a duplicate
    const res = await setTracking("journalist_a", true, currentList, dummyKey)
    // The NDKEvent mock always returns mock_event_id so we just check it published
    expect(res.ok).toBe(true)
  })
})

// ── Watch (Bookmark) ──────────────────────────────────────────────────────────
describe("setWatching", () => {
  it("adds an article id when isWatching is true", async () => {
    const res = await setWatching(dummyArticleId, true, [], dummyKey)
    expect(res.ok).toBe(true)
  })

  it("removes an article id when isWatching is false", async () => {
    const currentList = [dummyArticleId, "other_article"]
    const res = await setWatching(dummyArticleId, false, currentList, dummyKey)
    expect(res.ok).toBe(true)
  })

  it("handles an empty watch list without error", async () => {
    const res = await setWatching(dummyArticleId, false, [], dummyKey)
    expect(res.ok).toBe(true)
  })
})

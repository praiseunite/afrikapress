import { describe, it, expect, vi } from "vitest"
import { publishArticle } from "@/lib/nostr/publish-article"
import * as openseal from "@/lib/openseal/stamp"

// Mock NDK to avoid actual relay connections
vi.mock("@nostr-dev-kit/ndk", () => {
  return {
    default: class NDK {
      signer: any
    },
    NDKPrivateKeySigner: class NDKPrivateKeySigner {
      constructor(key: string) {}
      async user() { return { pubkey: "dummy_pubkey" } }
    },
    NDKEvent: class NDKEvent {
      kind = 0
      content = ""
      tags: string[][] = []
      id = "test_event_id"
      async publish() { return new Set() }
    }
  }
})

vi.mock("@/lib/nostr/relay-pool", () => ({
  getNdk: () => new (require("@nostr-dev-kit/ndk").default)(),
  connectToRelays: async () => {},
}))

describe("publishArticle", () => {
  const dummyKey = "0000000000000000000000000000000000000000000000000000000000000000"

  it("fails if content is empty", async () => {
    const res = await publishArticle({ title: "", content: "", keyHex: dummyKey, sealOnBitcoin: false })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe("empty_content")
  })

  it("publishes successfully without OpenSeal", async () => {
    const res = await publishArticle({
      title: "Test",
      content: "Body",
      keyHex: dummyKey,
      sealOnBitcoin: false
    })
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.value).toBe("test_event_id")
  })

  it("fails if OpenSeal fails", async () => {
    vi.spyOn(openseal, "sealContent").mockResolvedValueOnce({ ok: false, error: "calendar_unreachable" })

    const res = await publishArticle({
      title: "Test",
      content: "Body",
      keyHex: dummyKey,
      sealOnBitcoin: true
    })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe("seal_failed")
  })

  it("publishes successfully with OpenSeal", async () => {
    vi.spyOn(openseal, "sealContent").mockResolvedValueOnce({
      ok: true,
      value: { hash: "abc", otsTicket: "ticket123" }
    })

    const res = await publishArticle({
      title: "Test",
      content: "Body",
      keyHex: dummyKey,
      sealOnBitcoin: true
    })
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.value).toBe("test_event_id")
  })
})

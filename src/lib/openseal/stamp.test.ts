import { describe, it, expect } from "vitest"
import { hashContent, sealContent } from "@/lib/openseal/stamp"

describe("hashContent", () => {
  it("returns a 64-character hex string", () => {
    const hash = hashContent("hello world")
    expect(hash).toHaveLength(64)
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true)
  })

  it("returns different hashes for different content", () => {
    const h1 = hashContent("article about election fraud in Lagos")
    const h2 = hashContent("article about election fraud in Lagos.")
    expect(h1).not.toBe(h2)
  })

  it("returns the same hash for identical content", () => {
    const content = "A journalist was arrested in Kano today."
    expect(hashContent(content)).toBe(hashContent(content))
  })

  it("returns a known SHA-256 hash for 'hello'", () => {
    // sha256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    const hash = hashContent("hello")
    expect(hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")
  })

  it("handles empty string without throwing", () => {
    expect(() => hashContent("")).not.toThrow()
  })

  it("handles unicode content (African languages) without throwing", () => {
    expect(() => hashContent("Ìjọba ìpínlẹ̀ Lágòs ti ní àṣẹ")).not.toThrow()
  })
})

describe("sealContent", () => {
  it("returns calendar_unreachable when all OTS calendars are down", async () => {
    // sealContent makes a real HTTP request — we just verify the error type is correct
    // In CI / no-network environment it must fail gracefully
    const res = await sealContent("Some article content for testing Bitcoin anchoring")
    if (!res.ok) {
      expect(["calendar_unreachable", "hash_failed"]).toContain(res.error)
    } else {
      // If network is available and returns a real ticket, verify its shape
      expect(res.value.hash).toHaveLength(64)
      expect(res.value.otsTicket.length).toBeGreaterThan(0)
    }
  })
})

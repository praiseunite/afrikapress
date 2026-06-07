import { describe, it, expect, vi, beforeAll } from "vitest"
import { verifyTimestamp } from "@/lib/openseal/verify"

// We need crypto.subtle for SHA-256 — available in vitest's happy-dom/node environment

describe("verifyTimestamp", () => {
  it("returns invalid_ticket for an empty string", async () => {
    const res = await verifyTimestamp("")
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe("invalid_ticket")
  })

  it("returns invalid_ticket for a string that is too short", async () => {
    const res = await verifyTimestamp("abc")
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe("invalid_ticket")
  })

  it("returns invalid_ticket for non-base64 input", async () => {
    const res = await verifyTimestamp("invalid_base64!!!")
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe("invalid_ticket")
  })

  it("returns pending when all calendar servers return 404", async () => {
    // All calendars return 404 = not yet anchored = pending
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 })
    )

    // A valid base64-encoded buffer of at least 10 bytes
    const validTicket = Buffer.from(new Uint8Array(16).fill(1)).toString("base64")
    const res = await verifyTimestamp(validTicket)
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.value.status).toBe("pending")

    vi.unstubAllGlobals()
  })

  it("returns verified when a calendar returns 200", async () => {
    // Build a fake OTS response — 8 bytes in the range that looks like a block height
    const fakeBlockBytes = new Uint8Array([0x40, 0x42, 0x0f, 0x00, 0x00, 0x00, 0x00, 0x00])
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => fakeBlockBytes.buffer,
      })
    )

    const validTicket = Buffer.from(new Uint8Array(16).fill(2)).toString("base64")
    const res = await verifyTimestamp(validTicket)
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.value.status).toBe("verified")

    vi.unstubAllGlobals()
  })

  it("returns pending if all calendar servers are unreachable (timeout)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")))
    const validTicket = Buffer.from(new Uint8Array(16).fill(3)).toString("base64")
    const res = await verifyTimestamp(validTicket)
    // All fail = treated as pending (not anchored on these servers yet)
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.value.status).toBe("pending")
    vi.unstubAllGlobals()
  })
})

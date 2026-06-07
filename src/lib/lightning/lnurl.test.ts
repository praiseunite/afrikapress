import { describe, it, expect } from "vitest"
import { resolveLightningAddress, requestInvoice, ZAP_AMOUNTS_SATS } from "@/lib/lightning/lnurl"

// ── NOTE: We mock fetch globally to avoid real network calls ──────────────────

const makeFetch = (body: object, ok = true) =>
  vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
    arrayBuffer: async () => new ArrayBuffer(0),
  })

import { vi } from "vitest"

describe("ZAP_AMOUNTS_SATS", () => {
  it("contains expected quick-pay amounts", () => {
    expect(ZAP_AMOUNTS_SATS).toContain(21)
    expect(ZAP_AMOUNTS_SATS).toContain(100)
    expect(ZAP_AMOUNTS_SATS).toContain(1000)
    expect(ZAP_AMOUNTS_SATS.every((s) => s > 0)).toBe(true)
  })
})

describe("resolveLightningAddress", () => {
  it("returns invalid_address for an address without @", async () => {
    const res = await resolveLightningAddress("notanemail")
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe("invalid_address")
  })

  it("returns invalid_address for an empty string", async () => {
    const res = await resolveLightningAddress("")
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe("invalid_address")
  })

  it("returns invalid_address if the tag is not payRequest", async () => {
    vi.stubGlobal("fetch", makeFetch({ tag: "withdrawRequest" }))
    const res = await resolveLightningAddress("user@domain.com")
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe("invalid_address")
    vi.unstubAllGlobals()
  })

  it("returns unreachable if fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")))
    const res = await resolveLightningAddress("user@domain.com")
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe("unreachable")
    vi.unstubAllGlobals()
  })

  it("returns unreachable if HTTP response is not ok", async () => {
    vi.stubGlobal("fetch", makeFetch({}, false))
    const res = await resolveLightningAddress("user@domain.com")
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe("unreachable")
    vi.unstubAllGlobals()
  })

  it("returns pay info on a valid response", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetch({
        tag: "payRequest",
        callback: "https://getalby.com/lnurlp/user/callback",
        minSendable: 1000,
        maxSendable: 100_000_000,
        metadata: "[]",
      })
    )
    const res = await resolveLightningAddress("user@getalby.com")
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.value.callback).toContain("callback")
      expect(res.value.minSendable).toBe(1000)
      expect(res.value.tag).toBe("payRequest")
    }
    vi.unstubAllGlobals()
  })
})

describe("requestInvoice", () => {
  it("returns invoice_error if response has no pr field", async () => {
    vi.stubGlobal("fetch", makeFetch({ status: "OK" }))
    const res = await requestInvoice("https://example.com/callback", 21_000)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe("invoice_error")
    vi.unstubAllGlobals()
  })

  it("returns invoice_error if server returns status ERROR", async () => {
    vi.stubGlobal("fetch", makeFetch({ status: "ERROR", reason: "amount too low" }))
    const res = await requestInvoice("https://example.com/callback", 1)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe("invoice_error")
    vi.unstubAllGlobals()
  })

  it("returns the bolt11 invoice on success", async () => {
    const pr = "lnbc210n1p..."
    vi.stubGlobal("fetch", makeFetch({ pr }))
    const res = await requestInvoice("https://example.com/callback", 21_000)
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.value.pr).toBe(pr)
    vi.unstubAllGlobals()
  })

  it("returns unreachable if fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")))
    const res = await requestInvoice("https://example.com/callback", 21_000)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe("unreachable")
    vi.unstubAllGlobals()
  })
})

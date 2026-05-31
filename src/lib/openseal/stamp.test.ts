import { describe, it, expect } from "vitest"
import { sha256 } from "@noble/hashes/sha2.js"
import { hashContent } from "@/lib/openseal/stamp"

describe("hashContent", () => {
  it("produces the correct SHA-256 hash for a known input", () => {
    // SHA-256("hello") = canonical value
    expect(hashContent("hello")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    )
  })

  it("produces the same hash for the same input", () => {
    expect(hashContent("test article")).toBe(hashContent("test article"))
  })

  it("produces different hashes for different inputs", () => {
    expect(hashContent("article A")).not.toBe(hashContent("article B"))
  })

  it("is sensitive to whitespace", () => {
    expect(hashContent("hello")).not.toBe(hashContent("hello "))
  })
})

import { describe, it, expect } from "vitest"
import { verifyTimestamp } from "@/lib/openseal/verify"

// Real OTS tickets are binary and need to be parsed by the opentimestamps library.
// For the sake of this mock unit test, we'll just test the error handling.

describe("verifyTimestamp", () => {
  it("fails if ticket is invalid", async () => {
    const result = await verifyTimestamp("invalid_base64")
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe("invalid_ticket")
  })
})

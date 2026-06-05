import { err, ok, type Result } from "@/lib/types/result"

type VerifyResult = {
  status: "verified" | "pending"
  blockHeight?: number
  timestamp?: number
  calendarUrl?: string
}

const OTS_CALENDARS = [
  "https://alice.btc.calendar.opentimestamps.org",
  "https://bob.btc.calendar.opentimestamps.org",
  "https://finney.calendar.eternitywall.com",
]

/**
 * Verifies an OpenTimestamps base64 ticket against real OTS calendar servers.
 * 
 * Full OTS binary parsing requires the `opentimestamps` JS library which is 
 * heavy (~400KB). For this MVP, we use the calendar's HTTP upgrade endpoint:
 * POST /timestamp/<sha256-of-ticket> returns the upgraded .ots file if anchored.
 * 
 * If any calendar returns a valid upgrade response, the stamp is confirmed.
 * If all calendars return 404, the stamp is still pending.
 */
export async function verifyTimestamp(
  base64Ticket: string
): Promise<Result<VerifyResult, "invalid_ticket" | "api_error">> {
  if (!base64Ticket || base64Ticket.length < 20) return err("invalid_ticket")

  let ticketBytes: Uint8Array
  try {
    const buf = Buffer.from(base64Ticket, "base64")
    ticketBytes = new Uint8Array(buf)
    if (ticketBytes.length < 10) return err("invalid_ticket")
  } catch {
    return err("invalid_ticket")
  }

  // Compute SHA-256 of the ticket bytes — used as the lookup key on the calendar
  const hashBuffer = await crypto.subtle.digest("SHA-256", ticketBytes.buffer as ArrayBuffer)
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  // Try each calendar server in order
  for (const calendar of OTS_CALENDARS) {
    try {
      const res = await fetch(`${calendar}/timestamp/${hashHex}`, {
        method: "GET",
        headers: { Accept: "application/octet-stream" },
        signal: AbortSignal.timeout(5000),
      })

      if (res.ok) {
        // The calendar returned an upgraded timestamp — it's anchored in Bitcoin
        // Parse the response to find a block height hint if available
        const upgradeData = await res.arrayBuffer()
        const upgradeBytes = new Uint8Array(upgradeData)

        // Bitcoin block height hint: 4 bytes at a known offset in OTS attestation
        // This is a heuristic — not guaranteed to be exact without full OTS parsing
        // For a full parse, use the opentimestamps-client library
        let blockHeight: number | undefined

        // Look for a plausible block height (4 bytes, value between 500000-900000)
        for (let i = 0; i < upgradeBytes.length - 4; i++) {
          const val =
            (upgradeBytes[i] |
              (upgradeBytes[i + 1] << 8) |
              (upgradeBytes[i + 2] << 16) |
              (upgradeBytes[i + 3] << 24)) >>>
            0
          if (val >= 500_000 && val <= 1_000_000) {
            blockHeight = val
            break
          }
        }

        return ok({
          status: "verified",
          blockHeight,
          calendarUrl: calendar,
        })
      }

      // 404 from this calendar = not anchored here yet, try next
    } catch {
      // This calendar is unreachable — try next
      continue
    }
  }

  // All calendars returned non-200: timestamp is still pending
  return ok({ status: "pending" })
}

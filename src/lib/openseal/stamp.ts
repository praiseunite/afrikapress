import { sha256 } from "@noble/hashes/sha2.js"
import { utf8ToBytes, bytesToHex } from "@noble/hashes/utils.js"
import { err, ok, type Result } from "@/lib/types/result"

const OTS_CALENDAR = "https://alice.btc.calendar.opentimestamps.org"

export const hashContent = (content: string): string =>
  bytesToHex(sha256(utf8ToBytes(content)))

/**
 * Submits a content hash to the OpenTimestamps calendar.
 * Returns a base64-encoded .ots proof ticket.
 */
export async function stampHash(
  contentHash: string
): Promise<Result<string, "calendar_unreachable" | "invalid_hash">> {
  if (contentHash.length !== 64) return err("invalid_hash")

  const hashBytes = Uint8Array.from(
    contentHash.match(/.{2}/g)!.map((b) => parseInt(b, 16))
  )

  try {
    const res = await fetch(`${OTS_CALENDAR}/digest`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: hashBytes,
    })
    if (!res.ok) return err("calendar_unreachable")
    const ticket = Buffer.from(await res.arrayBuffer()).toString("base64")
    return ok(ticket)
  } catch {
    return err("calendar_unreachable")
  }
}

/** One-step seal: hash content → submit to OTS → return both */
export async function sealContent(
  content: string
): Promise<Result<{ hash: string; otsTicket: string }, "calendar_unreachable">> {
  const hash = hashContent(content)
  const stamp = await stampHash(hash)
  if (!stamp.ok) return err("calendar_unreachable")
  return ok({ hash, otsTicket: stamp.value })
}

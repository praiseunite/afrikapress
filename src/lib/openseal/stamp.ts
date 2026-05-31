import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils"
import { err, ok, type Result } from "@/lib/types/result"

const OTS_CALENDAR = "https://alice.btc.calendar.opentimestamps.org"

/** Returns the SHA-256 hex hash of any string */
export function hashContent(content: string): string {
  return bytesToHex(sha256(utf8ToBytes(content)))
}

/**
 * Submits a content hash to the OpenTimestamps calendar server.
 * Returns the base64-encoded .ots proof ticket.
 */
export async function stampHash(
  contentHash: string
): Promise<Result<string, "calendar_unreachable" | "invalid_hash">> {
  if (!contentHash || contentHash.length !== 64) return err("invalid_hash")

  const hashBytes = new Uint8Array(
    contentHash.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
  )

  try {
    const res = await fetch(`${OTS_CALENDAR}/digest`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: hashBytes,
    })

    if (!res.ok) return err("calendar_unreachable")

    const ticket = await res.arrayBuffer()
    const base64 = Buffer.from(ticket).toString("base64")
    return ok(base64)
  } catch {
    return err("calendar_unreachable")
  }
}

/**
 * One-step helper — hashes content and immediately submits to OTS.
 * This is what the article editor calls on publish.
 */
export async function sealContent(
  content: string
): Promise<Result<{ hash: string; otsTicket: string }, "calendar_unreachable">> {
  const hash = hashContent(content)
  const stamp = await stampHash(hash)
  if (!stamp.ok) return err("calendar_unreachable")
  return ok({ hash, otsTicket: stamp.value })
}

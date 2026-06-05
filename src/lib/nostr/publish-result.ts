import { sha256 } from "@noble/hashes/sha2.js"
import { utf8ToBytes, bytesToHex } from "@noble/hashes/utils.js"
import { getNdk, connectToRelays } from "./relay-pool"
import { NDKEvent } from "@nostr-dev-kit/ndk"
import { sealContent } from "@/lib/openseal/stamp"
import { err, ok, type Result } from "@/lib/types/result"

export type PartyResult = {
  party: string
  votes: number
}

export type ElectionResultInput = {
  country: string
  region: string
  ward: string
  pollingUnit: string
  parties: PartyResult[]
  keyHex: string
  sealOnBitcoin: boolean
}

/**
 * Publishes a citizen's Polling Unit election result to Nostr.
 * The result is cryptographically signed with the citizen's key,
 * tagged for AfrikaPress filtering, and optionally sealed on Bitcoin.
 */
export async function publishElectionResult(
  input: ElectionResultInput
): Promise<Result<string, "empty_data" | "relay_unreachable" | "seal_failed">> {
  const { country, region, ward, pollingUnit, parties, keyHex, sealOnBitcoin } = input

  if (!country.trim() || !region.trim() || !pollingUnit.trim() || parties.length === 0) {
    return err("empty_data")
  }

  // Build a structured content string for hashing + readability
  const resultLines = parties.map((p) => `${p.party}: ${p.votes}`).join("\n")
  const content = [
    `Election Result — ${country}, ${region}`,
    `Ward: ${ward}`,
    `Polling Unit: ${pollingUnit}`,
    `---`,
    resultLines,
  ].join("\n")

  const ndk = getNdk()

  // Dynamically import NDKPrivateKeySigner to keep the bundle lean
  const { NDKPrivateKeySigner } = await import("@nostr-dev-kit/ndk")
  const signer = new NDKPrivateKeySigner(keyHex)
  ndk.signer = signer

  try {
    await connectToRelays()
  } catch {
    return err("relay_unreachable")
  }

  const event = new NDKEvent(ndk)
  event.kind = 1 // Short text note — lightweight, widely supported
  event.content = content
  event.tags = [
    ["t", "afrikapress-election"],
    ["t", "afrikapress"],
    ["country", country.trim()],
    ["region", region.trim()],
    ["ward", ward.trim()],
    ["pu", pollingUnit.trim()],
    // Encode party results as structured tags for easy aggregation
    ...parties.map((p) => ["party", p.party, String(p.votes)]),
  ]

  if (sealOnBitcoin) {
    const sealResult = await sealContent(content)
    if (!sealResult.ok) return err("seal_failed")
    event.tags.push(["ots", sealResult.value.otsTicket])
  }

  try {
    const publishPromise = event.publish()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 5000)
    )
    await Promise.race([publishPromise, timeoutPromise])
    return ok(event.id ?? "")
  } catch (e) {
    console.error("Election result publish failed:", e)
    return err("relay_unreachable")
  }
}

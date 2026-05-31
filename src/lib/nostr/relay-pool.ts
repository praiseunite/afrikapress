import NDK, { NDKRelaySet } from "@nostr-dev-kit/ndk"

const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://nos.lol",
  "wss://relay.nostr.band",
]

/** Singleton NDK instance — shared across the entire app */
let ndkInstance: NDK | undefined

export function getNdk(): NDK {
  if (!ndkInstance) {
    ndkInstance = new NDK({ explicitRelayUrls: RELAYS })
  }
  return ndkInstance
}

/**
 * Connects to all configured relays.
 * Safe to call multiple times — NDK handles de-duplication.
 */
export async function connectToRelays(): Promise<void> {
  await getNdk().connect()
}

export function getRelaySet(): NDKRelaySet {
  return NDKRelaySet.fromRelayUrls(RELAYS, getNdk())
}

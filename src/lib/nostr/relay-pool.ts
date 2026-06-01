import NDK, { NDKRelaySet } from "@nostr-dev-kit/ndk"

const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://nos.lol",
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
  try {
    await getNdk().connect(3000)
  } catch (err) {
    console.warn("Some relays failed to connect:", err)
  }
}

export function getRelaySet(): NDKRelaySet {
  return NDKRelaySet.fromRelayUrls(RELAYS, getNdk())
}

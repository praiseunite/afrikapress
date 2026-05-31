/**
 * Nostr event types used across the app.
 * kind:1        — short note
 * kind:30023    — long-form article (NIP-23)
 * kind:9735     — Zap receipt (NIP-57)
 */
export type NostrKind = 1 | 30023 | 9735

export type NostrEvent = {
  id: string
  pubkey: string
  created_at: number
  kind: NostrKind
  tags: string[][]
  content: string
  sig: string
}

export type ArticleEvent = NostrEvent & {
  kind: 30023
  /** Derived from tags: ["title", "..."] */
  title: string
  /** Derived from tags: ["ots", "..."] — the OpenTimestamps proof hex */
  otsProof: string | undefined
  isSealed: boolean
}

export type ElectionEvent = NostrEvent & {
  kind: 1
  state: string
  lga: string
  ward: string
  pollingUnit: string
  imageUrl: string
  isSealed: boolean
}

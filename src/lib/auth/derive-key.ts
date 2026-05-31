import { argon2id } from "@noble/hashes/argon2.js"
import { utf8ToBytes, bytesToHex } from "@noble/hashes/utils.js"
import { err, ok, type Result } from "@/lib/types/result"

const SALT = utf8ToBytes("afrikapress-v1")
const MIN_ANSWERS = 4

/** Argon2id parameters — tuned for security vs. performance */
const PARAMS = {
  /** Production: 64MB memory, very brute-force resistant */
  production: { m: 65536, t: 3, p: 1 },
  /** Test: 256KB memory — same algorithm, fast enough for unit tests */
  test: { m: 256, t: 1, p: 1 },
} as const

const isTest = process.env.NODE_ENV === "test"
const { m, t, p } = isTest ? PARAMS.test : PARAMS.production

/**
 * Derives a 32-byte Nostr private key from a journalist's personal answers.
 * Deterministic: same inputs always produce the same key, on any device.
 */
export function deriveKeyFromAnswers(
  answers: string[]
): Result<Uint8Array, "insufficient_answers" | "empty_answer"> {
  if (answers.length < MIN_ANSWERS) return err("insufficient_answers")

  const hasBlank = answers.some((a) => !a.trim())
  if (hasBlank) return err("empty_answer")

  const normalized = answers.map((a) => a.trim().toLowerCase()).join("|")
  const input = utf8ToBytes(normalized)

  const keyBytes = argon2id(input, SALT, { m, t, p, dkLen: 32 })
  return ok(keyBytes)
}

export const keyToHex = (key: Uint8Array): string => bytesToHex(key)

import { argon2id } from "@noble/hashes/argon2"
import { utf8ToBytes, bytesToHex } from "@noble/hashes/utils"
import { err, ok, type Result } from "@/lib/types/result"

const SALT = utf8ToBytes("afrikapress-v1")

/** Minimum number of answers required to derive a key */
const MIN_ANSWERS = 4

/**
 * Derives a 32-byte Nostr private key from a journalist's personal answers.
 *
 * Uses Argon2id with 64MB memory and 3 iterations, making brute-force
 * attacks computationally infeasible even if the attacker knows the email.
 *
 * The same 4 answers will always produce the same key on any device.
 */
export function deriveKeyFromAnswers(
  answers: string[]
): Result<Uint8Array, "insufficient_answers" | "empty_answer"> {
  if (answers.length < MIN_ANSWERS) return err("insufficient_answers")

  const hasEmptyAnswer = answers.some((a) => !a.trim())
  if (hasEmptyAnswer) return err("empty_answer")

  const combined = utf8ToBytes(answers.map((a) => a.trim().toLowerCase()).join("|"))

  const keyBytes = argon2id(combined, SALT, {
    m: 65536, // 64 MB memory
    t: 3,     // 3 iterations
    p: 1,     // 1 thread
    dkLen: 32,
  })

  return ok(keyBytes)
}

/** Convenience helper — converts the key bytes to a hex string */
export const keyToHex = (key: Uint8Array): string => bytesToHex(key)

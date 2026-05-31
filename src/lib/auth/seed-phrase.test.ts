import { describe, it, expect } from "vitest"
import { keyToSeedWords, seedWordsToKey } from "@/lib/auth/seed-phrase"
import { deriveKeyFromAnswers } from "@/lib/auth/derive-key"
import { bytesToHex } from "@noble/hashes/utils"

const VALID_ANSWERS = ["chidi@gmail.com", "Adaobi", "1998", "mango"]

describe("seed phrase round-trip", () => {
  it("converts a key to 12 words and back to the same key", () => {
    const keyResult = deriveKeyFromAnswers(VALID_ANSWERS)
    expect(keyResult.ok).toBe(true)
    if (!keyResult.ok) return

    const wordsResult = keyToSeedWords(keyResult.value)
    expect(wordsResult.ok).toBe(true)
    if (!wordsResult.ok) return

    expect(wordsResult.value.length).toBe(12)

    const recoveredResult = seedWordsToKey(wordsResult.value)
    expect(recoveredResult.ok).toBe(true)
    if (!recoveredResult.ok) return

    expect(bytesToHex(recoveredResult.value)).toBe(bytesToHex(keyResult.value))
  })

  it("fails with invalid_mnemonic for garbage input", () => {
    const result = seedWordsToKey(["dog", "cat", "bird", "fish"])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe("invalid_mnemonic")
  })

  it("fails with invalid_key_length for a wrong-size key", () => {
    const result = keyToSeedWords(new Uint8Array(16))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe("invalid_key_length")
  })
})

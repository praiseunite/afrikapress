import { describe, it, expect } from "vitest"
import { deriveKeyFromAnswers, keyToHex } from "@/lib/auth/derive-key"

const VALID_ANSWERS = ["chidi@gmail.com", "Adaobi", "1998", "mango"]

describe("deriveKeyFromAnswers", () => {
  it("produces the same key for the same inputs", () => {
    const a = deriveKeyFromAnswers(VALID_ANSWERS)
    const b = deriveKeyFromAnswers(VALID_ANSWERS)
    expect(a.ok && b.ok && keyToHex(a.value) === keyToHex(b.value)).toBe(true)
  })

  it("produces a different key when any input changes", () => {
    const a = deriveKeyFromAnswers(VALID_ANSWERS)
    const b = deriveKeyFromAnswers(["other@gmail.com", "Adaobi", "1998", "mango"])
    expect(a.ok && b.ok && keyToHex(a.value) !== keyToHex(b.value)).toBe(true)
  })

  it("returns a 32-byte key on success", () => {
    const result = deriveKeyFromAnswers(VALID_ANSWERS)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.length).toBe(32)
  })

  it("fails with insufficient_answers when fewer than 4 given", () => {
    const result = deriveKeyFromAnswers(["only@one.com", "Adaobi"])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe("insufficient_answers")
  })

  it("fails with empty_answer when any answer is blank", () => {
    const result = deriveKeyFromAnswers(["chidi@gmail.com", "", "1998", "mango"])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe("empty_answer")
  })

  it("is case and whitespace insensitive for answers", () => {
    const a = deriveKeyFromAnswers(["CHIDI@GMAIL.COM", "ADAOBI", "1998", "MANGO"])
    const b = deriveKeyFromAnswers(["  chidi@gmail.com  ", "adaobi", "1998", "mango"])
    expect(a.ok && b.ok && keyToHex(a.value) === keyToHex(b.value)).toBe(true)
  })
})

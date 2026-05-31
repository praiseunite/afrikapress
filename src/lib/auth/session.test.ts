import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { saveSession, loadSession, clearSession, hasActiveSession } from "@/lib/auth/session"

// jsdom is needed for sessionStorage — add to vitest config if not present
describe("session storage", () => {
  beforeEach(() => clearSession())
  afterEach(() => clearSession())

  it("saves and loads a key", () => {
    saveSession("deadbeef1234")
    expect(loadSession()).toBe("deadbeef1234")
  })

  it("returns undefined when nothing is saved", () => {
    expect(loadSession()).toBeUndefined()
  })

  it("reports active session correctly", () => {
    expect(hasActiveSession()).toBe(false)
    saveSession("abc")
    expect(hasActiveSession()).toBe(true)
  })

  it("clears the key and returns undefined afterwards", () => {
    saveSession("abc")
    clearSession()
    expect(loadSession()).toBeUndefined()
    expect(hasActiveSession()).toBe(false)
  })
})

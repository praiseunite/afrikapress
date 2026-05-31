/**
 * Session storage for the journalist's private key.
 *
 * Uses sessionStorage (cleared on tab/browser close) not localStorage.
 * This means a journalist who closes their browser is automatically
 * logged out — leaving no trace of their key on the device.
 */

const SESSION_KEY = "ap_session"

export function saveSession(keyHex: string): void {
  sessionStorage.setItem(SESSION_KEY, keyHex)
}

export function loadSession(): string | undefined {
  return sessionStorage.getItem(SESSION_KEY) ?? undefined
}

/** Wipes the key from memory instantly — use on logout */
export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function hasActiveSession(): boolean {
  return sessionStorage.getItem(SESSION_KEY) !== null
}

/**
 * Rust-style Result type. Every function that can fail must return this.
 * Never throw. Never return null. Be explicit.
 */
export type Ok<T> = { ok: true; value: T }
export type Err<E> = { ok: false; error: E }
export type Result<T, E = string> = Ok<T> | Err<E>

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value })
export const err = <E>(error: E): Err<E> => ({ ok: false, error })

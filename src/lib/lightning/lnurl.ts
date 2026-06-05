import { err, ok, type Result } from "@/lib/types/result"

export type LnurlPayInfo = {
  callback: string
  minSendable: number   // millisatoshis
  maxSendable: number   // millisatoshis
  metadata: string
  tag: string
}

export type LnInvoice = {
  pr: string            // BOLT-11 payment request string
  successAction?: { tag: string; message?: string }
}

/**
 * Resolves a Lightning Address (user@domain.com) to an LNURL-pay endpoint
 * and fetches the pay info (min/max amounts, metadata).
 */
export async function resolveLightningAddress(
  lightningAddress: string
): Promise<Result<LnurlPayInfo, "invalid_address" | "unreachable">> {
  if (!lightningAddress.includes("@")) return err("invalid_address")

  const [username, domain] = lightningAddress.split("@")
  if (!username || !domain) return err("invalid_address")

  const lnurlEndpoint = `https://${domain}/.well-known/lnurlp/${username}`

  try {
    const res = await fetch(lnurlEndpoint, {
      headers: { Accept: "application/json" },
      // Keep it lean — short timeout for a payment lookup
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return err("unreachable")

    const data = await res.json()
    if (data.tag !== "payRequest") return err("invalid_address")

    return ok({
      callback: data.callback,
      minSendable: data.minSendable ?? 1000,
      maxSendable: data.maxSendable ?? 100_000_000,
      metadata: data.metadata ?? "[]",
      tag: data.tag,
    })
  } catch {
    return err("unreachable")
  }
}

/**
 * Requests a BOLT-11 invoice from the LNURL-pay callback
 * for a specific amount in millisatoshis.
 */
export async function requestInvoice(
  callback: string,
  amountMsats: number
): Promise<Result<LnInvoice, "invoice_error" | "unreachable">> {
  try {
    const url = `${callback}?amount=${amountMsats}`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return err("unreachable")

    const data = await res.json()
    if (data.status === "ERROR" || !data.pr) return err("invoice_error")

    return ok({ pr: data.pr, successAction: data.successAction })
  } catch {
    return err("unreachable")
  }
}

/**
 * Returns the suggested quick-zap amounts in sats.
 */
export const ZAP_AMOUNTS_SATS = [21, 100, 500, 1000, 5000]

import { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk"
import { getNdk, connectToRelays } from "./relay-pool"
import { sealContent } from "@/lib/openseal/stamp"
import { err, ok, type Result } from "@/lib/types/result"

type PublishOptions = {
  title: string
  content: string
  keyHex: string
  sealOnBitcoin: boolean
}

/**
 * Publishes a long-form article (kind:30023) to Nostr.
 * Optionally stamps the content hash on the Bitcoin blockchain via OpenTimestamps.
 */
export async function publishArticle({
  title,
  content,
  keyHex,
  sealOnBitcoin,
}: PublishOptions): Promise<Result<string, "empty_content" | "relay_unreachable" | "seal_failed">> {
  if (!title.trim() || !content.trim()) return err("empty_content")
  if (keyHex.length !== 64) return err("empty_content")

  const ndk = getNdk()
  const signer = new NDKPrivateKeySigner(keyHex)
  ndk.signer = signer

  try {
    await connectToRelays()
  } catch {
    return err("relay_unreachable")
  }

  const event = new NDKEvent(ndk)
  event.kind = 30023
  event.content = content
  event.tags = [
    ["title", title.trim()],
    ["client", "afrikapress"],
    ["t", "afrikapress"],
  ]

  if (sealOnBitcoin) {
    const sealResult = await sealContent(content)
    if (!sealResult.ok) return err("seal_failed")
    event.tags.push(["ots", sealResult.value.otsTicket])
  }

  try {
    const publishPromise = event.publish()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("publish_timeout")), 5000)
    )
    
    await Promise.race([publishPromise, timeoutPromise])
    return ok(event.id)
  } catch (e) {
    console.error("Publish failed or timed out:", e)
    return err("relay_unreachable")
  }
}

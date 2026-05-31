import { sha256 } from "@noble/hashes/sha2.js"
import { bytesToHex } from "@noble/hashes/utils.js"
import { err, ok, type Result } from "@/lib/types/result"

/**
 * Compresses an image file to stay under the target byte size.
 * This keeps feed loading fast on 3G networks in Nigeria.
 */
export async function compressImage(
  file: File,
  targetBytes = 500_000
): Promise<Result<Blob, "compression_failed" | "not_an_image">> {
  if (!file.type.startsWith("image/")) return err("not_an_image")

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement("canvas")

      let { width, height } = img
      const scale = Math.min(1, Math.sqrt(targetBytes / file.size))
      width = Math.floor(width * scale)
      height = Math.floor(height * scale)

      canvas.width = width
      canvas.height = height
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(err("compression_failed")); return }
          resolve(ok(blob))
        },
        "image/jpeg",
        0.8
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(err("compression_failed"))
    }

    img.src = url
  })
}

/** Uploads a compressed image blob to nostr.build and returns the URL */
export async function uploadImage(
  blob: Blob
): Promise<Result<string, "upload_failed">> {
  try {
    const form = new FormData()
    form.append("fileToUpload", blob, "photo.jpg")

    const res = await fetch("https://nostr.build/api/v2/upload/files", {
      method: "POST",
      body: form,
    })

    if (!res.ok) return err("upload_failed")

    const json = await res.json()
    const imageUrl = json?.data?.[0]?.url
    if (!imageUrl) return err("upload_failed")

    return ok(imageUrl)
  } catch {
    return err("upload_failed")
  }
}

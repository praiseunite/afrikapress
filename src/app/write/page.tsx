"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArticleEditor } from "@/components/editor/ArticleEditor"
import { publishArticle } from "@/lib/nostr/publish-article"
import { loadSession } from "@/lib/auth/session"

export default function WritePage() {
  const router = useRouter()
  const [keyHex, setKeyHex] = useState<string | null>(null)

  useEffect(() => {
    const key = loadSession()
    if (!key) {
      router.push("/auth/login")
    } else {
      setKeyHex(key)
    }
  }, [router])

  async function handlePublish(title: string, body: string, seal: boolean) {
    if (!keyHex) throw new Error("Not logged in")

    const res = await publishArticle({
      title,
      content: body,
      keyHex,
      sealOnBitcoin: seal,
    })

    if (!res.ok) {
      throw new Error(res.error)
    }

    // Give relays a second to propagate, then go to feed
    setTimeout(() => {
      router.push("/feed")
    }, 1000)
  }

  if (!keyHex) return null // or a loading spinner

  return (
    <div className="mx-auto max-w-2xl p-4 pt-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Write a Story</h1>
      <ArticleEditor onPublish={handlePublish} />
    </div>
  )
}

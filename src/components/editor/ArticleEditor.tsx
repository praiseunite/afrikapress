"use client"

import { useState } from "react"
import { OpenSealToggle } from "@/components/editor/OpenSealToggle"

type PublishState = "idle" | "publishing" | "done" | "error"

type Props = {
  onPublish: (title: string, body: string, seal: boolean) => Promise<void>
}

export function ArticleEditor({ onPublish }: Props) {
  const [title, setTitle]   = useState("")
  const [body, setBody]     = useState("")
  const [seal, setSeal]     = useState(true)
  const [state, setState]   = useState<PublishState>("idle")
  const [errMsg, setErrMsg] = useState("")

  const canPublish = title.trim().length > 0 && body.trim().length > 0 && state === "idle"

  async function handlePublish() {
    setState("publishing")
    setErrMsg("")
    try {
      await onPublish(title.trim(), body.trim(), seal)
      setState("done")
    } catch (e) {
      setState("error")
      setErrMsg(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        data-testid="article-title"
        type="text"
        placeholder="Story title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-lg font-semibold text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
      />

      <textarea
        data-testid="article-body"
        placeholder="Write your story..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={12}
        className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
      />

      <OpenSealToggle enabled={seal} onChange={setSeal} />

      {errMsg && (
        <p className="text-sm text-red-400" role="alert">{errMsg}</p>
      )}

      <button
        data-testid="publish-button"
        onClick={handlePublish}
        disabled={!canPublish}
        className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {state === "publishing" ? "Publishing…" : state === "done" ? "Published! ✓" : "Publish to AfrikaPress"}
      </button>
    </div>
  )
}

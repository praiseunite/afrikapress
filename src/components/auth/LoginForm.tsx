"use client"

import { useState } from "react"
import { deriveKeyFromAnswers, keyToHex } from "@/lib/auth/derive-key"
import { seedWordsToKey } from "@/lib/auth/seed-phrase"
import { saveSession } from "@/lib/auth/session"

type Tab = "answers" | "words"
type Props = { onComplete: () => void }

const QUESTIONS = [
  { id: "login-email",        label: "Your email address",              type: "email" },
  { id: "login-mothers-name", label: "Your mother's first name",        type: "text"  },
  { id: "login-year",         label: "A year you will never forget",    type: "text"  },
  { id: "login-secret",       label: "A secret word only you know",     type: "password" },
] as const

export function LoginForm({ onComplete }: Props) {
  const [tab, setTab]           = useState<Tab>("answers")
  const [answers, setAnswers]   = useState(["", "", "", ""])
  const [seedInput, setSeedInput] = useState("")
  const [errMsg, setErrMsg]     = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)))
  }

  async function handleLogin() {
    setErrMsg("")
    setIsLoading(true)

    // A small timeout allows the UI to render the loading state before the CPU-heavy Argon2 blocks the thread
    await new Promise((resolve) => setTimeout(resolve, 50))

    try {
      let keyHex = ""

      if (tab === "answers") {
        const result = deriveKeyFromAnswers(answers)
        if (!result.ok) {
          setErrMsg("Please fill in all 4 fields.")
          setIsLoading(false)
          return
        }
        keyHex = keyToHex(result.value)
      } else {
        const words = seedInput.trim().split(/\s+/)
        if (words.length !== 24) {
          setErrMsg("Please enter exactly 24 words.")
          setIsLoading(false)
          return
        }
        const result = seedWordsToKey(words)
        if (!result.ok) {
          setErrMsg("Those words are not valid. Please check them and try again.")
          setIsLoading(false)
          return
        }
        keyHex = keyToHex(result.value)
      }

      saveSession(keyHex)
      onComplete()
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmitAnswers = !answers.some((a) => !a.trim())
  const canSubmitWords = seedInput.trim().split(/\s+/).length === 24
  const canSubmit = tab === "answers" ? canSubmitAnswers : canSubmitWords

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Log in using your personal answers or your 24 backup words.
        </p>
      </div>

      <div className="flex rounded-xl bg-zinc-900 p-1">
        <button
          data-testid="tab-answers"
          onClick={() => { setTab("answers"); setErrMsg("") }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "answers" ? "bg-zinc-800 text-white shadow" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Use My Answers
        </button>
        <button
          data-testid="tab-words"
          onClick={() => { setTab("words"); setErrMsg("") }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "words" ? "bg-zinc-800 text-white shadow" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Use Backup Words
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {tab === "answers" ? (
          QUESTIONS.map((q, i) => (
            <div key={q.id}>
              <label className="mb-1 block text-xs font-medium text-zinc-400">{q.label}</label>
              <input
                data-testid={q.id}
                type={q.type}
                value={answers[i]}
                onChange={(e) => updateAnswer(i, e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
              />
            </div>
          ))
        ) : (
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Your 24 Backup Words</label>
            <textarea
              data-testid="login-seed-words"
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              placeholder="apple banana cat..."
              rows={4}
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
            />
          </div>
        )}
      </div>

      {errMsg && <p className="text-sm text-red-400" role="alert">{errMsg}</p>}

      <button
        data-testid="login-button"
        onClick={handleLogin}
        disabled={!canSubmit || isLoading}
        className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading ? "Logging in..." : "Log In"}
      </button>
    </div>
  )
}

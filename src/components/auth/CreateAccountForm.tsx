"use client"

import { useState } from "react"
import { deriveKeyFromAnswers } from "@/lib/auth/derive-key"
import { keyToSeedWords } from "@/lib/auth/seed-phrase"
import { saveSession } from "@/lib/auth/session"
import { keyToHex } from "@/lib/auth/derive-key"

type Step = 1 | 2 | 3

type Props = { onComplete: () => void }

const QUESTIONS = [
  { id: "answer-email",        label: "Your email address",              type: "email" },
  { id: "answer-mothers-name", label: "Your mother's first name",        type: "text"  },
  { id: "answer-year",         label: "A year you will never forget",    type: "text"  },
  { id: "answer-secret",       label: "A secret word only you know",     type: "password" },
] as const

export function CreateAccountForm({ onComplete }: Props) {
  const [step, setStep]         = useState<Step>(1)
  const [answers, setAnswers]   = useState(["", "", "", ""])
  const [words, setWords]       = useState<string[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [errMsg, setErrMsg]     = useState("")

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)))
  }

  function generateAccount() {
    setErrMsg("")
    const keyResult = deriveKeyFromAnswers(answers)
    if (!keyResult.ok) {
      setErrMsg("Please fill in all 4 fields.")
      return
    }

    const wordsResult = keyToSeedWords(keyResult.value)
    if (!wordsResult.ok) {
      setErrMsg("Key generation failed. Please try again.")
      return
    }

    saveSession(keyToHex(keyResult.value))
    setWords(wordsResult.value)
    setStep(2)
  }

  function finish() {
    if (confirmed) { onComplete(); return }
    setErrMsg("Please confirm you have saved your backup words.")
  }

  if (step === 1) return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Answer 4 questions only you know. We never store your answers.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {QUESTIONS.map((q, i) => (
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
        ))}
      </div>

      {errMsg && <p className="text-sm text-red-400" role="alert">{errMsg}</p>}

      <button
        data-testid="generate-button"
        onClick={generateAccount}
        disabled={answers.some((a) => !a.trim())}
        className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black disabled:opacity-40"
      >
        Generate My Account
      </button>
    </div>
  )

  if (step === 2) return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Your 24 Backup Words</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Write these down or download the PDF. These words restore your account if you forget your answers.
        </p>
      </div>

      <div
        data-testid="seed-words"
        className="grid grid-cols-3 gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
      >
        {words.map((word, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-5 text-right text-xs text-zinc-600">{i + 1}.</span>
            <span className="font-mono text-white">{word}</span>
          </div>
        ))}
      </div>

      <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
        <input
          data-testid="confirm-saved"
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-emerald-500"
        />
        I have saved my 24 words
      </label>

      {errMsg && <p className="text-sm text-red-400" role="alert">{errMsg}</p>}

      <button
        data-testid="continue-button"
        onClick={finish}
        className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  )

  return null
}

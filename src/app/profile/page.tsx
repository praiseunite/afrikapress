"use client"

import { useEffect, useState } from "react"
import { loadSession } from "@/lib/auth/session"
import { nip19, getPublicKey } from "nostr-tools"
import { deriveKeyFromAnswers, keyToHex } from "@/lib/auth/derive-key"
import { useRouter } from "next/navigation"
import { useLocale } from "@/components/shared/LocaleProvider"

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useLocale()
  
  const [pubkeyHex, setPubkeyHex] = useState<string>("")
  const [privkeyHex, setPrivkeyHex] = useState<string>("")
  const [npub, setNpub] = useState<string>("")
  const [nsec, setNsec] = useState<string>("")
  
  const [isRevealed, setIsRevealed] = useState(false)
  const [error, setError] = useState("")
  
  // Brain wallet questions for verification
  const [q1, setQ1] = useState("")
  const [q2, setQ2] = useState("")
  const [q3, setQ3] = useState("")
  const [q4, setQ4] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    const key = loadSession()
    if (!key) {
      router.push("/auth/login")
      return
    }
    
    try {
      const pub = getPublicKey(new Uint8Array(Buffer.from(key, "hex")))
      setPrivkeyHex(key)
      setPubkeyHex(pub)
      setNpub(nip19.npubEncode(pub))
      setNsec(nip19.nsecEncode(new Uint8Array(Buffer.from(key, "hex"))))
    } catch (err) {
      console.error(err)
    }
  }, [router])

  const handleReveal = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsVerifying(true)
    
    // Slight delay to allow UI to show "Verifying..." before sync block
    await new Promise((r) => setTimeout(r, 100))

    try {
      const result = deriveKeyFromAnswers([q1, q2, q3, q4])
      if (!result.ok) {
        setError("Please answer all 4 questions.")
        setIsVerifying(false)
        return
      }

      const derivedHex = keyToHex(result.value)
      if (derivedHex === privkeyHex) {
        setIsRevealed(true)
      } else {
        setError("Answers are incorrect. Try again.")
      }
    } catch (err) {
      setError("An error occurred during verification.")
    }
    setIsVerifying(false)
  }

  if (!npub) return null

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-zinc-300">
      <h1 className="mb-2 text-3xl font-bold text-white">Your Profile</h1>
      <p className="mb-8 text-zinc-500">View your Nostr identity and public address.</p>

      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-2 text-lg font-bold text-white">Public Key (npub)</h2>
        <p className="mb-4 text-sm text-zinc-500">
          This is your public address. You can share this with others so they can follow you or send you messages on Nostr.
        </p>
        <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-3 font-mono text-sm text-emerald-400 break-all">
          {npub}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-2 text-lg font-bold text-white">Private Key (nsec)</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Your private key gives full control over your account. NEVER share this with anyone.
        </p>

        {isRevealed ? (
          <div className="rounded border border-red-500/30 bg-red-500/10 p-3 font-mono text-sm text-red-400 break-all">
            {nsec}
          </div>
        ) : (
          <form onSubmit={handleReveal} className="mt-6 flex flex-col gap-4">
            <p className="text-sm font-semibold text-white">
              To reveal your private key, please confirm your 4 Brain Wallet answers:
            </p>
            
            <input
              type="password"
              placeholder="1. Mother's maiden name?"
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="password"
              placeholder="2. City you were born in?"
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="password"
              placeholder="3. Name of your first pet?"
              value={q3}
              onChange={(e) => setQ3(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="password"
              placeholder="4. Favorite childhood hero?"
              value={q4}
              onChange={(e) => setQ4(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isVerifying}
              className="mt-2 rounded bg-red-500 px-6 py-3 font-bold text-white transition-opacity hover:bg-red-600 disabled:opacity-50"
            >
              {isVerifying ? "Verifying..." : "Verify & Reveal Private Key"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

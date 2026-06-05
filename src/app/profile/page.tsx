"use client"

import { useEffect, useState } from "react"
import { loadSession } from "@/lib/auth/session"
import { nip19, getPublicKey } from "nostr-tools"
import { deriveKeyFromAnswers, keyToHex } from "@/lib/auth/derive-key"
import { keyToSeedWords } from "@/lib/auth/seed-phrase"
import { useRouter } from "next/navigation"
import { useLocale } from "@/components/shared/LocaleProvider"

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useLocale()
  
  const [pubkeyHex, setPubkeyHex] = useState<string>("")
  const [privkeyHex, setPrivkeyHex] = useState<string>("")
  const [npub, setNpub] = useState<string>("")
  const [nsec, setNsec] = useState<string>("")
  const [seedWords, setSeedWords] = useState<string[]>([])
  
  const [isRevealed, setIsRevealed] = useState(false)
  const [error, setError] = useState("")
  const [lightningAddress, setLightningAddress] = useState("")
  const [lnSaved, setLnSaved] = useState(false)

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
      const seedResult = keyToSeedWords(new Uint8Array(Buffer.from(key, "hex")))
      if (seedResult.ok) {
        setSeedWords(seedResult.value)
      }
      // Load saved lightning address
      const savedLn = localStorage.getItem(`ln_address_${pub}`)
      if (savedLn) setLightningAddress(savedLn)
    } catch (err) {
      console.error(err)
    }
  }, [router])

  function saveLightningAddress() {
    if (!pubkeyHex || !lightningAddress.trim()) return
    localStorage.setItem(`ln_address_${pubkeyHex}`, lightningAddress.trim())
    setLnSaved(true)
    setTimeout(() => setLnSaved(false), 2000)
  }

  function downloadBackup() {
    if (seedWords.length === 0 || !nsec) return
    const content = [
      "AfrikaPress Account Recovery Backup",
      "====================================",
      "",
      "KEEP THIS FILE SAFE. NEVER SHARE IT.",
      "Store it on a USB drive or print and hide it.",
      "",
      `Public Key (npub): ${npub}`,
      "",
      `Private Key (nsec): ${nsec}`,
      "",
      "24-Word Recovery Phrase:",
      seedWords.map((w, i) => `${i + 1}. ${w}`).join("\n"),
      "",
      `Generated: ${new Date().toISOString()}`,
    ].join("\n")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "afrikapress-recovery-backup.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

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
      <p className="mb-8 text-zinc-500">Manage your journalist identity, Lightning address, and recovery backup.</p>

      {/* Public key */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-2 text-lg font-bold text-white">Public Key (npub)</h2>
        <p className="mb-4 text-sm text-zinc-500">
          This is your public journalist address. Share it so others can follow your work on Nostr.
        </p>
        <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-3 font-mono text-xs text-emerald-400 break-all">
          {npub}
        </div>
      </div>

      {/* Lightning Address */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-2 text-lg font-bold text-white">⚡ Lightning Address</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Add your Lightning address so readers can send you Bitcoin tips directly when they read your articles.
          Get a free one at <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">getalby.com</a>.
        </p>
        <div className="flex gap-2">
          <input
            value={lightningAddress}
            onChange={(e) => setLightningAddress(e.target.value)}
            placeholder="yourname@getalby.com"
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={saveLightningAddress}
            className={`rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${
              lnSaved ? "bg-emerald-500 text-black" : "bg-amber-500 text-black hover:bg-amber-400"
            }`}
          >
            {lnSaved ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-2 text-lg font-bold text-white">Private Key (nsec)</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Your private key gives full control over your account. NEVER share this with anyone.
        </p>

        {isRevealed ? (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-zinc-400">Nostr Private Key (nsec)</p>
              <div className="rounded border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-400 break-all">
                {nsec}
              </div>
            </div>

            {seedWords.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-zinc-400">24-Word Recovery Seed Phrase</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {seedWords.map((word, index) => (
                    <div key={index} className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 p-2">
                      <span className="text-[10px] text-zinc-500">{index + 1}.</span>
                      <span className="font-mono text-xs text-emerald-400">{word}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download backup */}
            <button
              onClick={downloadBackup}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              💾 Download Recovery Backup (.txt)
            </button>
            <p className="text-xs text-zinc-600">
              Save this file on a USB drive or print it and hide it somewhere safe.
              This is the only way to recover your account if you forget your 4 questions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReveal} className="mt-6 flex flex-col gap-4">
            <p className="text-sm font-semibold text-white">
              To reveal your private key, please confirm your 4 Brain Wallet answers:
            </p>
            
            <input
              type="text"
              placeholder="1. Your email address"
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="2. Your mother's first name"
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="3. A year you will never forget"
              value={q3}
              onChange={(e) => setQ3(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="password"
              placeholder="4. A secret word only you know"
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

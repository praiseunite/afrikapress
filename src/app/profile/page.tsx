"use client"

import { useEffect, useState } from "react"
import { loadSession } from "@/lib/auth/session"
import { nip19, getPublicKey } from "nostr-tools"
import { deriveKeyFromAnswers, keyToHex } from "@/lib/auth/derive-key"
import { keyToSeedWords } from "@/lib/auth/seed-phrase"
import { useRouter } from "next/navigation"
import {
  fetchJournalistProfile,
  publishProfile,
  type ProfileData,
} from "@/lib/nostr/social"

type SaveState = "idle" | "saving" | "saved" | "error"

export default function ProfilePage() {
  const router = useRouter()

  const [pubkeyHex, setPubkeyHex] = useState("")
  const [privkeyHex, setPrivkeyHex] = useState("")
  const [npub, setNpub] = useState("")
  const [nsec, setNsec] = useState("")
  const [seedWords, setSeedWords] = useState<string[]>([])
  const [isRevealed, setIsRevealed] = useState(false)
  const [verifyError, setVerifyError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  // Brain wallet questions
  const [q1, setQ1] = useState("")
  const [q2, setQ2] = useState("")
  const [q3, setQ3] = useState("")
  const [q4, setQ4] = useState("")

  // Identity form fields
  const [name, setName] = useState("")
  const [about, setAbout] = useState("")
  const [picture, setPicture] = useState("")
  const [lightningAddress, setLightningAddress] = useState("")
  const [nip05, setNip05] = useState("")
  const [profileSaveState, setProfileSaveState] = useState<SaveState>("idle")
  const [profileError, setProfileError] = useState("")
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    const key = loadSession()
    if (!key) { router.push("/auth/login"); return }

    try {
      const pub = getPublicKey(new Uint8Array(Buffer.from(key, "hex")))
      setPrivkeyHex(key)
      setPubkeyHex(pub)
      setNpub(nip19.npubEncode(pub))
      setNsec(nip19.nsecEncode(new Uint8Array(Buffer.from(key, "hex"))))
      const seedResult = keyToSeedWords(new Uint8Array(Buffer.from(key, "hex")))
      if (seedResult.ok) setSeedWords(seedResult.value)

      // Load existing Kind 0 profile from Nostr
      fetchJournalistProfile(pub).then((profile) => {
        // Only pre-fill if not placeholder
        if (!profile.name.endsWith("…")) setName(profile.name)
        setAbout(profile.about)
        setPicture(profile.picture)
        if (profile.lightningAddress) setLightningAddress(profile.lightningAddress)
        if (profile.nip05) setNip05(profile.nip05)
        setIsLoadingProfile(false)
      })
    } catch {
      setIsLoadingProfile(false)
    }
  }, [router])

  async function saveProfile() {
    if (!privkeyHex || !name.trim()) {
      setProfileError("Display name is required.")
      return
    }
    setProfileSaveState("saving")
    setProfileError("")

    const data: ProfileData = {
      name,
      about,
      picture,
      lud16: lightningAddress || undefined,
      nip05: nip05 || undefined,
    }

    const res = await publishProfile(data, privkeyHex)
    if (res.ok) {
      // Also persist lightning address locally for instant SocialBar display
      localStorage.setItem(`ln_address_${pubkeyHex}`, lightningAddress.trim())
      setProfileSaveState("saved")
      setTimeout(() => setProfileSaveState("idle"), 3000)
    } else {
      setProfileSaveState("error")
      setProfileError("Could not reach relays. Check your connection and try again.")
    }
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
    setVerifyError("")
    setIsVerifying(true)
    await new Promise((r) => setTimeout(r, 100))
    try {
      const result = deriveKeyFromAnswers([q1, q2, q3, q4])
      if (!result.ok) { setVerifyError("Please answer all 4 questions."); setIsVerifying(false); return }
      const derivedHex = keyToHex(result.value)
      if (derivedHex === privkeyHex) {
        setIsRevealed(true)
      } else {
        setVerifyError("Answers are incorrect. Try again.")
      }
    } catch {
      setVerifyError("An error occurred during verification.")
    }
    setIsVerifying(false)
  }

  if (!npub) return null

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-zinc-300 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Your Profile</h1>
        <p className="mt-1 text-zinc-500">Your journalist identity on AfrikaPress and the Nostr network.</p>
      </div>

      {/* ── Journalist Identity (Kind 0) ─────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-1 text-lg font-bold text-white">🪪 Journalist Identity</h2>
        <p className="mb-5 text-sm text-zinc-500">
          This is published to the Nostr network as your public profile (Kind 0). Anyone can see your name, bio, and picture.
        </p>

        {isLoadingProfile ? (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Avatar preview */}
            {picture && (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={picture} alt="Avatar" className="h-14 w-14 rounded-full object-cover border-2 border-zinc-700" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                <p className="text-xs text-zinc-500">Profile picture preview</p>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-400">Display Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amina Sule"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-400">Bio</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Investigative journalist covering West African politics and human rights."
                rows={3}
                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-400">Profile Picture URL</label>
              <input
                value={picture}
                onChange={(e) => setPicture(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-zinc-600">Upload your photo to any image host (e.g. imgur.com) and paste the link here.</p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-amber-400">⚡ Lightning Address</label>
              <input
                value={lightningAddress}
                onChange={(e) => setLightningAddress(e.target.value)}
                placeholder="yourname@getalby.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-zinc-600">
                Get a free one at{" "}
                <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">getalby.com</a>
                {" "}or{" "}
                <a href="https://walletofsatoshi.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">Wallet of Satoshi</a>.
                This is how readers send you Bitcoin.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-400">NIP-05 Verification (optional)</label>
              <input
                value={nip05}
                onChange={(e) => setNip05(e.target.value)}
                placeholder="you@yourdomain.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {profileError && (
              <p className="rounded-lg bg-red-500/10 p-2 text-xs text-red-400">{profileError}</p>
            )}

            <button
              onClick={saveProfile}
              disabled={profileSaveState === "saving" || !name.trim()}
              className={`w-full rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-40 ${
                profileSaveState === "saved"
                  ? "bg-emerald-500 text-black"
                  : profileSaveState === "error"
                  ? "bg-red-500 text-white"
                  : "bg-emerald-500 text-black hover:bg-emerald-400"
              }`}
            >
              {profileSaveState === "saving"
                ? "Publishing to Nostr…"
                : profileSaveState === "saved"
                ? "✓ Profile Published!"
                : profileSaveState === "error"
                ? "Failed — Try Again"
                : "Save & Publish Profile"}
            </button>
          </div>
        )}
      </div>

      {/* ── Public Key ───────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-1 text-lg font-bold text-white">Public Key (npub)</h2>
        <p className="mb-3 text-sm text-zinc-500">Your public journalist address. Share it so others can find you on any Nostr client.</p>
        <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-3 font-mono text-xs text-emerald-400 break-all">
          {npub}
        </div>
      </div>

      {/* ── Private Key ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-1 text-lg font-bold text-white">Private Key (nsec)</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Your private key gives full control over your account. <strong className="text-red-400">NEVER share this with anyone.</strong>
        </p>

        {isRevealed ? (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-zinc-400">Nostr Private Key (nsec)</p>
              <div className="rounded border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-400 break-all">{nsec}</div>
            </div>
            {seedWords.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-zinc-400">24-Word Recovery Seed Phrase</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {seedWords.map((word, i) => (
                    <div key={i} className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 p-2">
                      <span className="text-[10px] text-zinc-500">{i + 1}.</span>
                      <span className="font-mono text-xs text-emerald-400">{word}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={downloadBackup} className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-700">
              💾 Download Recovery Backup (.txt)
            </button>
            <p className="text-xs text-zinc-600">Save this file on a USB drive or print it and store it somewhere safe.</p>
          </div>
        ) : (
          <form onSubmit={handleReveal} className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-white">To reveal your private key, confirm your 4 Brain Wallet answers:</p>
            <input type="text" placeholder="1. Your email address" value={q1} onChange={(e) => setQ1(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none" />
            <input type="text" placeholder="2. Your mother's first name" value={q2} onChange={(e) => setQ2(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none" />
            <input type="text" placeholder="3. A year you will never forget" value={q3} onChange={(e) => setQ3(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none" />
            <input type="password" placeholder="4. A secret word only you know" value={q4} onChange={(e) => setQ4(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none" />
            {verifyError && <p className="text-sm text-red-500">{verifyError}</p>}
            <button type="submit" disabled={isVerifying}
              className="mt-2 rounded bg-red-500 px-6 py-3 font-bold text-white hover:bg-red-600 disabled:opacity-50">
              {isVerifying ? "Verifying…" : "Verify & Reveal Private Key"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

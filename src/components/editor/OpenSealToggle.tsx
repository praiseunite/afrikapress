"use client"

import { useState } from "react"

type Props = {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export function OpenSealToggle({ enabled, onChange }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <button
        data-testid="openseal-toggle"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative mt-0.5 h-6 w-11 flex-shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          enabled ? "bg-emerald-500" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>

      <div>
        <p className="text-sm font-medium text-white">🔏 OpenSeal on Bitcoin</p>
        <p className="mt-0.5 text-xs text-zinc-400">
          Creates permanent, tamper-proof evidence of this publication on the
          Bitcoin blockchain.
        </p>
      </div>
    </div>
  )
}

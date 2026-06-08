"use client"

import { useState } from "react"
import { detainedActivists } from "@/lib/data/detained-activists"

export function DetainedTrackerButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-900/50 transition-transform hover:scale-110 active:scale-95"
        title="Journalists & Activists Tracker"
      >
        <span className="text-2xl">🚨</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
                  <span>🚨</span> Detained Voices Tracker
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Journalists and activists targeted by the Nigerian state (2024-2026). We remember.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                {detainedActivists.map((person) => (
                  <div key={person.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white text-lg">{person.name}</h3>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{person.role}</p>
                      </div>
                      <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        person.status.includes("Released") || person.status.includes("Acquitted")
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {person.status}
                      </span>
                    </div>
                    
                    <p className="mb-4 text-sm text-zinc-400 leading-relaxed">
                      {person.reason}
                    </p>

                    <div className="flex justify-end">
                       <a
                        href={person.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
                      >
                        <span>Read Full Story</span>
                        <span>↗</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
              <p className="text-xs text-zinc-600">
                Data collected from CPJ, Amnesty International, FIJ, and Premium Times.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

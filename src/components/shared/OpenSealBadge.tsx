type BadgeVariant = "sealed" | "pending" | "unsealed"

type Props = { variant: BadgeVariant }

const STYLES: Record<BadgeVariant, string> = {
  sealed:   "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  pending:  "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  unsealed: "bg-zinc-800 text-zinc-500 border border-zinc-700",
}

const LABELS: Record<BadgeVariant, string> = {
  sealed:   "🔏 OpenSealed",
  pending:  "⏳ Sealing...",
  unsealed: "Not Sealed",
}

export function OpenSealBadge({ variant }: Props) {
  return (
    <span
      data-testid="openseal-badge"
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[variant]}`}
    >
      {LABELS[variant]}
    </span>
  )
}

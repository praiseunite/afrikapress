import type { ArticleEvent } from "@/lib/types/nostr"
import { OpenSealBadge } from "@/components/shared/OpenSealBadge"

type Props = { article: ArticleEvent; onClick: () => void }

const timeAgo = (unix: number): string => {
  const seconds = Math.floor(Date.now() / 1000) - unix
  if (seconds < 60)  return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const shortPubkey = (pk: string): string => `${pk.slice(0, 8)}…${pk.slice(-4)}`

export function ArticleCard({ article, onClick }: Props) {
  const sealVariant = article.isSealed ? "sealed" : "unsealed"

  return (
    <article
      data-testid="article-card"
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-800/70"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold leading-snug text-white line-clamp-2">
          {article.title}
        </h2>
        <OpenSealBadge variant={sealVariant} />
      </div>

      <p className="mb-3 text-sm text-zinc-400 line-clamp-2">
        {article.content.replace(/[#*`]/g, "").slice(0, 140)}
      </p>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>@{shortPubkey(article.pubkey)}</span>
        <span>{timeAgo(article.created_at)}</span>
      </div>
    </article>
  )
}

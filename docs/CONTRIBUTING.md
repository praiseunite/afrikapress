# AfrikaPress — Developer Standards & Contribution Guide

Welcome to the AfrikaPress codebase. Before writing a single line of code, read
this document end to end. These are not suggestions — they are the rules of the
project. Every pull request will be reviewed against them.

---

## Philosophy

We write code like Rust developers who happen to be using TypeScript.

That means:
- **No null.** Use `undefined` or a typed `Result` pattern instead.
- **No unchecked errors.** Every function that can fail must return a typed error
  or throw a typed exception. Swallowed errors are rejected.
- **No surprises.** A reader should be able to understand what a function does
  purely from its name and type signature — no comments needed for that.
- **Less is more.** If it can be done in one line, write one line. No ceremony.
- **O(1) where it matters.** Hash maps, not loops, for lookups. Indexes, not
  scans. Think before you iterate.

---

## Naming Rules

### Variables
Name things after what they *are*, not what type they are.

```ts
// Bad — generic, unhelpful
const data = await fetchUser()
const arr = events.map(e => e.id)
const val = 1000

// Good — specific, self-documenting
const journalist = await fetchUser()
const eventIds = events.map(e => e.id)
const satoshiAmount = 1000
```

### Functions
Name functions after what they *do*, as a verb phrase.

```ts
// Bad
function key() {}
function nostr() {}

// Good
function deriveKeyFromAnswers() {}
function publishArticle() {}
function verifyTimestampProof() {}
```

### Booleans
Always prefix with `is`, `has`, `can`, or `did`.

```ts
const isLoggedIn = !!session
const hasLightningWallet = profile.lightningAddress !== undefined
const canPublish = isLoggedIn && !isDraftEmpty
```

### Files
Use lowercase kebab-case. Name after what the file *does*, not what pattern
it implements.

```
// Bad
UserService.ts
AuthHelper.ts
Utils.ts

// Good
derive-key.ts
publish-article.ts
verify-proof.ts
```

---

## Error Handling — The Rule of No Surprises

Every function that touches external systems (Nostr relays, OpenTimestamps,
Lightning, the browser's crypto API) must handle its own errors explicitly.

We use a simple `Result<T, E>` pattern:

```ts
type Ok<T> = { ok: true; value: T }
type Err<E> = { ok: false; error: E }
type Result<T, E = string> = Ok<T> | Err<E>

const ok = <T>(value: T): Ok<T> => ({ ok: true, value })
const err = <E>(error: E): Err<E> => ({ ok: false, error })
```

**Usage:**

```ts
async function publishArticle(
  content: string,
  key: Uint8Array
): Promise<Result<string, 'relay_down' | 'sign_failed' | 'empty_content'>> {
  if (!content.trim()) return err('empty_content')

  const signed = signEvent(content, key)
  if (!signed) return err('sign_failed')

  const eventId = await broadcastToRelays(signed)
  if (!eventId) return err('relay_down')

  return ok(eventId)
}
```

Callers must always handle both branches:

```ts
const result = await publishArticle(body, nsec)
if (!result.ok) {
  showToast(`Publish failed: ${result.error}`)
  return
}
navigateToArticle(result.value)
```

**Banned patterns:**
```ts
// Never do this — silently swallowed error
try { ... } catch {}

// Never do this — untyped error
} catch (e) { console.log(e) }

// Never do this — assertion on unknown data
const user = data as User
```

---

## TDD — Test First, Code Second

Every feature must have its tests written before implementation. The cycle is:

1. Write a failing test that describes the desired behaviour.
2. Write the minimum code to make it pass.
3. Refactor if needed. Tests must still pass.

We use **Vitest** for unit tests and **Playwright** for end-to-end tests.

### Unit Test Template

```ts
// derive-key.test.ts
import { describe, it, expect } from 'vitest'
import { deriveKeyFromAnswers } from './derive-key'

describe('deriveKeyFromAnswers', () => {
  it('produces the same key for the same inputs', () => {
    const answers = ['chidi@gmail.com', 'Adaobi', '1998', 'mango']
    const keyA = deriveKeyFromAnswers(answers)
    const keyB = deriveKeyFromAnswers(answers)
    expect(keyA).toEqual(keyB)
  })

  it('produces different keys for different inputs', () => {
    const a = deriveKeyFromAnswers(['a@a.com', 'Mary', '2000', 'cat'])
    const b = deriveKeyFromAnswers(['b@b.com', 'Mary', '2000', 'cat'])
    expect(a).not.toEqual(b)
  })

  it('rejects fewer than 4 answers', () => {
    expect(() => deriveKeyFromAnswers(['a@a.com', 'Mary'])).toThrow()
  })
})
```

---

## BDD — Describe Behaviour, Not Implementation

End-to-end tests are written in plain English using Playwright and describe
user journeys, not code paths.

```ts
// auth.spec.ts
import { test, expect } from '@playwright/test'

test('a journalist can create an account and publish a story', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Create Account')
  await page.fill('[data-testid="answer-email"]', 'chidi@gmail.com')
  await page.fill('[data-testid="answer-mothers-name"]', 'Adaobi')
  await page.fill('[data-testid="answer-year"]', '1998')
  await page.fill('[data-testid="answer-secret"]', 'mango')
  await page.click('text=Generate My Account')

  await expect(page.locator('[data-testid="seed-words"]')).toBeVisible()
  await page.click('text=I have saved them')

  await page.goto('/write')
  await page.fill('[data-testid="article-title"]', 'INEC delays result upload in Kogi')
  await page.fill('[data-testid="article-body"]', 'Polling agents report...')
  await page.click('text=Publish to AfrikaPress')

  await expect(page.locator('text=Published')).toBeVisible()
})
```

---

## Component Rules

- One component per file.
- Props must always be fully typed. No `any`. No optional chains on non-optional props.
- If a component exceeds 80 lines, it is doing too much. Split it.
- Every interactive element must have a `data-testid` attribute for Playwright.
- No inline styles. Tailwind classes only.

```tsx
// Bad — anonymous, hard to debug, untestable
export default ({ title }: any) => <h1>{title}</h1>

// Good
type ArticleCardProps = {
  title: string
  author: string
  zapCount: number
  isSealed: boolean
}

export function ArticleCard({ title, author, zapCount, isSealed }: ArticleCardProps) {
  return (
    <article data-testid="article-card" className="rounded-lg p-4 bg-zinc-900">
      <h2 className="text-white font-semibold">{title}</h2>
      <p className="text-zinc-400 text-sm">{author}</p>
      {isSealed && <SealedBadge />}
      <ZapCount count={zapCount} />
    </article>
  )
}
```

---

## Git Commit Rules

We follow the Conventional Commits standard. Every commit message must match:

```
<type>: <short description in present tense>

Types:
  feat     — a new feature
  fix      — a bug fix
  test     — adding or fixing tests
  docs     — documentation only
  refactor — code change, no feature or fix
  chore    — build, tooling, dependencies
```

**Examples:**
```
feat: add Argon2id key derivation for brain wallet
fix: prevent empty article body from reaching relay
test: add BDD spec for journalist onboarding flow
docs: update architecture diagram with LNURL split
refactor: extract relay connection into singleton
```

**Never:**
```
fixed stuff
update
WIP
asdfgh
```

---

## Performance Rules

- Lookups must use `Map` or `Set`, never `Array.find()` in hot paths.
- Nostr event fetching must be paginated — never fetch unbounded lists.
- Images must be compressed client-side before upload (target < 500KB).
- PWA service worker must cache the shell and last 20 feed items for offline use.
- No `useEffect` with missing dependencies. Use `useCallback` for stable refs.

---

## Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e

# Type check
npm run typecheck

# Lint
npm run lint
```

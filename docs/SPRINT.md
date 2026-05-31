# AfrikaPress — Demo Sprint Board

**Goal:** Build a working, demonstrable MVP within 4 weeks. The demo must show
a journalist creating an account, publishing a story, and having it timestamped
on Bitcoin — live, on screen — to support the HRF grant application.

**Definition of Done:** HRF reviewer can visit `afrikapress.vercel.app`, create
an account with the Brain Wallet, publish an article, and see the OpenSeal badge.

---

## SPRINT 1 — Foundation & Identity
> **Milestone:** A journalist can create and recover an account with zero
> knowledge of cryptography.

---

### AP-01 · Project Infrastructure Setup
**Type:** Chore | **Estimate:** 1 day | **Assignee:** Praise

**User Story:**
> As a developer, I need a clean, typed, tested project foundation so that
> every feature I add has consistent tooling under it.

**Acceptance Criteria:**
- [ ] `vitest` configured with a passing smoke test (`1 + 1 === 2`)
- [ ] `playwright` installed and pointed at `localhost:3000`
- [ ] `npm run test`, `npm run test:e2e`, `npm run typecheck`, `npm run lint` all pass
- [ ] Folder structure matches `docs/architecture.md` exactly

**Tasks:**
- [ ] Install and configure `vitest` + `@vitest/coverage-v8`
- [ ] Install and configure `playwright` + create `playwright.config.ts`
- [ ] Add `typecheck` script (`tsc --noEmit`) to `package.json`
- [ ] Create all folders from the architecture doc (`lib/`, `components/`, `locales/`)

---

### AP-02 · Brain Wallet Key Derivation
**Type:** Feature | **Estimate:** 2 days | **Assignee:** Praise

**User Story:**
> As a journalist with no Bitcoin knowledge, I want to create my identity by
> answering questions I already know, so I never have to manage a hex key.

**Acceptance Criteria:**
- [ ] Same 4 answers always produce identical 32-byte key (deterministic)
- [ ] Different answers always produce a different key
- [ ] Fewer than 4 answers throws a typed error
- [ ] Key derivation uses Argon2id (memory ≥ 64MB, time ≥ 3 iterations)
- [ ] Function returns `Result<Uint8Array, 'insufficient_answers'>` — never throws

**Tasks:**
- [ ] Write failing unit tests for `deriveKeyFromAnswers()` first (TDD)
- [ ] Install `@noble/hashes` and implement `src/lib/auth/derive-key.ts`
- [ ] Implement `Result<T,E>` type helper in `src/lib/types/result.ts`
- [ ] All 3 unit tests pass with zero TypeScript errors

---

### AP-03 · BIP39 Seed Phrase Backup
**Type:** Feature | **Estimate:** 1 day | **Assignee:** Praise

**User Story:**
> As a journalist, I want a 12-word backup phrase I can write on paper, so
> that I can always recover my account even if I forget one of my answers.

**Acceptance Criteria:**
- [ ] 32-byte key correctly converts to 12 BIP39 words
- [ ] 12 words correctly recover the original 32-byte key
- [ ] PDF download contains all 12 words clearly formatted
- [ ] Round-trip test: `key → words → key` produces identical bytes

**Tasks:**
- [ ] Write round-trip unit tests first (TDD)
- [ ] Install `bip39` and implement `src/lib/auth/seed-phrase.ts`
- [ ] Implement PDF export using `src/lib/auth/export-pdf.ts`
- [ ] All unit tests pass

---

### AP-04 · Nostr Identity (Key → Profile)
**Type:** Feature | **Estimate:** 1 day | **Assignee:** Praise

**User Story:**
> As a journalist, once my key is derived, I want a valid Nostr identity so
> the app can publish signed content on my behalf.

**Acceptance Criteria:**
- [ ] 32-byte key correctly converts to `nsec` (bech32 Nostr private key)
- [ ] `nsec` correctly derives the matching `npub` (public key)
- [ ] NDK singleton connects to ≥ 3 relays on app load
- [ ] Connection failure is caught and surfaced as a typed error — never crashes

**Tasks:**
- [ ] Install `nostr-tools` and `@nostr-dev-kit/ndk`
- [ ] Implement `src/lib/auth/nostr-identity.ts` (key encoding/decoding)
- [ ] Implement `src/lib/nostr/relay-pool.ts` (NDK singleton)
- [ ] Write unit test: `deriveKey → toNsec → toNpub` round-trip

---

## SPRINT 2 — Account UI
> **Milestone:** A journalist can complete the full onboarding flow in the
> browser with no external dependencies.

---

### AP-05 · Create Account Screen (Step 1 — Questions)
**Type:** Feature | **Estimate:** 1 day | **Assignee:** Praise

**User Story:**
> As a journalist, I see a clean form asking for 4 personal questions, with
> clear explanation of why no email or password is needed.

**Acceptance Criteria:**
- [ ] Form has exactly 4 inputs, each with `data-testid`
- [ ] Submit button is disabled until all 4 fields are non-empty
- [ ] Pressing submit calls `deriveKeyFromAnswers` and navigates to Step 2
- [ ] Error state shown if derivation fails (typed error displayed)
- [ ] BDD Playwright test covers this full flow

**Tasks:**
- [ ] Build `src/components/auth/QuestionForm.tsx`
- [ ] Connect to `deriveKeyFromAnswers` from Sprint 1
- [ ] Write Playwright BDD test: fill form → click → see seed words
- [ ] Mobile-first responsive layout using Tailwind

---

### AP-06 · Create Account Screen (Step 2 — Seed Words)
**Type:** Feature | **Estimate:** 1 day | **Assignee:** Praise

**User Story:**
> As a journalist, after generating my key, I see my 12 backup words and can
> download them as a PDF before continuing.

**Acceptance Criteria:**
- [ ] 12 words displayed clearly, numbered, in a dark secure-looking card
- [ ] PDF download button works and contains all 12 words
- [ ] "Continue" button only appears after user clicks "I have saved my words"
- [ ] Going back to Step 1 does not regenerate a new key

**Tasks:**
- [ ] Build `src/components/auth/SeedWordDisplay.tsx`
- [ ] Wire up PDF export from Sprint 1
- [ ] Add "I have saved my words" confirmation checkbox
- [ ] Playwright test: see words → download PDF → click confirm → proceed

---

### AP-07 · Login Screen
**Type:** Feature | **Estimate:** 1 day | **Assignee:** Praise

**User Story:**
> As a returning journalist, I can log back in using either my 4 answers or
> my 12 backup words, and I land on the same account as before.

**Acceptance Criteria:**
- [ ] Two tabs: "Use My Answers" and "Use Backup Words"
- [ ] Brain Wallet tab: same 4-question form as onboarding
- [ ] Seed phrase tab: single textarea for 12 space-separated words
- [ ] Both paths derive the same key and produce the same `npub`
- [ ] Incorrect words give a typed, visible error — never a white crash screen

**Tasks:**
- [ ] Build `src/components/auth/LoginForm.tsx` with tab switcher
- [ ] Connect both paths to the key derivation functions from Sprint 1
- [ ] Write Playwright test: login via answers → same npub as onboarding
- [ ] Write Playwright test: login via seed words → same npub as onboarding

---

### AP-08 · Session Storage (Stay Logged In)
**Type:** Feature | **Estimate:** 0.5 days | **Assignee:** Praise

**User Story:**
> As a journalist, I don't want to re-enter my answers every time I open the
> app, but I want to be able to log out and wipe my key instantly.

**Acceptance Criteria:**
- [ ] On login, encrypted key is saved to `sessionStorage` (not `localStorage`)
- [ ] Refreshing the page keeps the user logged in
- [ ] Clicking "Log Out" immediately wipes the key from `sessionStorage`
- [ ] After logout, returning to the app shows the login screen

**Tasks:**
- [ ] Implement `src/lib/auth/session.ts` (save, load, clear key)
- [ ] Use `sessionStorage` (cleared on browser close) not `localStorage`
- [ ] Write unit test: save → load → clear → load returns `undefined`
- [ ] Wire logout button to `clearSession()` in the nav

---

## SPRINT 3 — Publishing & The Feed
> **Milestone:** A journalist can publish a story and a reader can see it live
> in the feed — with no centralized server involved.

---

### AP-09 · Article Editor
**Type:** Feature | **Estimate:** 1.5 days | **Assignee:** Praise

**User Story:**
> As a journalist, I have a clean, distraction-free writing space where I can
> type my story and publish it in one tap.

**Acceptance Criteria:**
- [ ] Title input and body textarea, both with `data-testid`
- [ ] "Publish" button disabled if title or body is empty
- [ ] OpenSeal toggle visible and ON by default
- [ ] Image attach button compresses image to < 500KB before upload
- [ ] Playwright test: fill title + body → click publish → see success state

**Tasks:**
- [ ] Build `src/components/editor/ArticleEditor.tsx`
- [ ] Build `src/components/editor/OpenSealToggle.tsx`
- [ ] Implement image compression in `src/lib/media/compress-image.ts`
- [ ] Wire publish button to `publishArticle()` (AP-10)

---

### AP-10 · Publish to Nostr
**Type:** Feature | **Estimate:** 1 day | **Assignee:** Praise

**User Story:**
> As a journalist, when I click publish, my story is instantly broadcast to
> multiple Nostr relays and becomes uncensorable.

**Acceptance Criteria:**
- [ ] Article published as Nostr `kind:30023` (long-form content)
- [ ] Published to ≥ 3 relays simultaneously
- [ ] Returns the Nostr event ID on success
- [ ] Returns a typed error if all relays are unreachable — never crashes
- [ ] Published article appears on `primal.net` within 30 seconds

**Tasks:**
- [ ] Implement `src/lib/nostr/publish-article.ts` using NDK
- [ ] Write unit test: mock relay → publish → check event structure
- [ ] Handle relay timeout with typed `'relay_unreachable'` error
- [ ] Verify published event appears on external Nostr client (manual)

---

### AP-11 · Main Feed
**Type:** Feature | **Estimate:** 1 day | **Assignee:** Praise

**User Story:**
> As a reader, I see a live feed of published AfrikaPress stories so I can
> read uncensored journalism.

**Acceptance Criteria:**
- [ ] Feed fetches the 20 most recent `kind:30023` events from relays
- [ ] Each article shows title, author npub (shortened), and time
- [ ] OpenSeal badge shown on sealed articles
- [ ] Feed renders from cache when offline (service worker)
- [ ] Loading state shown while fetching — never a blank white screen

**Tasks:**
- [ ] Implement `src/lib/nostr/fetch-feed.ts` (paginated, max 20)
- [ ] Build `src/components/feed/ArticleCard.tsx`
- [ ] Build `src/app/feed/page.tsx` with loading and error states
- [ ] Write Playwright test: publish article → refresh feed → see it

---

### AP-12 · OpenSeal (Bitcoin Timestamp)
**Type:** Feature | **Estimate:** 1.5 days | **Assignee:** Praise

**User Story:**
> As a journalist, when I publish with OpenSeal ON, my article gets an
> immutable Bitcoin timestamp that can be used as legal evidence.

**Acceptance Criteria:**
- [ ] SHA-256 hash of article content submitted to OpenTimestamps calendar
- [ ] `.ots` proof ticket stored as a tag on the Nostr event
- [ ] OpenSeal badge on the article updates from "Pending" to "Sealed: Block #XXXXX"
- [ ] Verification screen accepts a Nostr event ID and returns the block number
- [ ] Returns typed error if OpenTimestamps calendar is unreachable

**Tasks:**
- [ ] Install `opentimestamps` and implement `src/lib/openseal/stamp.ts`
- [ ] Implement `src/lib/openseal/verify.ts`
- [ ] Write unit test: known string → known SHA-256 hash (deterministic)
- [ ] Build `src/app/verify/page.tsx` with green/red verification result

---

## SPRINT 4 — Polish, PWA & Deploy
> **Milestone:** The demo is live at `afrikapress.vercel.app`, installs as a
> PWA on any phone, and is ready for the HRF screen recording.

---

### AP-13 · PWA Configuration
**Type:** Chore | **Estimate:** 0.5 days | **Assignee:** Praise

**User Story:**
> As a journalist in Lagos, I can install AfrikaPress directly from my
> browser and use it like a native app — with no app store.

**Acceptance Criteria:**
- [ ] `manifest.json` with correct name, icons (192px, 512px), theme color
- [ ] Service worker caches app shell + last 20 feed items
- [ ] "Add to Home Screen" prompt appears on Android Chrome
- [ ] App opens in standalone mode (no browser address bar)
- [ ] Lighthouse PWA score ≥ 90

**Tasks:**
- [ ] Install `next-pwa` and configure in `next.config.ts`
- [ ] Create `public/manifest.json` with AfrikaPress branding
- [ ] Generate icons in all required sizes
- [ ] Test install flow on a physical Android device

---

### AP-14 · Pidgin Language Support
**Type:** Feature | **Estimate:** 1 day | **Assignee:** Praise

**User Story:**
> As a Nigerian journalist who thinks in Pidgin, the app speaks my language —
> every button and label reads naturally to me.

**Acceptance Criteria:**
- [ ] Language toggle (EN / Pidgin) visible on every screen
- [ ] All UI strings in English are in `locales/en.json`
- [ ] All UI strings translated to Pidgin in `locales/pcm.json`
- [ ] Language preference persists across page refreshes
- [ ] No hardcoded English strings remain in any component

**Tasks:**
- [ ] Install `next-intl` and configure middleware
- [ ] Extract all strings to `en.json`
- [ ] Translate every string to Pidgin in `pcm.json`
- [ ] Build `src/components/shared/LanguageSwitcher.tsx`

---

### AP-15 · UI Polish & Accessibility
**Type:** Chore | **Estimate:** 1 day | **Assignee:** Praise

**User Story:**
> As a first-time visitor, the app looks premium and trustworthy — I feel
> safe using it to publish sensitive stories.

**Acceptance Criteria:**
- [ ] Dark theme applied consistently across all screens
- [ ] All text meets WCAG AA contrast ratios
- [ ] All interactive elements have visible focus rings (keyboard accessible)
- [ ] No layout breaks on screens from 320px (small Nokia) to 1440px (desktop)
- [ ] No Lighthouse accessibility warnings

**Tasks:**
- [ ] Apply dark theme tokens in Tailwind config
- [ ] Audit and fix all contrast issues
- [ ] Test responsive layout on 320px, 375px, 414px, 768px, 1024px
- [ ] Add `aria-label` to all icon-only buttons

---

### AP-16 · Production Deploy & Demo Recording
**Type:** Chore | **Estimate:** 0.5 days | **Assignee:** Praise

**User Story:**
> As an HRF grant reviewer, I can visit a live URL, create a test account,
> publish a story, and see it timestamped on Bitcoin in under 5 minutes.

**Acceptance Criteria:**
- [ ] App deployed to Vercel at `afrikapress.vercel.app`
- [ ] All environment variables set in Vercel dashboard
- [ ] End-to-end Playwright test suite passes against production URL
- [ ] 90-second screen recording covers: create account → publish → OpenSeal badge
- [ ] Recording uploaded and linked in the HRF grant application

**Tasks:**
- [ ] Set up Vercel project linked to GitHub `main` branch
- [ ] Configure production environment variables in Vercel
- [ ] Run `playwright test` against production URL
- [ ] Record and trim the 90-second demo video

# AfrikaPress — Development Task Tracker

## Phase 1: MVP (Months 1–3) — Target: HRF Grant Submission

### Month 1 — Foundation & Identity

#### Project Setup
- [ ] Create GitHub organization: `AfrikaPress`
- [ ] Initialize Next.js 14 + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Configure `next-pwa` (manifest, service worker, offline cache)
- [ ] Set up ESLint + Prettier for code consistency
- [ ] Write initial `README.md` (use the generated file)
- [ ] Add MIT License file
- [ ] Create folder structure as per implementation plan
- [ ] Set up Vercel deployment + custom domain `afrikapress.app`

#### Authentication — Brain Wallet
- [ ] Install `@noble/hashes` (Argon2id implementation)
- [ ] Install `bip39` library
- [ ] Write `src/lib/auth/brainwallet.ts`
  - [ ] Implement `deriveKeyFromAnswers(answers: string[])` function
  - [ ] Add salt: `"afrikapress-v1"`
  - [ ] Argon2id params: memory=64MB, iterations=3, parallelism=1
  - [ ] Returns 32-byte hex → Nostr `nsec` private key
- [ ] Write `src/lib/auth/bip39.ts`
  - [ ] Implement `privateKeyToMnemonic(nsec: string)` → 12 words
  - [ ] Implement `mnemonicToPrivateKey(words: string)` → nsec
  - [ ] Implement `exportToPDF(words: string[])` → downloadable PDF
- [ ] Write `src/lib/auth/keystore.ts`
  - [ ] Implement encrypted localStorage storage for session key
  - [ ] Implement `clearKey()` for logout
- [ ] Write unit tests for brainwallet determinism
  - [ ] Same 4 inputs must ALWAYS produce same nsec key
  - [ ] Different inputs must produce different keys

#### Authentication — UI Screens
- [ ] Build `src/app/auth/create/page.tsx` — 3-step onboarding wizard
  - [ ] Step 1: 4 question input form
  - [ ] Step 2: Display 12-word seed phrase + PDF download button
  - [ ] Step 3: Verify 2 random words before proceeding
- [ ] Build `src/app/auth/login/page.tsx`
  - [ ] Brain Wallet tab (4 questions)
  - [ ] Seed Phrase tab (12 word text input)
  - [ ] NWC/Extension tab (for advanced users)

#### Nostr Integration — Foundation
- [ ] Install `@nostr-dev-kit/ndk` and `nostr-tools`
- [ ] Write `src/lib/nostr/ndk.ts`
  - [ ] NDK singleton with relay list (your relay + 4 public relays)
  - [ ] Auto-connect on app load
- [ ] Write `src/lib/nostr/publish.ts`
  - [ ] `publishArticle(title, content, tags, nsec)` → Nostr kind:30023
  - [ ] `publishElectionResult(metadata, imageUrl, nsec)` → Nostr kind:1
- [ ] Write `src/lib/nostr/fetch.ts`
  - [ ] `fetchFeed(limit)` → array of articles from relays
  - [ ] `fetchProfile(npub)` → user profile metadata

---

### Month 2 — Core Publishing Features

#### Article Editor
- [ ] Build `src/components/editor/ArticleEditor.tsx`
  - [ ] Markdown text area with character count
  - [ ] Image attach button (compress before upload)
  - [ ] OpenSeal toggle switch (default: ON)
- [ ] Build `src/components/editor/OpenSealToggle.tsx`
  - [ ] Toggle UI with explanation tooltip
  - [ ] Shows "Bitcoin Block Pending..." after publish
  - [ ] Shows "✅ Sealed: Block #XXXXX" when confirmed
- [ ] Build `src/app/write/page.tsx`
  - [ ] Wire up editor + publish function
  - [ ] Loading state during publishing
  - [ ] Success screen with Nostr event ID

#### OpenSeal (Bitcoin Timestamping)
- [ ] Install `opentimestamps` library
- [ ] Write `src/lib/openseal/timestamp.ts`
  - [ ] `sealDocument(content: string)` → SHA-256 hash
  - [ ] `submitToOTS(hash)` → returns `.ots` calendar ticket
  - [ ] `verifyOTS(hash, otsTicket)` → returns block number or "pending"
  - [ ] Store `.ots` ticket as Nostr event tag on the article
- [ ] Build `src/app/verify/page.tsx`
  - [ ] Input: Nostr event ID or article URL
  - [ ] Fetches article from relay, extracts `.ots` tag
  - [ ] Runs verification → displays result with block explorer link

#### Main Feed
- [ ] Build `src/components/feed/ArticleCard.tsx`
  - [ ] Author name, timestamp, article preview
  - [ ] OpenSeal badge (🔒 Sealed / 🔓 Not Sealed)
  - [ ] Zap count
- [ ] Build `src/components/feed/ElectionCard.tsx`
  - [ ] State/LGA/PU metadata display
  - [ ] Thumbnail of EC8A photo
  - [ ] Mandatory sealed badge
- [ ] Build `src/app/feed/page.tsx`
  - [ ] Tabs: "Stories" / "Elections" / "Following"
  - [ ] Infinite scroll (load more on scroll)
  - [ ] Offline support (show cached feed when no internet)

---

### Month 3 — Payments, Elections & Launch

#### Lightning Payments (Zaps)
- [ ] Set up LNbits on VPS
  - [ ] Configure AfrikaPress Lightning address
  - [ ] Configure 2% split on all incoming Zaps
- [ ] Write `src/lib/lightning/zap.ts`
  - [ ] `generateZapInvoice(amount, recipientLightningAddress)` via NWC
  - [ ] `listenForPayment(invoice)` → confirm payment received
- [ ] Build `src/components/zap/ZapButton.tsx`
  - [ ] Amount selector: 100 / 1,000 / 5,000 / custom
  - [ ] QR code modal for invoice
  - [ ] Deep link for mobile wallets (opens Lightning wallet app)
  - [ ] Success animation when payment confirmed
  - [ ] "2% supports AfrikaPress" disclosure text

#### Election Transparency Module
- [ ] Build `src/components/elections/PhotoCapture.tsx`
  - [ ] Camera access via browser API
  - [ ] Auto-compress image to <500KB (saves data)
  - [ ] Preview before submit
- [ ] Build `src/components/elections/ResultsForm.tsx`
  - [ ] State dropdown (all 36 Nigerian states)
  - [ ] LGA dropdown (updates based on state)
  - [ ] Ward + PU number text input
  - [ ] Optional: manual result entry per party
- [ ] Build `src/app/elections/page.tsx`
  - [ ] Wire up PhotoCapture + ResultsForm
  - [ ] Force OpenSeal (non-optional for elections)
  - [ ] Submit → Nostr publish → OpenSeal → success screen

#### Localization
- [ ] Set up `next-intl` or `i18next` for translations
- [ ] Create `src/locales/en.json` (all UI strings in English)
- [ ] Create `src/locales/pcm.json` (Nigerian Pidgin translations)
- [ ] Build `src/components/shared/LanguageSwitcher.tsx`
- [ ] Test every screen renders correctly in Pidgin

#### Profile + Final Screens
- [ ] Build `src/app/profile/[npub]/page.tsx`
  - [ ] Avatar, bio, Lightning address
  - [ ] Article count, Zap received count
  - [ ] List of published articles
  - [ ] "Support this Journalist" Zap button
- [ ] Build `src/components/shared/OpenSealBadge.tsx`
  - [ ] Reusable badge: 🔒 Sealed / 🔓 Not Sealed

#### Infrastructure & Launch
- [ ] Set up DigitalOcean VPS ($12/month)
- [ ] Deploy `nostr-rs-relay` on VPS via Docker
- [ ] Deploy LNbits on VPS via Docker
- [ ] Configure Cloudflare DNS for relay domain
- [ ] Deploy PWA to Vercel
- [ ] Onboard 20 pilot journalists (Lagos, Abuja, Kano)
- [ ] Document each journalist's experience for HRF case studies

---

## Phase 2: Privacy & Expansion (Months 4–6)

- [ ] Cashu eCash anonymous donation integration
- [ ] Machankura USSD API integration (SMS Zap fallback)
- [ ] Hausa language support (`src/locales/ha.json`)
- [ ] Yoruba language support (`src/locales/yo.json`)
- [ ] Build Android APK with Capacitor or React Native Web
- [ ] Distribute APK directly from `afrikapress.app/download`
- [ ] Expand to 100+ journalists across West Africa

---

## Phase 3: Resilience & Scale (Months 7–12)

- [ ] Fedimint Emergency Legal Fund UI
- [ ] Submit to F-Droid open-source Android store
- [ ] French language support (Francophone West Africa)
- [ ] Partnership integrations (Yiaga Africa, Paradigm Initiative)
- [ ] Second African relay node (Ghana or Kenya)
- [ ] Self-sustaining Zap Split revenue covering server costs

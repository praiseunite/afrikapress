# AfrikaPress

**Publish without permission. Get paid without banks.**

AfrikaPress is an open-source, Bitcoin-native publishing and payment platform built for journalists, citizen reporters, and election observers operating under censorship and financial repression in West Africa.

Built on [Nostr](https://nostr.com), the [Bitcoin Lightning Network](https://lightning.network), and [OpenTimestamps](https://opentimestamps.org).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built on Nostr](https://img.shields.io/badge/Built%20on-Nostr-purple)](https://nostr.com)
[![Lightning](https://img.shields.io/badge/Payments-Lightning%20Network-orange)](https://lightning.network)
[![OpenTimestamps](https://img.shields.io/badge/Proofs-OpenTimestamps-blue)](https://opentimestamps.org)

---

## The Problem

In Nigeria — and across West Africa — the truth has two enemies:

**1. Censorship of Publishing**
Governments pressure social media companies to remove critical reporting. Journalists have their accounts suspended, their websites blocked, their stories deleted. During the 2024 #EndBadGovernance protests, 56 journalists were detained or assaulted. The Cybercrimes Act Section 24 is weaponized to arrest reporters for posting truthful content online.

**2. Censorship of Money**
During the 2021 #EndSARS protests, the Central Bank of Nigeria froze the bank accounts of the Feminist Coalition within 48 hours of them going viral. Journalists and civil society groups who challenge the government cannot receive funding through traditional banks. PayPal is restricted. International wire transfers are expensive, slow, and traceable by state intelligence agencies.

**3. Manipulated Election Records**
In the 2023 Nigerian presidential election, INEC's promised electronic result upload system (IReV) failed, was delayed, or showed results inconsistent with what was announced at polling units. When candidates went to court to request the raw data, they were denied or given incomplete records. Citizens had no way to prove what the authentic local results were.

**AfrikaPress solves all three problems** with a single open-source tool built on Bitcoin's freedom-technology stack.

---

## The Solution

AfrikaPress is a **Nostr client application** specifically designed for:

- **Journalists** who need to publish stories that cannot be taken down
- **Citizen reporters** who need to document election results before they can be altered
- **Readers** who want to fund independent journalism without a bank account

### How It Works

| Layer | Technology | What It Does |
| :--- | :--- | :--- |
| **Publishing** | Nostr Protocol | Stories broadcast to thousands of independent relays simultaneously. No single server to shut down. |
| **Payments** | Bitcoin Lightning Network | Readers send direct, instant, borderless Bitcoin tips (Zaps) to journalists. No bank required. |
| **Proof** | Bitcoin Blockchain (OpenSeal) | Every article and election photo is cryptographically timestamped on Bitcoin. Tamper-proof legal evidence. |

### System Architecture

```
  📱 USER'S PHONE (AfrikaPress PWA — No App Store Required)
  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │  🔑 Brain Wallet                  📄 12-Word Backup     │
  │  Argon2id(email + answers)  ←→   BIP39 Seed Phrase     │
  │  → Generates nsec key locally     → Downloadable PDF    │
  │  → No server. No email. No ID.                          │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
         │ publishes to              │ timestamps on
         ▼                           ▼
  🌐 NOSTR RELAY NETWORK        ₿ BITCOIN BLOCKCHAIN
  ┌────────────────────┐        ┌────────────────────┐
  │ 🇳🇬 AfrikaPress    │        │ OpenTimestamps      │
  │    African Relay   │        │ Calendar Server     │
  │ 🌍 Global Public   │        │        ↓            │
  │    Relays (free)   │        │ OP_RETURN Anchor    │
  │ 🌍 Backup Relays   │        │ Permanent. Forever. │
  └────────────────────┘        └────────────────────┘
         │ pays via
         ▼
  ⚡ LIGHTNING NETWORK
  ┌────────────────────────────────┐
  │ Reader → Journalist:  98% sats │
  │ Reader → AfrikaPress:  2% sats │
  │ (instant, no bank, no KYC)    │
  └────────────────────────────────┘
```

---

## Key Features

### 🔑 Brain Wallet — No Email, No Password, No Server
AfrikaPress uses a custom identity system built for users who cannot safely store long cryptographic keys.

Users create their identity by answering 4 personal questions (e.g., email, mother's name, a memorable year, a secret word). The app uses **Argon2id** (the gold-standard key-stretching algorithm) to deterministically derive their Nostr private key from these answers — entirely on-device. No data is ever sent to a server.

A **12-word BIP39 seed phrase** is always generated as a backup and can be exported as a PDF.

The user can always regenerate their account on any device by re-entering the same 4 answers. No "forgot password" email needed. No account exists on any server to be hacked or handed to a government.

### 📰 Censorship-Resistant Publishing (Nostr)
Articles published on AfrikaPress are broadcast simultaneously to multiple independent Nostr relays. To censor a story, a government would need to contact every relay operator in the world — an impossible task. The journalist's identity (their Nostr keypair) is portable: they can use their key on any Nostr client, anywhere, forever.

### 🔏 OpenSeal — Bitcoin Timestamping
Every article and election photo published through AfrikaPress is automatically processed by **OpenSeal** — our integration of [OpenTimestamps](https://opentimestamps.org). The SHA-256 hash (digital fingerprint) of the content is anchored to the Bitcoin blockchain via `OP_RETURN`.

This creates an immutable, court-admissible proof that the content existed, unaltered, at a specific date and time. Even if all Nostr relays go offline, the Bitcoin proof remains on the blockchain permanently.

**Use case:** A citizen journalist photographs an authentic polling unit result sheet (Form EC8A) during the Nigerian election. AfrikaPress OpenSeals the photo. When the central INEC portal shows a different result two days later, the journalist can present the Bitcoin timestamp as evidence to an election tribunal.

### 🗳️ Election Transparency Module
A dedicated module allows citizen observers to:
1. Photograph their polling unit result sheet (Form EC8A / EC60E)
2. Tag it with the State, LGA, Ward, and Polling Unit number
3. Publish it to the Nostr network (uncensorable)
4. Auto-timestamp it on Bitcoin (tamper-proof)

OpenSeal is **mandatory** for election submissions and cannot be disabled.

### ⚡ Lightning Zaps — Pay Journalists Without a Bank
Readers can support journalists instantly with Bitcoin micropayments (Zaps) directly through the app. Payments go peer-to-peer — no bank, no PayPal, no intermediary. 

A 2% platform fee on all Zaps sustains AfrikaPress's infrastructure costs and development. This is disclosed transparently in the app.

### 🌍 African-First Design
- **Progressive Web App (PWA):** Installs directly from the browser. No Google Play Store. No Apple App Store. No censorship of the app itself.
- **Low-bandwidth optimized:** Images auto-compressed. Feed cached offline. Works on slow 3G connections.
- **No App Store:** Also distributed as a direct Android APK download from `afrikapress.app/download`
- **Language support:** English + Nigerian Pidgin (Phase 1). Hausa, Yoruba, French (Phase 2).

---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| Framework | Next.js 14 (React + TypeScript) |
| Styling | Tailwind CSS |
| PWA | next-pwa |
| Nostr Protocol | NDK (@nostr-dev-kit/ndk) + nostr-tools |
| Key Derivation | @noble/hashes (Argon2id) |
| Seed Phrases | bip39 |
| Bitcoin Timestamping | opentimestamps-js |
| Lightning Payments | Nostr Wallet Connect (NWC) |
| Relay Software | nostr-rs-relay (Rust) |
| Lightning Backend | LNbits |
| Hosting | Vercel (frontend) + DigitalOcean (relay) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A Lightning wallet for testing (e.g., [Mutiny](https://mutinywallet.com), [Alby](https://getalby.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/AfrikaPress/afrikapress.git
cd afrikapress

# Install dependencies
npm install

# Copy the environment variables file
cp .env.example .env.local

# Configure your environment variables
# See .env.example for required variables

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

```env
# Nostr Relay Configuration
NEXT_PUBLIC_AFRIKAPRESS_RELAY=wss://relay.afrikapress.app
NEXT_PUBLIC_FALLBACK_RELAYS=wss://relay.damus.io,wss://relay.primal.net

# Lightning Configuration
NEXT_PUBLIC_AFRIKAPRESS_LIGHTNING_ADDRESS=afrikapress@afrikapress.app
NEXT_PUBLIC_ZAP_SPLIT_PERCENTAGE=2

# OpenTimestamps
NEXT_PUBLIC_OTS_CALENDAR=https://alice.btc.calendar.opentimestamps.org

# App
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Running the Relay (Optional — Local Development)

```bash
cd relay/
docker-compose up -d
```

This starts a local `nostr-rs-relay` at `ws://localhost:8080`.

---

## Project Structure

```
afrikapress/
├── src/
│   ├── app/                   # Next.js pages
│   │   ├── page.tsx           # Splash / landing
│   │   ├── feed/              # Main article feed
│   │   ├── write/             # Article editor
│   │   ├── elections/         # Election transparency module
│   │   ├── verify/            # OpenSeal verification
│   │   ├── profile/[npub]/    # Journalist profiles
│   │   └── auth/              # Login + account creation
│   ├── components/            # Reusable UI components
│   │   ├── feed/              # ArticleCard, ElectionCard
│   │   ├── editor/            # ArticleEditor, OpenSealToggle
│   │   ├── elections/         # PhotoCapture, ResultsForm
│   │   ├── zap/               # ZapButton
│   │   └── shared/            # LanguageSwitcher, OpenSealBadge
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── brainwallet.ts # Argon2id key derivation
│   │   │   ├── bip39.ts       # 12-word seed phrase + PDF export
│   │   │   └── keystore.ts    # Encrypted local session storage
│   │   ├── nostr/
│   │   │   ├── ndk.ts         # NDK setup + relay connections
│   │   │   ├── publish.ts     # Publish articles and election data
│   │   │   └── fetch.ts       # Read events from relays
│   │   ├── openseal/
│   │   │   └── timestamp.ts   # Bitcoin timestamping via OpenTimestamps
│   │   └── lightning/
│   │       └── zap.ts         # NWC Zap invoice generation
│   ├── locales/               # Language files
│   │   ├── en.json            # English
│   │   └── pcm.json           # Nigerian Pidgin
│   └── types/
│       └── nostr.ts           # TypeScript types for Nostr events
└── relay/
    ├── docker-compose.yml     # Run relay + LNbits locally
    └── config.toml            # Relay configuration
```

---

## Roadmap

### ✅ Phase 1 — Minimum Viable Freedom (Months 1–3)
*Target: HRF Bitcoin Development Fund — Phase 1 Grant*

- [x] Brain Wallet authentication (Argon2id + BIP39)
- [x] Nostr article publishing (kind:30023)
- [x] OpenSeal automatic Bitcoin timestamping
- [x] Lightning Zap payments via NWC
- [x] OpenSeal verification screen
- [x] Election Transparency module (Form EC8A upload)
- [x] English + Nigerian Pidgin UI
- [x] PWA install (no app store required)
- [x] 20+ Nigerian journalists onboarded

### 🔄 Phase 2 — Privacy & Expansion (Months 4–6)
- [ ] Cashu eCash for fully anonymous donations
- [ ] Machankura USSD integration (SMS Zap on basic phones)
- [ ] Hausa language support
- [ ] Yoruba language support
- [ ] Android APK direct download
- [ ] 100+ journalists across West Africa

### 🔮 Phase 3 — Resilience & Scale (Months 7–12)
- [ ] Fedimint Emergency Legal Fund
- [ ] F-Droid open-source app store distribution
- [ ] French language (Francophone West Africa)
- [ ] Multi-country relay infrastructure (Ghana, Kenya)

---

## How to Contribute

AfrikaPress is fully open source under the MIT License. Contributions are welcome.

### Ways to Contribute

- **Code:** Fix bugs, implement features from the task tracker
- **Translation:** Help translate the app into Hausa, Yoruba, French, Swahili
- **Testing:** Test the app on different Android devices and report issues
- **Design:** Improve UX for low-literacy users or low-bandwidth scenarios
- **Documentation:** Improve docs and how-to guides for journalists

### Development Workflow

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/afrikapress.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Write tests if applicable
# Commit with a clear message
git commit -m "feat: add Hausa language support"

# Push and open a Pull Request
git push origin feature/your-feature-name
```

### Code Standards
- All new code must be written in TypeScript
- Run `npm run lint` before committing
- New authentication or cryptography code requires a peer review from at least one maintainer
- All UI strings must be added to both `en.json` and `pcm.json` (Nigerian Pidgin) before merging

---

## Privacy & Security

AfrikaPress is designed from first principles to protect journalists operating in hostile environments.

| Threat | AfrikaPress's Defense |
| :--- | :--- |
| Government demands journalist identity from platform | We have no user database. Identity lives only on the user's device. |
| Government orders article taken down | Nostr relays are decentralized. No single server to shut down. |
| Government denies a story existed | Bitcoin blockchain timestamp proves existence. Immutable. |
| Government freezes journalist's bank account | Lightning payments bypass the banking system entirely. |
| Government blocks the AfrikaPress website | Users can connect directly to Nostr relays. App works offline (cached PWA). |
| Government seizes journalist's phone | Brain Wallet can be regenerated from memory alone (4 known facts). |

**Security Disclosure:** If you discover a security vulnerability in AfrikaPress, please email `security@afrikapress.app`. Do not open a public GitHub issue for security vulnerabilities.

---

## The Brain Wallet — Technical Explanation

AfrikaPress uses a custom key-derivation system to make Nostr identity accessible to non-technical journalists.

```
User inputs:
  answers = [email, mothersMaidenName, memorableYear, secretWord]

Derivation:
  salt       = "afrikapress-v1"
  combined   = answers.join("|")
  keyBytes   = Argon2id(combined, salt, memory=65536, time=3, parallelism=1)
  privateKey = keyBytes[0..31]  // 32 bytes = valid secp256k1 private key
  nsec       = bech32encode("nsec", privateKey)
```

**Why Argon2id?**
Argon2id is the OWASP-recommended algorithm for password-based key derivation. The `memory=65536` (64MB) parameter means each guess takes several seconds even on powerful hardware, making brute-force attacks computationally infeasible even if an attacker knows the user's email address.

**Why 4 questions?**
The entropy of 4 personal answers (each with many possible values) combined with Argon2id's cost parameters provides adequate security. The 12-word BIP39 seed phrase backup provides a high-entropy fallback that does not depend on user-chosen answers.

---

## Self-Sustainability

AfrikaPress applies a transparent **2% Zap Split** on all reader donations. This means:

- A journalist receives 98% of every Zap (Lightning tip) from readers
- AfrikaPress automatically receives 2% to cover infrastructure costs

This split is disclosed prominently in the app's Zap interface. As the platform grows, this model aims to make AfrikaPress self-sustaining beyond grant funding, ensuring long-term availability for the journalists who depend on it.

Current infrastructure costs: ~$25/month (Vercel free tier + $12/month VPS).

---

## Acknowledgements

AfrikaPress is supported by the [Human Rights Foundation Bitcoin Development Fund](https://hrf.org/bdfapply).

Built with gratitude on the shoulders of open-source giants:
- [Nostr Protocol](https://github.com/nostr-protocol/nostr) — fiatjaf and contributors
- [NDK (Nostr Development Kit)](https://github.com/nostr-dev-kit/ndk) — pablof7z
- [OpenTimestamps](https://github.com/opentimestamps/opentimestamps-client) — Peter Todd
- [noble/hashes](https://github.com/paulmillr/noble-hashes) — Paul Miller
- [Machankura](https://machankura.com) — 8333 (SMS Bitcoin Africa)

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

This software is free to use, fork, and modify. If you build a version for your country, please contribute improvements back to the main repository so all journalists benefit.

---

## Contact

- **Platform:** [afrikapress.app](https://afrikapress.app)
- **Nostr:** `npub1afrikapress...` *(update after first key generation)*
- **Email:** hello@afrikapress.app
- **Security:** security@afrikapress.app
- **Geyser Fund (Donations):** [geyser.fund/project/afrikapress](https://geyser.fund)

*For journalists in immediate danger, please contact the [Committee to Protect Journalists](https://cpj.org) or [Reporters Without Borders](https://rsf.org).*

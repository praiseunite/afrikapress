# AfrikaPress

> **Uncensorable journalism and citizen election monitoring — secured by Bitcoin and Nostr.**

**Live:** [afrikapress.vercel.app](https://afrikapress.vercel.app) · **License:** MIT · **Stack:** Next.js · Nostr · OpenTimestamps · Lightning Network

---

## The Problem

In Nigeria's 2023 presidential election, the Independent National Electoral Commission (INEC) promised real-time result uploads via the IReV portal. It failed. Results were disputed. The Labour Party spent over a year in court contesting outcomes — and the full truth was never independently verifiable by ordinary Nigerians.

This is not a Nigerian problem alone. Across Africa — and across the world — journalists are silenced, election results are falsified, and there is no tamper-proof record that ordinary citizens can independently verify.

AfrikaPress solves both problems with the same technology: **Bitcoin and Nostr.**

---

## What AfrikaPress Does

### 🗞️ Uncensorable Journalism
- Journalists write and publish long-form articles directly to the global Nostr network
- No central server. No company. No single point that a government can raid or shut down
- Every article is **sealed on the Bitcoin blockchain** via OpenTimestamps — proving exactly when it was written, in a way that no court order can alter
- Readers can tip journalists directly in Bitcoin via the **Lightning Network** — no bank, no PayPal, no account that can be frozen

### 🗳️ Citizen Election Monitoring
- Any citizen can submit their Polling Unit result from any election, in any country
- Each submission is **cryptographically signed** with the citizen's private key — forgeries are mathematically detectable
- Results are **anchored to the Bitcoin blockchain** — a permanent, public record that no court or electoral commission can alter
- Anyone in the world can independently calculate the true aggregate result from the raw on-chain data

---

## Why Bitcoin and Nostr?

| Requirement | Solution |
|---|---|
| Censorship resistance | Nostr — decentralised protocol with no central server |
| Permanent tamper-proof records | OpenTimestamps — hashes anchored to Bitcoin blocks |
| Direct journalist monetisation | Lightning Network — instant Bitcoin payments worldwide |
| No surveillance | Brain Wallet — no email, no phone, no personal data stored |
| No app store censorship | Progressive Web App — installs directly from the browser |

---

## Key Technical Features

### Brain Wallet Login (No Email, No Password)
Journalists create their cryptographic identity by answering 4 personal questions only they know. The answers are hashed using PBKDF2 into a 256-bit private key. Zero personal data is ever transmitted or stored on any server.

### OpenTimestamps Integration
Every article and election result is hashed (SHA-256) and submitted to the OpenTimestamps calendar network. The calendar aggregates thousands of such hashes into a single Bitcoin transaction per block (~10 minutes). The resulting `.ots` proof is stored alongside the article in the Nostr event. Anyone can verify the proof independently using the open-source OpenTimestamps tooling.

### Lightning Zaps (NIP-57)
Journalists add their Lightning address (e.g. from [Alby](https://getalby.com)) to their profile. Readers see a ⚡ Zap button on every article. Clicking it generates a BOLT-11 invoice via LNURL-pay, which the reader pastes into any Lightning wallet. No custodian. No middleman. Sats go directly to the journalist.

### Nostr-Native Architecture
- Articles: Nostr kind `30023` (long-form content)
- Election results: Nostr kind `1` with structured tags
- All content tagged `#afrikapress` for clean filtering
- Connects to 3 global public relays with a 4-second timeout fallback

---

## Running Locally

```bash
git clone https://github.com/praiseunite/afrikapress
cd afrikapress
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Cannot Be Shut Down

1. **No company to raid.** AfrikaPress has no office, no CEO, no centrally held data.
2. **No server to seize.** Articles and election results live on 20+ global Nostr relay servers across multiple jurisdictions.
3. **No domain required for the data.** If the website is blocked by an ISP, anyone can spin up a new front-end pointing to the same Nostr data within hours.
4. **Bitcoin proofs are permanent.** Even if every relay on earth was shut down, the OpenTimestamps proofs embedded in the Bitcoin blockchain remain accessible and verifiable forever.

---

## Documenting the Crackdown (2025–2026)

AfrikaPress was built in direct response to the escalating persecution of journalists and activists in Nigeria. Recent data highlights the urgent need for a censorship-resistant publishing and payment platform:

*   **Sodeeq Atanda & Daniel Ojukwu (FIJ):** Investigative journalists from the Foundation for Investigative Journalism repeatedly targeted, abducted, and detained by police forces (IRT and IGP Monitoring Unit) using the Cybercrimes Act to punish their reporting.
*   **Omoyele Sowore (SaharaReporters):** A prominent activist and publisher subjected to frequent harassment and multiple arrests following his participation in protests and criticism of the government.
*   **The #EndBadGovernance 11:** Protest leaders (including Adaramoye Michael Lenin and Daniel Akande) arrested during the August 2024 economic hardship protests and baselessly charged with "treasonable felony" and "terrorism" before being acquitted in December 2025.
*   **Okey Ndibe:** Writer and public intellectual briefly detained by the State Security Service (SSS) at Lagos airport in June 2026, demonstrating the state's willingness to intimidate government critics.

*(Data sourced from the Committee to Protect Journalists, Amnesty International, FIJ, and Premium Times.)*

---

## Grant Applications

AfrikaPress is applying for open-source funding from:
- [Human Rights Foundation — Bitcoin Development Fund](https://hrf.org/bdfapply)
- [OpenSats — Nostr Fund](https://opensats.org/apply)
- [BTrust Builders](https://btrust.tech)

Funds will be used to cover developer time to build the Android app, a dedicated AfrikaPress Nostr relay, expanded language support (Hausa, Yoruba, Igbo, French, Swahili), and community onboarding of Nigerian journalists and election monitors ahead of the 2027 elections.

---

## Contributing

AfrikaPress is fully open source under the MIT License. Contributions, issues, and pull requests are welcome.

Built with ❤️ in Nigeria, for Africa and the world.

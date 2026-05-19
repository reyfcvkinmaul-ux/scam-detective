# Scam Detective — Web3 Safety Academy

> Learn to detect crypto scams before they detect you.

A gamified web3 safety education platform. Users play as a detective who investigates suspicious airdrops, phishing sites, fake support DMs, rugpull tokens, and malicious approvals. Each mission is a short detective case: review evidence, tag red flags, answer quiz questions, and deliver a verdict.

## Phase 4 — Anti-cheat + Leaderboard (live ✓)

🌐 **Live app:** https://scam-detective-zeta.vercel.app

| Contract V2 (anti-cheat) | Address |
|--------------------------|---------|
| SafetyBadgeV2 (EIP-712 signed mint) | [`0xf24Da065E40F29a3d8d6ed20cce9bf3ce85e6869`](https://sepolia.basescan.org/address/0xf24Da065E40F29a3d8d6ed20cce9bf3ce85e6869) |
| ReputationScore (V2)               | [`0x981421c66FB79350b4d3D947C84F6593b2891c1C`](https://sepolia.basescan.org/address/0x981421c66FB79350b4d3D947C84F6593b2891c1C) |

### Anti-cheat (EIP-712 signed proofs)
- Server signer wallet (separate from deployer) lives in Vercel env (`SIGNER_PRIVATE_KEY`)
- `/api/proof` endpoint signs `MintProof(user, missionId, deadline)` only when client passes the case
- Smart contract `mintWithProof()` verifies signer recovery + deadline freshness
- Open `mint()` is disabled by default (`openMintEnabled = false`); owner can toggle for emergencies
- Foundry test suite: 14/14 passing — covers expired proof, wrong signer, replay-to-other-user, signer rotation
- E2E verified on-chain: token #2 minted via signed proof, replay to different wallet → `InvalidSignature` revert

### Leaderboard (`/leaderboard`)
- Reads `BadgeMinted` events directly from Base Sepolia — no DB, no indexer required
- Pagination handles RPC's 2000-block cap automatically
- Auto-refreshes every 60s via Vercel ISR
- Sorted by total XP, then badge count

### V1 → V2 migration
- V1 holders auto-airdropped to V2 at deploy time via `airdropBadge()`
- V1 contracts at `0xF94c8ccd…6E81` / `0x4F4B5A00…f7FC` deprecated but still readable

## Phase 3B — Vercel Production Deploy (live ✓)

🌐 **Live app:** https://scam-detective-zeta.vercel.app

- ✅ Frontend deployed to Vercel production
- ✅ `setBaseURI` + `configureMissionBySlug` updated on-chain (6 txs) — `tokenURI()` now resolves to live domain
- ✅ Badge metadata + SVG reachable: token #1 will display correctly on Basescan, OpenSea, wallet apps
- ✅ All 7 routes smoke-tested at 200 OK (homepage, /missions, /profile, all 5 case pages, /badges/*.json, /badges/*.svg)

### Phase 4 — Anti-cheat + leaderboard (next)
- EIP-712 signed proof from server: user must actually pass the case before mint succeeds
- Public leaderboard at `/leaderboard` reading on-chain XP via `ReputationScore`
- Daily challenge mode

## Phase 3 — On-chain Layer (deployed ✓)

Soulbound badges live on Base Sepolia.

| Contract | Address |
|----------|---------|
| SafetyBadge (ERC-5192 SBT)  | [`0xF94c8ccd776d5b13095199B57F775AfDA9AE6E81`](https://sepolia.basescan.org/address/0xF94c8ccd776d5b13095199B57F775AfDA9AE6E81) |
| ReputationScore             | [`0x4F4B5A00D9b6DC8659947b7AF97855A29978f7FC`](https://sepolia.basescan.org/address/0x4F4B5A00D9b6DC8659947b7AF97855A29978f7FC) |

- ✅ ERC-721 + EIP-5192 soulbound (locked, non-transferable). 1 badge per (wallet, missionId)
- ✅ ReputationScore aggregator: total XP + badge count read on-chain
- ✅ Foundry test suite: 15/15 passing
- ✅ All 5 missions configured at deploy time
- ✅ E2E verified on-chain: token #1 minted, `locked()` = true, ReputationScore reads 120 XP
- ✅ Source verification submitted to Sourcify
- ✅ Frontend mint button live, profile shows on-chain status

### Phase 3B — Vercel + Verified Etherscan (next)
- Deploy frontend to Vercel
- Verify both contracts on Basescan (needs free API key from basescan.org)
- Optional: server-signed proofs (EIP-712) so users can't mint without actually passing a case

## Phase 2 — Wallet auth + 5 playable cases

Wallet login (MetaMask, OKX, EIP-6963 multi-injected) + local persistence + all 5 cases playable end-to-end.

- ✅ wagmi v2 + viem, configured for Base Sepolia
- ✅ Connect modal: MetaMask, OKX Wallet, plus generic injected (Rabby/Trust/Frame/etc)
- ✅ Wallet badge in header with copy/profile/disconnect dropdown, wrong-chain switch hint
- ✅ Zustand profile store, persisted to localStorage, scoped per wallet address (or "guest")
- ✅ Per-mission completion tracking: best-score wins, XP delta only on improvement
- ✅ Daily streak counter (current + longest)
- ✅ Soulbound badges collected per mission slug
- ✅ Mission dashboard: completion checkmarks, score chips, retry indicator, total XP/badges/streak
- ✅ Profile page: badge gallery, stat cards, recent activity timeline
- ✅ All 5 cases populated and playable: Free Airdrop, Seed Phrase Phishing, Rugpull Token, Fake Customer Support, Malicious Approval

## Phase 1 — MVP (initial commit)

Frontend-only, no wallet, no backend, no contracts. Five mission categories, **one playable case** end-to-end:

- ✅ Cyber-detective dark theme (Tailwind + Framer Motion)
- ✅ Homepage with hero, demo case preview, and how-it-works
- ✅ Mission dashboard with 5 cards (1 playable, 4 locked)
- ✅ Playable case: **Free Airdrop Alert** — 5 evidence tabs, 8 red flags, 3-question quiz, verdict, scoring, badge unlock
- ✅ Click-to-tag red flag mechanic on real evidence text
- ✅ Animated score reveal + soulbound-style badge ceremony

## Roadmap

### Phase 2 — Auth + Persistence (next)
- Privy (social + wallet, embedded wallet for non-crypto users)
- Supabase (Postgres) for user progress, mission history, leaderboard
- 4 more playable cases (Seed Phrase Phishing, Rugpull Token, Fake Support, Malicious Approval)
- Daily streaks, weekly missions

### Phase 2B — Sync + Leaderboard (next)
- Supabase + SIWE for cross-device sync
- Public seasonal leaderboard
- Daily challenge endpoint with curated case-of-the-day

### Phase 3 — On-chain Layer
- `SafetyBadge` (ERC-5192 soulbound) on Base Sepolia
- `ReputationScore` aggregating completed cases per wallet
- `MissionRegistry` for sponsor-funded reward pools
- IPFS metadata via Pinata
- Web3 Safety Passport public profile page

### Phase 4 — AI + Sponsorship
- LLM-generated case variants via 9router (kr/claude-opus, cx/gpt)
- Personalized difficulty
- Sponsor admin panel (wallets, exchanges create branded cases)

## Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + custom cyber-detective theme tokens
- **Animation:** Framer Motion
- **Icons:** lucide-react
- **Target chain (Phase 3):** Base Sepolia → Base mainnet
- **Smart contracts (Phase 3):** Foundry + Solidity, ERC-5192 soulbound

## Run locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

Build:

```bash
npm run build
npm run start
```

## Project structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout, dark mode
│   ├── page.tsx             # Homepage
│   ├── globals.css          # Theme tokens, panel/btn classes, redflag spans
│   └── missions/
│       ├── page.tsx         # Dashboard (5 cards)
│       └── [slug]/
│           ├── page.tsx     # Server component, getMission()
│           └── MissionView.tsx  # Client: tabs, redflag tagging, quiz, verdict, result
└── lib/
    ├── missions.ts          # Static mission data + types
    └── utils.ts             # cn() helper (clsx + tailwind-merge)
```

## Mission data model

Missions are authored in `src/lib/missions.ts` as typed TypeScript objects:

- `evidence[]` — tabs (social post, website, wallet popup, transaction, DM, etc.)
- `redFlags[]` — substrings that match inside evidence bodies; users click them to tag
- `quiz[]` — multiple-choice questions with explanations
- `correctVerdict` — `"safe" | "dangerous"`
- `badge` — soulbound badge metadata awarded on pass

The `EvidenceBody` renderer auto-splits each tab's text by `redFlags.text` matches, longest-first to avoid overlap. Each match becomes a clickable `<span>` that toggles the flag.

## Scoring

- 40% — red flags tagged (proportion found)
- 40% — quiz questions correct
- 20% — verdict correct

Pass = score ≥ 70 AND verdict correct → unlock badge.

## License

MIT (or pick what makes sense for the team)

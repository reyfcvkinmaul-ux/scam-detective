# Scam Detective — Web3 Safety Academy

> Learn to detect crypto scams before they detect you.

A gamified web3 safety education platform. Users play as a detective who investigates suspicious airdrops, phishing sites, fake support DMs, rugpull tokens, and malicious approvals. Each mission is a short detective case: review evidence, tag red flags, answer quiz questions, and deliver a verdict.

## Phase 1 — MVP (this commit)

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

# Scam Detective — Submission Package

This file is a one-page reference for hackathon / grant / showcase submissions.
Copy fields into the actual submission form.

---

## One-line pitch

> Scam Detective turns crypto scam patterns into bite-sized detective cases. Each case you solve mints a soulbound NFT badge — your on-chain proof of safety knowledge.

## Tagline

> Learn to detect crypto scams before they detect you.

## Project name

**Scam Detective — Web3 Safety Academy**

## Category / track

Education · Web3 Safety · Consumer dApp · Soulbound Identity · Public Goods

## Live demo

https://scam-detective-zeta.vercel.app

## Source code

https://github.com/reyfcvkinmaul-ux/scam-detective (MIT)

## Network

Base Sepolia (chainId 84532) — testnet, ready to migrate to Base mainnet.

## Deployed contract addresses

- SafetyBadgeV2 (EIP-712 mint + ERC-5192 soulbound):
  `0xf24Da065E40F29a3d8d6ed20cce9bf3ce85e6869`
  https://sepolia.basescan.org/address/0xf24Da065E40F29a3d8d6ed20cce9bf3ce85e6869
- ReputationScore (read-only XP aggregator):
  `0x981421c66FB79350b4d3D947C84F6593b2891c1C`
  https://sepolia.basescan.org/address/0x981421c66FB79350b4d3D947C84F6593b2891c1C

## The problem (3 sentences)

Crypto users lose billions per year to recurring scam patterns — fake airdrops, seed phrase phishing, malicious token approvals, fake support DMs, rugpull tokens. Every post-mortem reads the same: "the red flags were obvious in hindsight." Yet there's no fun, gamified way to *practice* detecting these patterns *before* encountering them.

## The solution (3 sentences)

Scam Detective is a detective game. You investigate 5 real scam scenarios, tag red flags, answer quiz questions, and deliver a verdict — and earn a soulbound NFT badge for each case you solve. Your wallet builds a public, on-chain reputation other dApps can use to gate sensitive actions or unlock perks for verified safety-aware users.

## What's unique

1. **Soulbound by design (EIP-5192)** — badges can't be bought, sold, or transferred. They mean what they say.
2. **Anti-cheat via EIP-712 signed proofs** — the open `mint()` path is disabled; minting requires a server-side signature that's only issued after the user demonstrably passes the case.
3. **Trustless leaderboard** — `/leaderboard` reads `BadgeMinted` events directly from the chain. No database, no indexer, no centralized point of failure.
4. **Composable reputation** — `ReputationScore` contract aggregates XP per address, queryable by any dApp.
5. **Real scam patterns, real teaching** — each case teaches a specific defense (red flag pattern, contract review, calldata decoding) you'll actually use when interacting with real protocols.

## Tech stack

- **Smart contracts**: Solidity 0.8.24, Foundry, OpenZeppelin v5
- **Standards**: ERC-721, EIP-5192 (soulbound), EIP-712 (typed signed data), EIP-6963 (multi-injected wallet)
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind, Framer Motion
- **Web3 SDK**: wagmi v2 + viem
- **State**: zustand + localStorage
- **Anti-cheat**: Node.js serverless signer in Vercel env
- **Hosting**: Vercel (Next.js + serverless API routes), Base Sepolia public RPC

## Test coverage

- Foundry: **29 tests passing** (15 V1 + 14 V2)
  - Mint success / double-mint revert
  - Soulbound transfer reverts (4 paths)
  - EIP-5192 `locked()` interface
  - EIP-712 `mintWithProof` happy path
  - Expired deadline → `ProofExpired`
  - Wrong signer → `InvalidSignature`
  - Replay-to-different-user → `InvalidSignature`
  - Signer rotation
  - Open mint toggle
- E2E live: 2 tokens minted on-chain, leaderboard correctly indexes them.

## Demo flow (for video / GIF)

1. Land on https://scam-detective-zeta.vercel.app
2. Connect MetaMask, switch to Base Sepolia
3. Open `/missions` — see 5 cases
4. Click "Free Airdrop Alert"
5. Phase 1 (Investigate): tag the red flags
6. Phase 2 (Quiz): answer 3 multiple-choice questions
7. Phase 3 (Verdict): scam or legit
8. Phase 4 (Result): if passed → "Mint badge on-chain (signed proof)" button
9. Click → frontend POSTs `/api/proof`, receives EIP-712 signature
10. Wallet popup, confirm tx, ~1 second later badge minted
11. Visit `/profile` → token visible with "On-chain ✓" chip + Basescan deep-link
12. Visit `/leaderboard` → ranked top 50 by XP, current user highlighted

## Sample tx (proof of life)

- **Mint via open path (V1)**: https://sepolia.basescan.org/tx/0x3e4a... (token #1, deployer)
- **Mint via signed proof (V2)**: https://sepolia.basescan.org/tx/0xc6b3805fa0a133bc30116daa14ec67b2997a31ee171de58661594ca2a691ae26 (token #2, deployer, anti-cheat enforced)

## Team

- **Reyn** (`@reyfcvkinmaul-ux` on GitHub) — sole builder, full-stack web3 development

## What was built during this hackathon

100% of code:
- 9 git commits
- 3 smart contract deployments on Base Sepolia
- 29 Foundry tests
- 18 production routes
- 2 EIP-712 signed-proof mints E2E verified
- 0 mainnet ETH spent (testnet only)

## Future roadmap

- Daily challenge mode (random case + bonus XP)
- Sponsored missions (projects fund USDC pools, users earn for safety education)
- ZK-proof of completion (replace trusted signer with on-chain provable correctness)
- Mainnet deployment to Base
- 20+ cases (community submissions)
- Mobile-first UX polish
- Anti-sybil via Privacy Pools / WorldID layering

## Why MiMo

[Personalize this paragraph based on which MiMo program — Reyn to fill in]

## License

MIT

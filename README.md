# 🕵️ Scam Detective — Web3 Safety Academy

> **Learn to detect crypto scams before they detect you.**

A gamified web3 safety education platform built on Base Sepolia. Users play as a detective investigating real scam patterns — fake airdrops, seed phrase phishing, rugpull tokens, fake support DMs, malicious token approvals — and earn **soulbound NFT badges** for each case they solve.

---

## 🚀 Live Demo

| | |
|---|---|
| **App**           | https://scam-detective-zeta.vercel.app |
| **Repo**          | https://github.com/reyfcvkinmaul-ux/scam-detective |
| **Network**       | Base Sepolia (chainId 84532) |
| **Tagline**       | *Learn to detect crypto scams before they detect you.* |

### Try It in 60 Seconds
1. Visit https://scam-detective-zeta.vercel.app
2. Connect MetaMask / OKX / any EIP-6963 injected wallet, switch to **Base Sepolia**
3. Open *Free Airdrop Alert* → tag red flags → answer quiz → deliver verdict
4. Click **Mint badge on-chain (signed proof)** — receive a soulbound ERC-721 you can't sell or transfer
5. Check `/leaderboard` and `/profile` — your XP is now public on-chain

> Need a Base Sepolia faucet? https://www.alchemy.com/faucets/base-sepolia

---

## 🎯 Why This Matters

Crypto users lose **billions per year** to scams that almost always look the same in hindsight. Yet there's no fun, gamified way to *practice* detecting these patterns before encountering them in the wild.

Scam Detective turns 5 of the most common scam categories into bite-sized investigation cases. Each completed case mints a **soulbound badge** — your on-chain proof of detective skill that follows your wallet forever. Build a reputation other dApps can verify; can't be bought, can't be sold, can't be sybil-farmed.

---

## 🧰 Tech Stack

**Smart Contracts** — Solidity 0.8.24, OpenZeppelin v5, Foundry
- `SafetyBadgeV2.sol` — ERC-721 + EIP-5192 (soulbound) + EIP-712 (signed mint proofs)
- `ReputationScore.sol` — read-only XP aggregator across all minted badges

**Frontend** — Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion
- wagmi v2 + viem (multi-injected, EIP-6963 wallet discovery)
- zustand for local profile state
- SWR for leaderboard refresh

**Anti-cheat** — Off-chain Node.js signer in Vercel env signs `MintProof(user, missionId, deadline)` typed data. Smart contract verifies signature on `mintWithProof()`. Replay attacks revert with `InvalidSignature`.

**Hosting** — Vercel (frontend + serverless API routes), Base Sepolia RPC for reads

---

## 📜 Deployed Contracts (Base Sepolia)

| Contract | Address |
|----------|---------|
| **SafetyBadgeV2** (EIP-712 signed mint) | [`0xf24Da065E40F29a3d8d6ed20cce9bf3ce85e6869`](https://sepolia.basescan.org/address/0xf24Da065E40F29a3d8d6ed20cce9bf3ce85e6869) |
| **ReputationScore**                     | [`0x981421c66FB79350b4d3D947C84F6593b2891c1C`](https://sepolia.basescan.org/address/0x981421c66FB79350b4d3D947C84F6593b2891c1C) |

Sample on-chain mint tx: [`0xc6b3805f…ae26`](https://sepolia.basescan.org/tx/0xc6b3805fa0a133bc30116daa14ec67b2997a31ee171de58661594ca2a691ae26)

---

## 🔐 Anti-Cheat Architecture

```
   Browser              Vercel Serverless          Base Sepolia
  ──────────            ──────────────────         ───────────────
   user passes  ──POST──▶ /api/proof
   case quiz             validates passed=true
                         signs MintProof EIP-712
                         with SIGNER_PRIVATE_KEY
                         (env var, never exposed)
                ◀──sig────
   wallet signs
   mintWithProof
   tx              ───────────────────────────▶ mintWithProof()
                                                  ↳ recover signer
                                                  ↳ check deadline
                                                  ↳ check no double-mint
                                                  ↳ mint soulbound NFT
                                                  ↳ aggregate XP
```

- **`mint()` open path is disabled by default** — only `mintWithProof()` works in production
- Server signer wallet (`0x4c8B…7CdE`) is **separate** from deployer; rotatable via `setSigner()`
- Replay attacks → `InvalidSignature` revert (proof is bound to specific user)
- Expired proofs → `ProofExpired` revert (5-minute deadline)
- Owner can toggle `openMintEnabled` for emergencies

---

## 🏆 Leaderboard (`/leaderboard`)

Fully trustless: aggregates `BadgeMinted` events from the blockchain directly via viem.
- **No database, no indexer** — `eth_getLogs` with 2000-block pagination
- 60s ISR cache
- Sorted by total XP, then badge count
- Top 50 detectives shown with Basescan deep-links

---

## 🧪 Tests & Verification

| Suite | Status |
|-------|--------|
| `forge test --match-contract SafetyBadgeTest`   | 15/15 ✅ |
| `forge test --match-contract SafetyBadgeV2Test` | 14/14 ✅ |
| End-to-end on-chain mint via signed proof       | ✅ |
| Replay attack from another wallet               | reverts `InvalidSignature` ✅ |
| Soulbound transfer attempt                      | reverts ✅ |
| Production smoke test (7 routes)                | 200 OK ✅ |

---

## 📂 Repo Structure

```
scam-detective/
├── contracts/                    Foundry project
│   ├── src/
│   │   ├── SafetyBadge.sol       V1 (legacy, deployed)
│   │   ├── SafetyBadgeV2.sol     V2 with EIP-712 signed mint (live)
│   │   └── ReputationScore.sol   XP aggregator
│   ├── script/
│   │   ├── Deploy.s.sol          V1 deploy
│   │   └── DeployV2.s.sol        V2 deploy + V1 migration airdrop
│   └── test/
│       ├── SafetyBadge.t.sol     15 tests
│       └── SafetyBadgeV2.t.sol   14 tests
└── src/
    ├── app/
    │   ├── page.tsx              Landing
    │   ├── missions/             5 detective cases
    │   ├── profile/              Wallet-scoped stats + on-chain badges
    │   ├── leaderboard/          Top 50 detectives
    │   └── api/
    │       ├── proof/route.ts    EIP-712 signer endpoint
    │       └── leaderboard/route.ts   On-chain event aggregator
    ├── lib/
    │   ├── wagmi.ts              Base Sepolia config
    │   ├── missions.ts           5 missions (all data-driven)
    │   ├── profile.ts            zustand + localStorage persistence
    │   └── contracts/            Addresses + ABIs + helpers
    └── components/
        ├── ConnectWalletButton.tsx
        ├── MintBadgeButton.tsx
        └── Providers.tsx
```

---

## 🛠️ Local Development

```bash
# Frontend
git clone https://github.com/reyfcvkinmaul-ux/scam-detective.git
cd scam-detective
npm install
npm run dev               # http://localhost:3000

# Contracts
cd contracts
forge install
forge build
forge test -vv

# Deploy your own (Base Sepolia)
cp .env.example .env      # paste PRIVATE_KEY + RPC
forge script script/DeployV2.s.sol --broadcast \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

---

## 🌱 What's Next

- **Daily challenge mode** — random case per UTC day with bonus XP
- **Sponsored missions** — projects can fund mission completions, users earn USDC + badge
- **Mainnet move** — Base mainnet deployment after community feedback
- **More cases** — currently 5, target 20+ with submissions from the community
- **ZK-proof of completion** — replace the trusted signer with a zero-knowledge proof of correct answers

---

## 📜 License

MIT — fork it, remix it, ship your own scam-education platform.

---

## 🙏 Acknowledgments

Built with love and a lot of `cast send` for the **MiMo** ecosystem.
Thanks to the OpenZeppelin team for battle-tested contracts and to Foundry for making Solidity testing actually fun.

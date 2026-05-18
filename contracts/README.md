# Scam Detective — Smart Contracts

Soulbound badge contracts for Scam Detective Web3 Safety Academy.

## Contracts

- **`SafetyBadge.sol`** — ERC-721 + EIP-5192 soulbound. One badge per `(wallet, missionId)` pair, where `missionId = keccak256(slug)`. Transfer/approve permanently blocked.
- **`ReputationScore.sol`** — read-only aggregator. Computes total XP and badge count for a wallet across a list of mission IDs. No mutable state.

## Setup

Foundry must be installed (`curl -L https://foundry.paradigm.xyz | bash && foundryup`).

```bash
cd contracts
forge install foundry-rs/forge-std --no-git
forge install OpenZeppelin/openzeppelin-contracts --no-git
forge build
forge test -vv
```

Expected output:
```
Ran 15 tests for test/SafetyBadge.t.sol:SafetyBadgeTest
Suite result: ok. 15 passed; 0 failed; 0 skipped
```

## Deploy to Base Sepolia

```bash
cp .env.example .env
# Edit .env:
#   PRIVATE_KEY    — funded with Base Sepolia ETH from a faucet
#   BADGE_BASE_URI — e.g. https://your-app.vercel.app/badges/

source .env
forge script script/Deploy.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify
```

The script will:
1. Deploy `SafetyBadge` (deployer is owner)
2. Deploy `ReputationScore` (immutable badge ref)
3. Set `baseURI` to `BADGE_BASE_URI`
4. Configure all 5 missions with their XP and metadata URI

After deploy, copy the printed addresses into:
- `../src/lib/contracts/addresses.ts` → `HARDCODED.safetyBadge` and `HARDCODED.reputationScore`
- Or set `NEXT_PUBLIC_SAFETY_BADGE_ADDRESS` + `NEXT_PUBLIC_REPUTATION_SCORE_ADDRESS` in Vercel env

## Verify on Basescan (manual)

If `--verify` failed:

```bash
forge verify-contract \
  --chain base-sepolia \
  --etherscan-api-key $BASESCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address)" $DEPLOYER) \
  $SAFETY_BADGE_ADDR \
  src/SafetyBadge.sol:SafetyBadge

forge verify-contract \
  --chain base-sepolia \
  --etherscan-api-key $BASESCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address)" $SAFETY_BADGE_ADDR) \
  $REPUTATION_SCORE_ADDR \
  src/ReputationScore.sol:ReputationScore
```

## Soulbound enforcement

Override of `_update()` blocks every transfer except mint (from = 0) and burn (to = 0). Both `approve()` and `setApprovalForAll()` revert with `NonTransferable` so wallets can't even register operator delegations.

`locked(uint256)` returns `true` for all token IDs (EIP-5192). The `Locked` event is emitted on every mint.

## Mission IDs

Each mission is keyed by `keccak256(bytes(slug))`. Slugs match `src/lib/missions.ts`:

| Slug | XP |
|------|----|
| `free-airdrop-alert`     | 120 |
| `seed-phrase-phishing`   | 130 |
| `rugpull-token-analysis` | 220 |
| `fake-customer-support`  | 110 |
| `malicious-approval`     | 300 |

// Contract addresses — populated after `forge script script/Deploy.s.sol --broadcast`
// You can also override via NEXT_PUBLIC_SAFETY_BADGE_ADDRESS env vars at build time.

import { type Address } from "viem";

const fromEnv = (name: string): Address | undefined => {
  const v = process.env[name];
  return v && v.startsWith("0x") && v.length === 42 ? (v as Address) : undefined;
};

// After deploy, paste the addresses here OR set NEXT_PUBLIC_* env vars in Vercel.
const HARDCODED = {
  safetyBadge: "0x0000000000000000000000000000000000000000" as Address,
  reputationScore: "0x0000000000000000000000000000000000000000" as Address,
};

export const CONTRACTS = {
  safetyBadge:
    fromEnv("NEXT_PUBLIC_SAFETY_BADGE_ADDRESS") ?? HARDCODED.safetyBadge,
  reputationScore:
    fromEnv("NEXT_PUBLIC_REPUTATION_SCORE_ADDRESS") ?? HARDCODED.reputationScore,
} as const;

export const isContractsConfigured = (): boolean =>
  CONTRACTS.safetyBadge !== "0x0000000000000000000000000000000000000000";

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASESCAN_BASE = "https://sepolia.basescan.org";

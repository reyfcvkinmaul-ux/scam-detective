import safetyBadgeAbi from "./SafetyBadgeV2.abi.json";
import reputationScoreAbi from "./ReputationScore.abi.json";

// Re-export under the V1 name so existing call sites work without modification.
// V2 keeps the same function names that the frontend calls (badgeOf, mint, etc.)
// and adds new ones (mintWithProof, signer, openMintEnabled).
export { safetyBadgeAbi, reputationScoreAbi };
export * from "./addresses";

import { keccak256, toBytes, type Hex } from "viem";

/// Mission ID = keccak256(slug as utf8 bytes). Matches Solidity `keccak256(bytes(slug))`.
export function missionIdOf(slug: string): Hex {
  return keccak256(toBytes(slug));
}

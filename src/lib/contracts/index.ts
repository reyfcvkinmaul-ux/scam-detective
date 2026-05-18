import safetyBadgeAbi from "./SafetyBadge.abi.json";
import reputationScoreAbi from "./ReputationScore.abi.json";

export { safetyBadgeAbi, reputationScoreAbi };
export * from "./addresses";

import { keccak256, toBytes, type Hex } from "viem";

/// Mission ID = keccak256(slug as utf8 bytes). Matches Solidity `keccak256(bytes(slug))`.
export function missionIdOf(slug: string): Hex {
  return keccak256(toBytes(slug));
}

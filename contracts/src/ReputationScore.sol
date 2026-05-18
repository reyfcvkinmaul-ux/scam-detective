// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SafetyBadge} from "./SafetyBadge.sol";

/// @title ReputationScore
/// @notice Read-only aggregator that computes a wallet's total XP based on owned badges.
/// @dev Lightweight: caller passes the list of mission IDs to check. This avoids storing
///      a per-user mutable counter and stays trustless against the badge contract.
contract ReputationScore {
    SafetyBadge public immutable badge;

    constructor(address badgeAddress) {
        badge = SafetyBadge(badgeAddress);
    }

    /// @notice Total XP for a wallet across the supplied mission ids.
    function xpFor(address user, bytes32[] calldata missionIds) external view returns (uint256 total) {
        unchecked {
            for (uint256 i = 0; i < missionIds.length; ++i) {
                if (badge.badgeOf(user, missionIds[i]) != 0) {
                    total += badge.xpOf(missionIds[i]);
                }
            }
        }
    }

    /// @notice Number of badges held among the supplied mission ids.
    function badgeCount(address user, bytes32[] calldata missionIds) external view returns (uint256 count) {
        unchecked {
            for (uint256 i = 0; i < missionIds.length; ++i) {
                if (badge.badgeOf(user, missionIds[i]) != 0) ++count;
            }
        }
    }

    /// @notice Boolean per mission id whether the user holds the badge.
    function ownsBadges(address user, bytes32[] calldata missionIds)
        external
        view
        returns (bool[] memory results)
    {
        results = new bool[](missionIds.length);
        for (uint256 i = 0; i < missionIds.length; ++i) {
            results[i] = badge.badgeOf(user, missionIds[i]) != 0;
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {SafetyBadgeV2} from "../src/SafetyBadgeV2.sol";
import {ReputationScore} from "../src/ReputationScore.sol";
import {SafetyBadge} from "../src/SafetyBadge.sol";

/// @notice Deploy SafetyBadgeV2 + new ReputationScore wired to V2.
///         Configures all 5 missions and migrates V1 holders via airdrop.
/// @dev Required env:
///        PRIVATE_KEY    — funded deployer (will be V2 owner)
///        SIGNER_ADDRESS — off-chain EIP-712 signer for mintWithProof
///        BADGE_BASE_URI — metadata host, e.g. https://scam-detective-zeta.vercel.app/badges/
///      Optional:
///        V1_ADDRESS     — if set, migrate any badges held by deployer in V1
contract DeployV2 is Script {
    struct MissionInit {
        string slug;
        uint256 xp;
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        address signerAddr = vm.envAddress("SIGNER_ADDRESS");
        string memory baseURI = vm.envOr("BADGE_BASE_URI", string(""));
        address v1Addr = vm.envOr("V1_ADDRESS", address(0));

        console2.log("Deployer:        ", deployer);
        console2.log("Signer:          ", signerAddr);
        console2.log("BaseURI:         ", baseURI);
        if (v1Addr != address(0)) {
            console2.log("V1 to migrate:   ", v1Addr);
        }

        vm.startBroadcast(pk);

        SafetyBadgeV2 badge = new SafetyBadgeV2(deployer, signerAddr);
        ReputationScore rep = new ReputationScore(address(badge));

        if (bytes(baseURI).length > 0) {
            badge.setBaseURI(baseURI);
        }

        MissionInit[5] memory missions = [
            MissionInit("free-airdrop-alert", 120),
            MissionInit("seed-phrase-phishing", 130),
            MissionInit("rugpull-token-analysis", 220),
            MissionInit("fake-customer-support", 110),
            MissionInit("malicious-approval", 300)
        ];

        for (uint256 i = 0; i < missions.length; i++) {
            string memory uri =
                bytes(baseURI).length > 0 ? string.concat(baseURI, missions[i].slug, ".json") : "";
            badge.configureMissionBySlug(missions[i].slug, missions[i].xp, uri);
        }

        // Migrate V1 holders — checks deployer wallet for any V1 badges and re-mints them on V2
        if (v1Addr != address(0)) {
            SafetyBadge v1 = SafetyBadge(v1Addr);
            for (uint256 i = 0; i < missions.length; i++) {
                bytes32 missionId = keccak256(bytes(missions[i].slug));
                if (v1.badgeOf(deployer, missionId) != 0) {
                    badge.airdropBadge(deployer, missionId);
                    console2.log("Airdropped V2 badge for slug:", missions[i].slug);
                }
            }
        }

        vm.stopBroadcast();

        console2.log("SafetyBadgeV2:   ", address(badge));
        console2.log("ReputationScore: ", address(rep));
    }
}

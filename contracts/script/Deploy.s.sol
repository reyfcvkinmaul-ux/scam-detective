// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {SafetyBadge} from "../src/SafetyBadge.sol";
import {ReputationScore} from "../src/ReputationScore.sol";

/// @notice Deploy SafetyBadge + ReputationScore and configure all missions in one tx batch.
/// @dev Usage:
///        forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
contract Deploy is Script {
    struct MissionInit {
        string slug;
        uint256 xp;
        string uri;
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        string memory baseURI = vm.envOr("BADGE_BASE_URI", string(""));

        console2.log("Deployer:", deployer);
        console2.log("Balance: ", deployer.balance);

        vm.startBroadcast(pk);

        SafetyBadge badge = new SafetyBadge(deployer);
        ReputationScore rep = new ReputationScore(address(badge));

        if (bytes(baseURI).length > 0) {
            badge.setBaseURI(baseURI);
        }

        MissionInit[5] memory missions = [
            MissionInit("free-airdrop-alert", 120, _u(baseURI, "free-airdrop-alert")),
            MissionInit("seed-phrase-phishing", 130, _u(baseURI, "seed-phrase-phishing")),
            MissionInit("rugpull-token-analysis", 220, _u(baseURI, "rugpull-token-analysis")),
            MissionInit("fake-customer-support", 110, _u(baseURI, "fake-customer-support")),
            MissionInit("malicious-approval", 300, _u(baseURI, "malicious-approval"))
        ];

        for (uint256 i = 0; i < missions.length; i++) {
            badge.configureMissionBySlug(missions[i].slug, missions[i].xp, missions[i].uri);
        }

        vm.stopBroadcast();

        console2.log("SafetyBadge:    ", address(badge));
        console2.log("ReputationScore:", address(rep));
    }

    function _u(string memory base, string memory slug) internal pure returns (string memory) {
        if (bytes(base).length == 0) return "";
        return string.concat(base, slug, ".json");
    }
}

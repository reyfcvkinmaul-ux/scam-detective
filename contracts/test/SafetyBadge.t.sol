// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SafetyBadge, IERC5192} from "../src/SafetyBadge.sol";
import {ReputationScore} from "../src/ReputationScore.sol";

contract SafetyBadgeTest is Test {
    SafetyBadge badge;
    ReputationScore rep;

    address owner = address(0xA11CE);
    address alice = address(0xBEEF);
    address bob = address(0xCAFE);

    bytes32 mission1 = keccak256("free-airdrop-alert");
    bytes32 mission2 = keccak256("seed-phrase-phishing");
    bytes32 missionUnknown = keccak256("does-not-exist");

    event Locked(uint256 tokenId);
    event BadgeMinted(address indexed to, bytes32 indexed missionId, uint256 indexed tokenId);

    function setUp() public {
        vm.prank(owner);
        badge = new SafetyBadge(owner);
        rep = new ReputationScore(address(badge));

        vm.startPrank(owner);
        badge.configureMissionBySlug("free-airdrop-alert", 120, "ipfs://m1");
        badge.configureMissionBySlug("seed-phrase-phishing", 130, "ipfs://m2");
        vm.stopPrank();
    }

    function test_Mint_Success() public {
        vm.expectEmit(true, true, true, true);
        emit BadgeMinted(alice, mission1, 1);
        vm.expectEmit(true, false, false, true);
        emit Locked(1);

        vm.prank(alice);
        uint256 tokenId = badge.mint(mission1);

        assertEq(tokenId, 1);
        assertEq(badge.ownerOf(1), alice);
        assertEq(badge.badgeOf(alice, mission1), 1);
        assertTrue(badge.locked(1));
    }

    function test_MintBySlug_Success() public {
        vm.prank(alice);
        uint256 tokenId = badge.mintBySlug("free-airdrop-alert");
        assertEq(tokenId, 1);
        assertEq(badge.badgeOf(alice, mission1), 1);
    }

    function test_DoubleMint_Reverts() public {
        vm.startPrank(alice);
        badge.mint(mission1);
        vm.expectRevert(SafetyBadge.AlreadyMinted.selector);
        badge.mint(mission1);
        vm.stopPrank();
    }

    function test_UnknownMission_Reverts() public {
        vm.prank(alice);
        vm.expectRevert(SafetyBadge.MissionNotConfigured.selector);
        badge.mint(missionUnknown);
    }

    function test_Transfer_Reverts() public {
        vm.prank(alice);
        badge.mint(mission1);

        vm.prank(alice);
        vm.expectRevert(SafetyBadge.NonTransferable.selector);
        badge.transferFrom(alice, bob, 1);
    }

    function test_SafeTransfer_Reverts() public {
        vm.prank(alice);
        badge.mint(mission1);

        vm.prank(alice);
        vm.expectRevert(SafetyBadge.NonTransferable.selector);
        badge.safeTransferFrom(alice, bob, 1);
    }

    function test_Approve_Reverts() public {
        vm.prank(alice);
        badge.mint(mission1);

        vm.prank(alice);
        vm.expectRevert(SafetyBadge.NonTransferable.selector);
        badge.approve(bob, 1);
    }

    function test_SetApprovalForAll_Reverts() public {
        vm.prank(alice);
        vm.expectRevert(SafetyBadge.NonTransferable.selector);
        badge.setApprovalForAll(bob, true);
    }

    function test_SeparateMissionsForSameUser() public {
        vm.startPrank(alice);
        uint256 t1 = badge.mint(mission1);
        uint256 t2 = badge.mint(mission2);
        vm.stopPrank();

        assertEq(t1, 1);
        assertEq(t2, 2);
        assertEq(badge.badgeOf(alice, mission1), 1);
        assertEq(badge.badgeOf(alice, mission2), 2);
    }

    function test_DifferentUsersSameMission() public {
        vm.prank(alice);
        badge.mint(mission1);
        vm.prank(bob);
        badge.mint(mission1);

        assertEq(badge.badgeOf(alice, mission1), 1);
        assertEq(badge.badgeOf(bob, mission1), 2);
    }

    function test_TokenURI_PerMissionOverride() public {
        vm.prank(alice);
        badge.mint(mission1);
        assertEq(badge.tokenURI(1), "ipfs://m1");
    }

    function test_TokenURI_BaseFallback() public {
        vm.prank(owner);
        badge.configureMissionBySlug("no-uri", 50, "");

        vm.prank(owner);
        badge.setBaseURI("https://app.test/badges/");

        vm.prank(alice);
        badge.mintBySlug("no-uri");

        bytes32 hash = keccak256("no-uri");
        // tokenURI fallback returns baseURI + hex(hash)
        string memory expected = string.concat(
            "https://app.test/badges/0x",
            _bytes32ToHex(hash)
        );
        assertEq(badge.tokenURI(1), expected);
    }

    function test_SupportsInterface_ERC5192() public view {
        assertTrue(badge.supportsInterface(type(IERC5192).interfaceId));
        // ERC-721
        assertTrue(badge.supportsInterface(0x80ac58cd));
        // ERC-721 Metadata
        assertTrue(badge.supportsInterface(0x5b5e139f));
    }

    function test_ReputationScore_Aggregates() public {
        vm.startPrank(alice);
        badge.mint(mission1); // 120 xp
        badge.mint(mission2); // 130 xp
        vm.stopPrank();

        bytes32[] memory ids = new bytes32[](3);
        ids[0] = mission1;
        ids[1] = mission2;
        ids[2] = missionUnknown;

        assertEq(rep.xpFor(alice, ids), 250);
        assertEq(rep.badgeCount(alice, ids), 2);

        bool[] memory owns = rep.ownsBadges(alice, ids);
        assertTrue(owns[0]);
        assertTrue(owns[1]);
        assertFalse(owns[2]);

        // Bob has nothing
        assertEq(rep.xpFor(bob, ids), 0);
    }

    function test_ConfigureMission_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(); // OZ Ownable revert with custom error OwnableUnauthorizedAccount
        badge.configureMissionBySlug("x", 1, "y");
    }

    function _bytes32ToHex(bytes32 data) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory out = new bytes(64);
        for (uint256 i = 0; i < 32; ++i) {
            out[i * 2] = alphabet[uint8(data[i] >> 4)];
            out[i * 2 + 1] = alphabet[uint8(data[i]) & 0xf];
        }
        return string(out);
    }
}

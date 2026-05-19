// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SafetyBadgeV2} from "../src/SafetyBadgeV2.sol";
import {IERC5192} from "../src/SafetyBadge.sol";

contract SafetyBadgeV2Test is Test {
    SafetyBadgeV2 badge;

    address owner = address(0xA11CE);
    address signer;
    uint256 signerPk = 0xC0FFEE;
    address alice = address(0xBEEF);
    address bob = address(0xCAFE);

    bytes32 mission1 = keccak256("free-airdrop-alert");

    bytes32 constant MINT_PROOF_TYPEHASH =
        keccak256("MintProof(address user,bytes32 missionId,uint256 deadline)");

    function setUp() public {
        signer = vm.addr(signerPk);
        vm.prank(owner);
        badge = new SafetyBadgeV2(owner, signer);

        vm.prank(owner);
        badge.configureMissionBySlug("free-airdrop-alert", 120, "ipfs://m1");
    }

    function _signProof(uint256 pk, address user, bytes32 missionId, uint256 deadline)
        internal
        view
        returns (bytes memory)
    {
        bytes32 structHash = keccak256(abi.encode(MINT_PROOF_TYPEHASH, user, missionId, deadline));
        bytes32 digest = _hashTypedDataV4(structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, digest);
        return abi.encodePacked(r, s, v);
    }

    function _hashTypedDataV4(bytes32 structHash) internal view returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", badge.DOMAIN_SEPARATOR(), structHash));
    }

    function test_MintWithProof_Success() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _signProof(signerPk, alice, mission1, deadline);

        vm.prank(alice);
        uint256 tokenId = badge.mintWithProof(mission1, deadline, sig);

        assertEq(tokenId, 1);
        assertEq(badge.ownerOf(1), alice);
        assertTrue(badge.locked(1));
    }

    function test_MintWithProof_RevertsOnExpired() public {
        uint256 deadline = block.timestamp - 1;
        bytes memory sig = _signProof(signerPk, alice, mission1, deadline);

        vm.prank(alice);
        vm.expectRevert(SafetyBadgeV2.ProofExpired.selector);
        badge.mintWithProof(mission1, deadline, sig);
    }

    function test_MintWithProof_RevertsOnWrongSigner() public {
        uint256 deadline = block.timestamp + 1 hours;
        // Sign with a different key
        bytes memory sig = _signProof(0xBAD, alice, mission1, deadline);

        vm.prank(alice);
        vm.expectRevert(SafetyBadgeV2.InvalidSignature.selector);
        badge.mintWithProof(mission1, deadline, sig);
    }

    function test_MintWithProof_RevertsOnReplayDifferentUser() public {
        // Signature for alice should NOT work for bob
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory aliceSig = _signProof(signerPk, alice, mission1, deadline);

        vm.prank(bob);
        vm.expectRevert(SafetyBadgeV2.InvalidSignature.selector);
        badge.mintWithProof(mission1, deadline, aliceSig);
    }

    function test_MintWithProof_RevertsOnDoubleMint() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _signProof(signerPk, alice, mission1, deadline);

        vm.prank(alice);
        badge.mintWithProof(mission1, deadline, sig);

        // Even with valid sig, can't mint twice for same mission
        vm.prank(alice);
        vm.expectRevert(SafetyBadgeV2.AlreadyMinted.selector);
        badge.mintWithProof(mission1, deadline, sig);
    }

    function test_OpenMint_DisabledByDefault() public {
        vm.prank(alice);
        vm.expectRevert(SafetyBadgeV2.OpenMintDisabled.selector);
        badge.mint(mission1);
    }

    function test_OpenMint_WorksAfterToggle() public {
        vm.prank(owner);
        badge.setOpenMint(true);

        vm.prank(alice);
        uint256 tokenId = badge.mint(mission1);
        assertEq(tokenId, 1);
    }

    function test_OpenMint_BlocksAgainAfterDisable() public {
        vm.startPrank(owner);
        badge.setOpenMint(true);
        badge.setOpenMint(false);
        vm.stopPrank();

        vm.prank(alice);
        vm.expectRevert(SafetyBadgeV2.OpenMintDisabled.selector);
        badge.mint(mission1);
    }

    function test_AirdropBadge_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        badge.airdropBadge(alice, mission1);

        vm.prank(owner);
        uint256 tokenId = badge.airdropBadge(alice, mission1);
        assertEq(tokenId, 1);
        assertEq(badge.ownerOf(1), alice);
    }

    function test_SetSigner_RotatesAuthority() public {
        uint256 newSignerPk = 0xFEED;
        address newSigner = vm.addr(newSignerPk);

        vm.prank(owner);
        badge.setSigner(newSigner);

        // Old signer's sig no longer works
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory oldSig = _signProof(signerPk, alice, mission1, deadline);
        vm.prank(alice);
        vm.expectRevert(SafetyBadgeV2.InvalidSignature.selector);
        badge.mintWithProof(mission1, deadline, oldSig);

        // New signer's sig works
        bytes memory newSig = _signProof(newSignerPk, alice, mission1, deadline);
        vm.prank(alice);
        uint256 tokenId = badge.mintWithProof(mission1, deadline, newSig);
        assertEq(tokenId, 1);
    }

    function test_Transfer_StillBlocked() public {
        vm.prank(owner);
        badge.airdropBadge(alice, mission1);

        vm.prank(alice);
        vm.expectRevert(SafetyBadgeV2.NonTransferable.selector);
        badge.transferFrom(alice, bob, 1);
    }

    function test_DomainSeparator_Stable() public view {
        bytes32 ds = badge.DOMAIN_SEPARATOR();
        assertTrue(ds != bytes32(0));
    }

    function test_SetSigner_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        badge.setSigner(alice);
    }

    function test_SetOpenMint_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        badge.setOpenMint(true);
    }
}

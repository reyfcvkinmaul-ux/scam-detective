// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title IERC5192 — Soulbound (Minimal) Interface
/// @notice https://eips.ethereum.org/EIPS/eip-5192
interface IERC5192 {
    /// @notice Emitted when the locking status is changed to locked.
    event Locked(uint256 tokenId);
    /// @notice Emitted when the locking status is changed to unlocked.
    event Unlocked(uint256 tokenId);
    /// @notice Returns the locking status of an Soulbound Token
    function locked(uint256 tokenId) external view returns (bool);
}

/// @title SafetyBadge
/// @notice Soulbound (non-transferable) ERC-721 representing completion of a Scam Detective mission.
/// @dev One badge per (wallet, missionId). Mints are open in this MVP — anyone can claim.
///      Phase 4 will add EIP-712 signed proofs from a trusted issuer to gate minting.
contract SafetyBadge is ERC721, Ownable, IERC5192 {
    /// @notice Auto-incrementing token id (starts at 1).
    uint256 public nextTokenId = 1;

    /// @notice Maps tokenId → mission slug hash (keccak256 of the slug string).
    mapping(uint256 => bytes32) public missionOf;

    /// @notice Maps (owner, missionId) → tokenId. 0 means not minted.
    mapping(address => mapping(bytes32 => uint256)) public badgeOf;

    /// @notice Per-mission XP value, set by owner. Used by ReputationScore to total XP.
    mapping(bytes32 => uint256) public xpOf;

    /// @notice Per-mission tokenURI override (where metadata JSON lives).
    /// @dev If unset, tokenURI() falls back to baseURI + slug-hash hex.
    mapping(bytes32 => string) public missionURI;

    /// @notice Default base URI for badges that don't have a per-mission override.
    string public baseURI;

    event BadgeMinted(address indexed to, bytes32 indexed missionId, uint256 indexed tokenId);
    event MissionConfigured(bytes32 indexed missionId, uint256 xp, string uri);

    error AlreadyMinted();
    error NonTransferable();
    error MissionNotConfigured();
    error NotOwner();

    constructor(address initialOwner)
        ERC721("Scam Detective Safety Badge", "SDSB")
        Ownable(initialOwner)
    {}

    /// @notice Configure a mission's XP and metadata URI. Only owner.
    function configureMission(bytes32 missionId, uint256 xp, string calldata uri) external onlyOwner {
        xpOf[missionId] = xp;
        missionURI[missionId] = uri;
        emit MissionConfigured(missionId, xp, uri);
    }

    /// @notice Convenience: configure by slug string (computes the hash for you).
    function configureMissionBySlug(string calldata slug, uint256 xp, string calldata uri) external onlyOwner {
        bytes32 missionId = keccak256(bytes(slug));
        xpOf[missionId] = xp;
        missionURI[missionId] = uri;
        emit MissionConfigured(missionId, xp, uri);
    }

    /// @notice Set the default base URI. Only owner.
    function setBaseURI(string calldata uri) external onlyOwner {
        baseURI = uri;
    }

    /// @notice Mint a soulbound badge to msg.sender for a given mission.
    /// @dev MVP: open mint, anyone can claim if they haven't already.
    ///      Phase 4 will require a signed proof from a trusted issuer.
    function mint(bytes32 missionId) external returns (uint256 tokenId) {
        return _mintTo(msg.sender, missionId);
    }

    /// @notice Mint by slug string convenience.
    function mintBySlug(string calldata slug) external returns (uint256 tokenId) {
        return _mintTo(msg.sender, keccak256(bytes(slug)));
    }

    function _mintTo(address to, bytes32 missionId) internal returns (uint256 tokenId) {
        if (xpOf[missionId] == 0 && bytes(missionURI[missionId]).length == 0) revert MissionNotConfigured();
        if (badgeOf[to][missionId] != 0) revert AlreadyMinted();

        tokenId = nextTokenId++;
        missionOf[tokenId] = missionId;
        badgeOf[to][missionId] = tokenId;

        _safeMint(to, tokenId);
        emit BadgeMinted(to, missionId, tokenId);
        emit Locked(tokenId);
    }

    /// @notice Returns true — every badge is permanently soulbound.
    function locked(uint256 /*tokenId*/) external pure returns (bool) {
        return true;
    }

    /// @notice ERC-721 metadata URI. Per-mission override wins over baseURI.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        bytes32 missionId = missionOf[tokenId];
        string memory uri = missionURI[missionId];
        if (bytes(uri).length > 0) return uri;
        // fallback: baseURI + hex of missionId
        return string.concat(baseURI, _toHex(missionId));
    }

    /// @notice Owner of a (wallet, mission) pair. Returns 0 if not minted.
    function badgeIdOf(address user, bytes32 missionId) external view returns (uint256) {
        return badgeOf[user][missionId];
    }

    /// @dev Soulbound enforcement — block any transfer except mint (from == 0) and burn (to == 0).
    ///      OpenZeppelin v5 routes mint/transfer/burn through _update. auth check stays intact.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address from) {
        from = super._update(to, tokenId, auth);
        // Allow mint (from == 0) and burn (to == 0). Block transfers between EOAs/contracts.
        if (from != address(0) && to != address(0)) revert NonTransferable();
    }

    /// @notice Disabled — soulbound tokens cannot grant operator approvals either.
    function approve(address /*to*/, uint256 /*tokenId*/) public pure override {
        revert NonTransferable();
    }

    function setApprovalForAll(address /*operator*/, bool /*approved*/) public pure override {
        revert NonTransferable();
    }

    /// @notice ERC-165: advertise IERC5192 support.
    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return interfaceId == type(IERC5192).interfaceId || super.supportsInterface(interfaceId);
    }

    function _toHex(bytes32 data) internal pure returns (string memory) {
        bytes16 alphabet = 0x30313233343536373839616263646566; // "0123456789abcdef"
        bytes memory out = new bytes(2 + 64);
        out[0] = "0";
        out[1] = "x";
        for (uint256 i = 0; i < 32; i++) {
            out[2 + i * 2] = alphabet[uint8(data[i] >> 4)];
            out[3 + i * 2] = alphabet[uint8(data[i]) & 0xf];
        }
        return string(out);
    }
}

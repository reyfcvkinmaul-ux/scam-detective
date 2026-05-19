// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC5192} from "./SafetyBadge.sol";

/// @title SafetyBadgeV2
/// @notice Soulbound badge with EIP-712 signed mint proofs.
/// @dev Adds anti-cheat: a trusted off-chain signer must produce a valid signature
///      bound to (user, missionId, deadline) before mint succeeds. Owner can disable
///      this and fall back to open mint via `setOpenMint(true)` for emergencies.
contract SafetyBadgeV2 is ERC721, Ownable, EIP712, IERC5192 {
    using ECDSA for bytes32;

    bytes32 public constant MINT_PROOF_TYPEHASH =
        keccak256("MintProof(address user,bytes32 missionId,uint256 deadline)");

    /// @notice Off-chain signer producing mint proofs. Settable by owner.
    address public signer;

    /// @notice If true, anyone can call `mint()` without a proof (legacy V1 mode).
    /// @dev Default: false. Toggle on for emergencies or for non-anti-cheat deployments.
    bool public openMintEnabled;

    uint256 public nextTokenId = 1;

    mapping(uint256 => bytes32) public missionOf;
    mapping(address => mapping(bytes32 => uint256)) public badgeOf;
    mapping(bytes32 => uint256) public xpOf;
    mapping(bytes32 => string) public missionURI;
    string public baseURI;

    event BadgeMinted(address indexed to, bytes32 indexed missionId, uint256 indexed tokenId);
    event MissionConfigured(bytes32 indexed missionId, uint256 xp, string uri);
    event SignerUpdated(address indexed previousSigner, address indexed newSigner);
    event OpenMintToggled(bool enabled);

    error AlreadyMinted();
    error NonTransferable();
    error MissionNotConfigured();
    error InvalidSignature();
    error ProofExpired();
    error OpenMintDisabled();

    constructor(address initialOwner, address initialSigner)
        ERC721("Scam Detective Safety Badge", "SDSB")
        Ownable(initialOwner)
        EIP712("ScamDetectiveSafetyBadge", "2")
    {
        signer = initialSigner;
        emit SignerUpdated(address(0), initialSigner);
    }

    // ---------- Owner config ----------

    function setSigner(address newSigner) external onlyOwner {
        emit SignerUpdated(signer, newSigner);
        signer = newSigner;
    }

    function setOpenMint(bool enabled) external onlyOwner {
        openMintEnabled = enabled;
        emit OpenMintToggled(enabled);
    }

    function configureMission(bytes32 missionId, uint256 xp, string calldata uri) external onlyOwner {
        xpOf[missionId] = xp;
        missionURI[missionId] = uri;
        emit MissionConfigured(missionId, xp, uri);
    }

    function configureMissionBySlug(string calldata slug, uint256 xp, string calldata uri)
        external
        onlyOwner
    {
        bytes32 missionId = keccak256(bytes(slug));
        xpOf[missionId] = xp;
        missionURI[missionId] = uri;
        emit MissionConfigured(missionId, xp, uri);
    }

    function setBaseURI(string calldata uri) external onlyOwner {
        baseURI = uri;
    }

    /// @notice Migration helper: owner can airdrop badges to existing V1 holders.
    /// @dev Use sparingly during V1→V2 cutover. After migration, prefer mintWithProof.
    function airdropBadge(address to, bytes32 missionId) external onlyOwner returns (uint256) {
        return _mintTo(to, missionId);
    }

    // ---------- Mint paths ----------

    /// @notice Mint with EIP-712 proof signed by the trusted signer.
    /// @param missionId keccak256(slug) of the mission
    /// @param deadline UNIX timestamp; must be in the future
    /// @param signature 65-byte ECDSA signature over the typed data
    function mintWithProof(bytes32 missionId, uint256 deadline, bytes calldata signature)
        external
        returns (uint256 tokenId)
    {
        if (block.timestamp > deadline) revert ProofExpired();

        bytes32 structHash = keccak256(abi.encode(MINT_PROOF_TYPEHASH, msg.sender, missionId, deadline));
        bytes32 digest = _hashTypedDataV4(structHash);
        address recovered = digest.recover(signature);
        if (recovered != signer || recovered == address(0)) revert InvalidSignature();

        return _mintTo(msg.sender, missionId);
    }

    /// @notice Open mint — only works when `openMintEnabled = true`.
    function mint(bytes32 missionId) external returns (uint256 tokenId) {
        if (!openMintEnabled) revert OpenMintDisabled();
        return _mintTo(msg.sender, missionId);
    }

    function mintBySlug(string calldata slug) external returns (uint256 tokenId) {
        if (!openMintEnabled) revert OpenMintDisabled();
        return _mintTo(msg.sender, keccak256(bytes(slug)));
    }

    function _mintTo(address to, bytes32 missionId) internal returns (uint256 tokenId) {
        if (xpOf[missionId] == 0 && bytes(missionURI[missionId]).length == 0) {
            revert MissionNotConfigured();
        }
        if (badgeOf[to][missionId] != 0) revert AlreadyMinted();

        tokenId = nextTokenId++;
        missionOf[tokenId] = missionId;
        badgeOf[to][missionId] = tokenId;

        _safeMint(to, tokenId);
        emit BadgeMinted(to, missionId, tokenId);
        emit Locked(tokenId);
    }

    // ---------- ERC-5192 + Soulbound enforcement ----------

    function locked(uint256 /*tokenId*/) external pure returns (bool) {
        return true;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address from)
    {
        from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) revert NonTransferable();
    }

    function approve(address /*to*/, uint256 /*tokenId*/) public pure override {
        revert NonTransferable();
    }

    function setApprovalForAll(address /*operator*/, bool /*approved*/) public pure override {
        revert NonTransferable();
    }

    // ---------- Metadata ----------

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        bytes32 missionId = missionOf[tokenId];
        string memory uri = missionURI[missionId];
        if (bytes(uri).length > 0) return uri;
        return string.concat(baseURI, _toHex(missionId));
    }

    function badgeIdOf(address user, bytes32 missionId) external view returns (uint256) {
        return badgeOf[user][missionId];
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return interfaceId == type(IERC5192).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @notice Expose EIP-712 domain separator for off-chain signers.
    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    function _toHex(bytes32 data) internal pure returns (string memory) {
        bytes16 alphabet = 0x30313233343536373839616263646566;
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

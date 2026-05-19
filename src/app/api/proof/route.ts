import { NextRequest, NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, toBytes, type Hex, isAddress, getAddress } from "viem";
import { MISSIONS } from "@/lib/missions";
import { CONTRACTS, BASE_SEPOLIA_CHAIN_ID } from "@/lib/contracts";

// EIP-712 typed-data definition — must match SafetyBadgeV2.MINT_PROOF_TYPEHASH and the
// EIP712 constructor args ("ScamDetectiveSafetyBadge", "2").
const DOMAIN = {
  name: "ScamDetectiveSafetyBadge",
  version: "2",
  chainId: BASE_SEPOLIA_CHAIN_ID,
  verifyingContract: CONTRACTS.safetyBadge,
} as const;

const TYPES = {
  MintProof: [
    { name: "user", type: "address" },
    { name: "missionId", type: "bytes32" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

// 30 minutes is plenty for the user to confirm in their wallet
const PROOF_TTL_SECONDS = 30 * 60;

export async function POST(req: NextRequest) {
  let body: { user?: string; slug?: string; passed?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { user, slug, passed } = body;

  // 1) Input validation
  if (!user || typeof user !== "string" || !isAddress(user)) {
    return NextResponse.json({ error: "Invalid user address" }, { status: 400 });
  }
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }
  const mission = MISSIONS.find((m) => m.slug === slug);
  if (!mission) {
    return NextResponse.json({ error: "Unknown mission" }, { status: 404 });
  }
  if (passed !== true) {
    return NextResponse.json(
      { error: "Mission not marked as passed" },
      { status: 403 },
    );
  }

  // 2) Server signer key — must be set in Vercel env
  const pk = process.env.SIGNER_PRIVATE_KEY;
  if (!pk || !pk.startsWith("0x")) {
    return NextResponse.json(
      { error: "Server signer not configured" },
      { status: 500 },
    );
  }

  const signerAccount = privateKeyToAccount(pk as Hex);
  const userAddr = getAddress(user);
  const missionId = keccak256(toBytes(slug));
  const deadline = Math.floor(Date.now() / 1000) + PROOF_TTL_SECONDS;

  // 3) Sign the typed proof
  const signature = await signerAccount.signTypedData({
    domain: DOMAIN,
    types: TYPES,
    primaryType: "MintProof",
    message: {
      user: userAddr,
      missionId,
      deadline: BigInt(deadline),
    },
  });

  return NextResponse.json({
    signature,
    deadline,
    missionId,
    user: userAddr,
    signer: signerAccount.address,
  });
}

export const runtime = "nodejs";

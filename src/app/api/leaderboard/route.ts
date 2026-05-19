import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem, type Address, keccak256, toBytes } from "viem";
import { baseSepolia } from "viem/chains";
import { CONTRACTS } from "@/lib/contracts";
import { MISSIONS } from "@/lib/missions";

// Refresh leaderboard data at most every 60 seconds via Vercel ISR-style cache.
// Force dynamic so the route is server-rendered on every request (with edge cache).
export const revalidate = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// V2 deploy block on Base Sepolia (lookback floor — keeps RPC pagination tight).
// Public Base RPC caps eth_getLogs to 2000 blocks/query, so we paginate from this floor.
const FROM_BLOCK = BigInt(41_696_700);
const PAGE_SIZE = BigInt(2000);
const MAX_PAGES = 200; // safety cap = 400k blocks lookback

const BadgeMintedEvent = parseAbiItem(
  "event BadgeMinted(address indexed to, bytes32 indexed missionId, uint256 indexed tokenId)",
);

const MISSION_XP: Record<string, number> = Object.fromEntries(
  MISSIONS.map((m) => [m.slug, m.xp]),
);

const MISSION_BY_ID: Record<string, string> = {};
for (const m of MISSIONS) {
  MISSION_BY_ID[keccak256(toBytes(m.slug))] = m.slug;
}

type LeaderboardEntry = {
  rank: number;
  address: Address;
  badgeCount: number;
  totalXp: number;
  missions: string[];
};

export async function GET() {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });

  // Use a typed Log shape that preserves the parsed event args
  type ParsedLog = Awaited<
    ReturnType<typeof client.getLogs<typeof BadgeMintedEvent>>
  >[number];
  const allLogs: ParsedLog[] = [];

  try {
    const latestBlock = await client.getBlockNumber();
    let cursor = FROM_BLOCK;
    let pages = 0;

    while (cursor <= latestBlock && pages < MAX_PAGES) {
      const upper = cursor + PAGE_SIZE - BigInt(1);
      const toBlock = upper > latestBlock ? latestBlock : upper;

      const logs = await client.getLogs({
        address: CONTRACTS.safetyBadge,
        event: BadgeMintedEvent,
        fromBlock: cursor,
        toBlock,
      });

      allLogs.push(...logs);
      cursor = toBlock + BigInt(1);
      pages += 1;
    }
  } catch (err) {
    return NextResponse.json(
      { error: "RPC fetch failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }

  // Aggregate by holder
  const byHolder = new Map<string, { badgeCount: number; xp: number; missions: Set<string> }>();
  for (const log of allLogs) {
    const to = log.args.to;
    const missionId = log.args.missionId;
    if (!to || !missionId) continue;
    const slug = MISSION_BY_ID[missionId.toLowerCase() as `0x${string}`] ??
                 MISSION_BY_ID[missionId];
    if (!slug) continue;

    const xp = MISSION_XP[slug] ?? 0;
    const key = to.toLowerCase();
    const existing = byHolder.get(key) ?? { badgeCount: 0, xp: 0, missions: new Set<string>() };
    if (!existing.missions.has(slug)) {
      existing.missions.add(slug);
      existing.badgeCount += 1;
      existing.xp += xp;
    }
    byHolder.set(key, existing);
  }

  const ranked: LeaderboardEntry[] = Array.from(byHolder.entries())
    .map(([address, agg]) => ({
      address: address as Address,
      badgeCount: agg.badgeCount,
      totalXp: agg.xp,
      missions: Array.from(agg.missions),
      rank: 0,
    }))
    .sort((a, b) => b.totalXp - a.totalXp || b.badgeCount - a.badgeCount)
    .slice(0, 50)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return NextResponse.json({
    contract: CONTRACTS.safetyBadge,
    chainId: baseSepolia.id,
    totalHolders: byHolder.size,
    totalBadges: allLogs.length,
    entries: ranked,
    fetchedAt: new Date().toISOString(),
  });
}

"use client";

import Link from "next/link";
import useSWR from "swr";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import {
  ArrowLeft,
  Trophy,
  Crown,
  Medal,
  Award,
  ExternalLink,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { BASESCAN_BASE } from "@/lib/contracts";
import { MISSIONS } from "@/lib/missions";

type Entry = {
  rank: number;
  address: string;
  badgeCount: number;
  totalXp: number;
  missions: string[];
};

type LBData = {
  contract: string;
  totalHolders: number;
  totalBadges: number;
  entries: Entry[];
  fetchedAt: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const RARITY_BY_SLUG: Record<string, string> = Object.fromEntries(
  MISSIONS.map((m) => [m.slug, m.badge.emoji]),
);

export default function LeaderboardPage() {
  const { address } = useAccount();
  const { data, error, isLoading, mutate } = useSWR<LBData>("/api/leaderboard", fetcher, {
    refreshInterval: 60_000,
  });

  return (
    <main className="min-h-screen pb-24">
      <header className="relative max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <Link href="/" className="text-ink-mid hover:text-ink-hi text-sm inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/missions" className="text-ink-mid hover:text-ink-hi px-3 py-2 rounded-md transition-colors">
            Missions
          </Link>
          <Link href="/profile" className="text-ink-mid hover:text-ink-hi px-3 py-2 rounded-md transition-colors">
            Profile
          </Link>
        </div>
      </header>

      <section className="relative max-w-6xl mx-auto px-6 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 flex-wrap"
        >
          <div>
            <div className="text-xs font-mono text-ink-low">DETECTIVE LEADERBOARD · BASE SEPOLIA</div>
            <h1 className="text-3xl font-semibold mt-1 inline-flex items-center gap-3">
              <Trophy className="w-7 h-7 text-neon-purple" />
              Top Detectives
            </h1>
            <p className="text-ink-mid mt-2 max-w-xl">
              Ranked by on-chain XP from soulbound badges. Fully trustless: aggregated from `BadgeMinted`
              events. Refreshes every minute.
            </p>
          </div>
          <button
            onClick={() => mutate()}
            className="btn-ghost text-sm inline-flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </motion.div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
            <Stat label="Detectives on the board" value={String(data.totalHolders)} />
            <Stat label="Badges minted on-chain" value={String(data.totalBadges)} />
            <Stat
              label="Last refreshed"
              value={data.fetchedAt ? new Date(data.fetchedAt).toLocaleTimeString() : "—"}
            />
          </div>
        )}
      </section>

      <section className="relative max-w-6xl mx-auto px-6 mt-8">
        {isLoading && !data && (
          <div className="panel p-8 text-center text-ink-mid inline-flex items-center justify-center gap-2 w-full">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading on-chain leaderboard…
          </div>
        )}

        {error && (
          <div className="panel p-5 border-warn/30 text-sm text-warn-soft inline-flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Couldn&apos;t fetch leaderboard. Public RPC may be rate-limited — try again in a moment.
          </div>
        )}

        {data && data.entries.length === 0 && (
          <div className="panel p-8 text-center text-ink-mid">
            No badges minted yet. Be the first detective on the board.
            <div className="mt-4">
              <Link href="/missions" className="btn-primary text-sm">
                Start a mission
              </Link>
            </div>
          </div>
        )}

        {data && data.entries.length > 0 && (
          <div className="panel p-0 overflow-hidden">
            {data.entries.map((entry, idx) => (
              <Row
                key={entry.address}
                entry={entry}
                isYou={!!address && address.toLowerCase() === entry.address.toLowerCase()}
                isLast={idx === data.entries.length - 1}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <div className="text-xs font-mono text-ink-low">{label}</div>
      <div className="text-2xl font-semibold mt-1.5">{value}</div>
    </div>
  );
}

function Row({ entry, isYou, isLast }: { entry: Entry; isYou: boolean; isLast: boolean }) {
  const rankIcon =
    entry.rank === 1 ? <Crown className="w-4 h-4 text-amber-300" /> :
    entry.rank === 2 ? <Medal className="w-4 h-4 text-slate-300" /> :
    entry.rank === 3 ? <Award className="w-4 h-4 text-orange-400" /> :
    null;

  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 ${isLast ? "" : "border-b border-white/5"} ${
        isYou ? "bg-neon-purple/5" : ""
      }`}
    >
      <div className="w-12 shrink-0 text-center">
        {rankIcon ?? <span className="text-ink-low font-mono text-sm">#{entry.rank}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-sm flex items-center gap-2">
          <span className="text-ink-hi truncate">{shorten(entry.address)}</span>
          {isYou && (
            <span className="chip chip-ok text-[10px] shrink-0">You</span>
          )}
          <a
            href={`${BASESCAN_BASE}/address/${entry.address}`}
            target="_blank"
            rel="noreferrer"
            className="text-ink-low hover:text-ink-hi shrink-0"
            title="View on Basescan"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="text-xs text-ink-low mt-1 flex items-center gap-1.5">
          {entry.missions.map((slug) => (
            <span key={slug} className="text-base" title={slug}>
              {RARITY_BY_SLUG[slug] ?? "🔹"}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-base font-semibold text-ink-hi">{entry.totalXp.toLocaleString()} XP</div>
        <div className="text-xs text-ink-low">
          {entry.badgeCount} badge{entry.badgeCount === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

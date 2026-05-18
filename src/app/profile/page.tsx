"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAccount, useReadContract } from "wagmi";
import {
  ArrowLeft,
  ShieldCheck,
  Trophy,
  Flame,
  Sparkles,
  Wallet,
  Award,
  Calendar,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { useScopeData, useProfile } from "@/lib/profile";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { MISSIONS } from "@/lib/missions";
import {
  CONTRACTS,
  BASE_SEPOLIA_CHAIN_ID,
  BASESCAN_BASE,
  isContractsConfigured,
  missionIdOf,
  reputationScoreAbi,
} from "@/lib/contracts";

const MISSION_IDS = MISSIONS.map((m) => missionIdOf(m.slug));

export default function ProfilePage() {
  const { address } = useAccount();
  const data = useScopeData();
  const scope = useProfile((s) => s.scope);
  const isGuest = scope === "guest";
  const onchainEnabled = isContractsConfigured() && !!address;

  // Read on-chain badge ownership in one batch via ReputationScore
  const { data: ownsArray } = useReadContract({
    address: CONTRACTS.reputationScore,
    abi: reputationScoreAbi,
    functionName: "ownsBadges",
    args: address ? [address, MISSION_IDS] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: onchainEnabled },
  });

  const { data: onchainXp } = useReadContract({
    address: CONTRACTS.reputationScore,
    abi: reputationScoreAbi,
    functionName: "xpFor",
    args: address ? [address, MISSION_IDS] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: onchainEnabled },
  });

  const onchainBadges = (ownsArray as boolean[] | undefined) ?? [];
  const onchainBadgeCount = onchainBadges.filter(Boolean).length;
  const onchainXpNum = onchainXp ? Number(onchainXp as bigint) : 0;

  const totalMissions = MISSIONS.length;
  const passed = data.history.filter((h) => h.passed).length;

  return (
    <main className="relative min-h-screen pb-24">
      <div className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none" />

      <header className="relative max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <Link href="/missions" className="text-ink-mid hover:text-ink-hi transition-colors text-sm inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Missions
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-neon-blue to-neon-purple grid place-items-center shadow-glow">
              <ShieldCheck className="w-3 h-3 text-bg-base" />
            </div>
            Scam Detective
          </Link>
          <ConnectWalletButton />
        </div>
      </header>

      <section className="relative max-w-6xl mx-auto px-6 pt-12">
        <div className="chip chip-info mb-3">
          <Wallet className="w-3.5 h-3.5" />
          Web3 Safety Passport
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Your <span className="text-gradient">profile</span>
        </h1>
        <p className="text-ink-mid mt-2 max-w-xl">
          {isGuest
            ? "Playing as guest. Progress is saved locally — connect a wallet to anchor it to your address."
            : `Connected as ${short(address ?? "")}. Progress synced to this address.`}
        </p>
      </section>

      {/* Stats grid */}
      <section className="relative max-w-6xl mx-auto px-6 mt-8 grid md:grid-cols-4 gap-4">
        <StatCard icon={<Trophy className="w-4 h-4" />} label="Total XP" value={data.totalXp} />
        <StatCard icon={<Award className="w-4 h-4" />} label="Badges" value={data.badges.length} sub={`of ${totalMissions}`} />
        <StatCard icon={<Sparkles className="w-4 h-4" />} label="Cases passed" value={`${passed} / ${totalMissions}`} />
        <StatCard
          icon={<Flame className="w-4 h-4" />}
          label="Daily streak"
          value={data.streak.current > 0 ? `${data.streak.current}🔥` : "—"}
          sub={data.streak.longest > 0 ? `Best: ${data.streak.longest}` : undefined}
        />
      </section>

      {/* On-chain panel */}
      {onchainEnabled && (
        <section className="relative max-w-6xl mx-auto px-6 mt-8">
          <div className="panel p-5 flex items-center gap-4 flex-wrap">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-neon-blue to-neon-purple grid place-items-center shadow-glow shrink-0">
              <CheckCircle2 className="w-5 h-5 text-bg-base" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono text-ink-low">ON-CHAIN STATUS · BASE SEPOLIA</div>
              <div className="text-sm mt-0.5">
                <span className="text-ink-hi font-medium">{onchainBadgeCount}</span>
                <span className="text-ink-mid"> soulbound badges minted</span>
                <span className="text-ink-low"> · </span>
                <span className="text-ink-hi font-medium">{onchainXpNum} XP</span>
                <span className="text-ink-mid"> certified</span>
              </div>
            </div>
            <a
              href={`${BASESCAN_BASE}/address/${address}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-xs inline-flex items-center gap-1"
            >
              View on Basescan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </section>
      )}

      {/* Badge gallery */}
      <section className="relative max-w-6xl mx-auto px-6 mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-neon-purple" />
          <h2 className="text-xl font-semibold">Badge collection</h2>
          <span className="text-ink-low text-sm">— {data.badges.length} earned</span>
        </div>

        {data.badges.length === 0 ? (
          <div className="panel p-8 text-center">
            <div className="text-4xl mb-3 opacity-50">🛡️</div>
            <p className="text-ink-mid text-sm">
              No badges yet. Solve a case and pass with score ≥ 70 to unlock your first badge.
            </p>
            <Link href="/missions" className="btn-primary text-sm mt-4 inline-block">
              Start a case
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {MISSIONS.map((m, idx) => {
              const earned = data.badges.find((b) => b.missionSlug === m.slug);
              const onchain = onchainBadges[idx] === true;
              return (
                <BadgeTile
                  key={m.slug}
                  emoji={m.badge.emoji}
                  name={m.badge.name}
                  desc={m.badge.description}
                  rarity={m.badge.rarity}
                  earned={!!earned}
                  earnedAt={earned?.unlockedAt}
                  onchain={onchain}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Mission history */}
      <section className="relative max-w-6xl mx-auto px-6 mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-neon-blue" />
          <h2 className="text-xl font-semibold">Recent activity</h2>
        </div>

        {data.history.length === 0 ? (
          <div className="panel p-8 text-center text-ink-mid text-sm">
            No history yet. Your mission attempts will show up here.
          </div>
        ) : (
          <div className="panel divide-y divide-bg-line/50">
            {data.history.slice(0, 12).map((h) => {
              const m = MISSIONS.find((x) => x.slug === h.slug);
              return (
                <Link
                  key={h.slug + h.completedAt}
                  href={`/missions/${h.slug}`}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-bg-elev/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-bg-elev grid place-items-center shrink-0 text-base">
                      {m?.badge.emoji ?? "🔍"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{m?.title ?? h.slug}</div>
                      <div className="text-xs text-ink-low font-mono">
                        {new Date(h.completedAt).toLocaleString()} · {m?.category}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`chip ${h.passed ? "chip-ok" : "chip-warn"}`}>
                      {h.passed ? "Passed" : "Retry"} · {h.score}
                    </span>
                    <span className="chip chip-info">+{h.xp} XP</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 text-ink-mid text-xs">
        {icon}
        <span className="font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-bold mt-2">{value}</div>
      {sub && <div className="text-xs text-ink-low mt-1">{sub}</div>}
    </div>
  );
}

function BadgeTile({
  emoji,
  name,
  desc,
  rarity,
  earned,
  earnedAt,
  onchain,
}: {
  emoji: string;
  name: string;
  desc: string;
  rarity: string;
  earned: boolean;
  earnedAt?: number;
  onchain?: boolean;
}) {
  return (
    <motion.div
      whileHover={earned ? { y: -2 } : {}}
      className={`panel p-4 text-center transition-all ${earned ? "border-neon-purple/30" : "opacity-40"} ${onchain ? "border-ok/40 shadow-[0_0_24px_rgba(16,185,129,0.15)]" : ""}`}
    >
      <div className={`text-5xl mb-3 ${earned ? "" : "grayscale"}`}>{emoji}</div>
      <div className="text-sm font-semibold leading-tight">{name}</div>
      <div className="text-xs text-ink-low mt-1.5 line-clamp-2 min-h-[2.4em]">{desc}</div>
      <div className="mt-3 flex items-center justify-center gap-1">
        {onchain ? (
          <span className="chip chip-ok text-[10px]">
            <CheckCircle2 className="w-3 h-3" /> On-chain
          </span>
        ) : (
          <span className={`chip ${earned ? "chip-ok" : ""} text-[10px]`}>
            {earned ? "Earned" : rarity}
          </span>
        )}
      </div>
      {earned && earnedAt && (
        <div className="mt-2 text-[10px] text-ink-low font-mono">
          {new Date(earnedAt).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
}

function short(addr: string, head = 6, tail = 4) {
  if (!addr) return "";
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

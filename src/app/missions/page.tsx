"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MISSIONS } from "@/lib/missions";
import { useProfile, useScopeData } from "@/lib/profile";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import {
  ArrowLeft,
  Lock,
  Clock,
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  User,
} from "lucide-react";

export default function MissionsPage() {
  const data = useScopeData();
  const scope = useProfile((s) => s.scope);
  const isGuest = scope === "guest";

  const completedSlugs = new Set(data.history.filter((h) => h.passed).map((h) => h.slug));
  const completedCount = completedSlugs.size;

  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none" />

      <header className="relative max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-ink-mid hover:text-ink-hi transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/profile" className="text-sm text-ink-mid hover:text-ink-hi inline-flex items-center gap-1.5">
            <User className="w-4 h-4" />
            Profile
          </Link>
          <ConnectWalletButton />
        </div>
      </header>

      <section className="relative max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="chip chip-info mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Mission Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Pick a <span className="text-gradient">case</span>
            </h1>
            <p className="text-ink-mid mt-2 max-w-xl">
              Five categories. All five playable. Connect a wallet to claim badges and persist progress.
            </p>
          </div>
          <ProgressStrip
            solved={completedCount}
            total={MISSIONS.length}
            xp={data.totalXp}
            badges={data.badges.length}
            streak={data.streak.current}
          />
        </div>
        {isGuest && completedCount > 0 && (
          <div className="mt-4 panel p-4 flex items-center gap-3 text-sm">
            <Sparkles className="w-4 h-4 text-neon-blue shrink-0" />
            <span className="text-ink-mid">
              You have local progress as a guest. Connect a wallet to claim your badges and have them stick to your address.
            </span>
          </div>
        )}
      </section>

      <section className="relative max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MISSIONS.map((m, i) => {
            const completion = data.history.find((h) => h.slug === m.slug);
            return (
              <motion.div
                key={m.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <MissionCard mission={m} completedScore={completion?.score} passed={completion?.passed} />
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function ProgressStrip({
  solved,
  total,
  xp,
  badges,
  streak,
}: {
  solved: number;
  total: number;
  xp: number;
  badges: number;
  streak: number;
}) {
  return (
    <div className="panel px-5 py-4 flex items-center gap-5 flex-wrap">
      <Stat label="Cases" value={`${solved} / ${total}`} />
      <div className="w-px h-8 bg-bg-line" />
      <Stat label="XP" value={String(xp)} />
      <div className="w-px h-8 bg-bg-line" />
      <Stat label="Badges" value={String(badges)} />
      <div className="w-px h-8 bg-bg-line" />
      <Stat label="Streak" value={streak > 0 ? `${streak}🔥` : "—"} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-ink-low font-mono uppercase tracking-wider">{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );
}

function MissionCard({
  mission,
  completedScore,
  passed,
}: {
  mission: (typeof MISSIONS)[number];
  completedScore?: number;
  passed?: boolean;
}) {
  const locked = !mission.available;

  const cardInner = (
    <div
      className={`panel scanline p-5 h-full flex flex-col ${
        locked ? "opacity-60" : "hover:border-neon-blue/40 transition-all hover:-translate-y-0.5"
      } ${passed ? "border-ok/30" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="chip chip-info text-[10px] uppercase tracking-wider">{mission.category}</span>
        {locked ? (
          <span className="chip text-ink-low">
            <Lock className="w-3 h-3" /> Soon
          </span>
        ) : passed ? (
          <span className="chip chip-ok">
            <CheckCircle2 className="w-3 h-3" /> Passed · {completedScore}
          </span>
        ) : completedScore !== undefined ? (
          <span className="chip chip-warn">Retry · last {completedScore}</span>
        ) : (
          <span className="chip chip-ok">Playable</span>
        )}
      </div>

      <h3 className="text-lg font-semibold leading-tight">{mission.title}</h3>
      <p className="text-ink-mid text-sm mt-1.5 line-clamp-3">{mission.summary}</p>

      <div className="flex items-center gap-3 text-xs text-ink-low mt-4 font-mono">
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3 h-3" /> {mission.estMinutes}m
        </span>
        <span>·</span>
        <span>{mission.difficulty}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <Trophy className="w-3 h-3" /> {mission.xp} XP
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-bg-line flex items-center justify-between">
        <div className="text-xs text-ink-mid">
          <span className="text-ink-low">Badge: </span>
          <span>{mission.badge.emoji} {mission.badge.name}</span>
        </div>
        {!locked && (
          <span className="text-neon-blue text-sm inline-flex items-center gap-1">
            {passed ? "Replay" : "Open"} <ArrowRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );

  if (locked) return cardInner;

  return (
    <Link href={`/missions/${mission.slug}`} className="block h-full">
      {cardInner}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MISSIONS } from "@/lib/missions";
import { ShieldCheck, ArrowLeft, Lock, Clock, Trophy, ArrowRight, Sparkles } from "lucide-react";

export default function MissionsPage() {
  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none" />

      <header className="relative max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-ink-mid hover:text-ink-hi transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
        <div className="flex items-center gap-2 font-semibold">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-neon-blue to-neon-purple grid place-items-center shadow-glow">
            <ShieldCheck className="w-3.5 h-3.5 text-bg-base" />
          </div>
          Scam Detective
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
              Five categories. One playable in this MVP — the rest unlock as we add them.
            </p>
          </div>
          <ProgressStrip />
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MISSIONS.map((m, i) => (
            <motion.div
              key={m.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <MissionCard mission={m} />
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}

function ProgressStrip() {
  return (
    <div className="panel px-5 py-4 flex items-center gap-6">
      <Stat label="Cases solved" value="0 / 5" />
      <div className="w-px h-8 bg-bg-line" />
      <Stat label="XP" value="0" />
      <div className="w-px h-8 bg-bg-line" />
      <Stat label="Badges" value="0" />
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

function MissionCard({ mission }: { mission: (typeof MISSIONS)[number] }) {
  const locked = !mission.available;

  const cardInner = (
    <div
      className={`panel scanline p-5 h-full flex flex-col ${
        locked ? "opacity-60" : "hover:border-neon-blue/40 transition-all hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="chip chip-info text-[10px] uppercase tracking-wider">{mission.category}</span>
        {locked ? (
          <span className="chip text-ink-low">
            <Lock className="w-3 h-3" /> Soon
          </span>
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
            Open <ArrowRight className="w-3.5 h-3.5" />
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

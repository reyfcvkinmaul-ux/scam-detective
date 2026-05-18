"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Bird,
  Globe,
  Wallet,
  Receipt,
  MessageSquare,
  Gavel,
  Flag,
  Check,
  X,
  Trophy,
  Sparkles,
  Eye,
  AlertTriangle,
  Clock,
} from "lucide-react";
import type { Mission, RedFlag, Verdict } from "@/lib/missions";

type Phase = "investigate" | "quiz" | "verdict" | "result";

const ICONS = {
  twitter: Bird,
  globe: Globe,
  wallet: Wallet,
  receipt: Receipt,
  message: MessageSquare,
  gavel: Gavel,
};

export function MissionView({ mission }: { mission: Mission }) {
  const [activeTab, setActiveTab] = useState(mission.evidence[0]?.id ?? "");
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<Phase>("investigate");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const totalFlags = mission.redFlags.length;
  const foundFlags = flagged.size;
  const quizCorrect = useMemo(
    () => mission.quiz.filter((q) => answers[q.id] === q.correctIndex).length,
    [answers, mission.quiz]
  );
  const verdictCorrect = verdict === mission.correctVerdict;

  // Score: flag detection (40%) + quiz (40%) + verdict (20%)
  const score = useMemo(() => {
    const flagScore = (foundFlags / totalFlags) * 40;
    const quizScore = (quizCorrect / mission.quiz.length) * 40;
    const verdictScore = verdictCorrect ? 20 : 0;
    return Math.round(flagScore + quizScore + verdictScore);
  }, [foundFlags, totalFlags, quizCorrect, mission.quiz.length, verdictCorrect]);

  const xpEarned = Math.round((score / 100) * mission.xp);
  const passed = score >= 70 && verdictCorrect;

  function toggleFlag(id: string) {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main className="relative min-h-screen pb-24">
      <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />

      {/* Top nav */}
      <header className="relative max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <Link href="/missions" className="text-ink-mid hover:text-ink-hi transition-colors text-sm inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          All cases
        </Link>
        <div className="flex items-center gap-2 font-semibold text-sm">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-neon-blue to-neon-purple grid place-items-center shadow-glow">
            <ShieldCheck className="w-3 h-3 text-bg-base" />
          </div>
          Scam Detective
        </div>
      </header>

      {/* Case header */}
      <section className="relative max-w-6xl mx-auto px-6 pt-10">
        <div className="text-xs font-mono text-ink-low">CASE FILE · #001 · {mission.category.toUpperCase()}</div>
        <div className="flex items-end justify-between gap-4 mt-2 flex-wrap">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{mission.title}</h1>
            <p className="text-ink-mid mt-2 max-w-2xl">{mission.summary}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="chip chip-info">
              <Clock className="w-3 h-3" /> {mission.estMinutes} min
            </span>
            <span className="chip">{mission.difficulty}</span>
            <span className="chip chip-ok">
              <Trophy className="w-3 h-3" /> {mission.xp} XP
            </span>
          </div>
        </div>

        {/* Briefing */}
        <div className="panel mt-6 p-5 flex gap-4">
          <div className="w-10 h-10 rounded-md bg-bg-elev grid place-items-center text-neon-blue border border-neon-blue/20 shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-ink-low mb-1">BRIEFING</div>
            <p className="text-ink-hi text-[15px] leading-relaxed">{mission.briefing}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 panel px-5 py-4 flex items-center gap-6 flex-wrap">
          <ProgressStat
            label="Red flags tagged"
            value={`${foundFlags} / ${totalFlags}`}
            tone={foundFlags === totalFlags ? "ok" : "info"}
          />
          <div className="w-px h-8 bg-bg-line" />
          <ProgressStat
            label="Phase"
            value={
              phase === "investigate"
                ? "Investigation"
                : phase === "quiz"
                ? "Quiz"
                : phase === "verdict"
                ? "Verdict"
                : "Result"
            }
            tone="info"
          />
          <div className="ml-auto flex gap-2">
            {phase === "investigate" && (
              <button onClick={() => setPhase("quiz")} className="btn-primary text-sm">
                Continue to quiz <ArrowRight className="w-3.5 h-3.5 inline -mt-0.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Phase content */}
      <section className="relative max-w-6xl mx-auto px-6 mt-8">
        <AnimatePresence mode="wait">
          {phase === "investigate" && (
            <motion.div
              key="invest"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <InvestigatePhase
                mission={mission}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                flagged={flagged}
                toggleFlag={toggleFlag}
              />
            </motion.div>
          )}

          {phase === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <QuizPhase
                mission={mission}
                answers={answers}
                setAnswers={setAnswers}
                onNext={() => setPhase("verdict")}
                onBack={() => setPhase("investigate")}
              />
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div
              key="verdict"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <VerdictPhase
                verdict={verdict}
                setVerdict={setVerdict}
                onSubmit={() => setPhase("result")}
                onBack={() => setPhase("quiz")}
              />
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ResultPhase
                mission={mission}
                score={score}
                xpEarned={xpEarned}
                passed={passed}
                foundFlags={foundFlags}
                totalFlags={totalFlags}
                quizCorrect={quizCorrect}
                verdictCorrect={verdictCorrect}
                flagged={flagged}
                answers={answers}
                onReset={() => {
                  setPhase("investigate");
                  setFlagged(new Set());
                  setAnswers({});
                  setVerdict(null);
                  setActiveTab(mission.evidence[0]?.id ?? "");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

function ProgressStat({
  label,
  value,
  tone = "info",
}: {
  label: string;
  value: string;
  tone?: "ok" | "info" | "warn";
}) {
  const toneCls =
    tone === "ok"
      ? "text-ok"
      : tone === "warn"
      ? "text-warn-soft"
      : "text-neon-blue";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-low font-mono">{label}</div>
      <div className={`text-base font-semibold mt-0.5 ${toneCls}`}>{value}</div>
    </div>
  );
}

/* ───────────── INVESTIGATE ───────────── */

function InvestigatePhase({
  mission,
  activeTab,
  setActiveTab,
  flagged,
  toggleFlag,
}: {
  mission: Mission;
  activeTab: string;
  setActiveTab: (id: string) => void;
  flagged: Set<string>;
  toggleFlag: (id: string) => void;
}) {
  const tab = mission.evidence.find((t) => t.id === activeTab) ?? mission.evidence[0];

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div>
        {/* Tabs */}
        <div className="flex gap-1 panel p-1 overflow-x-auto no-scrollbar">
          {mission.evidence.map((t) => {
            const Icon = ICONS[t.icon];
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors ${
                  active
                    ? "bg-bg-elev text-ink-hi border border-neon-blue/30"
                    : "text-ink-mid hover:text-ink-hi border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Evidence body */}
        <div className="panel mt-4 p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-xs font-mono text-ink-low">EVIDENCE · {tab.label.toUpperCase()}</div>
              {tab.caption && <div className="text-ink-mid text-sm mt-1">{tab.caption}</div>}
            </div>
            <span className="chip chip-warn text-[10px]">
              <Flag className="w-3 h-3" /> Tap suspicious phrases
            </span>
          </div>

          <EvidenceBody
            text={tab.body}
            redFlags={mission.redFlags}
            flagged={flagged}
            onToggle={toggleFlag}
          />
        </div>
      </div>

      {/* Side panel: red flag tracker */}
      <aside className="panel p-5 h-fit lg:sticky lg:top-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-warn" />
          <h3 className="font-semibold">Red flag log</h3>
        </div>
        <p className="text-xs text-ink-low">
          Tap suspicious text in any evidence tab to log it. Found {flagged.size} of {mission.redFlags.length}.
        </p>

        <div className="mt-4 space-y-2">
          {mission.redFlags.map((rf) => {
            const isFound = flagged.has(rf.id);
            return (
              <div
                key={rf.id}
                className={`text-xs p-2.5 rounded-md border transition-colors ${
                  isFound
                    ? "border-warn/40 bg-warn/5 text-ink-hi"
                    : "border-bg-line bg-bg-panel/40 text-ink-low"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isFound ? (
                    <Check className="w-3.5 h-3.5 text-ok shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-ink-low/50 shrink-0" />
                  )}
                  <span className="font-medium">{rf.label}</span>
                </div>
                {isFound && (
                  <p className="text-[11px] text-ink-mid mt-1.5 leading-relaxed pl-5">
                    {rf.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function EvidenceBody({
  text,
  redFlags,
  flagged,
  onToggle,
}: {
  text: string;
  redFlags: RedFlag[];
  flagged: Set<string>;
  onToggle: (id: string) => void;
}) {
  // Build segments: split text by all redFlag.text occurrences (longest first to prevent overlap)
  const sortedFlags = useMemo(
    () => [...redFlags].sort((a, b) => b.text.length - a.text.length),
    [redFlags]
  );

  const segments = useMemo(() => {
    type Seg = { kind: "text"; value: string } | { kind: "flag"; rf: RedFlag };
    const result: Seg[] = [{ kind: "text", value: text }];

    for (const rf of sortedFlags) {
      for (let i = 0; i < result.length; i++) {
        const seg = result[i];
        if (seg.kind !== "text") continue;
        const idx = seg.value.indexOf(rf.text);
        if (idx === -1) continue;
        const before = seg.value.slice(0, idx);
        const after = seg.value.slice(idx + rf.text.length);
        const replacement: Seg[] = [];
        if (before) replacement.push({ kind: "text", value: before });
        replacement.push({ kind: "flag", rf });
        if (after) replacement.push({ kind: "text", value: after });
        result.splice(i, 1, ...replacement);
        i += replacement.length - 1;
      }
    }
    return result;
  }, [text, sortedFlags]);

  return (
    <div className="term whitespace-pre-wrap leading-relaxed">
      {segments.map((seg, i) => {
        if (seg.kind === "text") return <span key={i}>{seg.value}</span>;
        const isFlagged = flagged.has(seg.rf.id);
        return (
          <span
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => onToggle(seg.rf.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(seg.rf.id);
              }
            }}
            className={`redflag ${isFlagged ? "flagged" : ""}`}
            title={isFlagged ? "Tagged: " + seg.rf.label : "Tap to tag as suspicious"}
          >
            {seg.rf.text}
          </span>
        );
      })}
    </div>
  );
}

/* ───────────── QUIZ ───────────── */

function QuizPhase({
  mission,
  answers,
  setAnswers,
  onNext,
  onBack,
}: {
  mission: Mission;
  answers: Record<string, number>;
  setAnswers: (a: Record<string, number>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const allAnswered = mission.quiz.every((q) => answers[q.id] !== undefined);

  return (
    <div className="panel p-6 md:p-8">
      <div className="text-xs font-mono text-ink-low mb-2">PHASE 02 · QUIZ</div>
      <h2 className="text-2xl font-bold">Test your understanding</h2>
      <p className="text-ink-mid text-sm mt-1">
        Three questions. Then deliver your verdict.
      </p>

      <div className="mt-8 space-y-7">
        {mission.quiz.map((q, qi) => (
          <div key={q.id}>
            <div className="text-xs font-mono text-ink-low mb-2">QUESTION {qi + 1}</div>
            <h3 className="text-lg font-medium leading-snug">{q.prompt}</h3>
            <div className="mt-4 grid gap-2">
              {q.options.map((opt, idx) => {
                const selected = answers[q.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [q.id]: idx })}
                    className={`text-left px-4 py-3 rounded-md border transition-all text-sm ${
                      selected
                        ? "border-neon-blue/50 bg-neon-blue/5 text-ink-hi shadow-glow"
                        : "border-bg-line bg-bg-panel/40 text-ink-mid hover:border-neon-blue/30 hover:text-ink-hi"
                    }`}
                  >
                    <span className="font-mono text-ink-low mr-3">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button onClick={onBack} className="btn-ghost text-sm">
          <ArrowLeft className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> Back to evidence
        </button>
        <button
          onClick={onNext}
          disabled={!allAnswered}
          className={`btn-primary text-sm ${!allAnswered ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          Continue to verdict <ArrowRight className="w-3.5 h-3.5 inline -mt-0.5 ml-1" />
        </button>
      </div>
    </div>
  );
}

/* ───────────── VERDICT ───────────── */

function VerdictPhase({
  verdict,
  setVerdict,
  onSubmit,
  onBack,
}: {
  verdict: Verdict | null;
  setVerdict: (v: Verdict) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div className="panel p-6 md:p-8">
      <div className="text-xs font-mono text-ink-low mb-2">PHASE 03 · VERDICT</div>
      <h2 className="text-2xl font-bold">Final judgment</h2>
      <p className="text-ink-mid text-sm mt-1">
        Based on all evidence, what is your call on this case?
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <VerdictButton
          tone="ok"
          icon={<Check className="w-5 h-5" />}
          label="Safe"
          desc="No significant red flags. Legitimate."
          selected={verdict === "safe"}
          onClick={() => setVerdict("safe")}
        />
        <VerdictButton
          tone="warn"
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Dangerous"
          desc="Multiple red flags. Active threat."
          selected={verdict === "dangerous"}
          onClick={() => setVerdict("dangerous")}
        />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button onClick={onBack} className="btn-ghost text-sm">
          <ArrowLeft className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> Back to quiz
        </button>
        <button
          onClick={onSubmit}
          disabled={!verdict}
          className={`btn-primary text-sm ${!verdict ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          <Gavel className="w-3.5 h-3.5 inline -mt-0.5 mr-1.5" />
          Submit verdict
        </button>
      </div>
    </div>
  );
}

function VerdictButton({
  tone,
  icon,
  label,
  desc,
  selected,
  onClick,
}: {
  tone: "ok" | "warn";
  icon: React.ReactNode;
  label: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  const ring =
    tone === "ok"
      ? selected
        ? "border-ok/50 bg-ok/5 shadow-[0_0_24px_rgba(16,185,129,0.25)]"
        : "border-bg-line hover:border-ok/40"
      : selected
      ? "border-warn/50 bg-warn/5 shadow-glowRed"
      : "border-bg-line hover:border-warn/40";
  const tint = tone === "ok" ? "text-ok" : "text-warn-soft";

  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-lg border text-left transition-all ${ring}`}
    >
      <div className={`inline-flex items-center gap-2 ${tint} font-semibold text-lg`}>
        {icon}
        {label}
      </div>
      <p className="text-ink-mid text-sm mt-2">{desc}</p>
    </button>
  );
}

/* ───────────── RESULT ───────────── */

function ResultPhase({
  mission,
  score,
  xpEarned,
  passed,
  foundFlags,
  totalFlags,
  quizCorrect,
  verdictCorrect,
  flagged,
  answers,
  onReset,
}: {
  mission: Mission;
  score: number;
  xpEarned: number;
  passed: boolean;
  foundFlags: number;
  totalFlags: number;
  quizCorrect: number;
  verdictCorrect: boolean;
  flagged: Set<string>;
  answers: Record<string, number>;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Hero result */}
      <div className={`panel ${passed ? "" : "panel-warn"} p-8 md:p-10 text-center scanline`}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple mb-4 shadow-glow"
        >
          <span className="text-4xl">{passed ? mission.badge.emoji : "🔍"}</span>
        </motion.div>

        <div className="text-xs font-mono text-ink-low">
          {passed ? "BADGE UNLOCKED" : "CASE CLOSED"}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mt-1">
          {passed ? mission.badge.name : "Keep investigating"}
        </h2>
        <p className="text-ink-mid mt-2 max-w-xl mx-auto">
          {passed
            ? mission.badge.description
            : "You missed the verdict or scored under 70%. Review the breakdown below and try again — no penalty."}
        </p>

        <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
          <ScoreRing score={score} />
          <div className="text-left">
            <Stat label="XP earned" value={`+${xpEarned}`} sub={`of ${mission.xp}`} />
            <Stat
              label="Verdict"
              value={verdictCorrect ? "Correct" : "Incorrect"}
              tone={verdictCorrect ? "ok" : "warn"}
            />
            <Stat label="Badge" value={mission.badge.name} sub={mission.badge.rarity} />
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="panel p-6">
          <div className="flex items-center gap-2 mb-3">
            <Flag className="w-4 h-4 text-warn" />
            <h3 className="font-semibold">Red flags ({foundFlags}/{totalFlags})</h3>
          </div>
          <p className="text-xs text-ink-low mb-4">
            Each flag explained — even the ones you missed.
          </p>
          <div className="space-y-2.5">
            {mission.redFlags.map((rf) => {
              const found = flagged.has(rf.id);
              return (
                <div key={rf.id} className="flex gap-3 text-sm">
                  <div className="shrink-0 mt-0.5">
                    {found ? (
                      <Check className="w-4 h-4 text-ok" />
                    ) : (
                      <X className="w-4 h-4 text-warn" />
                    )}
                  </div>
                  <div>
                    <div className={`font-medium ${found ? "text-ink-hi" : "text-warn-soft"}`}>
                      {rf.label} <span className="text-ink-low font-normal">— &ldquo;{rf.text}&rdquo;</span>
                    </div>
                    <p className="text-ink-mid text-xs mt-1 leading-relaxed">{rf.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-neon-blue" />
            <h3 className="font-semibold">Quiz ({quizCorrect}/{mission.quiz.length})</h3>
          </div>
          <p className="text-xs text-ink-low mb-4">Answer review with explanations.</p>
          <div className="space-y-4">
            {mission.quiz.map((q, qi) => {
              const userIdx = answers[q.id];
              const right = userIdx === q.correctIndex;
              return (
                <div key={q.id} className="text-sm">
                  <div className="flex items-start gap-2">
                    {right ? (
                      <Check className="w-4 h-4 text-ok shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-warn shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-ink-hi font-medium">
                        Q{qi + 1}. {q.prompt}
                      </div>
                      <div className="text-xs mt-1.5">
                        <span className="text-ink-low">Your answer: </span>
                        <span className={right ? "text-ok" : "text-warn-soft"}>
                          {q.options[userIdx]}
                        </span>
                      </div>
                      {!right && (
                        <div className="text-xs text-ok mt-0.5">
                          Correct: {q.options[q.correctIndex]}
                        </div>
                      )}
                      <p className="text-ink-mid text-xs mt-2 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
        <button onClick={onReset} className="btn-ghost text-sm">
          Replay case
        </button>
        <Link href="/missions" className="btn-primary text-sm">
          Back to missions <ArrowRight className="w-3.5 h-3.5 inline -mt-0.5 ml-1" />
        </Link>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const tone = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-28 h-28">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - dash }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold">{score}</div>
        <div className="text-[10px] font-mono text-ink-low uppercase tracking-wider">score</div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "ok" | "warn";
}) {
  const cls = tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn-soft" : "text-ink-hi";
  return (
    <div className="mb-2">
      <div className="text-[10px] uppercase tracking-wider text-ink-low font-mono">{label}</div>
      <div className={`text-base font-semibold ${cls}`}>
        {value} {sub && <span className="text-ink-low text-xs font-normal">{sub}</span>}
      </div>
    </div>
  );
}

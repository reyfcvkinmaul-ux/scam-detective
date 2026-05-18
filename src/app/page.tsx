"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Sparkles, Eye, Trophy, ArrowRight, Wallet, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* grid backdrop */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />

      <Nav />

      {/* HERO */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 chip chip-info mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Web3 Safety Academy · Phase 1 MVP
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Learn to detect crypto scams
            <br />
            <span className="text-gradient">before they detect you.</span>
          </h1>
          <p className="mt-6 text-ink-mid max-w-2xl mx-auto text-lg">
            Scam Detective trains your instincts through interactive investigation missions.
            Real evidence. Real red flags. Real on-chain decisions — without losing real money.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/missions" className="btn-primary inline-flex items-center gap-2">
              Start Investigation
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/missions/free-airdrop-alert" className="btn-ghost inline-flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Try Demo Case
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-ink-low">
            <span className="chip">No wallet required to start</span>
            <span className="chip">5-minute cases</span>
            <span className="chip">Soulbound badges (optional)</span>
          </div>
        </motion.div>

        {/* Demo case preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="panel scanline p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-xs text-ink-low font-mono">CASE FILE · #001</div>
                <h3 className="text-xl font-semibold mt-1">Free Airdrop Alert</h3>
                <p className="text-ink-mid text-sm mt-1">
                  A viral tweet promises 5,000 USDC. Your job: verify before the user clicks.
                </p>
              </div>
              <span className="chip chip-warn whitespace-nowrap">Beginner · 4 min</span>
            </div>

            <div className="term mt-2">
              <span className="text-ink-low">$ </span>
              <span className="text-neon-blue">scam-detective</span> open --case 001<br />
              <span className="text-ink-low">[ok] </span>6 evidence tabs loaded<br />
              <span className="text-ink-low">[ok] </span>8 red flags hidden in evidence<br />
              <span className="text-ink-low">[?]  </span>verdict required after review
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-ink-mid text-sm">
                <Trophy className="w-4 h-4 text-neon-purple" />
                Reward: 120 XP + <span className="text-ink-hi">Phishing Survivor</span> badge
              </div>
              <Link
                href="/missions/free-airdrop-alert"
                className="text-neon-blue hover:text-neon-purple transition-colors text-sm font-medium inline-flex items-center gap-1"
              >
                Open case <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-2">How a mission works</h2>
        <p className="text-ink-mid text-center mb-12">Three steps. No lectures.</p>
        <div className="grid md:grid-cols-3 gap-5">
          <Step
            n={1}
            icon={<Eye className="w-5 h-5" />}
            title="Inspect evidence"
            body="Tabs of social posts, websites, wallet popups, transactions. Tag what feels off."
          />
          <Step
            n={2}
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Answer & decide"
            body="Quick quiz on what each red flag means. Then your verdict: safe or dangerous?"
          />
          <Step
            n={3}
            icon={<Trophy className="w-5 h-5" />}
            title="Earn the badge"
            body="Get a score breakdown, learn what you missed, mint a soulbound badge if you want it on-chain."
          />
        </div>
      </section>

      {/* WEB3 LAYER */}
      <section className="relative max-w-6xl mx-auto px-6 pb-32">
        <div className="panel p-8 md:p-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3 text-neon-blue text-sm font-mono">
            <Wallet className="w-4 h-4" />
            OPTIONAL · WEB3 LAYER
          </div>
          <h2 className="text-3xl font-bold mb-3">Your safety record, on-chain</h2>
          <p className="text-ink-mid max-w-2xl mx-auto">
            Connect a wallet to mint non-transferable Soulbound (ERC-5192) badges, build a public
            Web3 Safety Passport, and climb the seasonal leaderboard. Skip it if you just want to
            learn — every mission works without a wallet.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-ink-low">
            <span className="chip"><Lock className="w-3 h-3" /> Base Sepolia (testnet)</span>
            <span className="chip">ERC-5192 soulbound</span>
            <span className="chip">Coming in Phase 3</span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="relative max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-neon-blue to-neon-purple grid place-items-center shadow-glow">
          <ShieldCheck className="w-4 h-4 text-bg-base" />
        </div>
        <span>Scam Detective</span>
        <span className="text-ink-low text-xs font-mono">v0.1</span>
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/missions" className="text-ink-mid hover:text-ink-hi px-3 py-2 rounded-md transition-colors">
          Missions
        </Link>
        <Link href="/missions" className="btn-ghost text-sm">
          Start Investigation
        </Link>
      </nav>
    </header>
  );
}

function Step({ n, icon, title, body }: { n: number; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="panel p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-md bg-bg-elev grid place-items-center text-neon-blue border border-neon-blue/20">
          {icon}
        </div>
        <span className="text-ink-low font-mono text-xs">STEP {n.toString().padStart(2, "0")}</span>
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-ink-mid text-sm mt-1.5 leading-relaxed">{body}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-bg-line/60 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-8 text-xs text-ink-low flex flex-wrap items-center justify-between gap-3">
        <span>Scam Detective · Web3 Safety Academy · Phase 1 MVP</span>
        <span className="font-mono">build · static missions · no backend yet</span>
      </div>
    </footer>
  );
}

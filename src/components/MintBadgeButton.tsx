"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Lock,
} from "lucide-react";
import { useMintBadge } from "@/lib/hooks/useMintBadge";
import { useSwitchChain } from "wagmi";
import { BASE_SEPOLIA_CHAIN_ID } from "@/lib/contracts";

export function MintBadgeButton({
  slug,
  badgeName,
  badgeEmoji,
  passed,
}: {
  slug: string;
  badgeName: string;
  badgeEmoji: string;
  passed: boolean;
}) {
  const { status, mint, basescanTx, basescanBadge, error } = useMintBadge(slug, passed);
  const { switchChain, isPending: switching } = useSwitchChain();

  if (status === "not-configured") {
    return (
      <div className="panel p-4 text-sm flex items-center gap-3">
        <Lock className="w-4 h-4 text-ink-low shrink-0" />
        <div>
          <div className="text-ink-mid">On-chain minting not yet active on this deployment.</div>
          <div className="text-xs text-ink-low mt-0.5">Phase 3 contract not configured for this build.</div>
        </div>
      </div>
    );
  }

  if (status === "needs-wallet") {
    return (
      <div className="panel p-4 text-sm flex items-center gap-3">
        <Wallet className="w-4 h-4 text-neon-blue shrink-0" />
        <div>
          <div className="text-ink-hi">Connect a wallet to claim this badge on-chain.</div>
          <div className="text-xs text-ink-low mt-0.5">
            Soulbound NFT on Base Sepolia. Free mint, gas only.
          </div>
        </div>
      </div>
    );
  }

  if (status === "wrong-chain") {
    return (
      <button
        onClick={() => switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID })}
        disabled={switching}
        className="btn-primary text-sm inline-flex items-center gap-2"
      >
        <AlertTriangle className="w-4 h-4" />
        {switching ? "Switching…" : "Switch to Base Sepolia to mint"}
      </button>
    );
  }

  if (status === "already-minted") {
    return (
      <div className="panel p-4 flex items-center gap-3 text-sm border-ok/30">
        <span className="text-2xl">{badgeEmoji}</span>
        <div className="flex-1">
          <div className="text-ok font-medium inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Badge minted on-chain
          </div>
          <div className="text-xs text-ink-low mt-0.5">{badgeName} · soulbound, can&apos;t be transferred</div>
        </div>
        {basescanBadge && (
          <a
            href={basescanBadge}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost text-xs inline-flex items-center gap-1"
          >
            View <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="panel p-4 flex items-center gap-3 text-sm border-ok/40 shadow-[0_0_24px_rgba(16,185,129,0.25)]"
      >
        <Sparkles className="w-4 h-4 text-ok" />
        <div className="flex-1">
          <div className="text-ok font-medium">Mint confirmed</div>
          <div className="text-xs text-ink-low mt-0.5">
            {badgeName} is now in your wallet, permanently.
          </div>
        </div>
        {basescanTx && (
          <a
            href={basescanTx}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost text-xs inline-flex items-center gap-1"
          >
            Tx <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </motion.div>
    );
  }

  const busy = status === "pending" || status === "submitting" || status === "checking" || status === "fetching-proof";

  return (
    <div className="space-y-2">
      <button
        onClick={mint}
        disabled={busy || status !== "ready"}
        className="btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {status === "fetching-proof"
              ? "Requesting proof…"
              : status === "submitting"
              ? "Confirm in wallet…"
              : status === "pending"
              ? "Waiting for confirmation…"
              : "Checking…"}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Mint badge on-chain (signed proof)
          </>
        )}
      </button>
      <div className="text-xs text-ink-low">
        Soulbound NFT on Base Sepolia · gas only · server-signed mint proof (anti-cheat)
      </div>
      {status === "error" && error && (
        <div className="text-xs text-warn-soft inline-flex items-center gap-1.5 chip chip-warn">
          <AlertTriangle className="w-3 h-3" />
          {shortenError(error.message)}
        </div>
      )}
    </div>
  );
}

function shortenError(msg: string): string {
  // Strip stacktrace noise, keep first sentence
  const first = msg.split("\n")[0].split(".")[0];
  return first.length > 100 ? first.slice(0, 100) + "…" : first;
}

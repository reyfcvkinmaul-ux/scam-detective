"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ChevronDown, LogOut, Copy, Check, AlertTriangle, X } from "lucide-react";
import { useProfile } from "@/lib/profile";

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const setScope = useProfile((s) => s.setScope);

  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync wallet → profile scope
  useEffect(() => {
    setScope(isConnected && address ? address : "guest");
  }, [address, isConnected, setScope]);

  if (isConnected && address) {
    const onWrongChain = chainId !== baseSepolia.id;
    return (
      <div className="relative">
        {onWrongChain && (
          <button
            onClick={() => switchChain({ chainId: baseSepolia.id })}
            className="mr-2 chip chip-warn text-[11px]"
            disabled={switching}
          >
            <AlertTriangle className="w-3 h-3" />
            {switching ? "Switching…" : "Switch to Base Sepolia"}
          </button>
        )}
        <button
          onClick={() => setMenu((v) => !v)}
          className="btn-ghost text-sm inline-flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-ok shadow-[0_0_8px_#10b981]" />
          {short(address)}
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 panel p-2 z-50"
            >
              <div className="px-3 py-2 text-xs">
                <div className="text-ink-low font-mono">CONNECTED</div>
                <div className="text-ink-hi font-mono mt-0.5 break-all">{short(address, 8, 6)}</div>
                <div className="text-ink-low font-mono mt-1">
                  Chain: {chainId === baseSepolia.id ? "Base Sepolia" : `id ${chainId}`}
                </div>
              </div>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(address);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-bg-elev text-sm inline-flex items-center gap-2 text-ink-mid hover:text-ink-hi"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy address"}
              </button>
              <a
                href="/profile"
                className="w-full text-left px-3 py-2 rounded-md hover:bg-bg-elev text-sm inline-flex items-center gap-2 text-ink-mid hover:text-ink-hi"
              >
                <Wallet className="w-3.5 h-3.5" />
                My profile
              </a>
              <button
                onClick={() => {
                  disconnect();
                  setMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-bg-elev text-sm inline-flex items-center gap-2 text-warn-soft"
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary text-sm inline-flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bg-base/80 backdrop-blur-sm grid place-items-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18 }}
              className="panel p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="text-xs font-mono text-ink-low">CONNECT WALLET</div>
                  <h2 className="text-xl font-bold mt-1">Pick a wallet</h2>
                </div>
                <button onClick={() => setOpen(false)} className="text-ink-low hover:text-ink-hi">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-ink-mid text-sm">
                Wallet stays in your browser. We never custody funds. Network is{" "}
                <span className="text-neon-blue">Base Sepolia</span> (testnet).
              </p>

              <div className="mt-5 space-y-2">
                {connectors.map((connector) => {
                  const meta = connectorMeta(connector.id, connector.name);
                  return (
                    <button
                      key={connector.uid}
                      onClick={() => {
                        connect({ connector });
                        setOpen(false);
                      }}
                      disabled={isPending}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-md border border-bg-line bg-bg-panel/40 hover:border-neon-blue/40 hover:bg-bg-elev transition-all text-left disabled:opacity-50"
                    >
                      <span className="w-8 h-8 rounded-md bg-bg-elev grid place-items-center text-base">
                        {meta.emoji}
                      </span>
                      <div className="flex-1">
                        <div className="text-ink-hi font-medium text-sm">{meta.label}</div>
                        <div className="text-xs text-ink-low">{meta.hint}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="mt-4 text-xs text-warn-soft chip chip-warn">
                  <AlertTriangle className="w-3 h-3" />
                  {error.message.length > 80 ? error.message.slice(0, 80) + "…" : error.message}
                </div>
              )}

              <div className="mt-5 text-[11px] text-ink-low">
                No wallet? You can keep playing as guest — progress saves locally and migrates the
                moment you connect.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function short(addr: string, head = 6, tail = 4) {
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

function connectorMeta(id: string, fallbackName: string) {
  const i = id.toLowerCase();
  if (i.includes("metamask")) return { emoji: "🦊", label: "MetaMask", hint: "Most common — browser extension or mobile" };
  if (i.includes("okx")) return { emoji: "⬡", label: "OKX Wallet", hint: "OKX exchange wallet" };
  if (i.includes("rabby")) return { emoji: "🐰", label: "Rabby", hint: "Power-user multi-chain wallet" };
  if (i.includes("trust")) return { emoji: "🛡️", label: "Trust Wallet", hint: "Mobile-first wallet" };
  if (i.includes("coinbase")) return { emoji: "🔵", label: "Coinbase Wallet", hint: "Coinbase self-custody" };
  if (i.includes("phantom")) return { emoji: "👻", label: "Phantom", hint: "Solana + EVM" };
  return { emoji: "🔌", label: fallbackName || "Browser wallet", hint: "Detected injected wallet" };
}

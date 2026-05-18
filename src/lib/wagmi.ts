import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Multi-injected detection: wagmi's `injected()` connector auto-discovers
// MetaMask, OKX, Rabby, Trust, etc. via EIP-6963 (multi-provider standard).
// We also expose explicit `target` shortcuts so the UI can prefer specific wallets.

type EIP1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

function getOkxProvider(): EIP1193 | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { okxwallet?: EIP1193; okexchain?: EIP1193 };
  return w.okxwallet ?? w.okexchain;
}

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected({ target: "metaMask" }),
    injected({
      target: () => ({
        id: "okx",
        name: "OKX Wallet",
        // The injected connector tolerates undefined provider (won't connect, but won't crash on import either).
        provider: getOkxProvider() as unknown as never,
      }),
    }),
    // Generic injected catch-all — picks up any other EIP-1193 / EIP-6963 wallet
    injected(),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

"use client";

import { useCallback, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  CONTRACTS,
  BASE_SEPOLIA_CHAIN_ID,
  BASESCAN_BASE,
  isContractsConfigured,
  missionIdOf,
  safetyBadgeAbi,
} from "@/lib/contracts";

export type MintStatus =
  | "not-configured"      // contract address not set
  | "needs-wallet"        // wallet disconnected
  | "wrong-chain"         // wallet on wrong network
  | "checking"            // reading on-chain ownership
  | "already-minted"      // user already owns the badge
  | "ready"               // can mint now
  | "pending"             // tx submitted, waiting for confirmation
  | "submitting"          // user is in wallet popup
  | "success"             // tx confirmed
  | "error";

export function useMintBadge(slug: string) {
  const { address, chainId, isConnected } = useAccount();
  const configured = isContractsConfigured();

  const missionId = useMemo(() => missionIdOf(slug), [slug]);

  // Read current ownership — only when configured + connected
  const { data: currentTokenId, refetch: refetchOwnership } = useReadContract({
    address: CONTRACTS.safetyBadge,
    abi: safetyBadgeAbi,
    functionName: "badgeOf",
    args: address ? [address, missionId] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: configured && !!address },
  });

  const ownsBadge =
    currentTokenId !== undefined &&
    currentTokenId !== null &&
    BigInt(currentTokenId as bigint) > BigInt(0);

  const {
    writeContract,
    data: txHash,
    isPending: walletPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: txLoading,
    isSuccess: txConfirmed,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: !!txHash },
  });

  const mint = useCallback(() => {
    if (!configured || !address) return;
    writeContract({
      address: CONTRACTS.safetyBadge,
      abi: safetyBadgeAbi,
      functionName: "mintBySlug",
      args: [slug],
      chainId: BASE_SEPOLIA_CHAIN_ID,
    });
  }, [address, configured, slug, writeContract]);

  // Refetch ownership after tx confirms
  if (txConfirmed && !ownsBadge) {
    void refetchOwnership();
  }

  const status: MintStatus = (() => {
    if (!configured) return "not-configured";
    if (!isConnected || !address) return "needs-wallet";
    if (chainId !== BASE_SEPOLIA_CHAIN_ID) return "wrong-chain";
    if (txConfirmed) return "success";
    if (txLoading) return "pending";
    if (walletPending) return "submitting";
    if (writeError || txError) return "error";
    if (ownsBadge) return "already-minted";
    if (currentTokenId === undefined) return "checking";
    return "ready";
  })();

  return {
    status,
    mint,
    txHash,
    tokenId: currentTokenId as bigint | undefined,
    error: writeError ?? txError,
    reset,
    basescanTx: txHash ? `${BASESCAN_BASE}/tx/${txHash}` : undefined,
    basescanBadge: ownsBadge && address
      ? `${BASESCAN_BASE}/token/${CONTRACTS.safetyBadge}?a=${address}`
      : undefined,
  };
}

"use client";

import { useCallback, useMemo, useState } from "react";
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
  | "fetching-proof"      // requesting EIP-712 proof from /api/proof
  | "submitting"          // user is in wallet popup
  | "pending"             // tx submitted, waiting for confirmation
  | "success"             // tx confirmed
  | "error";

export function useMintBadge(slug: string, passed = false) {
  const { address, chainId, isConnected } = useAccount();
  const configured = isContractsConfigured();
  const missionId = useMemo(() => missionIdOf(slug), [slug]);

  const [proofError, setProofError] = useState<string | null>(null);
  const [fetchingProof, setFetchingProof] = useState(false);

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

  const mint = useCallback(async () => {
    if (!configured || !address) return;
    setProofError(null);
    setFetchingProof(true);
    try {
      const res = await fetch("/api/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: address, slug, passed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `Proof request failed (${res.status})`);
      }
      const { signature, deadline } = (await res.json()) as {
        signature: `0x${string}`;
        deadline: number;
      };

      writeContract({
        address: CONTRACTS.safetyBadge,
        abi: safetyBadgeAbi,
        functionName: "mintWithProof",
        args: [missionId, BigInt(deadline), signature],
        chainId: BASE_SEPOLIA_CHAIN_ID,
      });
    } catch (err) {
      setProofError(err instanceof Error ? err.message : "Failed to fetch proof");
    } finally {
      setFetchingProof(false);
    }
  }, [address, configured, slug, passed, missionId, writeContract]);

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
    if (fetchingProof) return "fetching-proof";
    if (writeError || txError || proofError) return "error";
    if (ownsBadge) return "already-minted";
    if (currentTokenId === undefined) return "checking";
    return "ready";
  })();

  return {
    status,
    mint,
    txHash,
    tokenId: currentTokenId as bigint | undefined,
    error: proofError
      ? new Error(proofError)
      : (writeError ?? txError ?? null),
    reset,
    basescanTx: txHash ? `${BASESCAN_BASE}/tx/${txHash}` : undefined,
    basescanBadge: ownsBadge && address
      ? `${BASESCAN_BASE}/token/${CONTRACTS.safetyBadge}?a=${address}`
      : undefined,
  };
}

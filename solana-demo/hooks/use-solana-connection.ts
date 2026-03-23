"use client";

import { useMemo } from "react";

import { getSolanaConnection } from "../lib/solana/connection";
import { useCluster } from "./use-cluster";

export function useSolanaConnection() {
  const { endpoint } = useCluster();

  return useMemo(() => getSolanaConnection(endpoint), [endpoint]);
}


"use client";

import { useMemo } from "react";

import { getClusterByKey } from "../lib/solana/rpc-config";
import { useNetworkStore } from "../store/network-store";

export function useCluster() {
  const cluster = useNetworkStore((state) => state.cluster);
  const setCluster = useNetworkStore((state) => state.setCluster);

  const selectedCluster = useMemo(() => getClusterByKey(cluster), [cluster]);

  return {
    cluster,
    setCluster,
    endpoint: selectedCluster.endpoint,
    label: selectedCluster.label
  };
}


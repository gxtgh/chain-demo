import { Connection } from "@solana/web3.js";

const cache = new Map<string, Connection>();

export function getSolanaConnection(endpoint: string): Connection {
  if (!cache.has(endpoint)) {
    cache.set(endpoint, new Connection(endpoint, "confirmed"));
  }

  return cache.get(endpoint)!;
}


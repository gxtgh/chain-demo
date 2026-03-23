import type { ClusterOption } from "../../types/network";

const defaultNetwork = import.meta.env.VITE_SOLANA_DEFAULT_NETWORK ?? "devnet";

export const clusters: ClusterOption[] = [
  {
    key: "mainnet-beta",
    label: "Mainnet Beta",
    endpoint: import.meta.env.VITE_SOLANA_RPC_MAINNET ?? "https://api.mainnet-beta.solana.com"
  },
  {
    key: "devnet",
    label: "Devnet",
    endpoint: import.meta.env.VITE_SOLANA_RPC_DEVNET ?? "https://api.devnet.solana.com"
  },
  {
    key: "testnet",
    label: "Testnet",
    endpoint: import.meta.env.VITE_SOLANA_RPC_TESTNET ?? "https://api.testnet.solana.com"
  },
  {
    key: "localnet",
    label: "Localnet",
    endpoint: import.meta.env.VITE_SOLANA_RPC_LOCALNET ?? "http://127.0.0.1:8899"
  }
];

export const defaultCluster =
  clusters.find((item) => item.key === defaultNetwork)?.key ?? "devnet";

export function getClusterByKey(clusterKey: string): ClusterOption {
  return clusters.find((item) => item.key === clusterKey) ?? clusters[1];
}

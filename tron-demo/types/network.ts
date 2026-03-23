export type TronNetwork = "shasta" | "mainnet";

export interface TronNetworkOption {
  id: TronNetwork;
  label: string;
  description: string;
  fullHost: string;
  explorerBaseUrl: string;
}

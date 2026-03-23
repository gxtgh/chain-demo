export type TonNetwork = "testnet" | "mainnet";

export interface TonNetworkOption {
  id: TonNetwork;
  label: string;
  description: string;
  endpoint: string;
}

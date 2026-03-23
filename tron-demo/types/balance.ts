import type { TronNetwork } from "./network";

export interface TokenBalanceSnapshot {
  contractAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  rawBalance: string;
  uiBalance: string;
}

export interface WalletBalanceSnapshot {
  address: string;
  trxSun: string;
  trx: string;
  network: TronNetwork;
  tokens: TokenBalanceSnapshot[];
}

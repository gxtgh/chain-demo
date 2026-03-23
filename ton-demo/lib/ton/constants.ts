import type { TonNetworkOption } from "../../types/network";

export const tonNetworks: TonNetworkOption[] = [
  {
    id: "testnet",
    label: "TON Testnet",
    description: "默认演示网络，适合本地签名与批量转账调试。",
    endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC"
  },
  {
    id: "mainnet",
    label: "TON Mainnet",
    description: "正式网络，请确认资金与地址后再操作。",
    endpoint: "https://toncenter.com/api/v2/jsonRPC"
  }
];

export const defaultNetwork = "testnet";

export const tonTransferReserveTon = "0.03";

export const tonExplorerBaseUrl = {
  testnet: "https://testnet.tonviewer.com",
  mainnet: "https://tonviewer.com"
} as const;

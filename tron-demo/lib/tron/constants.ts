import type { TronNetworkOption } from "../../types/network";

export const tronNetworks: TronNetworkOption[] = [
  {
    id: "shasta",
    label: "Tron Shasta",
    description: "默认测试网络，适合批量流程联调与演示。",
    fullHost: "https://api.shasta.trongrid.io",
    explorerBaseUrl: "https://shasta.tronscan.org/#"
  },
  {
    id: "mainnet",
    label: "Tron Mainnet",
    description: "正式网络，请在确认资产和合约地址后再执行。",
    fullHost: "https://api.trongrid.io",
    explorerBaseUrl: "https://tronscan.org/#"
  }
];

export const defaultNetwork = "shasta";
export const defaultFeeLimitSun = 100_000_000;
export const trxReserveSun = 3_000_000;

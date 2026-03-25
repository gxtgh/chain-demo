import { getFullnodeUrl } from "@mysten/sui/client";

export type AppSuiNetwork = "mainnet" | "testnet" | "devnet" | "localnet";

export const NETWORK_OPTIONS: AppSuiNetwork[] = ["mainnet", "testnet", "devnet", "localnet"];

export const NETWORK_URLS: Record<AppSuiNetwork, string> = {
  mainnet: getFullnodeUrl("mainnet"),
  testnet: getFullnodeUrl("testnet"),
  devnet: getFullnodeUrl("devnet"),
  localnet: getFullnodeUrl("localnet")
};

export const DEFAULT_NETWORK: AppSuiNetwork = "testnet";
export const DEFAULT_RPC = NETWORK_URLS[DEFAULT_NETWORK];
export const SUI_COIN_TYPE =
  "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";
export const DISPLAY_SUI_COIN_TYPE = "0x2::sui::SUI";
export const CETUS_USDC_COIN_TYPE =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";
export const CETUS_USDT_COIN_TYPE =
  "0x375f70cf2ae4c00bf37117d0c85a2c71545e6ee05c4a5c7d282cd66a4504b068::usdt::USDT";
export const CETUS_COIN_TYPE =
  "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS";
export const DEFAULT_GAS_RESERVE_MIST = 20_000_000n;

export function getNetworkRpcUrl(network: AppSuiNetwork) {
  return NETWORK_URLS[network];
}

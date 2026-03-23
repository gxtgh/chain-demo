import type { TronWeb } from "tronweb";

import { defaultFeeLimitSun } from "../tron/constants";
import type { TokenBalanceSnapshot, WalletBalanceSnapshot } from "../../types/balance";
import type { TronNetwork } from "../../types/network";
import type { TronWalletRecord } from "../../types/wallet";

const TRC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }]
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }]
  },
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }]
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
] as const;

export const balanceService = {
  parseTokenContracts(text: string) {
    return Array.from(
      new Set(
        text
          .split(/\r?\n|,/)
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );
  },

  async queryWalletBalances(
    tronWeb: TronWeb,
    network: TronNetwork,
    wallets: TronWalletRecord[],
    tokenContracts: string[]
  ) {
    const results: WalletBalanceSnapshot[] = [];

    for (const wallet of wallets) {
      const trxSun = await tronWeb.trx.getBalance(wallet.addressBase58);
      const tokens: TokenBalanceSnapshot[] = [];

      for (const contractAddress of tokenContracts) {
        try {
          const contract = await tronWeb
            .contract<typeof TRC20_ABI>(TRC20_ABI, contractAddress)
            .at(contractAddress);
          const rawBalance = await contract.balanceOf(wallet.addressBase58).call({
            feeLimit: defaultFeeLimitSun
          });
          const decimals = Number(await contract.decimals().call());
          const symbol = String(await contract.symbol().call());
          const name = String(await contract.name().call());

          tokens.push({
            contractAddress,
            symbol,
            name,
            decimals,
            rawBalance: rawBalance.toString(),
            uiBalance: formatTokenBalance(rawBalance.toString(), decimals)
          });
        } catch {
          tokens.push({
            contractAddress,
            symbol: "UNKNOWN",
            name: "Unknown Token",
            decimals: 0,
            rawBalance: "0",
            uiBalance: "0"
          });
        }
      }

      results.push({
        address: wallet.addressBase58,
        trxSun: String(trxSun),
        trx: String(tronWeb.fromSun(trxSun)),
        network,
        tokens
      });
    }

    return results;
  },

  trc20Abi: TRC20_ABI
};

function formatTokenBalance(rawBalance: string, decimals: number) {
  const value = BigInt(rawBalance || "0");

  if (decimals <= 0) {
    return value.toString();
  }

  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const fraction = value % base;
  const fractionText = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return fractionText ? `${whole}.${fractionText}` : whole.toString();
}

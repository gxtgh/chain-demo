import BN from "bn.js";
import Decimal from "decimal.js";
import { AggregatorClient, Env } from "@cetusprotocol/aggregator-sdk";
import { TickMath, ClmmPoolUtil, initCetusSDK } from "@cetusprotocol/cetus-sui-clmm-sdk";
import type { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

import { DEFAULT_RPC, SUI_COIN_TYPE } from "./constants";
import { suiClient } from "./client";
import type { SupportedSuiKeypair } from "./wallet";

export type CoinMetadataSummary = {
  coinType: string;
  decimals: number;
  symbol: string;
  name: string;
  iconUrl: string;
};

export type CreatePoolParams = {
  client: SuiClient;
  tokenA: CoinMetadataSummary;
  tokenB: CoinMetadataSummary;
  initialPrice: string;
  tickSpacing: number;
  tokenAAmount: string;
  slippage: number;
};

export type AddLiquidityParams = {
  pool: Record<string, any>;
  tokenA: CoinMetadataSummary;
  tokenB: CoinMetadataSummary;
  tokenAAmountHuman: string;
  rangePct: number;
  slippage: number;
};

const sdk: any = initCetusSDK({
  network: "mainnet",
  fullNodeUrl: DEFAULT_RPC
});

const aggregator = new AggregatorClient({
  client: suiClient as any,
  env: Env.Mainnet
});

const D = (value: string | number) => new Decimal(value);

function normalizeSuiType(coinType: string) {
  return coinType === "0x2::sui::SUI" ? SUI_COIN_TYPE : coinType;
}

function compareAscii(left: string, right: string) {
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const leftCode = left.charCodeAt(index);
    const rightCode = right.charCodeAt(index);
    if (leftCode !== rightCode) {
      return leftCode - rightCode;
    }
  }
  return left.length - right.length;
}

function toBaseUnits(value: string, decimals: number) {
  const result = D(value).mul(D(10).pow(decimals)).toFixed(0, Decimal.ROUND_DOWN);
  return new BN(result);
}

function toHuman(amount: BN, decimals: number) {
  return D(amount.toString()).div(D(10).pow(decimals)).toString();
}

export async function fetchCoinMetadata(client: SuiClient, coinType: string) {
  const metadata = await client.getCoinMetadata({
    coinType: normalizeSuiType(coinType)
  });

  if (!metadata) {
    throw new Error(`Unable to load metadata for ${coinType}`);
  }

  return {
    coinType: normalizeSuiType(coinType),
    decimals: metadata.decimals,
    symbol: metadata.symbol,
    name: metadata.name,
    iconUrl: metadata.iconUrl ?? ""
  };
}

export async function fetchPoolsByCoinTypes(coinTypes: string[]) {
  const response = await fetch("https://api-sui.cetus.zone/v3/sui/clmm/stats_pools", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
      body: JSON.stringify({
      coinTypes: coinTypes.map((coinType) => normalizeSuiType(coinType))
    })
  });

  if (!response.ok) {
    throw new Error("Failed to query Cetus pool data.");
  }

  const payload = await response.json();
  return payload?.data?.list ?? payload?.list ?? [];
}

export function quoteCreatePoolCounterAmount(params: CreatePoolParams) {
  const token1 = normalizeSuiType(params.tokenA.coinType);
  const token2 = normalizeSuiType(params.tokenB.coinType);
  const sortedA = compareAscii(token1, token2) > 0 ? token1 : token2;
  const sortedB = sortedA === token1 ? token2 : token1;
  const token1IsA = sortedA === token1;
  const decimalsA = token1IsA ? params.tokenA.decimals : params.tokenB.decimals;
  const decimalsB = token1IsA ? params.tokenB.decimals : params.tokenA.decimals;

  const price12 = D(params.initialPrice);
  const rangeMin = price12.mul(0.9);
  const rangeMax = price12.mul(1.1);
  const priceBA = token1IsA ? D(1).div(price12) : price12;
  const priceBAMin = token1IsA ? D(1).div(rangeMax) : rangeMin;
  const priceBAMax = token1IsA ? D(1).div(rangeMin) : rangeMax;

  const currentSqrtPrice = new BN(
    TickMath.priceToSqrtPriceX64(priceBA, decimalsA, decimalsB).toString()
  );
  const lowerSqrt = new BN(TickMath.priceToSqrtPriceX64(priceBAMin, decimalsA, decimalsB).toString());
  const upperSqrt = new BN(TickMath.priceToSqrtPriceX64(priceBAMax, decimalsA, decimalsB).toString());

  const tickLower = TickMath.getPrevInitializableTickIndex(
    TickMath.sqrtPriceX64ToTickIndex(lowerSqrt),
    params.tickSpacing
  );
  const tickUpper = TickMath.getNextInitializableTickIndex(
    TickMath.sqrtPriceX64ToTickIndex(upperSqrt),
    params.tickSpacing
  );

  const token1Base = toBaseUnits(params.tokenAAmount, params.tokenA.decimals);
  const estimate = ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(
    tickLower,
    tickUpper,
    token1Base,
    token1IsA,
    true,
    params.slippage,
    currentSqrtPrice
  );

  const otherAmount = token1IsA ? estimate.tokenMaxB : estimate.tokenMaxA;

  return {
    tickLower,
    tickUpper,
    tokenBAmountHuman: toHuman(otherAmount, params.tokenB.decimals)
  };
}

export async function createPoolWithWallet(
  walletAddress: string,
  execute: (tx: Transaction) => Promise<{ digest: string }>,
  params: CreatePoolParams
) {
  sdk.senderAddress = walletAddress;

  const sorted = compareAscii(params.tokenA.coinType, params.tokenB.coinType) > 0
    ? { coinA: params.tokenA, coinB: params.tokenB }
    : { coinA: params.tokenB, coinB: params.tokenA };

  const fixAmountA = sorted.coinA.coinType === params.tokenA.coinType;
  const coinAmount = toBaseUnits(
    params.tokenAAmount,
    fixAmountA ? sorted.coinA.decimals : sorted.coinB.decimals
  );
  const quote = quoteCreatePoolCounterAmount(params);
  const currentPrice = fixAmountA ? D(1).div(params.initialPrice) : D(params.initialPrice);

  const calc = await sdk.Pool.calculateCreatePoolWithPrice({
    tick_spacing: params.tickSpacing,
    current_price: currentPrice,
    coin_amount: coinAmount.toString(),
    fix_amount_a: fixAmountA,
    add_mode_params: {
      type: "Target",
      tick_lower: quote.tickLower,
      tick_upper: quote.tickUpper
    },
    coin_decimals_a: sorted.coinA.decimals,
    coin_decimals_b: sorted.coinB.decimals,
    price_base_coin: "coin_b",
    slippage: params.slippage
  });

  const { tx, pos_id, remain_coin_a, remain_coin_b } =
    await sdk.Pool.createPoolWithPriceReturnPositionPayload({
      tick_spacing: params.tickSpacing,
      calculate_result: calc,
      add_mode_params: {
        type: "Target",
        tick_lower: quote.tickLower,
        tick_upper: quote.tickUpper
      },
      coin_type_a: sorted.coinA.coinType,
      coin_type_b: sorted.coinB.coinType
    });

  if (remain_coin_a) {
    tx.transferObjects([remain_coin_a], walletAddress);
  }
  if (remain_coin_b) {
    tx.transferObjects([remain_coin_b], walletAddress);
  }
  tx.transferObjects([pos_id], walletAddress);
  tx.setSender(walletAddress);

  return execute(tx);
}

export async function createPoolWithKeypair(
  client: SuiClient,
  keypair: SupportedSuiKeypair,
  params: CreatePoolParams
) {
  const owner = keypair.toSuiAddress();
  const result = await createPoolWithWallet(owner, async (tx) =>
    client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx
    }), params);
  return result;
}

function calcTickRangeByPct(currentTick: number, tickSpacing: number, rangePct: number) {
  const delta = Math.floor(Math.log(1 + rangePct) / Math.log(1.0001));
  const lower = TickMath.getPrevInitializableTickIndex(currentTick - delta, tickSpacing);
  const upper = TickMath.getNextInitializableTickIndex(currentTick + delta, tickSpacing);
  return { lower, upper };
}

export function quoteAddLiquidityNeedTokenB(params: AddLiquidityParams) {
  const token1IsA = normalizeSuiType(params.tokenA.coinType) === normalizeSuiType(params.pool.coin_type_a);
  const fixedAmount = toBaseUnits(
    params.tokenAAmountHuman,
    token1IsA ? params.tokenA.decimals : params.tokenB.decimals
  );
  const currentSqrtPrice = new BN(String(params.pool.current_sqrt_price));
  const { lower, upper } = calcTickRangeByPct(
    Number(params.pool.current_tick_index),
    Number(params.pool.tick_spacing),
    params.rangePct
  );

  const estimate = ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(
    lower,
    upper,
    fixedAmount,
    token1IsA,
    true,
    params.slippage,
    currentSqrtPrice
  );

  const tokenBNeed = token1IsA ? estimate.tokenMaxB : estimate.tokenMaxA;

  return {
    tickLower: lower,
    tickUpper: upper,
    tokenBAmountHuman: toHuman(tokenBNeed, params.tokenB.decimals),
    token1IsA,
    estimate
  };
}

export async function addLiquidityWithWallet(
  walletAddress: string,
  execute: (tx: Transaction) => Promise<{ digest: string }>,
  params: AddLiquidityParams
) {
  sdk.senderAddress = walletAddress;
  const quote = quoteAddLiquidityNeedTokenB(params);
  const fixedBase = toBaseUnits(
    params.tokenAAmountHuman,
    quote.token1IsA ? params.tokenA.decimals : params.tokenB.decimals
  );

  const payload = await sdk.Position.createAddLiquidityFixTokenPayload({
    pool_id: params.pool.id,
    pos_id: "0x0",
    coinTypeA: params.pool.coin_type_a,
    coinTypeB: params.pool.coin_type_b,
    tick_lower: quote.tickLower,
    tick_upper: quote.tickUpper,
    amount_a: quote.token1IsA ? fixedBase.toString() : quote.estimate.tokenMaxA.toString(),
    amount_b: quote.token1IsA ? quote.estimate.tokenMaxB.toString() : fixedBase.toString(),
    fix_amount_a: quote.token1IsA,
    is_open: true,
    slippage: params.slippage,
    collect_fee: false,
    rewarder_coin_types: []
  });

  payload.setSender(walletAddress);
  return execute(payload as Transaction);
}

export async function addLiquidityWithKeypair(
  client: SuiClient,
  keypair: SupportedSuiKeypair,
  params: AddLiquidityParams
) {
  return addLiquidityWithWallet(keypair.toSuiAddress(), async (tx) =>
    client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx
    }), params);
}

async function getAllCoinsOfType(owner: string, coinType: string) {
  const items: Array<{ coinObjectId: string; balance: string }> = [];
  let cursor: string | null | undefined = null;

  do {
    const page = await suiClient.getCoins({
      owner,
      coinType: normalizeSuiType(coinType),
      cursor: cursor ?? undefined
    });
    page.data.forEach((coin) => {
      items.push({
        coinObjectId: coin.coinObjectId,
        balance: coin.balance
      });
    });
    cursor = page.hasNextPage ? page.nextCursor : null;
  } while (cursor);

  return items;
}

function mergeCoinsInTx(tx: Transaction, coinIds: string[]) {
  const [baseId, ...rest] = coinIds;
  const baseCoin = tx.object(baseId);
  if (rest.length) {
    tx.mergeCoins(
      baseCoin,
      rest.map((coinId) => tx.object(coinId))
    );
  }
  return baseCoin;
}

export async function quoteTrade(params: {
  fromCoinType: string;
  toCoinType: string;
  amountAtomic: bigint;
}) {
  return aggregator.findRouters({
    from: normalizeSuiType(params.fromCoinType),
    target: normalizeSuiType(params.toCoinType),
    amount: params.amountAtomic,
    byAmountIn: true
  });
}

export async function buildSwapTransaction(params: {
  owner: string;
  fromCoinType: string;
  toCoinType: string;
  amountAtomic: bigint;
  slippagePercent: number;
}) {
  const tx = new Transaction();
  const fromCoin = normalizeSuiType(params.fromCoinType);
  let inputCoin: any = tx.gas;

  if (fromCoin !== SUI_COIN_TYPE) {
    const coins = await getAllCoinsOfType(params.owner, fromCoin);
    if (!coins.length) {
      throw new Error(`No balance found for ${fromCoin}`);
    }

    coins.sort((left, right) => (BigInt(right.balance) > BigInt(left.balance) ? 1 : -1));
    inputCoin = mergeCoinsInTx(
      tx,
      coins.slice(0, 200).map((coin) => coin.coinObjectId)
    );
  }

  const [swapInput] = tx.splitCoins(inputCoin, [tx.pure.u64(params.amountAtomic)]);
  const router = await quoteTrade({
    fromCoinType: fromCoin,
    toCoinType: params.toCoinType,
    amountAtomic: params.amountAtomic
  });

  if (!router?.quoteID) {
    throw new Error("No Cetus trade route found for the current pair.");
  }

  const outputCoin = await aggregator.routerSwap({
    router,
    txb: tx as any,
    inputCoin: swapInput as any,
    slippage: params.slippagePercent / 100
  });

  tx.transferObjects([outputCoin as any], params.owner);
  tx.setSender(params.owner);

  return {
    tx,
    router
  };
}

export async function swapWithWallet(
  execute: (tx: Transaction) => Promise<{ digest: string }>,
  params: {
    owner: string;
    fromCoinType: string;
    toCoinType: string;
    amountAtomic: bigint;
    slippagePercent: number;
  }
) {
  const { tx, router } = await buildSwapTransaction(params);
  const result = await execute(tx);
  return {
    digest: result.digest,
    router
  };
}

export async function swapWithKeypair(
  client: SuiClient,
  keypair: SupportedSuiKeypair,
  params: {
    fromCoinType: string;
    toCoinType: string;
    amountAtomic: bigint;
    slippagePercent: number;
  }
) {
  const owner = keypair.toSuiAddress();
  const { tx, router } = await buildSwapTransaction({
    owner,
    fromCoinType: params.fromCoinType,
    toCoinType: params.toCoinType,
    amountAtomic: params.amountAtomic,
    slippagePercent: params.slippagePercent
  });

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx
  });

  return {
    digest: result.digest,
    router
  };
}

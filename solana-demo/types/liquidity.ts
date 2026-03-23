export type LiquidityActionStatus = "draft" | "ready" | "placeholder";

export interface OpenBookMarketDraftInput {
  baseMint: string;
  quoteMint: string;
  lotSize: number;
  tickSize: number;
}

export interface LiquidityPoolDraftInput {
  baseMint: string;
  quoteMint: string;
  baseAmount: number;
  quoteAmount: number;
  openBookMarketId?: string;
}

export interface LiquidityRemovalDraftInput {
  poolId: string;
  lpAmount: number;
}

export interface LiquidityBurnDraftInput {
  lpMint: string;
  amount: number;
}

export interface LiquidityDraftResult<TInput> {
  adapter: string;
  action: string;
  status: LiquidityActionStatus;
  message: string;
  input: TInput;
  nextSteps: string[];
}


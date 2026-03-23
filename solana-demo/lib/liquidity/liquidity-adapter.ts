import type {
  LiquidityBurnDraftInput,
  LiquidityDraftResult,
  LiquidityPoolDraftInput,
  LiquidityRemovalDraftInput,
  OpenBookMarketDraftInput
} from "../../types/liquidity";

export interface LiquidityProtocolAdapter {
  readonly name: string;
  createOpenBookMarketDraft(input: OpenBookMarketDraftInput): Promise<LiquidityDraftResult<OpenBookMarketDraftInput>>;
  createLiquidityDraft(input: LiquidityPoolDraftInput): Promise<LiquidityDraftResult<LiquidityPoolDraftInput>>;
  createPoolDraft(input: LiquidityPoolDraftInput): Promise<LiquidityDraftResult<LiquidityPoolDraftInput>>;
  removeLiquidityDraft(input: LiquidityRemovalDraftInput): Promise<LiquidityDraftResult<LiquidityRemovalDraftInput>>;
  burnLiquidityDraft(input: LiquidityBurnDraftInput): Promise<LiquidityDraftResult<LiquidityBurnDraftInput>>;
}


import { OpenBookPlaceholderAdapter } from "./openbook-placeholder-adapter";
import type {
  LiquidityBurnDraftInput,
  LiquidityPoolDraftInput,
  LiquidityRemovalDraftInput,
  OpenBookMarketDraftInput
} from "../../types/liquidity";

const defaultAdapter = new OpenBookPlaceholderAdapter();

export const liquidityService = {
  createOpenBookMarketDraft(input: OpenBookMarketDraftInput) {
    return defaultAdapter.createOpenBookMarketDraft(input);
  },

  createLiquidityDraft(input: LiquidityPoolDraftInput) {
    return defaultAdapter.createLiquidityDraft(input);
  },

  createPoolDraft(input: LiquidityPoolDraftInput) {
    return defaultAdapter.createPoolDraft(input);
  },

  removeLiquidityDraft(input: LiquidityRemovalDraftInput) {
    return defaultAdapter.removeLiquidityDraft(input);
  },

  burnLiquidityDraft(input: LiquidityBurnDraftInput) {
    return defaultAdapter.burnLiquidityDraft(input);
  }
};


import type {
  LiquidityBurnDraftInput,
  LiquidityDraftResult,
  LiquidityPoolDraftInput,
  LiquidityRemovalDraftInput,
  OpenBookMarketDraftInput
} from "../../types/liquidity";
import type { LiquidityProtocolAdapter } from "./liquidity-adapter";

export class OpenBookPlaceholderAdapter implements LiquidityProtocolAdapter {
  readonly name = "openbook-placeholder";

  async createOpenBookMarketDraft(
    input: OpenBookMarketDraftInput
  ): Promise<LiquidityDraftResult<OpenBookMarketDraftInput>> {
    return {
      adapter: this.name,
      action: "createOpenBookMarket",
      status: "placeholder",
      message: "OpenBook market creation is modeled, but on-chain submission is not connected yet.",
      input,
      nextSteps: [
        "Select a concrete OpenBook/Serum-compatible SDK.",
        "Map lot size and tick size to protocol-specific instructions.",
        "Add wallet-adapter signing flow for market initialization."
      ]
    };
  }

  async createLiquidityDraft(
    input: LiquidityPoolDraftInput
  ): Promise<LiquidityDraftResult<LiquidityPoolDraftInput>> {
    return {
      adapter: this.name,
      action: "createLiquidity",
      status: "placeholder",
      message: "Initial liquidity drafting is ready for teaching, but pool deposit instructions are not connected yet.",
      input,
      nextSteps: [
        "Choose AMM protocol adapter.",
        "Translate desired base/quote amounts to token account prep instructions.",
        "Assemble protocol deposit transaction."
      ]
    };
  }

  async createPoolDraft(
    input: LiquidityPoolDraftInput
  ): Promise<LiquidityDraftResult<LiquidityPoolDraftInput>> {
    return {
      adapter: this.name,
      action: "createPool",
      status: "placeholder",
      message: "Pool creation parameters are captured, but protocol-specific initialization is deferred.",
      input,
      nextSteps: [
        "Choose target pool protocol.",
        "Define PDA/account layout and initialization flow.",
        "Connect wallet signing and transaction dispatch."
      ]
    };
  }

  async removeLiquidityDraft(
    input: LiquidityRemovalDraftInput
  ): Promise<LiquidityDraftResult<LiquidityRemovalDraftInput>> {
    return {
      adapter: this.name,
      action: "removeLiquidity",
      status: "placeholder",
      message: "Liquidity removal is modeled as a draft only. Burn/redeem routing is not connected yet.",
      input,
      nextSteps: [
        "Resolve target AMM adapter.",
        "Fetch pool state and quote expected outputs.",
        "Build withdraw transaction using LP amount."
      ]
    };
  }

  async burnLiquidityDraft(
    input: LiquidityBurnDraftInput
  ): Promise<LiquidityDraftResult<LiquidityBurnDraftInput>> {
    return {
      adapter: this.name,
      action: "burnLiquidity",
      status: "placeholder",
      message: "LP burn flow is staged as a teaching draft and does not submit any on-chain instruction yet.",
      input,
      nextSteps: [
        "Resolve LP token mint authority and burn authority path.",
        "Confirm whether burn should be direct or part of remove-liquidity flow.",
        "Connect token burn instruction and wallet signing."
      ]
    };
  }
}


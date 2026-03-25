import { useMemo, useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient, useSuiClientContext } from "@mysten/dapp-kit";

import { AccountSummary } from "../../../components/sui/account-summary";
import { TaskLogPanel, type TaskLog } from "../../../components/logs/task-log-panel";
import { useUi } from "../../../components/ui/ui-context";
import { createSuiClient } from "../../../lib/sui/client";
import {
  createPoolWithKeypair,
  createPoolWithWallet,
  fetchCoinMetadata,
  quoteCreatePoolCounterAmount
} from "../../../lib/sui/cetus";
import { CETUS_USDC_COIN_TYPE, SUI_COIN_TYPE } from "../../../lib/sui/constants";
import { walletFromPrivateKey } from "../../../lib/sui/wallet";
import { createWalletExecutor } from "../../../lib/sui/wallet-executor";
import { makeLogId } from "../../../lib/utils/format";

export function LiquidityCreateRoutePage() {
  const { locale, text } = useUi();
  const [mode, setMode] = useState<"wallet" | "private">("wallet");
  const [privateKey, setPrivateKey] = useState("");
  const [tokenA, setTokenA] = useState(SUI_COIN_TYPE);
  const [tokenB, setTokenB] = useState(CETUS_USDC_COIN_TYPE);
  const [initialPrice, setInitialPrice] = useState("1");
  const [tokenAAmount, setTokenAAmount] = useState("1");
  const [tickSpacing, setTickSpacing] = useState("60");
  const [quote, setQuote] = useState("");
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { network } = useSuiClientContext();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const isSupportedNetwork = network === "mainnet";

  const walletExecutor = useMemo(() => createWalletExecutor(signAndExecute), [signAndExecute]);

  function appendLog(status: TaskLog["status"], message: string) {
    setLogs((current) => [{ id: makeLogId(), status, message }, ...current]);
  }

  async function loadQuote() {
    setError("");
    if (!isSupportedNetwork) {
      setError(locale === "zh-CN" ? "创建流动性案例当前仅支持 mainnet。" : "Create liquidity currently supports mainnet only.");
      return;
    }
    try {
      const [metaA, metaB] = await Promise.all([
        fetchCoinMetadata(client, tokenA),
        fetchCoinMetadata(client, tokenB)
      ]);
      const nextQuote = quoteCreatePoolCounterAmount({
        client: createSuiClient(),
        tokenA: metaA,
        tokenB: metaB,
        initialPrice,
        tickSpacing: Number(tickSpacing),
        tokenAAmount,
        slippage: 0.005
      });
      setQuote(nextQuote.tokenBAmountHuman);
      appendLog("info", `Estimated counter token amount: ${nextQuote.tokenBAmountHuman}`);
    } catch (quoteError) {
      const message = quoteError instanceof Error ? quoteError.message : "Failed to estimate pool amounts.";
      setError(message);
      appendLog("error", message);
    }
  }

  async function handleCreate() {
    setError("");
    if (!isSupportedNetwork) {
      setError(locale === "zh-CN" ? "创建流动性案例当前仅支持 mainnet。" : "Create liquidity currently supports mainnet only.");
      return;
    }
    setIsSubmitting(true);
    try {
      const [metaA, metaB] = await Promise.all([
        fetchCoinMetadata(client, tokenA),
        fetchCoinMetadata(client, tokenB)
      ]);
      const params = {
        client: createSuiClient(),
        tokenA: metaA,
        tokenB: metaB,
        initialPrice,
        tickSpacing: Number(tickSpacing),
        tokenAAmount,
        slippage: 0.005
      };
      const result =
        mode === "wallet"
          ? await createPoolWithWallet(account?.address ?? "", walletExecutor, params)
          : await createPoolWithKeypair(client, walletFromPrivateKey(privateKey).keypair, params);
      appendLog("success", `Pool creation submitted: ${result.digest}`);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Failed to create liquidity pool.";
      setError(message);
      appendLog("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="workspace-grid">
      <section className="content-card">
        <div className="panel-header">
          <h3>{locale === "zh-CN" ? "创建流动性" : "Create Liquidity"}</h3>
          <span>Cetus CLMM</span>
        </div>
        <div className="segmented">
          <button className={mode === "wallet" ? "active" : ""} onClick={() => setMode("wallet")} type="button">
            {text.common.walletMode}
          </button>
          <button className={mode === "private" ? "active" : ""} onClick={() => setMode("private")} type="button">
            {text.common.privateMode}
          </button>
        </div>
        {!isSupportedNetwork ? (
          <div className="status-banner info">
            {locale === "zh-CN"
              ? "Cetus 创建流动性当前只保留主网可执行路径。切到 testnet / devnet / localnet 时，这个页面只做展示。"
              : "Cetus liquidity creation keeps a mainnet-only executable path for now. On testnet / devnet / localnet this page is display-only."}
          </div>
        ) : null}
        {mode === "private" ? (
          <label className="field-stack">
            <span>{text.common.privateKey}</span>
            <textarea value={privateKey} onChange={(event) => setPrivateKey(event.target.value)} />
          </label>
        ) : null}
        <div className="form-grid two-columns">
          <label className="field-stack">
            <span>Base Coin Type</span>
            <input value={tokenA} onChange={(event) => setTokenA(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>Quote Coin Type</span>
            <input value={tokenB} onChange={(event) => setTokenB(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>Initial Price</span>
            <input value={initialPrice} onChange={(event) => setInitialPrice(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>Token A Amount</span>
            <input value={tokenAAmount} onChange={(event) => setTokenAAmount(event.target.value)} />
          </label>
        </div>
        <label className="field-stack">
          <span>Tick Spacing / Fee Tier</span>
          <select value={tickSpacing} onChange={(event) => setTickSpacing(event.target.value)}>
            {["2", "20", "60", "80", "100", "200"].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <div className="button-row">
          <button className="ghost-button" onClick={() => void loadQuote()} type="button">
            {locale === "zh-CN" ? "估算对手侧数量" : "Estimate Counter Amount"}
          </button>
          <button
            className="primary-button"
            disabled={!isSupportedNetwork || isSubmitting || (mode === "wallet" && !account)}
            onClick={() => void handleCreate()}
            type="button"
          >
            {isSubmitting ? "Creating..." : locale === "zh-CN" ? "创建池子并入池" : "Create Pool And Seed"}
          </button>
        </div>
        {quote ? <div className="status-banner info">{locale === "zh-CN" ? "预计需要 Token B:" : "Estimated Token B required:"} {quote}</div> : null}
        {error ? <div className="status-banner error">{error}</div> : null}
      </section>
      <div className="page-stack">
        <AccountSummary description={locale === "zh-CN" ? "创建流动性页直接按 sui_dev_cp 的 Cetus SDK 流程做了轻量重组。" : "This page is a lightweight rebuild of the Cetus SDK flow from sui_dev_cp for pool creation."} />
        <TaskLogPanel logs={logs} title={locale === "zh-CN" ? "创建流动性日志" : "Create Liquidity Logs"} />
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient, useSuiClientContext } from "@mysten/dapp-kit";

import { AccountSummary } from "../../../components/sui/account-summary";
import { TaskLogPanel, type TaskLog } from "../../../components/logs/task-log-panel";
import { useUi } from "../../../components/ui/ui-context";
import {
  addLiquidityWithKeypair,
  addLiquidityWithWallet,
  fetchCoinMetadata,
  fetchPoolsByCoinTypes,
  quoteAddLiquidityNeedTokenB
} from "../../../lib/sui/cetus";
import { CETUS_USDC_COIN_TYPE, SUI_COIN_TYPE } from "../../../lib/sui/constants";
import { walletFromPrivateKey } from "../../../lib/sui/wallet";
import { createWalletExecutor } from "../../../lib/sui/wallet-executor";
import { makeLogId } from "../../../lib/utils/format";

export function LiquidityAddRoutePage() {
  const { locale, text } = useUi();
  const [mode, setMode] = useState<"wallet" | "private">("wallet");
  const [privateKey, setPrivateKey] = useState("");
  const [tokenA, setTokenA] = useState(SUI_COIN_TYPE);
  const [tokenB, setTokenB] = useState(CETUS_USDC_COIN_TYPE);
  const [amountA, setAmountA] = useState("1");
  const [tickSpacing, setTickSpacing] = useState("60");
  const [pool, setPool] = useState<any>(null);
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

  async function queryPoolAndQuote() {
    setError("");
    if (!isSupportedNetwork) {
      setError(locale === "zh-CN" ? "添加流动性案例当前仅支持 mainnet。" : "Add liquidity currently supports mainnet only.");
      return;
    }
    try {
      const [metaA, metaB] = await Promise.all([
        fetchCoinMetadata(client, tokenA),
        fetchCoinMetadata(client, tokenB)
      ]);
      const pools = await fetchPoolsByCoinTypes([metaA.coinType, metaB.coinType]);
      const match = pools.find((item: any) => String(item.tickSpacing ?? item.tick_spacing) === tickSpacing) ?? pools[0];
      if (!match) {
        throw new Error(locale === "zh-CN" ? "当前币对没有查到可用的 Cetus 池子。" : "No available Cetus pool was found for the current pair.");
      }
      setPool(match);
      const nextQuote = quoteAddLiquidityNeedTokenB({
        pool: match,
        tokenA: metaA,
        tokenB: metaB,
        tokenAAmountHuman: amountA,
        rangePct: 0.1,
        slippage: 0.005
      });
      setQuote(nextQuote.tokenBAmountHuman);
      appendLog("info", `Pool found: ${match.id}`);
    } catch (poolError) {
      const message = poolError instanceof Error ? poolError.message : "Failed to query pool data.";
      setError(message);
      appendLog("error", message);
    }
  }

  async function handleAdd() {
    if (!isSupportedNetwork) {
      setError(locale === "zh-CN" ? "添加流动性案例当前仅支持 mainnet。" : "Add liquidity currently supports mainnet only.");
      return;
    }
    if (!pool) {
      setError(locale === "zh-CN" ? "请先查询池子并估算数量。" : "Query the pool and estimate amounts first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const [metaA, metaB] = await Promise.all([
        fetchCoinMetadata(client, tokenA),
        fetchCoinMetadata(client, tokenB)
      ]);
      const params = {
        pool,
        tokenA: metaA,
        tokenB: metaB,
        tokenAAmountHuman: amountA,
        rangePct: 0.1,
        slippage: 0.005
      };
      const result =
        mode === "wallet"
          ? await addLiquidityWithWallet(account?.address ?? "", walletExecutor, params)
          : await addLiquidityWithKeypair(client, walletFromPrivateKey(privateKey).keypair, params);
      appendLog("success", `Add liquidity submitted: ${result.digest}`);
    } catch (addError) {
      const message = addError instanceof Error ? addError.message : "Failed to add liquidity.";
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
          <h3>{locale === "zh-CN" ? "添加流动性" : "Add Liquidity"}</h3>
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
              ? "Cetus 添加流动性当前只保留主网可执行路径。切到 testnet / devnet / localnet 时，这个页面只做展示。"
              : "Cetus add-liquidity keeps a mainnet-only executable path for now. On testnet / devnet / localnet this page is display-only."}
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
            <span>Token A</span>
            <input value={tokenA} onChange={(event) => setTokenA(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>Token B</span>
            <input value={tokenB} onChange={(event) => setTokenB(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>Token A Amount</span>
            <input value={amountA} onChange={(event) => setAmountA(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>Tick Spacing</span>
            <select value={tickSpacing} onChange={(event) => setTickSpacing(event.target.value)}>
              {["2", "20", "60", "80", "100", "200"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="button-row">
          <button className="ghost-button" onClick={() => void queryPoolAndQuote()} type="button">
            {locale === "zh-CN" ? "查询池子并估算" : "Query Pool And Estimate"}
          </button>
          <button
            className="primary-button"
            disabled={!isSupportedNetwork || isSubmitting || (mode === "wallet" && !account)}
            onClick={() => void handleAdd()}
            type="button"
          >
            {isSubmitting ? "Adding..." : locale === "zh-CN" ? "添加流动性" : "Add Liquidity"}
          </button>
        </div>
        {pool ? <div className="status-banner info">Pool ID: {pool.id}</div> : null}
        {quote ? <div className="status-banner info">{locale === "zh-CN" ? "预计需要 Token B:" : "Estimated Token B required:"} {quote}</div> : null}
        {error ? <div className="status-banner error">{error}</div> : null}
      </section>
      <div className="page-stack">
        <AccountSummary description={locale === "zh-CN" ? "添加流动性页会先根据两种 coinType 查询 Cetus 池子，再生成区间头寸 payload。" : "The add-liquidity page first queries a Cetus pool by the two coin types, then prepares a ranged position payload."} />
        <TaskLogPanel logs={logs} title={locale === "zh-CN" ? "添加流动性日志" : "Add Liquidity Logs"} />
      </div>
    </div>
  );
}

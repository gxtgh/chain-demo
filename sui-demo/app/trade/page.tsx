import { useMemo, useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient, useSuiClientContext } from "@mysten/dapp-kit";

import { PageHeader } from "../../components/page/page-header";
import { AccountSummary } from "../../components/sui/account-summary";
import { TaskLogPanel, type TaskLog } from "../../components/logs/task-log-panel";
import { useUi } from "../../components/ui/ui-context";
import { fetchCoinMetadata, quoteTrade, swapWithKeypair, swapWithWallet } from "../../lib/sui/cetus";
import {
  CETUS_COIN_TYPE,
  CETUS_USDC_COIN_TYPE,
  SUI_COIN_TYPE
} from "../../lib/sui/constants";
import { walletFromPrivateKey } from "../../lib/sui/wallet";
import { createWalletExecutor } from "../../lib/sui/wallet-executor";
import { formatHumanUnits, makeLogId, toMist } from "../../lib/utils/format";

export function TradeRoutePage() {
  const { locale, text } = useUi();
  const [mode, setMode] = useState<"wallet" | "private">("wallet");
  const [privateKey, setPrivateKey] = useState("");
  const [fromCoin, setFromCoin] = useState(SUI_COIN_TYPE);
  const [toCoin, setToCoin] = useState(CETUS_USDC_COIN_TYPE);
  const [amount, setAmount] = useState("0.1");
  const [slippage, setSlippage] = useState("1");
  const [quoteText, setQuoteText] = useState("");
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { network } = useSuiClientContext();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const walletExecutor = useMemo(() => createWalletExecutor(signAndExecute), [signAndExecute]);
  const isSupportedNetwork = network === "mainnet";

  function appendLog(status: TaskLog["status"], message: string) {
    setLogs((current) => [{ id: makeLogId(), status, message }, ...current]);
  }

  async function handleQuote() {
    setError("");
    if (!isSupportedNetwork) {
      setError(locale === "zh-CN" ? "交易案例当前仅支持 mainnet。" : "Trade currently supports mainnet only.");
      return;
    }
    try {
      const [fromMeta, toMeta] = await Promise.all([
        fetchCoinMetadata(client, fromCoin),
        fetchCoinMetadata(client, toCoin)
      ]);
      const route = await quoteTrade({
        fromCoinType: fromCoin,
        toCoinType: toCoin,
        amountAtomic: toMist(amount, fromMeta.decimals)
      });
      if (!route?.quoteID) {
        throw new Error(locale === "zh-CN" ? "当前交易对没有查到可用路由。" : "No available route was found for the current trading pair.");
      }
      setQuoteText(
        `${amount} ${fromMeta.symbol} ≈ ${formatHumanUnits(route.amountOut.toString(), toMeta.decimals)} ${toMeta.symbol}`
      );
      appendLog("info", "Quote fetched from Cetus aggregator.");
    } catch (quoteError) {
      const message = quoteError instanceof Error ? quoteError.message : "Quote failed.";
      setError(message);
      appendLog("error", message);
    }
  }

  async function handleTrade() {
    setError("");
    if (!isSupportedNetwork) {
      setError(locale === "zh-CN" ? "交易案例当前仅支持 mainnet。" : "Trade currently supports mainnet only.");
      return;
    }
    setIsSubmitting(true);

    try {
      const fromMeta = await fetchCoinMetadata(client, fromCoin);
      const params = {
        fromCoinType: fromCoin,
        toCoinType: toCoin,
        amountAtomic: toMist(amount, fromMeta.decimals),
        slippagePercent: Number(slippage)
      };
      const result =
        mode === "wallet"
          ? await swapWithWallet(walletExecutor, {
              owner: account?.address ?? "",
              ...params
            })
          : await swapWithKeypair(client, walletFromPrivateKey(privateKey).keypair, params);

      appendLog("success", `Trade submitted: ${result.digest}`);
    } catch (tradeError) {
      const message = tradeError instanceof Error ? tradeError.message : "Trade failed.";
      setError(message);
      appendLog("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Trade"
        title={locale === "zh-CN" ? "交易" : "Trade"}
        description={locale === "zh-CN" ? "这个页面参考了 sui_dev_cp 里的 BatchSwap 核心调用路径，但先收成一个更容易演示的单交易案例。" : "This page follows the core BatchSwap call path from sui_dev_cp, but narrows it into a simpler single-trade demo."}
      />
      <div className="workspace-grid">
        <section className="content-card">
          <div className="panel-header">
            <h3>Sui Trade</h3>
            <span>Cetus Aggregator</span>
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
                ? "Cetus Aggregator 交易当前只保留主网可执行路径。切到 testnet / devnet / localnet 时，这个页面只做展示。"
                : "Cetus Aggregator trading keeps a mainnet-only executable path for now. On testnet / devnet / localnet this page is display-only."}
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
              <span>From Coin</span>
              <input value={fromCoin} onChange={(event) => setFromCoin(event.target.value)} />
            </label>
            <label className="field-stack">
              <span>To Coin</span>
              <input value={toCoin} onChange={(event) => setToCoin(event.target.value)} />
            </label>
            <label className="field-stack">
              <span>Amount</span>
              <input value={amount} onChange={(event) => setAmount(event.target.value)} />
            </label>
            <label className="field-stack">
              <span>Slippage %</span>
              <input value={slippage} onChange={(event) => setSlippage(event.target.value)} />
            </label>
          </div>
          <div className="button-row">
            <button className="ghost-button" type="button" onClick={() => void handleQuote()}>
              {locale === "zh-CN" ? "获取报价" : "Get Quote"}
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => setToCoin((current) => (current === CETUS_USDC_COIN_TYPE ? CETUS_COIN_TYPE : CETUS_USDC_COIN_TYPE))}
            >
              {locale === "zh-CN" ? "切换目标预设" : "Toggle Target Preset"}
            </button>
            <button
              className="primary-button"
              type="button"
              disabled={!isSupportedNetwork || isSubmitting || (mode === "wallet" && !account)}
              onClick={() => void handleTrade()}
            >
              {isSubmitting ? "Trading..." : locale === "zh-CN" ? "执行交易" : "Run Trade"}
            </button>
          </div>
          {quoteText ? <div className="status-banner info">{quoteText}</div> : null}
          {error ? <div className="status-banner error">{error}</div> : null}
        </section>
        <div className="page-stack">
          <AccountSummary description={locale === "zh-CN" ? "当前 trade 案例先保留一条可执行链路：获取报价、构建交易、完成签名和广播。" : "The current trade demo keeps one executable path: fetch a quote, build the transaction, sign it, and broadcast it."} />
          <TaskLogPanel logs={logs} title={locale === "zh-CN" ? "交易日志" : "Trade Logs"} />
        </div>
      </div>
    </div>
  );
}

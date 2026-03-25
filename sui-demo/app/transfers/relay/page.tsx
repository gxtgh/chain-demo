import { useMemo, useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { isValidSuiAddress } from "@mysten/sui/utils";

import { AccountSummary } from "../../../components/sui/account-summary";
import { TaskLogPanel, type TaskLog } from "../../../components/logs/task-log-panel";
import { useUi } from "../../../components/ui/ui-context";
import { buildRelayPlan, executeWithKeypair, executeWithWallet } from "../../../lib/sui/transfer";
import { createWalletExecutor } from "../../../lib/sui/wallet-executor";
import { formatSui, makeLogId, toMist } from "../../../lib/utils/format";
import { generateWallets, walletFromPrivateKey } from "../../../lib/sui/wallet";

export function TransferRelayRoutePage() {
  const { locale, text } = useUi();
  const [mode, setMode] = useState<"wallet" | "private">("wallet");
  const [privateKey, setPrivateKey] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.2");
  const [hopCount, setHopCount] = useState("2");
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [relayWallets, setRelayWallets] = useState<ReturnType<typeof generateWallets>>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const walletExecutor = useMemo(() => createWalletExecutor(signAndExecute), [signAndExecute]);

  const previewPlan = useMemo(() => {
    const hops = Math.max(0, Number(hopCount) || 0);
    const placeholders =
      relayWallets.length === hops
        ? relayWallets.map((wallet) => wallet.address)
        : Array.from({ length: hops }, (_, index) => `relay-${index + 1}`);
    return buildRelayPlan(recipient || "0x0", toMist(amount || "0"), placeholders);
  }, [amount, hopCount, recipient, relayWallets]);

  function appendLog(status: TaskLog["status"], message: string) {
    setLogs((current) => [{ id: makeLogId(), status, message }, ...current]);
  }

  async function handleSubmit() {
    setError("");
    const hops = Math.max(0, Number(hopCount) || 0);

    if (!isValidSuiAddress(recipient)) {
      setError(locale === "zh-CN" ? "请输入有效的最终接收地址。" : "Enter a valid final recipient address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedWallets = generateWallets(hops);
      setRelayWallets(generatedWallets);
      const plan = buildRelayPlan(
        recipient,
        toMist(amount),
        generatedWallets.map((wallet) => wallet.address)
      );

      appendLog("info", `Relay plan prepared. Source funding amount: ${formatSui(plan.fundingAmountMist)} SUI`);

      if (generatedWallets.length === 0) {
        if (mode === "wallet") {
          const result = await executeWithWallet(walletExecutor, {
            recipient,
            amountMist: toMist(amount)
          });
          appendLog("success", `Direct relay executed: ${result.digest}`);
        } else {
          const signer = walletFromPrivateKey(privateKey).keypair;
          const result = await executeWithKeypair(client, signer, {
            recipient,
            amountMist: toMist(amount)
          });
          appendLog("success", `Direct relay executed: ${result.digest}`);
        }
        return;
      }

      if (mode === "wallet") {
        const firstDigest = await executeWithWallet(walletExecutor, {
          recipient: generatedWallets[0].address,
          amountMist: plan.fundingAmountMist
        });
        appendLog("success", `Source wallet funded relay #1: ${firstDigest.digest}`);
      } else {
        const sourceSigner = walletFromPrivateKey(privateKey).keypair;
        const firstDigest = await executeWithKeypair(client, sourceSigner, {
          recipient: generatedWallets[0].address,
          amountMist: plan.fundingAmountMist
        });
        appendLog("success", `Source private key funded relay #1: ${firstDigest.digest}`);
      }

      for (let index = 0; index < generatedWallets.length; index += 1) {
        const currentWallet = generatedWallets[index];
        const signer = walletFromPrivateKey(currentWallet.privateKey).keypair;
        const nextRecipient =
          index === generatedWallets.length - 1 ? recipient : generatedWallets[index + 1].address;
        const nextAmount =
          index === generatedWallets.length - 1 ? toMist(amount) : plan.hops[index + 1].amountMist;
        const result = await executeWithKeypair(client, signer, {
          recipient: nextRecipient,
          amountMist: nextAmount
        });
        appendLog("success", `Relay hop ${index + 1} forwarded funds: ${result.digest}`);
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Relay transfer failed.";
      setError(message);
      appendLog("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="workspace-grid">
      <div className="page-stack">
        <section className="content-card">
          <div className="panel-header">
            <h3>{locale === "zh-CN" ? "中转" : "Relay"}</h3>
            <span>Relay chain</span>
          </div>
          <div className="segmented">
            <button className={mode === "wallet" ? "active" : ""} onClick={() => setMode("wallet")} type="button">
              {text.common.walletMode}
            </button>
            <button className={mode === "private" ? "active" : ""} onClick={() => setMode("private")} type="button">
              {text.common.privateMode}
            </button>
          </div>
          {mode === "private" ? (
            <label className="field-stack">
              <span>{text.common.privateKey}</span>
              <textarea value={privateKey} onChange={(event) => setPrivateKey(event.target.value)} />
            </label>
          ) : null}
          <div className="form-grid two-columns">
            <label className="field-stack">
              <span>{locale === "zh-CN" ? "最终接收地址" : "Final Recipient"}</span>
              <input value={recipient} onChange={(event) => setRecipient(event.target.value)} />
            </label>
            <label className="field-stack">
              <span>{locale === "zh-CN" ? "最终到账金额 (SUI)" : "Final Amount (SUI)"}</span>
              <input value={amount} onChange={(event) => setAmount(event.target.value)} />
            </label>
          </div>
          <label className="field-stack">
            <span>{locale === "zh-CN" ? "中转层数" : "Relay Hops"}</span>
            <input value={hopCount} onChange={(event) => setHopCount(event.target.value)} />
          </label>
          <div className="button-row">
            <button
              className="primary-button"
              disabled={isSubmitting || (mode === "wallet" && !account)}
              onClick={handleSubmit}
              type="button"
            >
              {isSubmitting ? "Relaying..." : locale === "zh-CN" ? "执行中转" : "Run Relay"}
            </button>
          </div>
          {error ? <div className="status-banner error">{error}</div> : null}
        </section>

        <section className="panel-card">
          <div className="panel-header">
            <h3>{locale === "zh-CN" ? "中转预览" : "Relay Preview"}</h3>
          </div>
          <div className="summary-grid">
            <div className="summary-item">
              <span>{locale === "zh-CN" ? "源地址准备金额" : "Source Funding"}</span>
              <strong>{formatSui(previewPlan.fundingAmountMist)} SUI</strong>
            </div>
            {previewPlan.hops.map((hop) => (
              <div className="summary-item" key={`${hop.hopIndex}-${hop.recipient}`}>
                <span>{locale === "zh-CN" ? `第 ${hop.hopIndex} 跳` : `Hop ${hop.hopIndex}`}</span>
                <strong>{hop.recipient}</strong>
                <small>{formatSui(hop.amountMist)} SUI</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="page-stack">
        <AccountSummary description={locale === "zh-CN" ? "中转页会在执行时临时生成 relay 钱包，并把需要的下一跳 gas 一起预埋进去。" : "The relay page creates temporary relay wallets during execution and preloads gas needed for the next hop."} />
        <TaskLogPanel logs={logs} title={locale === "zh-CN" ? "中转日志" : "Relay Logs"} />
      </div>
    </div>
  );
}

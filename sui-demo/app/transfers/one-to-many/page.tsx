import { useMemo, useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { isValidSuiAddress } from "@mysten/sui/utils";

import { AccountSummary } from "../../../components/sui/account-summary";
import { TaskLogPanel, type TaskLog } from "../../../components/logs/task-log-panel";
import { useUi } from "../../../components/ui/ui-context";
import { runOneToManyWithKeypair, runOneToManyWithWallet, type TransferTarget } from "../../../lib/sui/transfer";
import { createWalletExecutor } from "../../../lib/sui/wallet-executor";
import { makeLogId, toMist } from "../../../lib/utils/format";
import { parseCsvLikeLine, parseLineItems } from "../../../lib/utils/parse";
import { walletFromPrivateKey } from "../../../lib/sui/wallet";

export function TransferOneToManyRoutePage() {
  const { locale, text } = useUi();
  const [mode, setMode] = useState<"wallet" | "private">("wallet");
  const [privateKey, setPrivateKey] = useState("");
  const [listText, setListText] = useState("");
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const walletExecutor = useMemo(() => createWalletExecutor(signAndExecute), [signAndExecute]);

  function appendLog(status: TaskLog["status"], message: string) {
    setLogs((current) => [{ id: makeLogId(), status, message }, ...current]);
  }

  function parseTargets(): TransferTarget[] {
    return parseLineItems(listText).map((line) => {
      const [recipient, amount] = parseCsvLikeLine(line);
      if (!recipient || !amount) {
        throw new Error(
          locale === "zh-CN" ? "每一行都需要填写 address,amount。" : "Each row must include address,amount."
        );
      }
      if (!isValidSuiAddress(recipient)) {
        throw new Error(locale === "zh-CN" ? `无效地址: ${recipient}` : `Invalid address: ${recipient}`);
      }
      return {
        recipient,
        amountMist: toMist(amount)
      };
    });
  }

  async function handleSubmit() {
    setError("");
    setIsSubmitting(true);

    try {
      const targets = parseTargets();
      appendLog("info", `Parsed ${targets.length} transfer targets.`);

      if (mode === "wallet") {
        await runOneToManyWithWallet(walletExecutor, targets, (digest, index) => {
          appendLog("success", `Transfer ${index + 1}/${targets.length} sent: ${digest}`);
        });
      } else {
        const signer = walletFromPrivateKey(privateKey).keypair;
        await runOneToManyWithKeypair(client, signer, targets, (digest, index) => {
          appendLog("success", `Transfer ${index + 1}/${targets.length} sent: ${digest}`);
        });
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Batch transfer failed.";
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
          <h3>{locale === "zh-CN" ? "一转多" : "One To Many"}</h3>
          <span>SUI only</span>
        </div>
        <p className="muted-text">
          {locale === "zh-CN"
            ? <>每行一条记录，格式为 <code>address,amount</code>，金额单位为 SUI。</>
            : <>One record per line in <code>address,amount</code> format, with amounts in SUI.</>}
        </p>
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
        <label className="field-stack">
          <span>{locale === "zh-CN" ? "接收列表" : "Recipient List"}</span>
          <textarea
            placeholder={"0x...,0.1\n0x...,0.2"}
            value={listText}
            onChange={(event) => setListText(event.target.value)}
          />
        </label>
        <div className="button-row">
          <button
            className="primary-button"
            disabled={isSubmitting || (mode === "wallet" && !account)}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? "Sending..." : locale === "zh-CN" ? "执行一转多" : "Run One To Many"}
          </button>
        </div>
        {error ? <div className="status-banner error">{error}</div> : null}
      </section>

      <div className="page-stack">
        <AccountSummary description={locale === "zh-CN" ? "当前案例页聚焦 SUI 原生币，直接用 splitCoins + transferObjects 完成批量拆分转账。" : "This demo focuses on native SUI and uses splitCoins + transferObjects for batch fan-out transfers."} />
        <TaskLogPanel logs={logs} title={locale === "zh-CN" ? "一转多日志" : "One To Many Logs"} />
      </div>
    </div>
  );
}

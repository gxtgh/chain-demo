import { useState } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { isValidSuiAddress } from "@mysten/sui/utils";

import { AccountSummary } from "../../../components/sui/account-summary";
import { TaskLogPanel, type TaskLog } from "../../../components/logs/task-log-panel";
import { useUi } from "../../../components/ui/ui-context";
import { executeWithKeypair } from "../../../lib/sui/transfer";
import { walletFromPrivateKey } from "../../../lib/sui/wallet";
import { makeLogId, toMist } from "../../../lib/utils/format";
import { parseCsvLikeLine, parseLineItems } from "../../../lib/utils/parse";

export function TransferManyToManyRoutePage() {
  const { locale } = useUi();
  const [rowsText, setRowsText] = useState("");
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const client = useSuiClient();

  function appendLog(status: TaskLog["status"], message: string) {
    setLogs((current) => [{ id: makeLogId(), status, message }, ...current]);
  }

  async function handleSubmit() {
    setError("");
    setIsSubmitting(true);

    try {
      const rows = parseLineItems(rowsText);
      if (!rows.length) {
        throw new Error(
          locale === "zh-CN"
            ? "请先填写私钥、地址和金额列表。"
            : "Enter private key, address, and amount rows first."
        );
      }

      for (let index = 0; index < rows.length; index += 1) {
        const [privateKey, recipient, amount] = parseCsvLikeLine(rows[index]);
        if (!privateKey || !recipient || !amount) {
          throw new Error(
            locale === "zh-CN"
              ? "每一行格式必须是 privateKey,address,amount。"
              : "Each row must follow privateKey,address,amount."
          );
        }
        if (!isValidSuiAddress(recipient)) {
          throw new Error(locale === "zh-CN" ? `无效接收地址: ${recipient}` : `Invalid recipient: ${recipient}`);
        }

        const signer = walletFromPrivateKey(privateKey).keypair;
        const result = await executeWithKeypair(client, signer, {
          recipient,
          amountMist: toMist(amount)
        });
        appendLog("success", `Row ${index + 1}/${rows.length} sent: ${result.digest}`);
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Many-to-many transfer failed.";
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
          <h3>{locale === "zh-CN" ? "多转多" : "Many To Many"}</h3>
          <span>Private-key matrix</span>
        </div>
        <p className="muted-text">
          {locale === "zh-CN"
            ? <>每行一条 <code>privateKey,address,amount</code>，案例页逐条执行。</>
            : <>Run one row at a time in <code>privateKey,address,amount</code> format.</>}
        </p>
        <label className="field-stack">
          <span>{locale === "zh-CN" ? "转账矩阵" : "Transfer Matrix"}</span>
          <textarea
            placeholder={"suiprivkey...,0x...,0.1\nsuiprivkey...,0x...,0.2"}
            value={rowsText}
            onChange={(event) => setRowsText(event.target.value)}
          />
        </label>
        <div className="button-row">
          <button className="primary-button" disabled={isSubmitting} onClick={handleSubmit} type="button">
            {isSubmitting ? "Sending..." : locale === "zh-CN" ? "执行多转多" : "Run Many To Many"}
          </button>
        </div>
        {error ? <div className="status-banner error">{error}</div> : null}
      </section>
      <div className="page-stack">
        <AccountSummary description={locale === "zh-CN" ? "多转多页保留最核心的逐条 signer -> recipient 映射执行，便于继续接任务调度或并发控制。" : "Many-to-many keeps a simple signer-to-recipient mapping flow that is easy to extend with scheduling or concurrency later."} />
        <TaskLogPanel logs={logs} title={locale === "zh-CN" ? "多转多日志" : "Many To Many Logs"} />
      </div>
    </div>
  );
}

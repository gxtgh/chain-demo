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

export function TransferManyToOneRoutePage() {
  const { locale } = useUi();
  const [recipient, setRecipient] = useState("");
  const [defaultAmount, setDefaultAmount] = useState("0.1");
  const [sendersText, setSendersText] = useState("");
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const client = useSuiClient();

  function appendLog(status: TaskLog["status"], message: string) {
    setLogs((current) => [{ id: makeLogId(), status, message }, ...current]);
  }

  async function handleSubmit() {
    setError("");

    if (!isValidSuiAddress(recipient)) {
      setError(locale === "zh-CN" ? "请填写有效的接收地址。" : "Enter a valid recipient address.");
      return;
    }

    const rows = parseLineItems(sendersText);
    if (!rows.length) {
      setError(locale === "zh-CN" ? "请至少填写一个发送私钥。" : "Enter at least one sender private key.");
      return;
    }

    setIsSubmitting(true);
    try {
      for (let index = 0; index < rows.length; index += 1) {
        const [privateKey, amount] = parseCsvLikeLine(rows[index]);
        const signer = walletFromPrivateKey(privateKey).keypair;
        const result = await executeWithKeypair(client, signer, {
          recipient,
          amountMist: toMist(amount || defaultAmount)
        });
        appendLog("success", `Sender ${index + 1}/${rows.length} sent: ${result.digest}`);
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Many-to-one transfer failed.";
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
          <h3>{locale === "zh-CN" ? "多转一" : "Many To One"}</h3>
          <span>Private-key batch</span>
        </div>
        <label className="field-stack">
          <span>{locale === "zh-CN" ? "接收地址" : "Recipient Address"}</span>
          <input value={recipient} onChange={(event) => setRecipient(event.target.value)} />
        </label>
        <label className="field-stack">
          <span>{locale === "zh-CN" ? "默认金额 (SUI)" : "Default Amount (SUI)"}</span>
          <input value={defaultAmount} onChange={(event) => setDefaultAmount(event.target.value)} />
        </label>
        <label className="field-stack">
          <span>{locale === "zh-CN" ? "发送私钥列表" : "Sender Private Keys"}</span>
          <textarea
            placeholder={"suiprivkey...,0.1\nsuiprivkey...,0.2\nsuiprivkey..."}
            value={sendersText}
            onChange={(event) => setSendersText(event.target.value)}
          />
        </label>
        <div className="button-row">
          <button className="primary-button" disabled={isSubmitting} onClick={handleSubmit} type="button">
            {isSubmitting ? "Collecting..." : locale === "zh-CN" ? "执行多转一" : "Run Many To One"}
          </button>
        </div>
        {error ? <div className="status-banner error">{error}</div> : null}
      </section>
      <div className="page-stack">
        <AccountSummary description={locale === "zh-CN" ? "多转一直接按行读取私钥，并对每个 signer 逐条发起 SUI 转账。" : "Many-to-one reads each private key line by line and sends SUI transfers from every signer to one recipient."} />
        <TaskLogPanel logs={logs} title={locale === "zh-CN" ? "多转一日志" : "Many To One Logs"} />
      </div>
    </div>
  );
}

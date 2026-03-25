import { useMemo, useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";

import { AccountSummary } from "../../../components/sui/account-summary";
import { TaskLogPanel, type TaskLog } from "../../../components/logs/task-log-panel";
import { useUi } from "../../../components/ui/ui-context";
import { createStandardTokenWithKeypair, createStandardTokenWithWallet } from "../../../lib/sui/token";
import { createWalletExecutor } from "../../../lib/sui/wallet-executor";
import { makeLogId } from "../../../lib/utils/format";
import { walletFromPrivateKey } from "../../../lib/sui/wallet";

type FormState = {
  name: string;
  symbol: string;
  decimals: string;
  totalSupply: string;
  description: string;
  iconUrl: string;
};

const initialForm: FormState = {
  name: "",
  symbol: "",
  decimals: "9",
  totalSupply: "",
  description: "",
  iconUrl: ""
};

export function StandardTokenRoutePage() {
  const { locale, text } = useUi();
  const [mode, setMode] = useState<"wallet" | "private">("wallet");
  const [privateKey, setPrivateKey] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<null | {
    packageId: string;
    coinType: string;
    publishDigest: string;
    initDigest: string;
  }>(null);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [error, setError] = useState("");
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const walletExecutor = useMemo(() => createWalletExecutor(signAndExecute), [signAndExecute]);

  function appendLog(status: TaskLog["status"], message: string) {
    setLogs((current) => [{ id: makeLogId(), status, message }, ...current]);
  }

  async function handleSubmit() {
    setError("");
    setResult(null);

    if (!form.name || !form.symbol || !form.totalSupply) {
      setError(locale === "zh-CN" ? "请先补齐名称、符号和总量。" : "Fill in name, symbol, and total supply first.");
      return;
    }

    setIsSubmitting(true);
    try {
      appendLog("info", "Starting token template publish flow.");
      const params = {
        name: form.name.trim(),
        symbol: form.symbol.trim().toUpperCase(),
        decimals: Number(form.decimals),
        totalSupply: form.totalSupply.trim(),
        description: form.description.trim(),
        iconUrl: form.iconUrl.trim()
      };

      const nextResult =
        mode === "wallet"
          ? await createStandardTokenWithWallet(
              client,
              account?.address ?? "",
              walletExecutor,
              params
            )
          : await createStandardTokenWithKeypair(
              client,
              walletFromPrivateKey(privateKey).keypair,
              params
            );

      appendLog("success", `Token package published: ${nextResult.packageId}`);
      appendLog("success", `Currency initialized: ${nextResult.coinType}`);
      setResult(nextResult);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Token creation failed.";
      appendLog("error", message);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="workspace-grid">
      <div className="page-stack">
        <section className="content-card">
          <div className="panel-header">
            <h3>{locale === "zh-CN" ? "标准代币" : "Standard Token"}</h3>
            <span>Move template publish</span>
          </div>
          <p className="muted-text">
            {locale === "zh-CN"
              ? <>这里直接沿用了 <code>sui_dev_cp</code> 的模板发布思路，只把表单缩成案例版必需字段。</>
              : <>This page keeps the template publish flow from <code>sui_dev_cp</code> and trims the form down to demo essentials.</>}
          </p>

          <div className="segmented">
            <button
              className={mode === "wallet" ? "active" : ""}
              onClick={() => setMode("wallet")}
              type="button"
            >
              {text.common.walletMode}
            </button>
            <button
              className={mode === "private" ? "active" : ""}
              onClick={() => setMode("private")}
              type="button"
            >
              {text.common.privateMode}
            </button>
          </div>

          {mode === "private" ? (
            <label className="field-stack">
              <span>{text.common.privateKey}</span>
              <textarea
                placeholder="suiprivkey..."
                value={privateKey}
                onChange={(event) => setPrivateKey(event.target.value)}
              />
            </label>
          ) : null}

          <div className="form-grid two-columns">
            <label className="field-stack">
              <span>{locale === "zh-CN" ? "名称" : "Name"}</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="field-stack">
              <span>{locale === "zh-CN" ? "符号" : "Symbol"}</span>
              <input
                value={form.symbol}
                onChange={(event) =>
                  setForm((current) => ({ ...current, symbol: event.target.value.toUpperCase() }))
                }
              />
            </label>
            <label className="field-stack">
              <span>{locale === "zh-CN" ? "总量" : "Total Supply"}</span>
              <input
                value={form.totalSupply}
                onChange={(event) =>
                  setForm((current) => ({ ...current, totalSupply: event.target.value }))
                }
              />
            </label>
            <label className="field-stack">
              <span>{locale === "zh-CN" ? "小数位" : "Decimals"}</span>
              <input
                value={form.decimals}
                onChange={(event) =>
                  setForm((current) => ({ ...current, decimals: event.target.value }))
                }
              />
            </label>
          </div>

          <label className="field-stack">
            <span>{locale === "zh-CN" ? "描述" : "Description"}</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </label>

          <label className="field-stack">
            <span>{locale === "zh-CN" ? "图标 URL" : "Icon URL"}</span>
            <input
              placeholder="https://..."
              value={form.iconUrl}
              onChange={(event) => setForm((current) => ({ ...current, iconUrl: event.target.value }))}
            />
          </label>

          <div className="button-row">
            <button
              className="primary-button"
              disabled={isSubmitting || (mode === "wallet" && !account)}
              onClick={handleSubmit}
              type="button"
            >
              {isSubmitting ? "Publishing..." : locale === "zh-CN" ? "创建标准代币" : "Create Standard Token"}
            </button>
          </div>

          {error ? <div className="status-banner error">{error}</div> : null}
          {result ? (
            <div className="status-banner success">
              {locale === "zh-CN" ? "创建完成，Coin Type:" : "Created successfully, Coin Type:"} <code>{result.coinType}</code>
            </div>
          ) : null}
        </section>

        {result ? (
          <section className="panel-card">
            <div className="panel-header">
              <h3>{locale === "zh-CN" ? "结果摘要" : "Result Summary"}</h3>
            </div>
            <div className="summary-grid">
              <div className="summary-item">
                <span>Package ID</span>
                <strong>{result.packageId}</strong>
              </div>
              <div className="summary-item">
                <span>Coin Type</span>
                <strong>{result.coinType}</strong>
              </div>
              <div className="summary-item">
                <span>Publish Digest</span>
                <strong>{result.publishDigest}</strong>
              </div>
              <div className="summary-item">
                <span>Init Digest</span>
                <strong>{result.initDigest}</strong>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <div className="page-stack">
        <AccountSummary description={locale === "zh-CN" ? "钱包模式会走 dapp-kit 签名；私钥模式则复用本地 signer 直接发起交易。" : "Wallet mode signs through dapp-kit, while private-key mode reuses a local signer to submit transactions directly."} />
        <TaskLogPanel logs={logs} title={locale === "zh-CN" ? "代币日志" : "Token Logs"} />
      </div>
    </div>
  );
}

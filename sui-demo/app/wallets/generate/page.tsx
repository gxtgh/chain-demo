import { useMemo, useState } from "react";

import { CodeBlock } from "../../../components/common/code-block";
import { AccountSummary } from "../../../components/sui/account-summary";
import { useUi } from "../../../components/ui/ui-context";
import { generateWallets, validateWalletCount } from "../../../lib/sui/wallet";
import { downloadCsv, downloadJson } from "../../../lib/utils/download";

export function WalletGenerateRoutePage() {
  const { locale } = useUi();
  const [count, setCount] = useState("10");
  const [wallets, setWallets] = useState<ReturnType<typeof generateWallets>>([]);
  const [error, setError] = useState("");

  const walletPreview = useMemo(
    () =>
      wallets.length
        ? JSON.stringify(wallets.slice(0, 3), null, 2)
        : locale === "zh-CN"
          ? "还没有生成钱包。"
          : "No wallets generated yet.",
    [locale, wallets]
  );

  function handleGenerate() {
    const nextCount = Number(count);
    if (!validateWalletCount(nextCount)) {
      setError(locale === "zh-CN" ? "请输入 1 到 5000 之间的数量。" : "Enter a number between 1 and 5000.");
      return;
    }

    setError("");
    setWallets(generateWallets(nextCount));
  }

  return (
    <div className="workspace-grid">
      <div className="page-stack">
        <section className="content-card">
          <div className="panel-header">
            <h3>{locale === "zh-CN" ? "批量生成钱包" : "Batch Wallet Generation"}</h3>
            <span>Ed25519 only</span>
          </div>
          <p className="muted-text">
            {locale === "zh-CN"
              ? "这里直接复用了 sui_dev_cp 的本地生成思路，所有私钥都只在浏览器本地内存里处理。"
              : "This page reuses the local generation approach from sui_dev_cp, and all private keys stay in browser memory only."}
          </p>
          <div className="inline-form">
            <label className="field-stack">
              <span>{locale === "zh-CN" ? "生成数量" : "Wallet Count"}</span>
              <input value={count} onChange={(event) => setCount(event.target.value)} />
            </label>
            <div className="button-row">
              <button className="ghost-button" type="button" onClick={() => setCount("100")}>
                100
              </button>
              <button className="ghost-button" type="button" onClick={() => setCount("5000")}>
                Max
              </button>
              <button className="primary-button" type="button" onClick={handleGenerate}>
                {locale === "zh-CN" ? "立即生成" : "Generate Now"}
              </button>
            </div>
          </div>
          {error ? <div className="status-banner error">{error}</div> : null}
        </section>

        <section className="content-card">
          <div className="panel-header">
            <h3>{locale === "zh-CN" ? "结果导出" : "Export Results"}</h3>
            <span>{wallets.length} {locale === "zh-CN" ? "wallets" : "wallets"}</span>
          </div>
          <div className="button-row">
            <button
              className="ghost-button"
              disabled={!wallets.length}
              onClick={() => downloadJson("sui-wallets.json", wallets)}
              type="button"
            >
              {locale === "zh-CN" ? "导出 JSON" : "Export JSON"}
            </button>
            <button
              className="ghost-button"
              disabled={!wallets.length}
              onClick={() => downloadCsv("sui-wallets.csv", wallets)}
              type="button"
            >
              {locale === "zh-CN" ? "导出 CSV" : "Export CSV"}
            </button>
          </div>
          <CodeBlock value={walletPreview} />
        </section>
      </div>

      <div className="page-stack">
        <AccountSummary />
        <section className="panel-card">
          <div className="panel-header">
            <h3>{locale === "zh-CN" ? "安全提示" : "Security Notes"}</h3>
          </div>
          <ul className="flat-list">
            <li>{locale === "zh-CN" ? "钱包生成过程完全在本地执行。" : "Wallet generation runs fully on the client side."}</li>
            <li>{locale === "zh-CN" ? "导出的私钥文件需要自己妥善保管。" : "You are responsible for storing exported private-key files securely."}</li>
            <li>{locale === "zh-CN" ? "这版案例没有接入云端存储，也不会自动上传。" : "This demo does not use cloud storage and will not upload files automatically."}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

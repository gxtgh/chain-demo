import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { approvalService } from "../../lib/approval/approval-service";
import { useWalletStore } from "../../store/wallet-store";
import type { StandardAuthorityKind } from "../../types/approval";
import styles from "./approval-shell.module.scss";
import { ApprovalLogsPanel } from "./approval-logs-panel";
import { ApprovalWalletPanel } from "./approval-wallet-panel";
import { useApprovalTaskLogs } from "./use-approval-task-logs";

const authorityOptions: Array<{ value: StandardAuthorityKind; label: string; hint: string }> = [
  { value: "mint-tokens", label: "Mint Authority", hint: "目标地址填写 Mint 地址" },
  { value: "freeze-account", label: "Freeze Authority", hint: "目标地址填写 Mint 地址" },
  { value: "account-owner", label: "Account Owner", hint: "目标地址填写 Token Account 地址" },
  { value: "close-account", label: "Close Authority", hint: "目标地址填写 Token Account 地址" }
];

export function ApprovalClearAuthorityPage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const [authorityType, setAuthorityType] = useState<StandardAuthorityKind>("close-account");
  const [authorityWalletId, setAuthorityWalletId] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useApprovalTaskLogs();

  const authorityWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === authorityWalletId),
    [authorityWalletId, wallets]
  );
  const selectedOption = authorityOptions.find((item) => item.value === authorityType)!;

  function runClear() {
    startTransition(async () => {
      try {
        if (!authorityWallet) {
          throw new Error("Please choose the current authority wallet.");
        }

        const response = await approvalService.setAuthority(
          connection,
          authorityWallet,
          {
            authorityType,
            currentAuthorityAddress: authorityWallet.publicKey,
            targetAddress,
            clearAuthority: true
          },
          appendLog
        );

        setResult(response);
      } catch (error) {
        appendErrorLog(error);
      }
    });
  }

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="操作" value="Clear Authority" />
        <MetaCard label="权限类型" value={selectedOption.label} />
        <MetaCard label="当前签名人" value={authorityWallet ? authorityWallet.label : "未选择"} />
        <MetaCard label="风险" value="通常不可逆" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>清空 Authority</h2>
          <p className={styles.panelDescription}>
            将指定 authority 设为 `null`。很多权限一旦清空，就意味着项目主动放弃这项控制能力。
          </p>

          <div className={styles.panelBody}>
            <div className={styles.warningBox}>
              清空 authority 常常是不可逆动作，尤其是 `Mint Authority` 和 `Freeze Authority`。
            </div>
            <select
              className={styles.select}
              value={authorityType}
              onChange={(event) => setAuthorityType(event.target.value as StandardAuthorityKind)}
            >
              {authorityOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={authorityWalletId}
              onChange={(event) => setAuthorityWalletId(event.target.value)}
            >
              <option value="">选择当前权限钱包</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.label} · {wallet.publicKey.slice(0, 8)}...
                </option>
              ))}
            </select>
            <input
              className={styles.input}
              placeholder={selectedOption.hint}
              value={targetAddress}
              onChange={(event) => setTargetAddress(event.target.value.trim())}
            />
            <div className={styles.buttonRow}>
              <button
                className={styles.button}
                disabled={isPending || !authorityWallet || !targetAddress}
                onClick={runClear}
              >
                {isPending ? "处理中..." : "执行清空权限"}
              </button>
            </div>
            {result ? (
              <div className={styles.resultBox}>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            ) : (
              <div className={styles.empty}>还没有清空权限结果。</div>
            )}
          </div>
        </article>

        <ApprovalLogsPanel logs={logs} />
      </div>

      <ApprovalWalletPanel />
    </section>
  );
}

function MetaCard(props: { label: string; value: string }) {
  return (
    <div className={styles.metaCard}>
      <div className={styles.metaLabel}>{props.label}</div>
      <div className={styles.metaValue}>{props.value}</div>
    </div>
  );
}

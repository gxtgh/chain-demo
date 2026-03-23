import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { approvalService } from "../../lib/approval/approval-service";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./approval-shell.module.scss";
import { ApprovalLogsPanel } from "./approval-logs-panel";
import { ApprovalWalletPanel } from "./approval-wallet-panel";
import { useApprovalTaskLogs } from "./use-approval-task-logs";

export function ApprovalDelegatePage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const [ownerWalletId, setOwnerWalletId] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [delegateAddress, setDelegateAddress] = useState("");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useApprovalTaskLogs();

  const ownerWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === ownerWalletId),
    [ownerWalletId, wallets]
  );

  function runApproval() {
    startTransition(async () => {
      try {
        if (!ownerWallet) {
          throw new Error("Please choose an owner wallet.");
        }

        const response = await approvalService.approveDelegate(
          connection,
          ownerWallet,
          {
            ownerAddress: ownerWallet.publicKey,
            delegateAddress,
            mintAddress,
            amount
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
        <MetaCard label="本地钱包数" value={String(wallets.length)} />
        <MetaCard label="所有者" value={ownerWallet ? ownerWallet.label : "未选择"} />
        <MetaCard label="授权额度" value={amount} />
        <MetaCard label="模式" value="Approve Delegate" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>授权 Delegate</h2>
          <p className={styles.panelDescription}>
            为指定 mint 的 token account 设置 delegate，并授予一个可花费额度。这里默认使用 owner 的 ATA 作为目标 token account。
          </p>

          <div className={styles.panelBody}>
            <select
              className={styles.select}
              value={ownerWalletId}
              onChange={(event) => setOwnerWalletId(event.target.value)}
            >
              <option value="">选择 token 所有者钱包</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.label} · {wallet.publicKey.slice(0, 8)}...
                </option>
              ))}
            </select>
            <input
              className={styles.input}
              placeholder="Token Mint 地址"
              value={mintAddress}
              onChange={(event) => setMintAddress(event.target.value.trim())}
            />
            <input
              className={styles.input}
              placeholder="Delegate 地址"
              value={delegateAddress}
              onChange={(event) => setDelegateAddress(event.target.value.trim())}
            />
            <input
              className={styles.input}
              placeholder="授权数量，例如 12.5"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <div className={styles.buttonRow}>
              <button
                className={styles.button}
                disabled={isPending || !ownerWallet || !mintAddress || !delegateAddress || !amount}
                onClick={runApproval}
              >
                {isPending ? "处理中..." : "执行授权"}
              </button>
            </div>
            {result ? (
              <div className={styles.resultBox}>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            ) : (
              <div className={styles.empty}>还没有授权结果。</div>
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

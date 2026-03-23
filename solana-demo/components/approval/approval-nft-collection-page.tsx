import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { nftApprovalService } from "../../lib/approval/nft-approval-service";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./approval-shell.module.scss";
import { ApprovalLogsPanel } from "./approval-logs-panel";
import { ApprovalWalletPanel } from "./approval-wallet-panel";
import { useApprovalTaskLogs } from "./use-approval-task-logs";

export function ApprovalNftCollectionPage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const [authorityWalletId, setAuthorityWalletId] = useState("");
  const [collectionMintAddress, setCollectionMintAddress] = useState("");
  const [delegateAddress, setDelegateAddress] = useState("");
  const [mode, setMode] = useState<"approve" | "revoke">("approve");
  const [result, setResult] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useApprovalTaskLogs();

  const authorityWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === authorityWalletId),
    [authorityWalletId, wallets]
  );

  function runCollectionAuthority() {
    startTransition(async () => {
      try {
        if (!authorityWallet) {
          throw new Error("Please choose the current collection authority wallet.");
        }

        const response =
          mode === "approve"
            ? await nftApprovalService.approveCollectionAuthority(
                connection,
                authorityWallet,
                collectionMintAddress,
                delegateAddress,
                appendLog
              )
            : await nftApprovalService.revokeCollectionAuthority(
                connection,
                authorityWallet,
                collectionMintAddress,
                delegateAddress,
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
      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Collection Authority</h2>
          <p className={styles.panelDescription}>批准或撤销 collection authority，适用于集合 NFT 的管理授权。</p>
          <div className={styles.panelBody}>
            <select className={styles.select} value={mode} onChange={(event) => setMode(event.target.value as "approve" | "revoke")}>
              <option value="approve">批准 Collection Authority</option>
              <option value="revoke">撤销 Collection Authority</option>
            </select>
            <select className={styles.select} value={authorityWalletId} onChange={(event) => setAuthorityWalletId(event.target.value)}>
              <option value="">选择当前权限钱包</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.label} · {wallet.publicKey.slice(0, 8)}...
                </option>
              ))}
            </select>
            <input className={styles.input} placeholder="Collection Mint 地址" value={collectionMintAddress} onChange={(event) => setCollectionMintAddress(event.target.value.trim())} />
            <input className={styles.input} placeholder="被授权 / 被撤销的地址" value={delegateAddress} onChange={(event) => setDelegateAddress(event.target.value.trim())} />
            <div className={styles.buttonRow}>
              <button className={styles.button} disabled={isPending || !authorityWallet || !collectionMintAddress || !delegateAddress} onClick={runCollectionAuthority}>
                {isPending ? "处理中..." : mode === "approve" ? "执行批准" : "执行撤销"}
              </button>
            </div>
            {result ? <div className={styles.resultBox}><pre>{JSON.stringify(result, null, 2)}</pre></div> : <div className={styles.empty}>还没有执行结果。</div>}
          </div>
        </article>
        <ApprovalLogsPanel logs={logs} />
      </div>
      <ApprovalWalletPanel />
    </section>
  );
}

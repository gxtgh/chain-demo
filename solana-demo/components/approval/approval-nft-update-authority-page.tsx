import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { nftApprovalService } from "../../lib/approval/nft-approval-service";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./approval-shell.module.scss";
import { ApprovalLogsPanel } from "./approval-logs-panel";
import { ApprovalWalletPanel } from "./approval-wallet-panel";
import { useApprovalTaskLogs } from "./use-approval-task-logs";

export function ApprovalNftUpdateAuthorityPage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const [authorityWalletId, setAuthorityWalletId] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [newAuthorityAddress, setNewAuthorityAddress] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useApprovalTaskLogs();

  const authorityWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === authorityWalletId),
    [authorityWalletId, wallets]
  );

  function runUpdate() {
    startTransition(async () => {
      try {
        if (!authorityWallet) {
          throw new Error("Please choose the current update authority wallet.");
        }

        const response = await nftApprovalService.updateAuthority(
          connection,
          authorityWallet,
          mintAddress,
          newAuthorityAddress,
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
          <h2 className={styles.panelTitle}>Update Authority</h2>
          <p className={styles.panelDescription}>修改 NFT metadata 的 update authority。这是 NFT 里最核心的权限之一。</p>
          <div className={styles.panelBody}>
            <select className={styles.select} value={authorityWalletId} onChange={(event) => setAuthorityWalletId(event.target.value)}>
              <option value="">选择当前 Update Authority 钱包</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.label} · {wallet.publicKey.slice(0, 8)}...
                </option>
              ))}
            </select>
            <input className={styles.input} placeholder="NFT Mint 地址" value={mintAddress} onChange={(event) => setMintAddress(event.target.value.trim())} />
            <input className={styles.input} placeholder="新的 Update Authority 地址" value={newAuthorityAddress} onChange={(event) => setNewAuthorityAddress(event.target.value.trim())} />
            <div className={styles.buttonRow}>
              <button className={styles.button} disabled={isPending || !authorityWallet || !mintAddress || !newAuthorityAddress} onClick={runUpdate}>
                {isPending ? "处理中..." : "执行 Update Authority 变更"}
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

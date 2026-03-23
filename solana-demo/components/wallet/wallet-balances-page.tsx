import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { walletService } from "../../lib/wallet/wallet-service";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./wallet-shell.module.scss";
import { WalletLogsPanel } from "./wallet-logs-panel";
import { WalletRepositoryPanel } from "./wallet-repository-panel";
import { useWalletTaskLogs } from "./use-wallet-task-logs";
import type { WalletBalanceSnapshot } from "../../types/wallet";

export function WalletBalancesPage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const [balanceInput, setBalanceInput] = useState("");
  const [snapshots, setSnapshots] = useState<WalletBalanceSnapshot[]>([]);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useWalletTaskLogs();

  const selectedWallets = useMemo(
    () => wallets.filter((wallet) => selectedWalletIds.includes(wallet.id)),
    [selectedWalletIds, wallets]
  );

  const selectedAddressesText = useMemo(
    () => selectedWallets.map((wallet) => wallet.publicKey).join("\n"),
    [selectedWallets]
  );

  function runBalanceQuery() {
    startTransition(async () => {
      try {
        const addresses = Array.from(
          new Set(
            [...selectedWallets.map((wallet) => wallet.publicKey), ...balanceInput.split(/\r?\n/)]
              .map((item) => item.trim())
              .filter(Boolean)
          )
        );

        const result = await walletService.queryBalances(connection, addresses, appendLog);
        setSnapshots(result);
      } catch (error) {
        appendErrorLog(error);
      }
    });
  }

  const totalSol = snapshots.reduce((sum, item) => sum + item.sol, 0);
  const totalTokenAccounts = snapshots.reduce((sum, item) => sum + item.tokens.length, 0);

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="选中钱包" value={String(selectedWallets.length)} />
        <MetaCard label="已查询地址" value={String(snapshots.length)} />
        <MetaCard label="SOL 合计" value={totalSol.toFixed(6)} />
        <MetaCard label="Token 账户数" value={String(totalTokenAccounts)} />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>批量余额查询</h2>
          <p className={styles.panelDescription}>
            默认会查询当前选中的钱包，也可以额外粘贴地址列表。资产查询优先走 Solscan，失败时回退 RPC。
          </p>
          <div className={styles.panelBody}>
            <textarea
              className={styles.textarea}
              placeholder="可额外粘贴地址列表，每行一个。"
              value={balanceInput}
              onChange={(event) => setBalanceInput(event.target.value)}
            />
            <div className={styles.buttonRow}>
              <button className={styles.button} disabled={isPending} onClick={runBalanceQuery}>
                查询余额
              </button>
              <button
                className={`${styles.button} ${styles.buttonGhost}`}
                onClick={() => setBalanceInput(selectedAddressesText)}
              >
                填入选中地址
              </button>
            </div>
            {snapshots.length > 0 ? (
              <div className={styles.resultBox}>
                <pre>{JSON.stringify(snapshots, null, 2)}</pre>
              </div>
            ) : (
              <div className={styles.empty}>还没有余额查询结果。</div>
            )}
          </div>
        </article>

        <WalletLogsPanel logs={logs} />
      </div>

      <WalletRepositoryPanel />
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

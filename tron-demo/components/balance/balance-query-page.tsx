import { useMemo, useState, useTransition } from "react";

import { useTronClient } from "../../hooks/use-tron-client";
import { balanceService } from "../../lib/balance/balance-service";
import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import type { WalletBalanceSnapshot } from "../../types/balance";
import styles from "./balance-shell.module.scss";
import { BalanceLogsPanel } from "./balance-logs-panel";
import { useBalanceTaskLogs } from "./use-balance-task-logs";

export function BalanceQueryPage() {
  const tronWeb = useTronClient();
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const networkWallets = useMemo(
    () => wallets.filter((wallet) => wallet.network === network),
    [network, wallets]
  );
  const queryWallets = networkWallets.filter((wallet) => selectedWalletIds.includes(wallet.id));
  const [tokenContractsText, setTokenContractsText] = useState("");
  const [results, setResults] = useState<WalletBalanceSnapshot[]>([]);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useBalanceTaskLogs();

  function runQuery() {
    startTransition(async () => {
      try {
        const tokenContracts = balanceService.parseTokenContracts(tokenContractsText);
        const targetWallets = queryWallets.length ? queryWallets : networkWallets;

        if (!targetWallets.length) {
          throw new Error("当前网络下没有可查询的钱包。");
        }

        appendLog({
          timestamp: new Date().toISOString(),
          level: "info",
          message: `开始查询 ${targetWallets.length} 个钱包的 TRX 和 ${tokenContracts.length} 个 TRC20 合约。`
        });

        const snapshots = await balanceService.queryWalletBalances(
          tronWeb,
          network,
          targetWallets,
          tokenContracts
        );
        setResults(snapshots);
      } catch (error) {
        appendErrorLog(error);
      }
    });
  }

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="当前网络钱包" value={String(networkWallets.length)} />
        <MetaCard label="已选查询钱包" value={String(queryWallets.length)} />
        <MetaCard
          label="TRC20 合约数"
          value={String(balanceService.parseTokenContracts(tokenContractsText).length)}
        />
        <MetaCard label="查询模式" value="批量地址读取" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>批量查询余额</h2>
          <p className={styles.panelDescription}>
            若已选钱包不为空，将优先查询已选钱包。TRC20 合约地址支持逐行或逗号分隔输入。
          </p>

          <div className={styles.panelBody}>
            <textarea
              className={styles.textarea}
              placeholder={"输入 TRC20 合约地址，每行一个，可留空仅查询 TRX\n示例:\nTXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj"}
              value={tokenContractsText}
              onChange={(event) => setTokenContractsText(event.target.value)}
            />
            <div className={styles.buttonRow}>
              <button className={styles.button} disabled={isPending} onClick={runQuery}>
                {isPending ? "查询中..." : "执行查询"}
              </button>
            </div>

            {results.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>地址</th>
                      <th>TRX</th>
                      <th>TRC20 余额</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item) => (
                      <tr key={item.address}>
                        <td className={styles.code}>{item.address}</td>
                        <td>{item.trx}</td>
                        <td>
                          {item.tokens.length ? (
                            <div className={styles.featureList}>
                              {item.tokens.map((token) => (
                                <div key={`${item.address}-${token.contractAddress}`} className={styles.featureItem}>
                                  {token.symbol} ({token.contractAddress}): {token.uiBalance}
                                </div>
                              ))}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.empty}>还没有余额查询结果。</div>
            )}
          </div>
        </article>

        <BalanceLogsPanel logs={logs} />
      </div>
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

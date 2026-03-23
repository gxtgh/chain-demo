import { useMemo } from "react";

import { useWalletStore } from "../../store/wallet-store";
import styles from "./approval-shell.module.scss";

export function ApprovalWalletPanel() {
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const toggleWallet = useWalletStore((state) => state.toggleWallet);
  const toggleAllWallets = useWalletStore((state) => state.toggleAllWallets);

  const selectedCount = selectedWalletIds.length;
  const generatedCount = useMemo(
    () => wallets.filter((wallet) => wallet.origin === "generated").length,
    [wallets]
  );

  return (
    <article className={styles.panel}>
      <h2 className={styles.panelTitle}>本地钱包仓库</h2>
      <p className={styles.panelDescription}>
        授权模块默认使用本地钱包仓库中的钱包作为 token 账户所有者，方便教学时反复试验。
      </p>

      <div className={styles.panelBody}>
        <div className={styles.metaGrid}>
          <MetaCard label="本地钱包数" value={String(wallets.length)} />
          <MetaCard label="当前选中" value={String(selectedCount)} />
          <MetaCard label="生成钱包" value={String(generatedCount)} />
          <MetaCard label="执行模式" value="本地签名" />
        </div>

        <div className={styles.buttonRow}>
          <button className={`${styles.button} ${styles.buttonGhost}`} onClick={toggleAllWallets}>
            全选 / 取消全选
          </button>
        </div>

        {wallets.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>选择</th>
                  <th>标签</th>
                  <th>地址</th>
                  <th>来源</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedWalletIds.includes(wallet.id)}
                        onChange={() => toggleWallet(wallet.id)}
                      />
                    </td>
                    <td>{wallet.label}</td>
                    <td className={styles.code}>{wallet.publicKey}</td>
                    <td>
                      <span className={styles.pill}>{wallet.origin}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.empty}>钱包仓库还是空的，先去钱包模块生成或导入一批钱包。</div>
        )}
      </div>
    </article>
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

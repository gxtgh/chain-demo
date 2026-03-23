import type { ChangeEvent, RefObject } from "react";

import { exportWalletsToCsv, exportWalletsToJson, parseImportedWalletText, triggerTextDownload } from "../../lib/wallet/file-codec";
import { useWalletStore } from "../../store/wallet-store";
import type { BatchTaskLog } from "../../types/task";
import styles from "./wallet-shell.module.scss";

export function WalletRepositoryPanel(props: {
  onLog?: (log: BatchTaskLog) => void;
  fileInputRef?: RefObject<HTMLInputElement | null>;
  compact?: boolean;
}) {
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const addWallets = useWalletStore((state) => state.addWallets);
  const removeWallet = useWalletStore((state) => state.removeWallet);
  const clearWallets = useWalletStore((state) => state.clearWallets);
  const toggleWallet = useWalletStore((state) => state.toggleWallet);
  const toggleAllWallets = useWalletStore((state) => state.toggleAllWallets);

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const kind = file.name.endsWith(".csv") ? "csv" : "json";
      const imported = parseImportedWalletText(text, kind);
      addWallets(imported);
      props.onLog?.({
        timestamp: new Date().toISOString(),
        level: "info",
        message: `Imported ${imported.length} wallets from ${file.name}.`
      });
    } catch (error) {
      props.onLog?.({
        timestamp: new Date().toISOString(),
        level: "error",
        message: error instanceof Error ? error.message : "Failed to import wallets."
      });
    }

    event.target.value = "";
  }

  return (
    <article className={styles.panel}>
      <h2 className={styles.panelTitle}>本地钱包仓库</h2>
      <p className={styles.panelDescription}>
        钱包统一保存在浏览器本地，供各个钱包子页面复用。你可以在这里导入、导出、选择和清理钱包。
      </p>

      <div className={styles.panelBody}>
        <div className={styles.buttonRow}>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={() =>
              triggerTextDownload(
                "solana-wallets.json",
                exportWalletsToJson(wallets),
                "application/json"
              )
            }
          >
            导出 JSON
          </button>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={() =>
              triggerTextDownload("solana-wallets.csv", exportWalletsToCsv(wallets), "text/csv")
            }
          >
            导出 CSV
          </button>
          <button className={`${styles.button} ${styles.buttonGhost}`} onClick={toggleAllWallets}>
            全选 / 取消全选
          </button>
          <button className={`${styles.button} ${styles.buttonAccent}`} onClick={clearWallets}>
            清空钱包
          </button>
          {props.fileInputRef ? (
            <button
              className={`${styles.button} ${styles.buttonGhost}`}
              onClick={() => props.fileInputRef?.current?.click()}
            >
              导入 JSON / CSV
            </button>
          ) : null}
        </div>

        {props.fileInputRef ? (
          <input
            ref={props.fileInputRef}
            hidden
            type="file"
            accept=".json,.csv"
            onChange={handleImportFile}
          />
        ) : null}

        {wallets.length === 0 ? (
          <div className={styles.empty}>还没有本地钱包，先去批量生成或导入一批。</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>选择</th>
                  <th>标签</th>
                  <th>地址</th>
                  <th>来源</th>
                  <th>密钥指纹</th>
                  <th>操作</th>
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
                    <td className={styles.code}>{wallet.encryptedSecretKey.slice(0, 32)}...</td>
                    <td>
                      <button
                        className={`${styles.button} ${styles.buttonGhost}`}
                        onClick={() => removeWallet(wallet.id)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </article>
  );
}


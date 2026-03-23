import { useRef, useTransition } from "react";

import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import { walletService } from "../../lib/wallet/wallet-service";
import type { BatchTaskLog } from "../../types/task";
import styles from "./wallet-shell.module.scss";

export function WalletRepositoryPanel(props: {
  onLog: (log: BatchTaskLog) => void;
}) {
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const addWallets = useWalletStore((state) => state.addWallets);
  const toggleWallet = useWalletStore((state) => state.toggleWallet);
  const toggleAllWallets = useWalletStore((state) => state.toggleAllWallets);
  const removeWallet = useWalletStore((state) => state.removeWallet);
  const clearWallets = useWalletStore((state) => state.clearWallets);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    props.onLog({
      timestamp: new Date().toISOString(),
      level: "info",
      message: `已复制${label}`
    });
  }

  function triggerImport() {
    fileInputRef.current?.click();
  }

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    startTransition(async () => {
      try {
        const content = await file.text();
        const importedWallets = await walletService.importWallets(content, network);
        addWallets(importedWallets);
        props.onLog({
          timestamp: new Date().toISOString(),
          level: "info",
          message: `已导入 ${importedWallets.length} 个钱包。`
        });
      } catch (error) {
        props.onLog({
          timestamp: new Date().toISOString(),
          level: "error",
          message: error instanceof Error ? error.message : "导入钱包失败。"
        });
      } finally {
        event.target.value = "";
      }
    });
  }

  function exportWallets(scope: "selected" | "all") {
    const targetWallets =
      scope === "selected"
        ? wallets.filter((wallet) => selectedWalletIds.includes(wallet.id))
        : wallets;

    if (!targetWallets.length) {
      return;
    }

    const blob = new Blob([walletService.exportWallets(targetWallets)], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `tron-wallets-${scope}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    props.onLog({
      timestamp: new Date().toISOString(),
      level: "info",
      message: `已导出 ${targetWallets.length} 个钱包。`
    });
  }

  return (
    <article className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>钱包仓库</h2>
          <p className={styles.panelDescription}>
            Tron 钱包以本地私钥形式保存。请只在受控环境中使用，生产资金请结合更安全的密钥管理方式。
          </p>
        </div>
        <div className={styles.buttonRow}>
          <button className={styles.buttonGhost} onClick={toggleAllWallets}>
            {selectedWalletIds.length === wallets.length && wallets.length ? "取消全选" : "全选"}
          </button>
          <button className={styles.buttonGhost} disabled={isPending} onClick={triggerImport}>
            导入 JSON
          </button>
          <button className={styles.buttonGhost} onClick={() => exportWallets("selected")}>
            导出已选
          </button>
          <button className={styles.buttonGhost} onClick={() => exportWallets("all")}>
            导出全部
          </button>
          <button
            className={styles.buttonGhost}
            disabled={!wallets.length}
            onClick={clearWallets}
          >
            清空仓库
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        className={styles.hiddenInput}
        type="file"
        accept=".json,application/json"
        onChange={handleImport}
      />

      {wallets.length ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>选中</th>
                <th>标签</th>
                <th>网络</th>
                <th>地址</th>
                <th>私钥</th>
                <th>创建时间</th>
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
                  <td>
                    <span className={styles.pill}>{wallet.network}</span>
                  </td>
                  <td className={styles.code}>{wallet.addressBase58}</td>
                  <td className={styles.code}>{wallet.privateKey}</td>
                  <td>{new Date(wallet.createdAt).toLocaleString()}</td>
                  <td>
                    <div className={styles.buttonRow}>
                      <button
                        className={styles.buttonGhost}
                        onClick={() => void copyText("地址", wallet.addressBase58)}
                      >
                        复制地址
                      </button>
                      <button
                        className={styles.buttonGhost}
                        onClick={() => void copyText("私钥", wallet.privateKey)}
                      >
                        复制私钥
                      </button>
                      <button
                        className={styles.buttonGhost}
                        onClick={() => removeWallet(wallet.id)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.empty}>本地钱包仓库还是空的，先创建几组 Tron 钱包吧。</div>
      )}
    </article>
  );
}

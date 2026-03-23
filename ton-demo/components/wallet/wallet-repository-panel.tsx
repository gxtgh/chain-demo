import { useMemo, useRef, useState, useTransition } from "react";

import { useTonClient } from "../../hooks/use-ton-client";
import { walletService } from "../../lib/wallet/wallet-service";
import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import type { BatchTaskLog } from "../../types/task";
import type { WalletBalanceSnapshot } from "../../types/wallet";
import styles from "./wallet-shell.module.scss";

export function WalletRepositoryPanel(props: {
  onLog: (log: BatchTaskLog) => void;
}) {
  const client = useTonClient();
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const addWallets = useWalletStore((state) => state.addWallets);
  const toggleWallet = useWalletStore((state) => state.toggleWallet);
  const toggleAllWallets = useWalletStore((state) => state.toggleAllWallets);
  const removeWallet = useWalletStore((state) => state.removeWallet);
  const clearWallets = useWalletStore((state) => state.clearWallets);
  const [balances, setBalances] = useState<Record<string, WalletBalanceSnapshot>>({});
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentNetworkWallets = useMemo(
    () => wallets.filter((wallet) => wallet.network === network),
    [network, wallets]
  );

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    props.onLog({
      timestamp: new Date().toISOString(),
      level: "info",
      message: `已复制${label}`
    });
  }

  function clearAll() {
    clearWallets();
    setBalances({});
    props.onLog({
      timestamp: new Date().toISOString(),
      level: "info",
      message: "已清空本地钱包仓库。"
    });
  }

  function exportWallets(scope: "selected" | "all") {
    const targetWallets =
      scope === "selected"
        ? wallets.filter((wallet) => selectedWalletIds.includes(wallet.id))
        : wallets;

    if (!targetWallets.length) {
      props.onLog({
        timestamp: new Date().toISOString(),
        level: "error",
        message: scope === "selected" ? "没有可导出的已选钱包。" : "钱包仓库为空，无法导出。"
      });
      return;
    }

    const blob = new Blob([walletService.exportWallets(targetWallets)], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ton-wallets-${scope}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    props.onLog({
      timestamp: new Date().toISOString(),
      level: "info",
      message: `已导出 ${targetWallets.length} 个钱包。`
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
          message: error instanceof Error ? error.message : "钱包导入失败。"
        });
      } finally {
        event.target.value = "";
      }
    });
  }

  function queryBalances() {
    const targetWallets = currentNetworkWallets.length
      ? currentNetworkWallets.filter((wallet) => selectedWalletIds.includes(wallet.id))
      : [];
    const walletsToQuery = targetWallets.length ? targetWallets : currentNetworkWallets;

    if (!walletsToQuery.length) {
      props.onLog({
        timestamp: new Date().toISOString(),
        level: "error",
        message: `当前 ${network} 网络下没有可查询余额的钱包。`
      });
      return;
    }

    startTransition(async () => {
      try {
        const snapshots = await walletService.getBalances(client, walletsToQuery);
        setBalances((current) => {
          const next = { ...current };

          for (const item of snapshots) {
            next[item.address] = item;
          }

          return next;
        });
        props.onLog({
          timestamp: new Date().toISOString(),
          level: "info",
          message: `已完成 ${snapshots.length} 个钱包的余额查询。`
        });
      } catch (error) {
        props.onLog({
          timestamp: new Date().toISOString(),
          level: "error",
          message: error instanceof Error ? error.message : "余额查询失败。"
        });
      }
    });
  }

  return (
    <article className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>钱包仓库</h2>
          <p className={styles.panelDescription}>
            当前仓库中的钱包可直接参与批量签名。支持 JSON 导入导出和当前网络余额查询，适合演示或测试环境管理。
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
          <button className={styles.buttonGhost} disabled={isPending} onClick={queryBalances}>
            查询余额
          </button>
          <button
            className={styles.buttonGhost}
            disabled={!wallets.length}
            onClick={clearAll}
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
                <th>余额</th>
                <th>助记词</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet) => {
                const balance = balances[wallet.address];

                return (
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
                    <td className={styles.code}>{wallet.address}</td>
                    <td>{balance ? `${balance.balanceTon} TON` : "-"}</td>
                    <td className={styles.code}>{wallet.mnemonic.join(" ")}</td>
                    <td>{new Date(wallet.createdAt).toLocaleString()}</td>
                    <td>
                      <div className={styles.buttonRow}>
                        <button
                          className={styles.buttonGhost}
                          disabled={isPending}
                          onClick={() => void copyText("地址", wallet.address)}
                        >
                          复制地址
                        </button>
                        <button
                          className={styles.buttonGhost}
                          disabled={isPending}
                          onClick={() => void copyText("助记词", wallet.mnemonic.join(" "))}
                        >
                          复制助记词
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
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.empty}>本地钱包仓库还是空的，先创建几组 TON 钱包吧。</div>
      )}
    </article>
  );
}

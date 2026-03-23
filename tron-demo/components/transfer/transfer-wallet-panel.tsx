import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./transfer-shell.module.scss";

export function TransferWalletPanel() {
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const selectedWallets = wallets.filter(
    (wallet) => selectedWalletIds.includes(wallet.id) && wallet.network === network
  );

  return (
    <article className={styles.panel}>
      <h2 className={styles.panelTitle}>可用签名钱包</h2>
      <p className={styles.panelDescription}>
        当前仅展示 {network} 网络下已选中的钱包。转账任务会从这里查找源地址对应的本地私钥。
      </p>

      {selectedWallets.length ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>标签</th>
                <th>地址</th>
                <th>公钥</th>
              </tr>
            </thead>
            <tbody>
              {selectedWallets.map((wallet) => (
                <tr key={wallet.id}>
                  <td>{wallet.label}</td>
                  <td className={styles.code}>{wallet.addressBase58}</td>
                  <td className={styles.code}>{wallet.publicKey}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.empty}>当前网络下没有选中的钱包。</div>
      )}
    </article>
  );
}

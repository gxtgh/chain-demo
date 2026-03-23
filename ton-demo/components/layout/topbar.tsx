import { tonNetworks } from "../../lib/ton/constants";
import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import { NetworkSwitcher } from "../network/network-switcher";
import { RpcEndpointBadge } from "../network/rpc-endpoint-badge";
import styles from "./topbar.module.scss";

export function Topbar() {
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);
  const networkMeta = tonNetworks.find((item) => item.id === network);

  return (
    <header className={styles.topbar}>
      <div>
        <p className={styles.eyebrow}>TON Toolkit</p>
        <h2 className={styles.title}>本地钱包 + 批量转账演示台</h2>
        <p className={styles.subtitle}>
          当前网络: {networkMeta?.label}，已加载 {wallets.length} 个钱包，选中 {selectedWalletIds.length} 个。
        </p>
      </div>

      <div className={styles.actions}>
        <RpcEndpointBadge />
        <NetworkSwitcher />
      </div>
    </header>
  );
}

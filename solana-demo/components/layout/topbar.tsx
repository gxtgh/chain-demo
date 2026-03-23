import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { NetworkSwitcher } from "../network/network-switcher";
import { RpcEndpointBadge } from "../network/rpc-endpoint-badge";
import styles from "./topbar.module.scss";

export function Topbar() {
  return (
    <header className={styles.topbar}>
      <div>
        <p className={styles.eyebrow}>Phase 1</p>
        <h2 className={styles.title}>项目骨架与基础设施</h2>
      </div>

      <div className={styles.actions}>
        <RpcEndpointBadge />
        <NetworkSwitcher />
        <WalletMultiButton />
      </div>
    </header>
  );
}

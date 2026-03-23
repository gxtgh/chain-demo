import { tronNetworks } from "../../lib/tron/constants";
import { useNetworkStore } from "../../store/network-store";
import styles from "./network.module.scss";

export function RpcEndpointBadge() {
  const network = useNetworkStore((state) => state.network);
  const networkMeta = tronNetworks.find((item) => item.id === network);

  return (
    <div className={styles.badge}>
      <span className={styles.label}>Full Host</span>
      <strong>{networkMeta?.fullHost}</strong>
    </div>
  );
}

import { tonNetworks } from "../../lib/ton/constants";
import { useNetworkStore } from "../../store/network-store";
import styles from "./network.module.scss";

export function RpcEndpointBadge() {
  const network = useNetworkStore((state) => state.network);
  const networkMeta = tonNetworks.find((item) => item.id === network);

  return (
    <div className={styles.badge}>
      <span className={styles.label}>RPC</span>
      <strong>{networkMeta?.endpoint}</strong>
    </div>
  );
}

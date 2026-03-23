import { tronNetworks } from "../../lib/tron/constants";
import { useNetworkStore } from "../../store/network-store";
import styles from "./network.module.scss";

export function NetworkSwitcher() {
  const network = useNetworkStore((state) => state.network);
  const setNetwork = useNetworkStore((state) => state.setNetwork);

  return (
    <label className={styles.control}>
      <span className={styles.label}>网络</span>
      <select
        className={styles.select}
        value={network}
        onChange={(event) => setNetwork(event.target.value as typeof network)}
      >
        {tronNetworks.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

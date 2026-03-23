"use client";

import { clusters } from "../../lib/solana/rpc-config";
import { useCluster } from "../../hooks/use-cluster";
import styles from "./network.module.scss";

export function NetworkSwitcher() {
  const { cluster, setCluster } = useCluster();

  return (
    <label className={styles.selectWrap}>
      <span>网络</span>
      <select
        className={styles.select}
        value={cluster}
        onChange={(event) => setCluster(event.target.value)}
      >
        {clusters.map((item) => (
          <option key={item.key} value={item.key}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

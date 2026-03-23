"use client";

import { useCluster } from "../../hooks/use-cluster";
import styles from "./network.module.scss";

export function RpcEndpointBadge() {
  const { endpoint } = useCluster();

  return (
    <div className={styles.badge}>
      RPC: <span className={styles.badgeValue}>{endpoint}</span>
    </div>
  );
}

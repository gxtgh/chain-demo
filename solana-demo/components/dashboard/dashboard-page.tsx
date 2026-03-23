"use client";

import { useWallet } from "@solana/wallet-adapter-react";

import { DashboardHero } from "./dashboard-hero";
import { DashboardPanels } from "./dashboard-panels";
import styles from "./dashboard-page.module.scss";

export function DashboardPage() {
  const wallet = useWallet();

  return (
    <div className={styles.stack}>
      <DashboardHero
        connected={wallet.connected}
        publicKey={wallet.publicKey?.toBase58()}
      />
      <DashboardPanels />
    </div>
  );
}

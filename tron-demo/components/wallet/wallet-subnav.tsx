import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";

import styles from "./wallet-shell.module.scss";

const walletRoutes = [
  { href: "/wallets", label: "概览" },
  { href: "/wallets/generate", label: "批量创建" }
];

export function WalletSubnav() {
  const { pathname } = useLocation();

  return (
    <div className={styles.subnav}>
      {walletRoutes.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={clsx(
            styles.subnavItem,
            pathname === item.href && styles.subnavItemActive
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

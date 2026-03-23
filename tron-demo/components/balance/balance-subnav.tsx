import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";

import styles from "./balance-shell.module.scss";

const routes = [
  { href: "/balances", label: "概览" },
  { href: "/balances/query", label: "批量查询" }
];

export function BalanceSubnav() {
  const { pathname } = useLocation();

  return (
    <div className={styles.subnav}>
      {routes.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={clsx(styles.subnavItem, pathname === item.href && styles.subnavItemActive)}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";

import styles from "./transfer-shell.module.scss";

const transferRoutes = [
  { href: "/transfers", label: "概览" },
  { href: "/transfers/one-to-many", label: "一转多" },
  { href: "/transfers/many-to-one", label: "多转一" },
  { href: "/transfers/many-to-many", label: "多转多" },
  { href: "/transfers/relay", label: "中转" }
];

export function TransferSubnav() {
  const { pathname } = useLocation();

  return (
    <div className={styles.subnav}>
      {transferRoutes.map((item) => (
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

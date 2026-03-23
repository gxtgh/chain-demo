import clsx from "clsx";
import { NavLink } from "react-router-dom";

import styles from "./transfer-shell.module.scss";

const items = [
  { to: "/transfers", label: "总览" },
  { to: "/transfers/one-to-many", label: "一转多" },
  { to: "/transfers/many-to-one", label: "多转一" },
  { to: "/transfers/many-to-many", label: "多转多" },
  { to: "/transfers/relay", label: "中转转账" }
];

export function TransferSubnav() {
  return (
    <nav className={styles.subnav}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/transfers"}
          className={({ isActive }) => clsx(styles.tab, isActive && styles.tabActive)}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}


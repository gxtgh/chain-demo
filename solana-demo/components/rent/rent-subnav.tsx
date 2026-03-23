import clsx from "clsx";
import { NavLink } from "react-router-dom";

import styles from "./rent-shell.module.scss";

const items = [
  { to: "/rent", label: "总览" },
  { to: "/rent/scan", label: "扫描预估" },
  { to: "/rent/recover", label: "批量回收" }
];

export function RentSubnav() {
  return (
    <nav className={styles.subnav}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/rent"}
          className={({ isActive }) => clsx(styles.tab, isActive && styles.tabActive)}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}


import clsx from "clsx";
import { NavLink } from "react-router-dom";

import styles from "./liquidity-shell.module.scss";

const items = [
  { to: "/liquidity", label: "总览" },
  { to: "/liquidity/openbook", label: "OpenBook Id" },
  { to: "/liquidity/create", label: "创建流动性" },
  { to: "/liquidity/pool", label: "创建池子" },
  { to: "/liquidity/remove", label: "移除流动性" },
  { to: "/liquidity/burn", label: "燃烧流动性" }
];

export function LiquiditySubnav() {
  return (
    <nav className={styles.subnav}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/liquidity"}
          className={({ isActive }) => clsx(styles.tab, isActive && styles.tabActive)}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}


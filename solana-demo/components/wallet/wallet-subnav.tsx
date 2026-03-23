import clsx from "clsx";
import { NavLink } from "react-router-dom";

import styles from "./wallet-shell.module.scss";

const items = [
  { to: "/wallets", label: "总览" },
  { to: "/wallets/generate", label: "批量生成" },
  { to: "/wallets/balances", label: "余额查询" },
  { to: "/wallets/vanity", label: "靓号生成" },
  { to: "/wallets/migrate", label: "资产迁移" },
  { to: "/wallets/rent", label: "租金回收" }
];

export function WalletSubnav() {
  return (
    <nav className={styles.subnav}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/wallets"}
          className={({ isActive }) => clsx(styles.tab, isActive && styles.tabActive)}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}


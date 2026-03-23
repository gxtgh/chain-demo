import clsx from "clsx";
import { NavLink } from "react-router-dom";

import styles from "./approval-shell.module.scss";

const items = [
  { to: "/approvals", label: "总览" },
  { to: "/approvals/delegate", label: "授权 Delegate" },
  { to: "/approvals/revoke", label: "取消授权" },
  { to: "/approvals/authority", label: "Set Authority" },
  { to: "/approvals/token-2022", label: "Token-2022" },
  { to: "/approvals/nft", label: "NFT" },
  { to: "/approvals/protocols", label: "协议授权" }
];

export function ApprovalSubnav() {
  return (
    <nav className={styles.subnav}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/approvals"}
          className={({ isActive }) => clsx(styles.tab, isActive && styles.tabActive)}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

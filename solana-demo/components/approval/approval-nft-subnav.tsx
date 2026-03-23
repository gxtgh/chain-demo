import clsx from "clsx";
import { NavLink } from "react-router-dom";

import styles from "./approval-shell.module.scss";

const items = [
  { to: "/approvals/nft", label: "总览" },
  { to: "/approvals/nft/update-authority", label: "Update Authority" },
  { to: "/approvals/nft/collection", label: "Collection Authority" },
  { to: "/approvals/nft/delegate", label: "NFT Delegate" }
];

export function ApprovalNftSubnav() {
  return (
    <nav className={styles.subnav}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/approvals/nft"}
          className={({ isActive }) => clsx(styles.tab, isActive && styles.tabActive)}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

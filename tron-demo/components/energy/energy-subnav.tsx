import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";

import styles from "./energy-shell.module.scss";

const routes = [
  { href: "/energy", label: "概览" },
  { href: "/energy/rental", label: "能量租赁" }
];

export function EnergySubnav() {
  const { pathname } = useLocation();

  return (
    <div className={styles.subnav}>
      {routes.map((item) => (
        <Link key={item.href} to={item.href} className={clsx(styles.subnavItem, pathname === item.href && styles.subnavItemActive)}>
          {item.label}
        </Link>
      ))}
    </div>
  );
}

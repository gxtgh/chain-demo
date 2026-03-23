import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";

import styles from "./sidebar.module.scss";

const navItems = [
  { href: "/", label: "Dashboard", description: "项目概览、网络信息与工具入口" },
  { href: "/wallets", label: "钱包管理", description: "批量创建 TON 钱包并维护本地签名仓库" },
  { href: "/transfers", label: "转账矩阵", description: "一转多、多转一、多转多、中转转账" }
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>TON Demo</p>
        <h1 className={styles.title}>
          TON 链
          <br />
          批量工具案例
        </h1>
        <p className={styles.description}>
          参考 `solana-demo` 的目录结构与壳层布局，保留统一导航与任务面板，把重点放在 TON 钱包创建和批量转账能力。
        </p>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={clsx(
              styles.navCard,
              (item.href === "/"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`)) &&
                styles.navCardActive
            )}
          >
            <p className={styles.navLabel}>{item.label}</p>
            <p className={styles.navDescription}>{item.description}</p>
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.badge}>Local Signer</div>
        <div className={styles.badge}>Testnet First</div>
      </div>
    </aside>
  );
}

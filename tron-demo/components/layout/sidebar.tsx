import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";

import styles from "./sidebar.module.scss";

const navItems = [
  { href: "/", label: "Dashboard", description: "项目概览、网络信息与工具入口" },
  { href: "/wallets", label: "钱包管理", description: "批量创建 Tron 钱包和本地签名仓库" },
  { href: "/balances", label: "余额查询", description: "批量查询 TRX 与其他 TRC20 代币余额" },
  { href: "/transfers", label: "转账矩阵", description: "一对多、多对一、多对多和中转转账" },
  { href: "/energy", label: "能量租赁", description: "Stake 2.0 冻结、委托、回收与解冻流程" }
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Tron Demo</p>
        <h1 className={styles.title}>
          Tron 链
          <br />
          批量工具案例
        </h1>
        <p className={styles.description}>
          复用 `solana-demo` 的布局与路由节奏，把重点放在 Tron 的钱包生成、余额查询、批量转账和能量租赁。
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
        <div className={styles.badge}>Shasta First</div>
      </div>
    </aside>
  );
}

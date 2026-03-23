import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";

import styles from "./sidebar.module.scss";

const navItems = [
  { href: "/", label: "Dashboard", description: "项目概览与连接状态" },
  { href: "/wallets", label: "钱包管理", description: "批量生成、余额、靓号、迁移" },
  { href: "/transfers", label: "转账模块", description: "一转多、多转一、多转多" },
  { href: "/approvals", label: "授权模块", description: "Delegate、Authority、NFT、协议授权" },
  { href: "/rent", label: "租金回收", description: "账户关闭与批量回收" },
  { href: "/liquidity", label: "流动性管理", description: "OpenBook 与池子适配层" }
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div>
        <p className={styles.eyebrow}>Solana Demo</p>
        <h1 className={styles.title}>
          纯前端
          <br />
          教学型工具台
        </h1>
        <p className={styles.description}>
          所有链交互都将在浏览器内完成。这个阶段先把基础设施打稳，后面再逐块接功能。
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
    </aside>
  );
}

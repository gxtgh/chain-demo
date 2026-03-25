import type { PropsWithChildren } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

import { useUi } from "../ui/ui-context";
import { NETWORK_OPTIONS } from "../../lib/sui/constants";

export function AppShell({ children }: PropsWithChildren) {
  const account = useCurrentAccount();
  const location = useLocation();
  const { locale, setLocale, text, theme, setTheme, network, setNetwork } = useUi();

  const navigationGroups = [
    {
      label: text.nav.dashboard,
      items: [{ label: text.nav.overview, to: "/" }]
    },
    {
      label: text.nav.tokens,
      items: [
        { label: text.nav.tokenCases, to: "/tokens" },
        { label: text.nav.standardToken, to: "/tokens/standard" }
      ]
    },
    {
      label: text.nav.wallets,
      items: [
        { label: text.nav.walletCases, to: "/wallets" },
        { label: text.nav.batchGenerate, to: "/wallets/generate" }
      ]
    },
    {
      label: text.nav.transfers,
      items: [
        { label: text.nav.transferCases, to: "/transfers" },
        { label: text.nav.oneToMany, to: "/transfers/one-to-many" },
        { label: text.nav.manyToOne, to: "/transfers/many-to-one" },
        { label: text.nav.manyToMany, to: "/transfers/many-to-many" },
        { label: text.nav.relay, to: "/transfers/relay" }
      ]
    },
    {
      label: text.nav.liquidity,
      items: [
        { label: text.nav.liquidityCases, to: "/liquidity" },
        { label: text.nav.createLiquidity, to: "/liquidity/create" },
        { label: text.nav.addLiquidity, to: "/liquidity/add" }
      ]
    },
    {
      label: text.nav.trading,
      items: [{ label: text.nav.trade, to: "/trade" }]
    }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar-panel">
        <div className="brand-block">
          <div className="eyebrow">Sui Demo</div>
          <h1>{text.shell.brandTitle}</h1>
          <p>{text.shell.brandDescription}</p>
        </div>

        <div className="sidebar-groups">
          {navigationGroups.map((group) => (
            <section className="sidebar-group" key={group.label}>
              <div className="sidebar-group-title">{group.label}</div>
              <div className="sidebar-links">
                {group.items.map((item) => (
                  <NavLink
                    className={({ isActive }) =>
                      isActive || location.pathname === item.to
                        ? "sidebar-link active"
                        : "sidebar-link"
                    }
                    key={item.to}
                    to={item.to}
                  >
                    <span>{item.label}</span>
                    <small>{item.to}</small>
                  </NavLink>
                ))}
              </div>
            </section>
          ))}
        </div>
      </aside>

      <div className="app-content">
        <header className="topbar">
          <div className="topbar-copy">
            <div className="eyebrow">{text.shell.workspace}</div>
            <div className="topbar-meta">
              <strong>{text.shell[network]}</strong>
              <span>{account?.address ?? text.shell.connectHint}</span>
            </div>
          </div>
          <div className="topbar-actions">
            <label className="toolbar-field">
              <span>{text.shell.network}</span>
              <select value={network} onChange={(event) => setNetwork(event.target.value as typeof network)}>
                {NETWORK_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {text.shell[item]}
                  </option>
                ))}
              </select>
            </label>
            <label className="toolbar-field">
              <span>{text.shell.language}</span>
              <select value={locale} onChange={(event) => setLocale(event.target.value as "zh-CN" | "en-US")}>
                <option value="zh-CN">中文</option>
                <option value="en-US">English</option>
              </select>
            </label>
            <label className="toolbar-field">
              <span>{text.shell.theme}</span>
              <select value={theme} onChange={(event) => setTheme(event.target.value as "light" | "dark")}>
                <option value="light">{text.shell.light}</option>
                <option value="dark">{text.shell.dark}</option>
              </select>
            </label>
            <ConnectButton />
          </div>
        </header>

        <main className="page-frame">{children}</main>
      </div>
    </div>
  );
}

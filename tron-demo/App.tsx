import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppLayout } from "./app/layout";
import "./app/globals.scss";

const HomePage = lazy(() =>
  import("./app/page").then((module) => ({ default: module.HomePage }))
);

const WalletsLayoutPage = lazy(() =>
  import("./app/wallets/layout").then((module) => ({ default: module.WalletsLayoutPage }))
);
const WalletsPage = lazy(() =>
  import("./app/wallets/page").then((module) => ({ default: module.WalletsPage }))
);
const WalletGenerateRoutePage = lazy(() =>
  import("./app/wallets/generate/page").then((module) => ({
    default: module.WalletGenerateRoutePage
  }))
);

const BalancesLayoutPage = lazy(() =>
  import("./app/balances/layout").then((module) => ({ default: module.BalancesLayoutPage }))
);
const BalancesPage = lazy(() =>
  import("./app/balances/page").then((module) => ({ default: module.BalancesPage }))
);
const BalanceQueryRoutePage = lazy(() =>
  import("./app/balances/query/page").then((module) => ({
    default: module.BalanceQueryRoutePage
  }))
);

const TransfersLayoutPage = lazy(() =>
  import("./app/transfers/layout").then((module) => ({
    default: module.TransfersLayoutPage
  }))
);
const TransfersPage = lazy(() =>
  import("./app/transfers/page").then((module) => ({ default: module.TransfersPage }))
);
const TransferOneToManyRoutePage = lazy(() =>
  import("./app/transfers/one-to-many/page").then((module) => ({
    default: module.TransferOneToManyRoutePage
  }))
);
const TransferManyToOneRoutePage = lazy(() =>
  import("./app/transfers/many-to-one/page").then((module) => ({
    default: module.TransferManyToOneRoutePage
  }))
);
const TransferManyToManyRoutePage = lazy(() =>
  import("./app/transfers/many-to-many/page").then((module) => ({
    default: module.TransferManyToManyRoutePage
  }))
);
const TransferRelayRoutePage = lazy(() =>
  import("./app/transfers/relay/page").then((module) => ({
    default: module.TransferRelayRoutePage
  }))
);

const EnergyLayoutPage = lazy(() =>
  import("./app/energy/layout").then((module) => ({ default: module.EnergyLayoutPage }))
);
const EnergyPage = lazy(() =>
  import("./app/energy/page").then((module) => ({ default: module.EnergyPage }))
);
const EnergyRentalRoutePage = lazy(() =>
  import("./app/energy/rental/page").then((module) => ({
    default: module.EnergyRentalRoutePage
  }))
);

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/wallets" element={<WalletsLayoutPage />}>
              <Route index element={<WalletsPage />} />
              <Route path="generate" element={<WalletGenerateRoutePage />} />
            </Route>
            <Route path="/balances" element={<BalancesLayoutPage />}>
              <Route index element={<BalancesPage />} />
              <Route path="query" element={<BalanceQueryRoutePage />} />
            </Route>
            <Route path="/transfers" element={<TransfersLayoutPage />}>
              <Route index element={<TransfersPage />} />
              <Route path="one-to-many" element={<TransferOneToManyRoutePage />} />
              <Route path="many-to-one" element={<TransferManyToOneRoutePage />} />
              <Route path="many-to-many" element={<TransferManyToManyRoutePage />} />
              <Route path="relay" element={<TransferRelayRoutePage />} />
            </Route>
            <Route path="/energy" element={<EnergyLayoutPage />}>
              <Route index element={<EnergyPage />} />
              <Route path="rental" element={<EnergyRentalRoutePage />} />
            </Route>
          </Routes>
        </Suspense>
      </AppLayout>
    </BrowserRouter>
  );
}

function RouteFallback() {
  return (
    <section
      style={{
        padding: "32px",
        borderRadius: "28px",
        border: "1px solid var(--border-strong)",
        background: "rgba(255, 255, 255, 0.84)",
        boxShadow: "var(--shadow-panel)",
        color: "var(--text-muted)"
      }}
    >
      正在加载 Tron 工具模块...
    </section>
  );
}

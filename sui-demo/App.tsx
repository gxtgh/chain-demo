import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./app/layout";
import { HomePage } from "./app/page";
import { LiquidityLayoutPage } from "./app/liquidity/layout";
import { LiquidityPage } from "./app/liquidity/page";
import { LiquidityCreateRoutePage } from "./app/liquidity/create/page";
import { LiquidityAddRoutePage } from "./app/liquidity/add/page";
import { TokensLayoutPage } from "./app/tokens/layout";
import { TokensPage } from "./app/tokens/page";
import { StandardTokenRoutePage } from "./app/tokens/standard/page";
import { TradeRoutePage } from "./app/trade/page";
import { TransfersLayoutPage } from "./app/transfers/layout";
import { TransfersPage } from "./app/transfers/page";
import { TransferManyToManyRoutePage } from "./app/transfers/many-to-many/page";
import { TransferManyToOneRoutePage } from "./app/transfers/many-to-one/page";
import { TransferOneToManyRoutePage } from "./app/transfers/one-to-many/page";
import { TransferRelayRoutePage } from "./app/transfers/relay/page";
import { WalletsLayoutPage } from "./app/wallets/layout";
import { WalletsPage } from "./app/wallets/page";
import { WalletGenerateRoutePage } from "./app/wallets/generate/page";
import "./app/globals.scss";

function RouteFallback() {
  return <div className="route-fallback">Loading workspace...</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tokens" element={<TokensLayoutPage />}>
              <Route index element={<TokensPage />} />
              <Route path="standard" element={<StandardTokenRoutePage />} />
            </Route>
            <Route path="/wallets" element={<WalletsLayoutPage />}>
              <Route index element={<WalletsPage />} />
              <Route path="generate" element={<WalletGenerateRoutePage />} />
            </Route>
            <Route path="/transfers" element={<TransfersLayoutPage />}>
              <Route index element={<TransfersPage />} />
              <Route path="one-to-many" element={<TransferOneToManyRoutePage />} />
              <Route path="many-to-one" element={<TransferManyToOneRoutePage />} />
              <Route path="many-to-many" element={<TransferManyToManyRoutePage />} />
              <Route path="relay" element={<TransferRelayRoutePage />} />
            </Route>
            <Route path="/liquidity" element={<LiquidityLayoutPage />}>
              <Route index element={<LiquidityPage />} />
              <Route path="create" element={<LiquidityCreateRoutePage />} />
              <Route path="add" element={<LiquidityAddRoutePage />} />
            </Route>
            <Route path="/trade" element={<TradeRoutePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </BrowserRouter>
  );
}

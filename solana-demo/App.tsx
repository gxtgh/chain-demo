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
const WalletBalancesRoutePage = lazy(() =>
  import("./app/wallets/balances/page").then((module) => ({
    default: module.WalletBalancesRoutePage
  }))
);
const WalletVanityRoutePage = lazy(() =>
  import("./app/wallets/vanity/page").then((module) => ({
    default: module.WalletVanityRoutePage
  }))
);
const WalletMigrateRoutePage = lazy(() =>
  import("./app/wallets/migrate/page").then((module) => ({
    default: module.WalletMigrateRoutePage
  }))
);
const WalletRentRoutePage = lazy(() =>
  import("./app/wallets/rent/page").then((module) => ({ default: module.WalletRentRoutePage }))
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

const ApprovalsLayoutPage = lazy(() =>
  import("./app/approvals/layout").then((module) => ({ default: module.ApprovalsLayoutPage }))
);
const ApprovalsPage = lazy(() =>
  import("./app/approvals/page").then((module) => ({ default: module.ApprovalsPage }))
);
const ApprovalDelegateRoutePage = lazy(() =>
  import("./app/approvals/delegate/page").then((module) => ({
    default: module.ApprovalDelegateRoutePage
  }))
);
const ApprovalRevokeRoutePage = lazy(() =>
  import("./app/approvals/revoke/page").then((module) => ({
    default: module.ApprovalRevokeRoutePage
  }))
);
const ApprovalAuthorityOverviewRoutePage = lazy(() =>
  import("./app/approvals/authority/page").then((module) => ({
    default: module.ApprovalAuthorityOverviewRoutePage
  }))
);
const ApprovalAuthorityMintRoutePage = lazy(() =>
  import("./app/approvals/authority/mint/page").then((module) => ({
    default: module.ApprovalAuthorityMintRoutePage
  }))
);
const ApprovalAuthorityFreezeRoutePage = lazy(() =>
  import("./app/approvals/authority/freeze/page").then((module) => ({
    default: module.ApprovalAuthorityFreezeRoutePage
  }))
);
const ApprovalAuthorityOwnerRoutePage = lazy(() =>
  import("./app/approvals/authority/owner/page").then((module) => ({
    default: module.ApprovalAuthorityOwnerRoutePage
  }))
);
const ApprovalAuthorityCloseRoutePage = lazy(() =>
  import("./app/approvals/authority/close/page").then((module) => ({
    default: module.ApprovalAuthorityCloseRoutePage
  }))
);
const ApprovalAuthorityClearRoutePage = lazy(() =>
  import("./app/approvals/authority/clear/page").then((module) => ({
    default: module.ApprovalAuthorityClearRoutePage
  }))
);
const ApprovalToken2022RoutePage = lazy(() =>
  import("./app/approvals/token-2022/page").then((module) => ({
    default: module.ApprovalToken2022RoutePage
  }))
);
const ApprovalNftLayoutPage = lazy(() =>
  import("./app/approvals/nft/layout").then((module) => ({
    default: module.ApprovalNftLayoutPage
  }))
);
const ApprovalNftRoutePage = lazy(() =>
  import("./app/approvals/nft/page").then((module) => ({
    default: module.ApprovalNftRoutePage
  }))
);
const ApprovalNftUpdateAuthorityRoutePage = lazy(() =>
  import("./app/approvals/nft/update-authority/page").then((module) => ({
    default: module.ApprovalNftUpdateAuthorityRoutePage
  }))
);
const ApprovalNftCollectionRoutePage = lazy(() =>
  import("./app/approvals/nft/collection/page").then((module) => ({
    default: module.ApprovalNftCollectionRoutePage
  }))
);
const ApprovalNftDelegateRoutePage = lazy(() =>
  import("./app/approvals/nft/delegate/page").then((module) => ({
    default: module.ApprovalNftDelegateRoutePage
  }))
);
const ApprovalProtocolsRoutePage = lazy(() =>
  import("./app/approvals/protocols/page").then((module) => ({
    default: module.ApprovalProtocolsRoutePage
  }))
);

const RentLayoutPage = lazy(() =>
  import("./app/rent/layout").then((module) => ({ default: module.RentLayoutPage }))
);
const RentPage = lazy(() =>
  import("./app/rent/page").then((module) => ({ default: module.RentPage }))
);
const RentScanRoutePage = lazy(() =>
  import("./app/rent/scan/page").then((module) => ({ default: module.RentScanRoutePage }))
);
const RentRecoverRoutePage = lazy(() =>
  import("./app/rent/recover/page").then((module) => ({
    default: module.RentRecoverRoutePage
  }))
);

const LiquidityLayoutPage = lazy(() =>
  import("./app/liquidity/layout").then((module) => ({
    default: module.LiquidityLayoutPage
  }))
);
const LiquidityPage = lazy(() =>
  import("./app/liquidity/page").then((module) => ({ default: module.LiquidityPage }))
);
const LiquidityOpenBookRoutePage = lazy(() =>
  import("./app/liquidity/openbook/page").then((module) => ({
    default: module.LiquidityOpenBookRoutePage
  }))
);
const LiquidityCreateRoutePage = lazy(() =>
  import("./app/liquidity/create/page").then((module) => ({
    default: module.LiquidityCreateRoutePage
  }))
);
const LiquidityPoolRoutePage = lazy(() =>
  import("./app/liquidity/pool/page").then((module) => ({
    default: module.LiquidityPoolRoutePage
  }))
);
const LiquidityRemoveRoutePage = lazy(() =>
  import("./app/liquidity/remove/page").then((module) => ({
    default: module.LiquidityRemoveRoutePage
  }))
);
const LiquidityBurnRoutePage = lazy(() =>
  import("./app/liquidity/burn/page").then((module) => ({
    default: module.LiquidityBurnRoutePage
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
              <Route path="balances" element={<WalletBalancesRoutePage />} />
              <Route path="vanity" element={<WalletVanityRoutePage />} />
              <Route path="migrate" element={<WalletMigrateRoutePage />} />
              <Route path="rent" element={<WalletRentRoutePage />} />
            </Route>
            <Route path="/transfers" element={<TransfersLayoutPage />}>
              <Route index element={<TransfersPage />} />
              <Route path="one-to-many" element={<TransferOneToManyRoutePage />} />
              <Route path="many-to-one" element={<TransferManyToOneRoutePage />} />
              <Route path="many-to-many" element={<TransferManyToManyRoutePage />} />
              <Route path="relay" element={<TransferRelayRoutePage />} />
            </Route>
            <Route path="/approvals" element={<ApprovalsLayoutPage />}>
              <Route index element={<ApprovalsPage />} />
              <Route path="delegate" element={<ApprovalDelegateRoutePage />} />
              <Route path="revoke" element={<ApprovalRevokeRoutePage />} />
              <Route path="authority" element={<ApprovalAuthorityOverviewRoutePage />} />
              <Route path="authority/mint" element={<ApprovalAuthorityMintRoutePage />} />
              <Route path="authority/freeze" element={<ApprovalAuthorityFreezeRoutePage />} />
              <Route path="authority/owner" element={<ApprovalAuthorityOwnerRoutePage />} />
              <Route path="authority/close" element={<ApprovalAuthorityCloseRoutePage />} />
              <Route path="authority/clear" element={<ApprovalAuthorityClearRoutePage />} />
              <Route path="token-2022" element={<ApprovalToken2022RoutePage />} />
              <Route path="nft" element={<ApprovalNftLayoutPage />}>
                <Route index element={<ApprovalNftRoutePage />} />
                <Route
                  path="update-authority"
                  element={<ApprovalNftUpdateAuthorityRoutePage />}
                />
                <Route path="collection" element={<ApprovalNftCollectionRoutePage />} />
                <Route path="delegate" element={<ApprovalNftDelegateRoutePage />} />
              </Route>
              <Route path="protocols" element={<ApprovalProtocolsRoutePage />} />
            </Route>
            <Route path="/rent" element={<RentLayoutPage />}>
              <Route index element={<RentPage />} />
              <Route path="scan" element={<RentScanRoutePage />} />
              <Route path="recover" element={<RentRecoverRoutePage />} />
            </Route>
            <Route path="/liquidity" element={<LiquidityLayoutPage />}>
              <Route index element={<LiquidityPage />} />
              <Route path="openbook" element={<LiquidityOpenBookRoutePage />} />
              <Route path="create" element={<LiquidityCreateRoutePage />} />
              <Route path="pool" element={<LiquidityPoolRoutePage />} />
              <Route path="remove" element={<LiquidityRemoveRoutePage />} />
              <Route path="burn" element={<LiquidityBurnRoutePage />} />
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
        border: "1px solid var(--border)",
        background: "rgba(255, 255, 255, 0.88)",
        boxShadow: "var(--shadow-panel)",
        color: "var(--muted)"
      }}
    >
      正在加载模块...
    </section>
  );
}

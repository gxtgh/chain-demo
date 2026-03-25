import "@mysten/dapp-kit/dist/index.css";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
  lightTheme
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useUi } from "./ui/ui-context";
import { NETWORK_URLS } from "../lib/sui/constants";

const { networkConfig } = createNetworkConfig({
  mainnet: { url: NETWORK_URLS.mainnet },
  testnet: { url: NETWORK_URLS.testnet },
  devnet: { url: NETWORK_URLS.devnet },
  localnet: { url: NETWORK_URLS.localnet }
});

export function AppProviders({ children }: PropsWithChildren) {
  const { network } = useUi();
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} network={network}>
        <WalletProvider
          autoConnect
          storageKey="sui-demo-wallet"
          theme={{
            ...lightTheme,
            fontSizes: {
              ...lightTheme.fontSizes,
              medium: "14px"
            }
          }}
        >
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

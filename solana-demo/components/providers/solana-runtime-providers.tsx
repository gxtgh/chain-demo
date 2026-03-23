"use client";

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import { SolanaProvider } from "./solana-provider";

export function SolanaRuntimeProviders({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <SolanaProvider>
      <WalletModalProvider>{children}</WalletModalProvider>
    </SolanaProvider>
  );
}


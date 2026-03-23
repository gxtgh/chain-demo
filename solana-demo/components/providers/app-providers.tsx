import { SolanaRuntimeProviders } from "./solana-runtime-providers";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SolanaRuntimeProviders>{children}</SolanaRuntimeProviders>;
}


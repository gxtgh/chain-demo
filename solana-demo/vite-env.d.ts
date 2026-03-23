/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLANA_DEFAULT_NETWORK?: string;
  readonly VITE_SOLANA_RPC_MAINNET?: string;
  readonly VITE_SOLANA_RPC_DEVNET?: string;
  readonly VITE_SOLANA_RPC_TESTNET?: string;
  readonly VITE_SOLANA_RPC_LOCALNET?: string;
  readonly VITE_SOLSCAN_PRO_API_BASE_URL?: string;
  readonly VITE_SOLSCAN_PRO_API_KEY?: string;
  readonly VITE_DEFAULT_BATCH_CONCURRENCY?: string;
  readonly VITE_DEFAULT_RETRY_TIMES?: string;
  readonly VITE_DEMO_SECRET_PASSPHRASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

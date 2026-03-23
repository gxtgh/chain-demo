export const DEFAULT_BATCH_CONCURRENCY = Number(
  import.meta.env.VITE_DEFAULT_BATCH_CONCURRENCY ?? 5
);

export const DEFAULT_RETRY_TIMES = Number(import.meta.env.VITE_DEFAULT_RETRY_TIMES ?? 2);

export const DEMO_SECRET_PASSPHRASE =
  import.meta.env.VITE_DEMO_SECRET_PASSPHRASE ?? "local-demo-only";

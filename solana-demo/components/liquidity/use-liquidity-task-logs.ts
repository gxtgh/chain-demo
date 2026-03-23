import { useState } from "react";

import type { BatchTaskLog } from "../../types/task";

export function useLiquidityTaskLogs() {
  const [logs, setLogs] = useState<BatchTaskLog[]>([]);

  function appendLog(log: BatchTaskLog) {
    setLogs((current) => [log, ...current].slice(0, 80));
  }

  function appendErrorLog(error: unknown) {
    appendLog({
      timestamp: new Date().toISOString(),
      level: "error",
      message: error instanceof Error ? error.message : "Unknown liquidity task error."
    });
  }

  return { logs, appendLog, appendErrorLog };
}


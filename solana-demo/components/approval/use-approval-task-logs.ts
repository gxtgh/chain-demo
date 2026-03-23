import { useState } from "react";

import type { BatchTaskLog } from "../../types/task";

export function useApprovalTaskLogs() {
  const [logs, setLogs] = useState<BatchTaskLog[]>([]);

  function appendLog(log: BatchTaskLog) {
    setLogs((current) => [log, ...current].slice(0, 80));
  }

  function appendErrorLog(error: unknown) {
    appendLog({
      timestamp: new Date().toISOString(),
      level: "error",
      message: error instanceof Error ? error.message : "Unknown approval task error."
    });
  }

  return { logs, appendLog, appendErrorLog };
}

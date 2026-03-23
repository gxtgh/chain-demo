import { useState } from "react";

import type { BatchTaskLog } from "../../types/task";

export function useBalanceTaskLogs() {
  const [logs, setLogs] = useState<BatchTaskLog[]>([]);

  function appendLog(log: BatchTaskLog) {
    setLogs((current) => [log, ...current].slice(0, 40));
  }

  function appendErrorLog(error: unknown) {
    appendLog({
      timestamp: new Date().toISOString(),
      level: "error",
      message: error instanceof Error ? error.message : "未知余额任务异常。"
    });
  }

  return {
    logs,
    appendLog,
    appendErrorLog
  };
}

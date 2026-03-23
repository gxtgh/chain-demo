import { useState } from "react";

import type { BatchTaskLog } from "../../types/task";

export function useTransferTaskLogs() {
  const [logs, setLogs] = useState<BatchTaskLog[]>([]);

  function appendLog(log: BatchTaskLog) {
    setLogs((current) => [log, ...current].slice(0, 50));
  }

  function appendErrorLog(error: unknown) {
    appendLog({
      timestamp: new Date().toISOString(),
      level: "error",
      message: error instanceof Error ? error.message : "未知转账任务异常。"
    });
  }

  return {
    logs,
    appendLog,
    appendErrorLog
  };
}

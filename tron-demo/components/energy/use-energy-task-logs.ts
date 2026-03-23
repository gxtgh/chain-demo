import { useState } from "react";

import type { BatchTaskLog } from "../../types/task";

export function useEnergyTaskLogs() {
  const [logs, setLogs] = useState<BatchTaskLog[]>([]);

  function appendLog(log: BatchTaskLog) {
    setLogs((current) => [log, ...current].slice(0, 40));
  }

  function appendErrorLog(error: unknown) {
    appendLog({
      timestamp: new Date().toISOString(),
      level: "error",
      message: error instanceof Error ? error.message : "未知能量任务异常。"
    });
  }

  return { logs, appendLog, appendErrorLog };
}

export interface BatchTaskLog {
  timestamp?: string;
  level: "info" | "error";
  message: string;
}

export interface BatchTaskOptions {
  concurrency?: number;
  onLog?: (log: BatchTaskLog) => void;
}

export interface BatchTaskResult<TItem> {
  total: number;
  successCount: number;
  failedCount: number;
  items: TItem[];
}

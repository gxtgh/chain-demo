import type { BatchTaskLog, BatchTaskOptions, BatchTaskResult } from "../../types/task";

function enrichLog(log: BatchTaskLog): BatchTaskLog {
  return {
    timestamp: new Date().toISOString(),
    ...log
  };
}

export async function withRetry<T>(
  task: () => Promise<T>,
  retryTimes: number,
  onLog?: (log: BatchTaskLog) => void
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retryTimes; attempt += 1) {
    try {
      onLog?.(enrichLog({
        level: "info",
        message: `Running task attempt ${attempt + 1}/${retryTimes + 1}`
      }));
      return await task();
    } catch (error) {
      lastError = error;
      onLog?.(enrichLog({
        level: "error",
        message: error instanceof Error ? error.message : "Unknown retry error"
      }));
      if (attempt < retryTimes) {
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

export async function mapWithConcurrency<TInput, TOutput>(
  items: TInput[],
  mapper: (item: TInput, index: number) => Promise<TOutput>,
  options: BatchTaskOptions = {}
): Promise<BatchTaskResult<TOutput>> {
  const concurrency = Math.max(1, options.concurrency ?? 5);
  const results: TOutput[] = new Array(items.length);
  let currentIndex = 0;
  let successCount = 0;
  let failedCount = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const jobIndex = currentIndex;
      currentIndex += 1;

      try {
        results[jobIndex] = await mapper(items[jobIndex], jobIndex);
        successCount += 1;
      } catch (error) {
        failedCount += 1;
        options.onLog?.(enrichLog({
          level: "error",
          message: error instanceof Error ? error.message : "Unknown batch error"
        }));
        throw error;
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length || 1) }, () => worker())
  );

  return {
    total: items.length,
    successCount,
    failedCount,
    items: results
  };
}

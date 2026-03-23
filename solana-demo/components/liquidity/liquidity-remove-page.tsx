import { useState, useTransition } from "react";

import { liquidityService } from "../../lib/liquidity/liquidity-service";
import styles from "./liquidity-shell.module.scss";
import { LiquidityLogsPanel } from "./liquidity-logs-panel";
import { useLiquidityTaskLogs } from "./use-liquidity-task-logs";

export function LiquidityRemovePage() {
  const [poolId, setPoolId] = useState("");
  const [lpAmount, setLpAmount] = useState(1);
  const [result, setResult] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useLiquidityTaskLogs();

  function runDraft() {
    startTransition(async () => {
      try {
        const draft = await liquidityService.removeLiquidityDraft({ poolId, lpAmount });
        setResult(draft);
        appendLog({
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Created remove-liquidity draft."
        });
      } catch (error) {
        appendErrorLog(error);
      }
    });
  }

  return (
    <RemovalPanel
      title="移除流动性"
      description="输入池子标识和 LP 数量，先输出教学型 withdraw 草稿和后续集成步骤。"
      result={result}
      logs={logs}
      isPending={isPending}
      submitLabel="生成移除草稿"
      onSubmit={runDraft}
    >
      <input className={styles.input} placeholder="Pool Id" value={poolId} onChange={(event) => setPoolId(event.target.value.trim())} />
      <input className={styles.input} type="number" min={0.000001} step="0.000001" value={lpAmount} onChange={(event) => setLpAmount(Number(event.target.value))} />
    </RemovalPanel>
  );
}

function RemovalPanel(props: {
  title: string;
  description: string;
  result: unknown;
  logs: Parameters<typeof LiquidityLogsPanel>[0]["logs"];
  isPending: boolean;
  submitLabel: string;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.stack}>
      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>{props.title}</h2>
          <p className={styles.panelDescription}>{props.description}</p>
          <div className={styles.panelBody}>
            {props.children}
            <div className={styles.buttonRow}>
              <button className={`${styles.button} ${styles.buttonSecondary}`} disabled={props.isPending} onClick={props.onSubmit}>
                {props.isPending ? "处理中..." : props.submitLabel}
              </button>
            </div>
            {props.result ? (
              <div className={styles.resultBox}>
                <pre>{JSON.stringify(props.result, null, 2)}</pre>
              </div>
            ) : (
              <div className={styles.empty}>还没有生成结果。</div>
            )}
          </div>
        </article>

        <LiquidityLogsPanel logs={props.logs} />
      </div>
    </section>
  );
}


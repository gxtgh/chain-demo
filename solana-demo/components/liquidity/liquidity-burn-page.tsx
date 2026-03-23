import { useState, useTransition } from "react";

import { liquidityService } from "../../lib/liquidity/liquidity-service";
import styles from "./liquidity-shell.module.scss";
import { LiquidityLogsPanel } from "./liquidity-logs-panel";
import { useLiquidityTaskLogs } from "./use-liquidity-task-logs";

export function LiquidityBurnPage() {
  const [lpMint, setLpMint] = useState("");
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useLiquidityTaskLogs();

  function runDraft() {
    startTransition(async () => {
      try {
        const draft = await liquidityService.burnLiquidityDraft({ lpMint, amount });
        setResult(draft);
        appendLog({
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Created liquidity burn draft."
        });
      } catch (error) {
        appendErrorLog(error);
      }
    });
  }

  return (
    <BurnPanel
      title="燃烧流动性"
      description="当前只输出 LP burn 的协议占位草稿，后续会根据具体池子协议决定是直接 burn 还是并入 withdraw。"
      result={result}
      logs={logs}
      isPending={isPending}
      submitLabel="生成燃烧草稿"
      onSubmit={runDraft}
    >
      <input className={styles.input} placeholder="LP Mint" value={lpMint} onChange={(event) => setLpMint(event.target.value.trim())} />
      <input className={styles.input} type="number" min={0.000001} step="0.000001" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
    </BurnPanel>
  );
}

function BurnPanel(props: {
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


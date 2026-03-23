import { useState, useTransition } from "react";

import { liquidityService } from "../../lib/liquidity/liquidity-service";
import styles from "./liquidity-shell.module.scss";
import { LiquidityLogsPanel } from "./liquidity-logs-panel";
import { useLiquidityTaskLogs } from "./use-liquidity-task-logs";

export function LiquidityOpenBookPage() {
  const [baseMint, setBaseMint] = useState("");
  const [quoteMint, setQuoteMint] = useState("");
  const [lotSize, setLotSize] = useState(1);
  const [tickSize, setTickSize] = useState(0.01);
  const [result, setResult] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useLiquidityTaskLogs();

  function runDraft() {
    startTransition(async () => {
      try {
        const draft = await liquidityService.createOpenBookMarketDraft({
          baseMint,
          quoteMint,
          lotSize,
          tickSize
        });
        setResult(draft);
        appendLog({
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Created OpenBook market draft."
        });
      } catch (error) {
        appendErrorLog(error);
      }
    });
  }

  return (
    <LiquidityActionLayout
      title="创建 OpenBook Id"
      description="先建模 base/quote、lot size 和 tick size，再输出协议占位适配结果。"
      isPending={isPending}
      onSubmit={runDraft}
      submitLabel="生成 OpenBook 草稿"
      logs={logs}
      result={result}
    >
      <div className={styles.inlineControls}>
        <input className={styles.input} placeholder="Base Mint" value={baseMint} onChange={(event) => setBaseMint(event.target.value.trim())} />
        <input className={styles.input} placeholder="Quote Mint" value={quoteMint} onChange={(event) => setQuoteMint(event.target.value.trim())} />
      </div>
      <div className={styles.inlineControls}>
        <input className={styles.input} type="number" min={0.000001} step="0.000001" value={lotSize} onChange={(event) => setLotSize(Number(event.target.value))} />
        <input className={styles.input} type="number" min={0.000001} step="0.000001" value={tickSize} onChange={(event) => setTickSize(Number(event.target.value))} />
      </div>
    </LiquidityActionLayout>
  );
}

function LiquidityActionLayout(props: {
  title: string;
  description: string;
  isPending: boolean;
  onSubmit: () => void;
  submitLabel: string;
  logs: Parameters<typeof LiquidityLogsPanel>[0]["logs"];
  result: unknown;
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


import { useState, useTransition } from "react";

import { liquidityService } from "../../lib/liquidity/liquidity-service";
import styles from "./liquidity-shell.module.scss";
import { LiquidityLogsPanel } from "./liquidity-logs-panel";
import { useLiquidityTaskLogs } from "./use-liquidity-task-logs";

export function LiquidityCreatePage() {
  const [baseMint, setBaseMint] = useState("");
  const [quoteMint, setQuoteMint] = useState("");
  const [baseAmount, setBaseAmount] = useState(1);
  const [quoteAmount, setQuoteAmount] = useState(1);
  const [openBookMarketId, setOpenBookMarketId] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useLiquidityTaskLogs();

  function runDraft() {
    startTransition(async () => {
      try {
        const draft = await liquidityService.createLiquidityDraft({
          baseMint,
          quoteMint,
          baseAmount,
          quoteAmount,
          openBookMarketId: openBookMarketId || undefined
        });
        setResult(draft);
        appendLog({
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Created liquidity deposit draft."
        });
      } catch (error) {
        appendErrorLog(error);
      }
    });
  }

  return (
    <LiquidityDraftPanel
      title="创建流动性"
      description="先建模注入 base/quote 的参数，再输出后续接 AMM 协议需要的草稿信息。"
      result={result}
      logs={logs}
      isPending={isPending}
      submitLabel="生成流动性草稿"
      onSubmit={runDraft}
    >
      <div className={styles.inlineControls}>
        <input className={styles.input} placeholder="Base Mint" value={baseMint} onChange={(event) => setBaseMint(event.target.value.trim())} />
        <input className={styles.input} placeholder="Quote Mint" value={quoteMint} onChange={(event) => setQuoteMint(event.target.value.trim())} />
      </div>
      <div className={styles.inlineControls}>
        <input className={styles.input} type="number" min={0.000001} step="0.000001" value={baseAmount} onChange={(event) => setBaseAmount(Number(event.target.value))} />
        <input className={styles.input} type="number" min={0.000001} step="0.000001" value={quoteAmount} onChange={(event) => setQuoteAmount(Number(event.target.value))} />
      </div>
      <input className={styles.input} placeholder="OpenBook Market Id（可选）" value={openBookMarketId} onChange={(event) => setOpenBookMarketId(event.target.value.trim())} />
    </LiquidityDraftPanel>
  );
}

function LiquidityDraftPanel(props: {
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


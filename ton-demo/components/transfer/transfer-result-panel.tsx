import { transferService } from "../../lib/transfer/transfer-service";
import type { TonTransferBatchResult } from "../../types/transfer";
import styles from "./transfer-shell.module.scss";

export function TransferResultPanel(props: {
  result: TonTransferBatchResult | null;
}) {
  if (!props.result) {
    return <div className={styles.empty}>还没有转账结果。</div>;
  }

  const totalAmount = props.result.items
    .reduce((sum, item) => sum + Number(item.amount), 0)
    .toFixed(4)
    .replace(/\.?0+$/, "");

  return (
    <div className={styles.resultStack}>
      <div className={styles.resultSummary}>
        <div className={styles.resultMetric}>
          <span className={styles.resultLabel}>模式</span>
          <strong>{props.result.mode}</strong>
        </div>
        <div className={styles.resultMetric}>
          <span className={styles.resultLabel}>网络</span>
          <strong>{props.result.network}</strong>
        </div>
        <div className={styles.resultMetric}>
          <span className={styles.resultLabel}>成功笔数</span>
          <strong>{props.result.successCount}</strong>
        </div>
        <div className={styles.resultMetric}>
          <span className={styles.resultLabel}>总金额</span>
          <strong>{totalAmount || "0"} TON</strong>
        </div>
      </div>

      <div className={styles.resultCards}>
        {props.result.items.map((item, index) => (
          <article key={`${item.sourceAddress}-${item.destinationAddress}-${index}`} className={styles.resultCard}>
            <div className={styles.resultCardTop}>
              <span className={styles.pill}>Seqno {item.seqno}</span>
              <span className={styles.pill}>确认后 {item.confirmedSeqno}</span>
            </div>
            <div className={styles.resultAddress}>
              <span>源地址</span>
              <a href={item.sourceExplorerUrl} target="_blank" rel="noreferrer">
                {item.sourceAddress}
              </a>
            </div>
            <div className={styles.resultAddress}>
              <span>目标地址</span>
              <a href={item.destinationExplorerUrl} target="_blank" rel="noreferrer">
                {item.destinationAddress}
              </a>
            </div>
            <div className={styles.resultMetaRow}>
              <span>金额: {item.amount} TON</span>
              {item.memo ? <span>Memo: {item.memo}</span> : <span>Memo: -</span>}
            </div>
          </article>
        ))}
      </div>

      <div className={styles.resultActions}>
        <a
          className={styles.buttonGhostLink}
          href={transferService.explorerAddressUrl(
            props.result.network,
            props.result.items[props.result.items.length - 1]?.destinationAddress ??
              props.result.items[0].destinationAddress
          )}
          target="_blank"
          rel="noreferrer"
        >
          打开最后一个目标地址
        </a>
      </div>
    </div>
  );
}

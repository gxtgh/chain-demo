import type { TronTransferBatchResult } from "../../types/transfer";
import styles from "./transfer-shell.module.scss";

export function TransferResultPanel({ result }: { result: TronTransferBatchResult | null }) {
  if (!result) {
    return <div className={styles.empty}>还没有转账结果。</div>;
  }

  return (
    <div className={styles.resultStack}>
      <div className={styles.resultSummary}>
        <div className={styles.resultMetric}>
          <span className={styles.resultLabel}>模式</span>
          <strong>{result.mode}</strong>
        </div>
        <div className={styles.resultMetric}>
          <span className={styles.resultLabel}>网络</span>
          <strong>{result.network}</strong>
        </div>
        <div className={styles.resultMetric}>
          <span className={styles.resultLabel}>资产</span>
          <strong>{result.asset.kind === "trx" ? "TRX" : "TRC20"}</strong>
        </div>
        <div className={styles.resultMetric}>
          <span className={styles.resultLabel}>成功笔数</span>
          <strong>{result.successCount}</strong>
        </div>
      </div>

      <div className={styles.resultCards}>
        {result.items.map((item) => (
          <article key={item.txId} className={styles.resultCard}>
            <div className={styles.resultCardTop}>
              <span className={styles.pill}>{item.assetKind.toUpperCase()}</span>
              <a href={item.transactionExplorerUrl} target="_blank" rel="noreferrer">
                {item.txId}
              </a>
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
              <span>金额: {item.amount}</span>
              {item.contractAddress ? <span>合约: {item.contractAddress}</span> : <span>资产: TRX</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

import { useMemo, useState, useTransition } from "react";

import { useTonClient } from "../../hooks/use-ton-client";
import { transferService } from "../../lib/transfer/transfer-service";
import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import type { TonTransferBatchResult } from "../../types/transfer";
import styles from "./transfer-shell.module.scss";
import { TransferLogsPanel } from "./transfer-logs-panel";
import { TransferResultPanel } from "./transfer-result-panel";
import { TransferWalletPanel } from "./transfer-wallet-panel";
import { useTransferTaskLogs } from "./use-transfer-task-logs";

export function TransferRelayPage() {
  const client = useTonClient();
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const networkWallets = useMemo(
    () => wallets.filter((wallet) => wallet.network === network),
    [network, wallets]
  );
  const [sourceAddress, setSourceAddress] = useState("");
  const [relayAddress, setRelayAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [sourceToRelayAmount, setSourceToRelayAmount] = useState("0.05");
  const [relayToDestinationAmount, setRelayToDestinationAmount] = useState("0.04");
  const [sourceMemo, setSourceMemo] = useState("relay-step-1");
  const [relayMemo, setRelayMemo] = useState("relay-step-2");
  const [results, setResults] = useState<TonTransferBatchResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useTransferTaskLogs();

  function fillSample() {
    if (networkWallets.length < 2) {
      return;
    }

    const [source, relay, destination] = networkWallets;

    if (!source || !relay) {
      return;
    }

    setSourceAddress(source.address);
    setRelayAddress(relay.address);
    setDestinationAddress(destination?.address ?? source.address);
  }

  function runTransfer() {
    startTransition(async () => {
      try {
        const result = await transferService.relay(
          client,
          network,
          networkWallets,
          {
            sourceAddress,
            relayAddress,
            destinationAddress,
            sourceToRelayAmount,
            relayToDestinationAmount,
            sourceMemo,
            relayMemo
          },
          appendLog
        );
        setResults(result);
      } catch (error) {
        appendErrorLog(error);
      }
    });
  }

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="网络" value={network} />
        <MetaCard label="源地址" value={sourceAddress ? `${sourceAddress.slice(0, 10)}...` : "未填写"} />
        <MetaCard label="中转地址" value={relayAddress ? `${relayAddress.slice(0, 10)}...` : "未填写"} />
        <MetaCard label="目标地址" value={destinationAddress ? `${destinationAddress.slice(0, 10)}...` : "未填写"} />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>中转转账</h2>
          <p className={styles.panelDescription}>
            源钱包先把 TON 转到 relay 钱包，等待余额到位后，再由 relay 钱包签名发送到最终目标地址。两段转账都会做余额保护。
          </p>
          <div className={styles.panelBody}>
            <div className={styles.inlineControls}>
              <input
                className={styles.input}
                placeholder="源钱包地址"
                value={sourceAddress}
                onChange={(event) => setSourceAddress(event.target.value.trim())}
              />
              <input
                className={styles.input}
                placeholder="中转钱包地址"
                value={relayAddress}
                onChange={(event) => setRelayAddress(event.target.value.trim())}
              />
            </div>

            <input
              className={styles.input}
              placeholder="目标地址"
              value={destinationAddress}
              onChange={(event) => setDestinationAddress(event.target.value.trim())}
            />

            <div className={styles.inlineControls}>
              <input
                className={styles.input}
                placeholder="源钱包 -> 中转金额"
                value={sourceToRelayAmount}
                onChange={(event) => setSourceToRelayAmount(event.target.value.trim())}
              />
              <input
                className={styles.input}
                placeholder="中转 -> 目标金额"
                value={relayToDestinationAmount}
                onChange={(event) => setRelayToDestinationAmount(event.target.value.trim())}
              />
            </div>

            <div className={styles.inlineControls}>
              <input
                className={styles.input}
                placeholder="第一段 memo"
                value={sourceMemo}
                onChange={(event) => setSourceMemo(event.target.value)}
              />
              <input
                className={styles.input}
                placeholder="第二段 memo"
                value={relayMemo}
                onChange={(event) => setRelayMemo(event.target.value)}
              />
            </div>

            <div className={styles.buttonRow}>
              <button
                className={styles.button}
                disabled={
                  isPending ||
                  !sourceAddress ||
                  !relayAddress ||
                  !destinationAddress ||
                  !sourceToRelayAmount ||
                  !relayToDestinationAmount
                }
                onClick={runTransfer}
              >
                {isPending ? "执行中..." : "执行中转任务"}
              </button>
              <button
                className={styles.buttonGhost}
                disabled={isPending || networkWallets.length < 2}
                onClick={fillSample}
              >
                填充示例
              </button>
            </div>

            <TransferResultPanel result={results} />
          </div>
        </article>

        <TransferLogsPanel logs={logs} />
      </div>

      <TransferWalletPanel />
    </section>
  );
}

function MetaCard(props: { label: string; value: string }) {
  return (
    <div className={styles.metaCard}>
      <div className={styles.metaLabel}>{props.label}</div>
      <div className={styles.metaValue}>{props.value}</div>
    </div>
  );
}

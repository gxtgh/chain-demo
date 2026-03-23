import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { transferService, validateTransferForm } from "../../lib/transfer/transfer-service";
import { useWalletStore } from "../../store/wallet-store";
import type { TransferAssetKind } from "../../types/transfer";
import styles from "./transfer-shell.module.scss";
import { TransferLogsPanel } from "./transfer-logs-panel";
import { TransferWalletPanel } from "./transfer-wallet-panel";
import { useTransferTaskLogs } from "./use-transfer-task-logs";

export function TransferRelayPage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const [sourceWalletId, setSourceWalletId] = useState("");
  const [relayWalletId, setRelayWalletId] = useState("");
  const [assetKind, setAssetKind] = useState<TransferAssetKind>("sol");
  const [mintAddress, setMintAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [sourceToRelayAmount, setSourceToRelayAmount] = useState("0.01");
  const [relayToDestinationAmount, setRelayToDestinationAmount] = useState("0.009");
  const [results, setResults] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useTransferTaskLogs();

  const sourceWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === sourceWalletId),
    [sourceWalletId, wallets]
  );
  const relayWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === relayWalletId),
    [relayWalletId, wallets]
  );

  function runTransfer() {
    startTransition(async () => {
      try {
        if (!sourceWallet || !relayWallet) {
          throw new Error("Please choose both source and relay wallets.");
        }

        validateTransferForm({
          asset: {
            kind: assetKind,
            mintAddress
          },
          destinationAddress,
          sourceWalletId,
          relayWalletId
        });

        const result = await transferService.relay(
          connection,
          {
            sourceAddress: sourceWallet.publicKey,
            relayAddress: relayWallet.publicKey,
            destinationAddress,
            sourceToRelayAmount,
            relayToDestinationAmount,
            asset: {
              kind: assetKind,
              mintAddress
            }
          },
          sourceWallet,
          relayWallet,
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
        <MetaCard label="本地钱包数" value={String(wallets.length)} />
        <MetaCard label="来源钱包" value={sourceWallet ? sourceWallet.label : "未选择"} />
        <MetaCard label="中转钱包" value={relayWallet ? relayWallet.label : "未选择"} />
        <MetaCard label="资产" value={assetKind === "sol" ? "SOL" : "SPL Token"} />
        <MetaCard label="模式" value="来源 -> 中转 -> 目标" />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>中转转账</h2>
          <p className={styles.panelDescription}>先从来源钱包打到中转钱包，再从中转钱包打到最终目标地址，支持 SOL 与指定 SPL Token。</p>
          <div className={styles.panelBody}>
            <div className={styles.inlineControls}>
              <select
                className={styles.select}
                value={sourceWalletId}
                onChange={(event) => setSourceWalletId(event.target.value)}
              >
                <option value="">选择来源钱包</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.label} · {wallet.publicKey.slice(0, 8)}...
                  </option>
                ))}
              </select>
              <select
                className={styles.select}
                value={relayWalletId}
                onChange={(event) => setRelayWalletId(event.target.value)}
              >
                <option value="">选择中转钱包</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.label} · {wallet.publicKey.slice(0, 8)}...
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inlineControls}>
              <select
                className={styles.select}
                value={assetKind}
                onChange={(event) => setAssetKind(event.target.value as TransferAssetKind)}
              >
                <option value="sol">SOL</option>
                <option value="spl">SPL Token</option>
              </select>
              <input
                className={styles.input}
                placeholder="SPL Mint 地址（仅 Token 模式必填）"
                value={mintAddress}
                onChange={(event) => setMintAddress(event.target.value.trim())}
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
                placeholder="来源 -> 中转 数量"
                value={sourceToRelayAmount}
                onChange={(event) => setSourceToRelayAmount(event.target.value)}
              />
              <input
                className={styles.input}
                placeholder="中转 -> 目标 数量"
                value={relayToDestinationAmount}
                onChange={(event) => setRelayToDestinationAmount(event.target.value)}
              />
            </div>
            <div className={styles.buttonRow}>
              <button
                className={styles.button}
                disabled={
                  isPending ||
                  !destinationAddress ||
                  !sourceWalletId ||
                  !relayWalletId ||
                  !sourceToRelayAmount ||
                  !relayToDestinationAmount ||
                  (assetKind === "spl" && !mintAddress)
                }
                onClick={runTransfer}
              >
                {isPending ? "执行中..." : "执行中转转账"}
              </button>
            </div>
            {results ? (
              <div className={styles.resultBox}>
                <pre>{JSON.stringify(results, null, 2)}</pre>
              </div>
            ) : (
              <div className={styles.empty}>还没有转账结果。</div>
            )}
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

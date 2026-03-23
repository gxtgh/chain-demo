import { useMemo, useState, useTransition } from "react";

import { energyService } from "../../lib/energy/energy-service";
import { useNetworkStore } from "../../store/network-store";
import { useWalletStore } from "../../store/wallet-store";
import type { EnergyActionReceipt } from "../../types/energy";
import styles from "./energy-shell.module.scss";
import { EnergyLogsPanel } from "./energy-logs-panel";
import { useEnergyTaskLogs } from "./use-energy-task-logs";

export function EnergyRentalPage() {
  const network = useNetworkStore((state) => state.network);
  const wallets = useWalletStore((state) => state.wallets);
  const networkWallets = useMemo(
    () => wallets.filter((wallet) => wallet.network === network),
    [network, wallets]
  );
  const [ownerWalletId, setOwnerWalletId] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [amountTrx, setAmountTrx] = useState("10");
  const [receipts, setReceipts] = useState<EnergyActionReceipt[]>([]);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useEnergyTaskLogs();

  const ownerWallet = networkWallets.find((wallet) => wallet.id === ownerWalletId);

  function pushReceipt(receipt: EnergyActionReceipt) {
    setReceipts((current) => [receipt, ...current].slice(0, 12));
    appendLog({
      timestamp: new Date().toISOString(),
      level: "info",
      message: `${receipt.action} 成功，交易 ${receipt.txId}`
    });
  }

  function runAction(action: "freeze" | "delegate" | "undelegate" | "unfreeze") {
    startTransition(async () => {
      try {
        if (!ownerWallet) {
          throw new Error("请选择一个钱包。");
        }

        if ((action === "delegate" || action === "undelegate") && !receiverAddress.trim()) {
          throw new Error("请输入接收地址。");
        }

        if (action === "freeze") {
          pushReceipt(await energyService.freeze(network, ownerWallet, amountTrx));
          return;
        }

        if (action === "delegate") {
          pushReceipt(await energyService.delegate(network, ownerWallet, receiverAddress, amountTrx));
          return;
        }

        if (action === "undelegate") {
          pushReceipt(await energyService.undelegate(network, ownerWallet, receiverAddress, amountTrx));
          return;
        }

        pushReceipt(await energyService.unfreeze(network, ownerWallet, amountTrx));
      } catch (error) {
        appendErrorLog(error);
      }
    });
  }

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="当前网络钱包" value={String(networkWallets.length)} />
        <MetaCard label="当前钱包" value={ownerWallet ? ownerWallet.label : "未选择"} />
        <MetaCard label="接收地址" value={receiverAddress ? `${receiverAddress.slice(0, 10)}...` : "未填写"} />
        <MetaCard label="操作金额" value={`${amountTrx} TRX`} />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>能量租赁操作台</h2>
          <p className={styles.panelDescription}>依次支持冻结、委托、回收和解冻。建议先在 Shasta 测试网验证流程。</p>
          <div className={styles.panelBody}>
            <select className={styles.select} value={ownerWalletId} onChange={(event) => setOwnerWalletId(event.target.value)}>
              <option value="">选择操作钱包</option>
              {networkWallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.label} · {wallet.addressBase58.slice(0, 10)}...
                </option>
              ))}
            </select>
            <input className={styles.input} placeholder="接收地址（委托/回收必填）" value={receiverAddress} onChange={(event) => setReceiverAddress(event.target.value.trim())} />
            <input className={styles.input} placeholder="金额（TRX）" value={amountTrx} onChange={(event) => setAmountTrx(event.target.value.trim())} />
            <div className={styles.buttonRow}>
              <button className={styles.button} disabled={isPending || !ownerWalletId} onClick={() => runAction("freeze")}>冻结 ENERGY</button>
              <button className={styles.buttonGhost} disabled={isPending || !ownerWalletId || !receiverAddress} onClick={() => runAction("delegate")}>委托 ENERGY</button>
              <button className={styles.buttonGhost} disabled={isPending || !ownerWalletId || !receiverAddress} onClick={() => runAction("undelegate")}>回收委托</button>
              <button className={styles.buttonGhost} disabled={isPending || !ownerWalletId} onClick={() => runAction("unfreeze")}>解冻</button>
            </div>

            {receipts.length ? (
              <div className={styles.resultStack}>
                {receipts.map((receipt) => (
                  <div key={receipt.txId} className={styles.resultCard}>
                    <div className={styles.resultCardTop}>
                      <span className={styles.pill}>{receipt.action}</span>
                      <a href={receipt.explorerUrl} target="_blank" rel="noreferrer">{receipt.txId}</a>
                    </div>
                    <div className={styles.resultMetaRow}>
                      <span>Owner: {receipt.ownerAddress}</span>
                      {receipt.receiverAddress ? <span>Receiver: {receipt.receiverAddress}</span> : null}
                    </div>
                    <div className={styles.resultMetaRow}>
                      <span>Amount: {receipt.amountTrx} TRX</span>
                      <span>Network: {receipt.network}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>还没有能量租赁结果。</div>
            )}
          </div>
        </article>
        <EnergyLogsPanel logs={logs} />
      </div>
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

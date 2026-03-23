import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { approvalService } from "../../lib/approval/approval-service";
import { useWalletStore } from "../../store/wallet-store";
import type { StandardAuthorityKind } from "../../types/approval";
import styles from "./approval-shell.module.scss";
import { ApprovalLogsPanel } from "./approval-logs-panel";
import { ApprovalWalletPanel } from "./approval-wallet-panel";
import { useApprovalTaskLogs } from "./use-approval-task-logs";

const AUTHORITY_META: Record<
  StandardAuthorityKind,
  {
    title: string;
    description: string;
    risk: string;
    targetHint: string;
  }
> = {
  "mint-tokens": {
    title: "Mint Authority",
    description: "修改谁可以继续为这个 mint 增发 token。适用于 Token Mint 账户本身。",
    risk: "把增发权限交出去后，对方可以继续铸造更多 token。",
    targetHint: "目标地址填写 Mint 地址"
  },
  "freeze-account": {
    title: "Freeze Authority",
    description: "修改谁可以冻结或解冻这个 mint 下的 token account。适用于 Token Mint 账户本身。",
    risk: "把冻结权限交出去后，对方可以冻结相关 token account。",
    targetHint: "目标地址填写 Mint 地址"
  },
  "account-owner": {
    title: "Account Owner",
    description: "修改某个 Token Account 的 owner。适用于具体的 token account，而不是 mint。",
    risk: "owner 变更后，新的 owner 将控制这个 token account。",
    targetHint: "目标地址填写 Token Account 地址"
  },
  "close-account": {
    title: "Close Authority",
    description: "修改谁可以关闭某个 Token Account 并取回租金。适用于具体的 token account。",
    risk: "把 close authority 交出去后，对方可以关闭这个 token account。",
    targetHint: "目标地址填写 Token Account 地址"
  }
};

export function ApprovalAuthorityPage(props: {
  authorityType: StandardAuthorityKind;
  clearAuthority?: boolean;
}) {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const [authorityWalletId, setAuthorityWalletId] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [newAuthorityAddress, setNewAuthorityAddress] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useApprovalTaskLogs();

  const authorityWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === authorityWalletId),
    [authorityWalletId, wallets]
  );
  const meta = AUTHORITY_META[props.authorityType];

  function runAuthorityUpdate() {
    startTransition(async () => {
      try {
        if (!authorityWallet) {
          throw new Error("Please choose the current authority wallet.");
        }

        const response = await approvalService.setAuthority(
          connection,
          authorityWallet,
          {
            authorityType: props.authorityType,
            currentAuthorityAddress: authorityWallet.publicKey,
            targetAddress,
            newAuthorityAddress,
            clearAuthority: props.clearAuthority
          },
          appendLog
        );

        setResult(response);
      } catch (error) {
        appendErrorLog(error);
      }
    });
  }

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="当前权限" value={meta.title} />
        <MetaCard label="当前签名人" value={authorityWallet ? authorityWallet.label : "未选择"} />
        <MetaCard label="操作" value={props.clearAuthority ? "Clear Authority" : "Set Authority"} />
        <MetaCard label="目标类型" value={meta.targetHint} />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {props.clearAuthority ? `清空 ${meta.title}` : `设置 ${meta.title}`}
          </h2>
          <p className={styles.panelDescription}>{meta.description}</p>

          <div className={styles.panelBody}>
            <div className={styles.warningBox}>{meta.risk}</div>
            <select
              className={styles.select}
              value={authorityWalletId}
              onChange={(event) => setAuthorityWalletId(event.target.value)}
            >
              <option value="">选择当前权限钱包</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.label} · {wallet.publicKey.slice(0, 8)}...
                </option>
              ))}
            </select>
            <input
              className={styles.input}
              placeholder={meta.targetHint}
              value={targetAddress}
              onChange={(event) => setTargetAddress(event.target.value.trim())}
            />
            {!props.clearAuthority ? (
              <input
                className={styles.input}
                placeholder="新的权限地址"
                value={newAuthorityAddress}
                onChange={(event) => setNewAuthorityAddress(event.target.value.trim())}
              />
            ) : null}
            <div className={styles.buttonRow}>
              <button
                className={styles.button}
                disabled={
                  isPending ||
                  !authorityWallet ||
                  !targetAddress ||
                  (!props.clearAuthority && !newAuthorityAddress)
                }
                onClick={runAuthorityUpdate}
              >
                {isPending
                  ? "处理中..."
                  : props.clearAuthority
                    ? "执行清空权限"
                    : "执行设置权限"}
              </button>
            </div>
            {result ? (
              <div className={styles.resultBox}>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            ) : (
              <div className={styles.empty}>还没有权限变更结果。</div>
            )}
          </div>
        </article>

        <ApprovalLogsPanel logs={logs} />
      </div>

      <ApprovalWalletPanel />
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

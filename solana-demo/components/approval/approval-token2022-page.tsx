import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { approvalService } from "../../lib/approval/approval-service";
import { useWalletStore } from "../../store/wallet-store";
import type { Token2022AuthorityKind } from "../../types/approval";
import styles from "./approval-shell.module.scss";
import { ApprovalLogsPanel } from "./approval-logs-panel";
import { ApprovalWalletPanel } from "./approval-wallet-panel";
import { useApprovalTaskLogs } from "./use-approval-task-logs";

const token2022Options: Array<{
  value: Token2022AuthorityKind;
  label: string;
  note: string;
}> = [
  {
    value: "transfer-fee-config",
    label: "Transfer Fee Config",
    note: "控制谁可以修改 transfer fee 参数。"
  },
  {
    value: "withheld-withdraw",
    label: "Withheld Withdraw",
    note: "控制谁可以提取累计的 withheld fee。"
  },
  {
    value: "close-mint",
    label: "Close Mint",
    note: "控制谁可以关闭 mint。"
  },
  {
    value: "interest-rate",
    label: "Interest Rate",
    note: "控制谁可以修改 interest-bearing 配置。"
  },
  {
    value: "permanent-delegate",
    label: "Permanent Delegate",
    note: "控制永久 delegate 设置。"
  },
  {
    value: "transfer-hook-program-id",
    label: "Transfer Hook Program",
    note: "控制 transfer hook program id 相关 authority。"
  },
  {
    value: "metadata-pointer",
    label: "Metadata Pointer",
    note: "控制 metadata pointer authority。"
  },
  {
    value: "group-pointer",
    label: "Group Pointer",
    note: "控制 token group pointer authority。"
  },
  {
    value: "group-member-pointer",
    label: "Group Member Pointer",
    note: "控制 token group member pointer authority。"
  },
  {
    value: "scaled-ui-amount-config",
    label: "Scaled UI Amount Config",
    note: "控制 scaled UI amount config authority。"
  },
  {
    value: "pausable-config",
    label: "Pausable Config",
    note: "控制 pausable extension authority。"
  }
];

export function ApprovalToken2022Page() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const [authorityType, setAuthorityType] = useState<Token2022AuthorityKind>("transfer-fee-config");
  const [authorityWalletId, setAuthorityWalletId] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [newAuthorityAddress, setNewAuthorityAddress] = useState("");
  const [clearAuthority, setClearAuthority] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useApprovalTaskLogs();

  const authorityWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === authorityWalletId),
    [authorityWalletId, wallets]
  );
  const selectedOption = token2022Options.find((option) => option.value === authorityType)!;

  function runToken2022Authority() {
    startTransition(async () => {
      try {
        if (!authorityWallet) {
          throw new Error("Please choose the current authority wallet.");
        }

        const response = await approvalService.setAuthority(
          connection,
          authorityWallet,
          {
            authorityType,
            currentAuthorityAddress: authorityWallet.publicKey,
            targetAddress: mintAddress,
            newAuthorityAddress,
            clearAuthority,
            tokenProgram: "token-2022"
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
        <MetaCard label="Program" value="Token-2022" />
        <MetaCard label="Authority" value={selectedOption.label} />
        <MetaCard label="签名人" value={authorityWallet ? authorityWallet.label : "未选择"} />
        <MetaCard label="模式" value={clearAuthority ? "Clear" : "Set"} />
      </div>

      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Token-2022 Authority</h2>
          <p className={styles.panelDescription}>
            这里通过 `TOKEN_2022_PROGRAM_ID` 调用真实 `setAuthority`，覆盖 Token-2022 中常见的扩展 authority 变更。
          </p>

          <div className={styles.panelBody}>
            <div className={styles.warningBox}>
              {selectedOption.note} 这类权限通常直接影响 mint 的长期行为，建议先在测试环境验证。
            </div>
            <select
              className={styles.select}
              value={authorityType}
              onChange={(event) => setAuthorityType(event.target.value as Token2022AuthorityKind)}
            >
              {token2022Options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
              placeholder="Token-2022 Mint 地址"
              value={mintAddress}
              onChange={(event) => setMintAddress(event.target.value.trim())}
            />
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={clearAuthority}
                onChange={(event) => setClearAuthority(event.target.checked)}
              />
              清空该 authority（设为 null）
            </label>
            {!clearAuthority ? (
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
                  !mintAddress ||
                  (!clearAuthority && !newAuthorityAddress)
                }
                onClick={runToken2022Authority}
              >
                {isPending ? "处理中..." : "执行 Token-2022 权限变更"}
              </button>
            </div>
            {result ? (
              <div className={styles.resultBox}>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            ) : (
              <div className={styles.empty}>还没有 Token-2022 权限变更结果。</div>
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

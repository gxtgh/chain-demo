import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { useMemo, useState, useTransition } from "react";

import { useSolanaConnection } from "../../hooks/use-solana-connection";
import { nftApprovalService } from "../../lib/approval/nft-approval-service";
import { useWalletStore } from "../../store/wallet-store";
import styles from "./approval-shell.module.scss";
import { ApprovalLogsPanel } from "./approval-logs-panel";
import { ApprovalWalletPanel } from "./approval-wallet-panel";
import { useApprovalTaskLogs } from "./use-approval-task-logs";

const tokenStandardOptions = [
  { value: TokenStandard.NonFungible, label: "NonFungible" },
  { value: TokenStandard.ProgrammableNonFungible, label: "ProgrammableNonFungible" }
];

export function ApprovalNftDelegatePage() {
  const connection = useSolanaConnection();
  const wallets = useWalletStore((state) => state.wallets);
  const [authorityWalletId, setAuthorityWalletId] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [delegateAddress, setDelegateAddress] = useState("");
  const [mode, setMode] = useState<"delegate" | "revoke">("delegate");
  const [tokenStandard, setTokenStandard] = useState<TokenStandard>(TokenStandard.NonFungible);
  const [result, setResult] = useState<unknown>(null);
  const [isPending, startTransition] = useTransition();
  const { logs, appendLog, appendErrorLog } = useApprovalTaskLogs();

  const authorityWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === authorityWalletId),
    [authorityWalletId, wallets]
  );

  function runDelegate() {
    startTransition(async () => {
      try {
        if (!authorityWallet) {
          throw new Error("Please choose the current NFT authority wallet.");
        }

        const response =
          mode === "delegate"
            ? await nftApprovalService.delegateStandard(
                connection,
                authorityWallet,
                mintAddress,
                delegateAddress,
                tokenStandard,
                appendLog
              )
            : await nftApprovalService.revokeStandard(
                connection,
                authorityWallet,
                mintAddress,
                delegateAddress,
                tokenStandard,
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
      <div className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>NFT Delegate</h2>
          <p className={styles.panelDescription}>对标准 NFT 做 delegate 或 revoke。当前优先兼容标准 NFT，pNFT 需要更完整的附加账户时会按指令要求补充。</p>
          <div className={styles.panelBody}>
            <select className={styles.select} value={mode} onChange={(event) => setMode(event.target.value as "delegate" | "revoke")}>
              <option value="delegate">Delegate NFT</option>
              <option value="revoke">Revoke NFT Delegate</option>
            </select>
            <select className={styles.select} value={tokenStandard} onChange={(event) => setTokenStandard(Number(event.target.value) as TokenStandard)}>
              {tokenStandardOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select className={styles.select} value={authorityWalletId} onChange={(event) => setAuthorityWalletId(event.target.value)}>
              <option value="">选择当前 NFT owner / authority 钱包</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.label} · {wallet.publicKey.slice(0, 8)}...
                </option>
              ))}
            </select>
            <input className={styles.input} placeholder="NFT Mint 地址" value={mintAddress} onChange={(event) => setMintAddress(event.target.value.trim())} />
            <input className={styles.input} placeholder="Delegate 地址" value={delegateAddress} onChange={(event) => setDelegateAddress(event.target.value.trim())} />
            <div className={styles.buttonRow}>
              <button className={styles.button} disabled={isPending || !authorityWallet || !mintAddress || !delegateAddress} onClick={runDelegate}>
                {isPending ? "处理中..." : mode === "delegate" ? "执行 NFT Delegate" : "执行 NFT Revoke"}
              </button>
            </div>
            {result ? <div className={styles.resultBox}><pre>{JSON.stringify(result, null, 2)}</pre></div> : <div className={styles.empty}>还没有执行结果。</div>}
          </div>
        </article>
        <ApprovalLogsPanel logs={logs} />
      </div>
      <ApprovalWalletPanel />
    </section>
  );
}

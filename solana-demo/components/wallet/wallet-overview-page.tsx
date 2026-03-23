import { useWalletStore } from "../../store/wallet-store";
import styles from "./wallet-shell.module.scss";

export function WalletOverviewPage() {
  const wallets = useWalletStore((state) => state.wallets);
  const selectedWalletIds = useWalletStore((state) => state.selectedWalletIds);

  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="本地钱包数" value={String(wallets.length)} />
        <MetaCard label="当前选中" value={String(selectedWalletIds.length)} />
        <MetaCard label="默认存储" value="Zustand + localStorage" />
        <MetaCard label="钱包工作流" value="子路由拆分" />
      </div>

      <article className={styles.panel}>
        <h2 className={styles.panelTitle}>钱包模块总览</h2>
        <p className={styles.panelDescription}>
          钱包功能已经拆成独立子页面。你可以按任务进入对应路由，避免把生成、查询、迁移和回收都堆在一页里。
        </p>
        <div className={styles.panelBody}>
          <div className={styles.empty}>
            建议顺序：先去“批量生成”准备钱包，再到“余额查询”确认状态，随后按需进入“靓号生成”、“资产迁移”或“租金回收”。
          </div>
        </div>
      </article>
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


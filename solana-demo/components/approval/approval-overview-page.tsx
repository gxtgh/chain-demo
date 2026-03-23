import styles from "./approval-shell.module.scss";

const approvalOperations = [
  {
    label: "SPL Token Delegate",
    description: "授权第三方地址在额度内转出指定 token。这是最常见、最适合单独做授权模块的能力。"
  },
  {
    label: "Revoke Delegate",
    description: "撤销已经设置的 delegate，停止第三方继续代表当前 token account 花费额度。"
  },
  {
    label: "Set Authority",
    description: "更换 mint authority、freeze authority、close authority、account owner 等。这类权限更强，风险也更高。"
  },
  {
    label: "Token-2022",
    description: "扩展 token 标准下的 fee、hook、metadata pointer、permanent delegate 等 authority。"
  },
  {
    label: "NFT / Metaplex",
    description: "NFT 里的 update authority、collection authority、delegate 等权限通常需要走 Metaplex 相关指令。"
  },
  {
    label: "协议级授权",
    description: "像 AMM、NFT 市场、质押协议里的授权，通常不是通用按钮，而是协议自己的指令组合。"
  }
];

export function ApprovalOverviewPage() {
  return (
    <section className={styles.stack}>
      <div className={styles.metaGrid}>
        <MetaCard label="当前阶段" value="标准授权 + 部分扩展已实装" />
        <MetaCard label="执行方式" value="纯前端本地签名" />
        <MetaCard label="已交付" value="Delegate + SetAuthority + Token-2022" />
        <MetaCard label="后续方向" value="Token-2022 / NFT 适配" />
      </div>

      <article className={styles.panel}>
        <h2 className={styles.panelTitle}>Solana 授权模块总览</h2>
        <p className={styles.panelDescription}>
          Solana 里“授权”并不是一个单独的总开关，而是分散在 Token Program、Token-2022、Metaplex 和各类协议里的权限设计。当前模块会优先把标准 SPL Token 权限做实，再为扩展授权预留清晰适配层。
        </p>
        <div className={styles.panelBody}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>授权类型</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                {approvalOperations.map((item) => (
                  <tr key={item.label}>
                    <td>{item.label}</td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.empty}>
            建议把“Delegate 授权”理解成“允许别人代你花一定额度的 token”，而不是把钱包私钥交出去。
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

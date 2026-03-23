import { clusters } from "../../lib/solana/rpc-config";
import styles from "./dashboard-page.module.scss";

const panels = [
  {
    title: "模块目录",
    lines: [
      "lib/solana: 连接、RPC、网络与通用链工具",
      "lib/wallet: 私钥、生成、导入导出、钱包 service",
      "lib/transfer: 批量转账编排与事务构建",
      "lib/rent: 租金回收与账户关闭流程",
      "lib/liquidity: OpenBook 与 AMM 占位适配层"
    ]
  },
  {
    title: "这一阶段已经接好",
    lines: [
      "Wallet Adapter Provider",
      "Network Switcher",
      "RPC endpoint 配置",
      "Solscan Pro client",
      "批处理工具基础设施"
    ]
  },
  {
    title: "后续会在这里继续做",
    lines: [
      "钱包批量生成与 CSV / JSON 导出",
      "余额查询和代币资产视图",
      "多种批量转账任务",
      "租金回收编排器",
      "流动性接口层和协议适配器"
    ]
  }
];

export function DashboardPanels() {
  return (
    <section className={styles.panelGrid}>
      <div className={styles.panelColumn}>
        {panels.map((panel) => (
          <article key={panel.title} className={styles.panel}>
            <h2 className={styles.panelTitle}>{panel.title}</h2>
            <div className={styles.panelBody}>
              {panel.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <article className={styles.panel}>
        <h2 className={styles.panelTitle}>内置网络配置</h2>
        <div className={styles.panelBody}>
          {clusters.map((item) => (
            <div key={item.key} className={styles.clusterItem}>
              <p className={styles.clusterLabel}>{item.label}</p>
              <p className={styles.clusterEndpoint}>{item.endpoint}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

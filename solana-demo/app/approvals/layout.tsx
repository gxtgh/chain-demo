import { Outlet } from "react-router-dom";

import { ApprovalSubnav } from "../../components/approval/approval-subnav";
import styles from "../../components/approval/approval-shell.module.scss";
import { PageHeader } from "../../components/page/page-header";

export function ApprovalsLayoutPage() {
  return (
    <section className={styles.stack}>
      <PageHeader
        eyebrow="Approvals"
        title="授权模块"
        description="授权模块现在按标准 SPL Token、SetAuthority、Token-2022、NFT 和协议适配层来组织。当前标准授权与部分 Token-2022 authority 已可真实执行，其余部分保留清晰扩展位。"
      />
      <ApprovalSubnav />
      <Outlet />
    </section>
  );
}

import { Outlet } from "react-router-dom";

import { ApprovalNftSubnav } from "../../../components/approval/approval-nft-subnav";
import styles from "../../../components/approval/approval-shell.module.scss";

export function ApprovalNftLayoutPage() {
  return (
    <section className={styles.stack}>
      <ApprovalNftSubnav />
      <Outlet />
    </section>
  );
}

import { Outlet } from "react-router-dom";

import { PageHeader } from "../../components/page/page-header";
import { RentSubnav } from "../../components/rent/rent-subnav";
import styles from "../../components/rent/rent-shell.module.scss";

export function RentLayoutPage() {
  return (
    <section className={styles.stack}>
      <PageHeader
        eyebrow="Rent"
        title="租金回收"
        description="租金回收模块已经拆成扫描预估和批量回收两个工作页，便于按步骤讲解与执行。"
      />
      <RentSubnav />
      <Outlet />
    </section>
  );
}


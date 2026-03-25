import { Outlet } from "react-router-dom";

import { SectionLayout } from "../../components/section/section-layout";
import { useUi } from "../../components/ui/ui-context";

export function TransfersLayoutPage() {
  const { text } = useUi();

  return (
    <SectionLayout
      eyebrow={text.sections.transfers.eyebrow}
      title={text.sections.transfers.title}
      description={text.sections.transfers.description}
      links={[
        { label: text.nav.overview, to: "/transfers" },
        { label: text.nav.oneToMany, to: "/transfers/one-to-many" },
        { label: text.nav.manyToOne, to: "/transfers/many-to-one" },
        { label: text.nav.manyToMany, to: "/transfers/many-to-many" },
        { label: text.nav.relay, to: "/transfers/relay" }
      ]}
    >
      <Outlet />
    </SectionLayout>
  );
}

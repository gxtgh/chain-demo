import { Outlet } from "react-router-dom";

import { SectionLayout } from "../../components/section/section-layout";
import { useUi } from "../../components/ui/ui-context";

export function WalletsLayoutPage() {
  const { text } = useUi();

  return (
    <SectionLayout
      eyebrow={text.sections.wallets.eyebrow}
      title={text.sections.wallets.title}
      description={text.sections.wallets.description}
      links={[
        { label: text.nav.overview, to: "/wallets" },
        { label: text.nav.batchGenerate, to: "/wallets/generate" }
      ]}
    >
      <Outlet />
    </SectionLayout>
  );
}

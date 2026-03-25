import { Outlet } from "react-router-dom";

import { SectionLayout } from "../../components/section/section-layout";
import { useUi } from "../../components/ui/ui-context";

export function LiquidityLayoutPage() {
  const { text } = useUi();

  return (
    <SectionLayout
      eyebrow={text.sections.liquidity.eyebrow}
      title={text.sections.liquidity.title}
      description={text.sections.liquidity.description}
      links={[
        { label: text.nav.overview, to: "/liquidity" },
        { label: text.nav.createLiquidity, to: "/liquidity/create" },
        { label: text.nav.addLiquidity, to: "/liquidity/add" }
      ]}
    >
      <Outlet />
    </SectionLayout>
  );
}

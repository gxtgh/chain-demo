import { Outlet } from "react-router-dom";

import { SectionLayout } from "../../components/section/section-layout";
import { useUi } from "../../components/ui/ui-context";

export function TokensLayoutPage() {
  const { text } = useUi();

  return (
    <SectionLayout
      eyebrow={text.sections.tokens.eyebrow}
      title={text.sections.tokens.title}
      description={text.sections.tokens.description}
      links={[
        { label: text.nav.overview, to: "/tokens" },
        { label: text.nav.standardToken, to: "/tokens/standard" }
      ]}
    >
      <Outlet />
    </SectionLayout>
  );
}

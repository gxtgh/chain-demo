import type { PropsWithChildren } from "react";

import { AppShell } from "../components/layout/app-shell";
import { AppProviders } from "../components/providers";
import { UiProvider } from "../components/ui/ui-context";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <UiProvider>
      <AppProviders>
        <AppShell>{children}</AppShell>
      </AppProviders>
    </UiProvider>
  );
}

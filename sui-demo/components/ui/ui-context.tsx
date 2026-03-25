import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { messages, type Locale, type MessageDictionary } from "../../lib/i18n/messages";
import { DEFAULT_NETWORK, type AppSuiNetwork } from "../../lib/sui/constants";

type ThemeMode = "light" | "dark";

type UiContextValue = {
  locale: Locale;
  theme: ThemeMode;
  network: AppSuiNetwork;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  setNetwork: (network: AppSuiNetwork) => void;
  text: MessageDictionary;
};

const UiContext = createContext<UiContextValue | null>(null);

function readStorage<T extends string>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(key);
  return (value as T) || fallback;
}

export function UiProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useState<Locale>(() => readStorage("sui-demo-locale", "zh-CN"));
  const [theme, setTheme] = useState<ThemeMode>(() => readStorage("sui-demo-theme", "light"));
  const [network, setNetwork] = useState<AppSuiNetwork>(() => readStorage("sui-demo-network", DEFAULT_NETWORK));

  useEffect(() => {
    window.localStorage.setItem("sui-demo-locale", locale);
  }, [locale]);

  useEffect(() => {
    window.localStorage.setItem("sui-demo-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("sui-demo-network", network);
  }, [network]);

  const value = useMemo<UiContextValue>(
    () => ({
      locale,
      theme,
      network,
      setLocale,
      setTheme,
      setNetwork,
      text: messages[locale]
    }),
    [locale, network, theme]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error("useUi must be used within UiProvider.");
  }
  return context;
}

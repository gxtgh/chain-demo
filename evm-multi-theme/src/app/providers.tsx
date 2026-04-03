import { ConfigProvider, theme as antdTheme } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { mainnet, bsc, bscTestnet, base } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { http } from 'viem'
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, buildAbsoluteUrl } from '@/config/site'
import { getThemeColorDefinition } from '@/config/theme-registry'
import type { RenderMode } from './render-mode'
import { resolveAppPreferences } from './preferences'

const queryClient = new QueryClient()
const projectId = '630c648c23af10f1fe6798c3a8eb3e4e'
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [bsc, bscTestnet, mainnet, base]
let walletRuntime: { wagmiAdapter: WagmiAdapter } | null = null

const metadata = {
  name: SITE_NAME,
  description: 'Create standard EVM tokens with a multi-theme launch toolkit.',
  url: SITE_URL,
  icons: [buildAbsoluteUrl(DEFAULT_OG_IMAGE)],
}

function getWalletRuntime() {
  if (walletRuntime) {
    return walletRuntime
  }

  const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks,
    transports: {
      [bsc.id]: http(),
      [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
      [mainnet.id]: http(),
      [base.id]: http(),
    },
  })

  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks,
    metadata,
    features: {
      analytics: false,
      onramp: false,
      swaps: false,
      send: false,
      receive: false,
      history: false,
    },
  })

  walletRuntime = { wagmiAdapter }
  return walletRuntime
}

export function AppProviders({
  children,
  mode = 'interactive',
}: {
  children: ReactNode
  mode?: RenderMode
}) {
  const location = useLocation()
  const content = useMemo(() => children, [children])
  const antdConfig = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    const [lang, chain] = segments
    const searchParams = new URLSearchParams(location.search)
    const preferences = resolveAppPreferences({
      lang,
      chain,
      theme: searchParams.get('theme'),
      themeColor: searchParams.get('themeColor'),
    })
    const accent = getThemeColorDefinition(preferences.themeColor).accent
    const isDark = preferences.theme === 'dark'
    const accentSoft = toRgba(accent, isDark ? 0.14 : 0.08)
    const accentHover = toRgba(accent, isDark ? 0.1 : 0.05)
    const accentOutline = toRgba(accent, isDark ? 0.18 : 0.12)

    return {
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: accent,
        colorText: isDark ? '#f6efe9' : '#20140f',
        colorTextPlaceholder: isDark ? 'rgba(197, 184, 176, 0.72)' : '#7d655b',
        colorBorder: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(76, 40, 20, 0.1)',
        colorBgContainer: isDark ? 'rgba(28, 28, 36, 0.94)' : 'rgba(255, 255, 255, 0.96)',
        colorBgElevated: isDark ? 'rgba(24, 24, 31, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        borderRadius: 18,
        controlHeight: 54,
        fontFamily: "'SF Pro Display', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', sans-serif",
      },
      components: {
        Select: {
          selectorBg: isDark ? 'rgba(28, 28, 36, 0.94)' : 'rgba(255, 255, 255, 0.96)',
          clearBg: isDark ? 'rgba(28, 28, 36, 0.94)' : 'rgba(255, 255, 255, 0.96)',
          optionSelectedBg: accentSoft,
          optionActiveBg: accentHover,
          activeBorderColor: accent,
          hoverBorderColor: accent,
          activeOutlineColor: accentOutline,
        },
      },
    } as const
  }, [location.pathname, location.search])
  const configProvider = (
    <ConfigProvider
      theme={antdConfig}
    >
      {content}
    </ConfigProvider>
  )

  if (mode === 'static') {
    return configProvider
  }

  const { wagmiAdapter } = getWalletRuntime()

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {configProvider}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function toRgba(hex: string, alpha: number) {
  const sanitized = hex.replace('#', '')
  const normalized = sanitized.length === 3
    ? sanitized.split('').map((char) => `${char}${char}`).join('')
    : sanitized

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

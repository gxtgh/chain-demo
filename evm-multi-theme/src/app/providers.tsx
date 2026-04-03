import { ConfigProvider } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useMemo } from 'react'
import { WagmiProvider } from 'wagmi'
import { mainnet, bsc, bscTestnet, base } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { http } from 'viem'
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, buildAbsoluteUrl } from '@/config/site'
import type { RenderMode } from './render-mode'

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
  const content = useMemo(() => children, [children])
  const configProvider = (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#ff6b2d',
          colorText: '#20140f',
          colorTextPlaceholder: '#7d655b',
          colorBorder: 'rgba(76, 40, 20, 0.1)',
          colorBgContainer: 'rgba(255, 255, 255, 0.96)',
          borderRadius: 18,
          controlHeight: 54,
          fontFamily: "'SF Pro Display', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', sans-serif",
        },
      }}
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

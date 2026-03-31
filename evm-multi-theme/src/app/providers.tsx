import { ConfigProvider } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useMemo } from 'react'
import { WagmiProvider } from 'wagmi'
import { mainnet, bsc, base } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { http } from 'viem'

const queryClient = new QueryClient()
const projectId = '630c648c23af10f1fe6798c3a8eb3e4e'
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [bsc, mainnet, base]

const metadata = {
  name: 'EVM Multi Theme',
  description: 'EVM Multi Theme single-page toolkit',
  url: 'http://localhost:5174',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  transports: {
    [bsc.id]: http(),
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

export function AppProviders({ children }: { children: ReactNode }) {
  const content = useMemo(() => children, [children])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </WagmiProvider>
  )
}

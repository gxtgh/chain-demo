import type { SupportedLang } from './chains'

type TranslationTree = {
  [key: string]: string | TranslationTree
}

const translations: Record<SupportedLang, TranslationTree> = {
  'en-us': {
    nav: {
      appName: 'EVM Demo',
      tagline: 'Single-page token launch case',
      description:
        'A foundation case for multi-chain token launch pages with wallet, theme, language, and AI-assisted form filling.',
      standard: 'Create Standard Token',
      tax: 'Create Tax Token',
      okxTrade: 'OKX Trade Test',
    },
    shell: {
      chain: 'Chain',
      language: 'Language',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      connected: 'Connected',
      connectWallet: 'Connect Wallet',
      connectHint: 'Injected wallet only in this first case version',
      switchNetwork: 'Switch Network',
      notImplemented:
        'Deployment logic is intentionally left as a service placeholder in this case version.',
    },
    common: {
      overview: 'Overview',
      required: 'Required',
      optional: 'Optional',
      aiSuggested: 'AI Suggested',
      submit: 'Confirm Deployment Parameters',
      review: 'Deployment Review',
      risk: 'Risk Check',
      missing: 'Missing Inputs',
      summary: 'Summary',
      applyAll: 'Apply Suggestions',
      applySafe: 'Only Fill Empty Fields',
      generate: 'Generate AI Suggestions',
      explain: 'Explain Field',
      confirmLabel: 'I understand the final deployment action must be confirmed by me.',
      notReady: 'Please complete the required fields before continuing.',
      ready: 'Parameters are ready for the final confirmation step.',
      walletNotConnected: 'Connect a wallet before preparing a deployment request.',
      deploymentPrepared:
        'Deployment request prepared. The actual contract deployment service is still a placeholder in this case.',
      unsupportedRoute: 'Unsupported route. Redirecting to the default page.',
    },
    pages: {
      standard: {
        eyebrow: 'Token Launch',
        title: 'Create Standard Token',
        description:
          'A compact standard token page with only the core launch parameters: name, symbol, total supply, and decimals.',
        aiPlaceholder:
          'Example: Help me create a Base standard token named Slerf Test with symbol SLERF, 100 million supply, and 18 decimals.',
        fields: {
          name: 'Token Name',
          symbol: 'Token Symbol',
          totalSupply: 'Total Supply',
          decimals: 'Decimals',
          recipient: 'Initial Receiver',
          mintable: 'Keep mint permission',
          burnable: 'Enable burn function',
          pausable: 'Enable pause control',
          website: 'Website or Docs URL',
        },
      },
      tax: {
        eyebrow: 'Tax Token',
        title: 'Create Tax Token',
        description:
          'A focused tax token page with core fields for name, symbol, supply, decimals, fee receiver, exchange, and pool token.',
        aiPlaceholder:
          'Example: Make a BSC tax token with 3% buy tax, 5% sell tax, total supply 1 billion, tax fees sent to 0x..., using PancakeSwap and BNB as the pool token.',
        fields: {
          name: 'Token Name',
          symbol: 'Token Symbol',
          totalSupply: 'Total Supply',
          decimals: 'Decimals',
          isSetTax: 'Enable Trading Tax',
          buyTax: 'Buy Tax (%)',
          sellTax: 'Sell Tax (%)',
          taxFeeReceiveAddress: 'Tax Fee Receiver',
          exchange: 'Exchange',
          poolToken: 'Pool Token',
        },
      },
      okxTrade: {
        eyebrow: 'Trade Test',
        title: 'OKX Swap Test',
        description:
          'A private-key-only test page for getting OKX DEX quotes on EVM chains, approving token spend when needed, and sending the final swap transaction.',
        fields: {
          privateKey: 'Private Key',
          fromTokenAddress: 'Token 1 Contract',
          fromTokenAmount: 'Token 1 Amount',
          toTokenAddress: 'Token 2 Contract',
          slippage: 'Slippage (%)',
          fromWrappedNativeMode: 'Token 1 uses native route',
          toWrappedNativeMode: 'Token 2 uses native route',
        },
        quoteSummary: 'Quote Summary',
        executionLogs: 'Swap Execution Logs',
        tokenInfo: 'Token Info',
        steps: {
          quote: 'Get Quote',
          approve: 'Approve Token',
          swap: 'Swap With Private Key',
        },
        notices: {
          privateKey:
            'The private key stays in the browser for this test page, but OKX API credentials are still sensitive and should not be exposed in production.',
          erc20Only:
            'Use the two route switches below to test native -> ERC20, ERC20 -> ERC20, and ERC20 -> native swaps independently.',
          fromWrappedNativeMode:
            'Enable this for native -> ERC20 swaps, such as BNB/ETH to an ERC20 token. Disable it to force Token 1 through the ERC20 approval flow.',
          toWrappedNativeMode:
            'Enable this for ERC20 -> native swaps, such as USDT to BNB/ETH. Disable it if Token 2 should stay as wrapped native ERC20.',
        },
      },
    },
    ai: {
      title: 'AI Launch Copilot',
      description:
        'Frontend-only AI assistance for this case version. It fills suggestions, explains fields, reviews risks, and prepares a human confirmation summary.',
      draftLabel: 'Describe what you want to launch',
      fieldExplainLabel: 'Explain this field',
      explainPlaceholder: 'Example: buyTax',
      warnings: 'Warnings',
      safeMode:
        'This case version never signs or deploys automatically. It only prepares and reviews form values.',
    },
  },
  'zh-cn': {
    nav: {
      appName: 'EVM Demo',
      tagline: '单页面代币创建案例',
      description:
        '一个用于多链代币创建页的基础案例，先把钱包、主题、语言和 AI 辅助填表这套通用壳子搭稳。',
      standard: '创建标准代币',
      tax: '创建税费代币',
      okxTrade: 'OKX 交易测试',
    },
    shell: {
      chain: '链',
      language: '语言',
      theme: '主题',
      light: '浅色',
      dark: '深色',
      connected: '已连接',
      connectWallet: '连接钱包',
      connectHint: '案例第一版仅接入浏览器注入钱包',
      switchNetwork: '切换网络',
      notImplemented: '当前案例版有意保留部署 service 占位，暂不执行真实链上部署。',
    },
    common: {
      overview: '概览',
      required: '必填',
      optional: '可选',
      aiSuggested: 'AI 建议值',
      submit: '确认部署参数',
      review: '部署审阅',
      risk: '风险检查',
      missing: '缺失项',
      summary: '摘要',
      applyAll: '应用全部建议',
      applySafe: '仅补全空字段',
      generate: '生成 AI 建议',
      explain: '解释字段',
      confirmLabel: '我已知晓最终部署动作必须由我亲自确认。',
      notReady: '请先补齐必填字段，再进入确认步骤。',
      ready: '参数已准备好，可以进入最终确认。',
      walletNotConnected: '请先连接钱包，再准备部署请求。',
      deploymentPrepared: '部署请求已准备好。真实合约部署 service 仍是后续待接入占位。',
      unsupportedRoute: '路由参数不受支持，正在跳转到默认页面。',
    },
    pages: {
      standard: {
        eyebrow: 'Token Launch',
        title: '创建标准代币',
        description:
          '这是一个精简版标准代币创建页，只保留名称、符号、总量和小数位四个核心参数。',
        aiPlaceholder:
          '例如：帮我创建一个 Base 链标准代币，名字叫 Slerf Test，符号 SLERF，总量 1 亿，18 位小数。',
        fields: {
          name: '代币名称',
          symbol: '代币符号',
          totalSupply: '总量',
          decimals: '小数位',
          recipient: '初始接收地址',
          mintable: '保留增发权限',
          burnable: '开启销毁能力',
          pausable: '开启暂停控制',
          website: '官网或文档地址',
        },
      },
      tax: {
        eyebrow: 'Tax Token',
        title: '创建税费代币',
        description:
          '这是一个精简版税费代币创建页，聚焦名称、符号、总量、小数位、税费接收地址、交易所和底池币种这些核心参数。',
        aiPlaceholder:
          '例如：帮我做一个 BSC 税费代币，买税 3%，卖税 5%，总量 10 亿，税费打到 0x...，用 PancakeSwap，底池币种选 BNB。',
        fields: {
          name: '代币名称',
          symbol: '代币符号',
          totalSupply: '总量',
          decimals: '小数位',
          isSetTax: '开启交易税',
          buyTax: '买税(%)',
          sellTax: '卖税(%)',
          taxFeeReceiveAddress: '税费接收地址',
          exchange: '交易所',
          poolToken: '底池币种',
        },
      },
      okxTrade: {
        eyebrow: 'Trade Test',
        title: 'OKX 交易测试',
        description:
          '一个仅使用私钥的测试页面，用来调用 OKX DEX 报价、必要时执行授权，并最终发送兑换交易。',
        fields: {
          privateKey: '私钥',
          fromTokenAddress: '代币1合约地址',
          fromTokenAmount: '代币1数量',
          toTokenAddress: '代币2合约地址',
          slippage: '滑点(%)',
          fromWrappedNativeMode: '代币1按原生币路径处理',
          toWrappedNativeMode: '代币2按原生币路径处理',
        },
        quoteSummary: '报价摘要',
        executionLogs: '交易执行日志',
        tokenInfo: '代币信息',
        steps: {
          quote: '获取报价',
          approve: '授权代币',
          swap: '私钥发起交易',
        },
        notices: {
          privateKey:
            '这个测试页会在浏览器内存中使用私钥，但 OKX API 凭证仍然属于敏感信息，不适合直接用于生产环境。',
          erc20Only: '通过下面两个路径开关，可以分别测试 原生币 -> ERC20、ERC20 -> ERC20、ERC20 -> 原生币 这三类交易。',
          fromWrappedNativeMode:
            '做原生币 -> ERC20 时开启，例如 BNB/ETH 换 ERC20；关闭后代币1会强制按 ERC20 授权再交易。',
          toWrappedNativeMode:
            '做 ERC20 -> 原生币 时开启，例如 USDT 换 BNB/ETH；关闭后代币2会保留为包装原生币 ERC20。',
        },
      },
    },
    ai: {
      title: 'AI Launch Copilot',
      description:
        '当前案例版使用前端 AI 辅助，只负责生成建议、解释字段、审阅风险和形成确认摘要。',
      draftLabel: '描述你想要创建的代币',
      fieldExplainLabel: '解释某个字段',
      explainPlaceholder: '例如：buyTax',
      warnings: '风险提示',
      safeMode: '这个案例版绝不会自动签名或自动部署，它只辅助整理和复核表单参数。',
    },
  },
}

export function translate(lang: SupportedLang, key: string) {
  const value = key.split('.').reduce<TranslationTree | string | undefined>((current, part) => {
    if (!current || typeof current === 'string') {
      return current
    }
    return current[part]
  }, translations[lang])

  return typeof value === 'string' ? value : key
}

import { DEFAULT_LANG, type SupportedLang } from '@/config/chains'

interface MessageTree {
  [key: string]: string | MessageTree
}

const messages = {
  'en-us': {
    common: {
      overview: 'Overview',
      exception: {
        possibleReasons: 'Reasons for failure',
        errorReason1: 'The {{chain}} network is congested. Please try again later.',
        errorReason2: 'Please make sure your account has enough balance for the on-chain transaction.',
        contactOfficialSupport: 'If you still cannot find a solution, please contact official support for help.',
      },
    },
    mobile: {
      menu: 'Menu',
      routes: 'Pages',
      settings: 'Settings',
      controls: 'Controls',
    },
    app: {
      name: 'Web3 Token',
      tagline: 'Token Tool Site',
    },
    footer: {
      copyright: 'Web3 Token © 2026',
      emailLabel: 'Email',
    },
    nav: {
      tokenCreation: 'Token Creation',
      projectAcceptance: 'Project Acceptance',
    },
    topbar: {
      language: 'Language',
      theme: 'Theme',
      themeColor: 'Theme Color',
      chain: 'Chain',
    },
    theme: {
      light: 'Light',
      dark: 'Dark',
      orange: 'Orange',
      purple: 'Purple',
      green: 'Green',
    },
    wallet: {
      connect: 'Connect Wallet',
      connecting: 'Connecting...',
      connected: 'Connected',
      disconnect: 'Disconnect',
      wrongChain: 'Switch Chain',
    },
    tokenCreation: {
      eyebrow: '',
      title: 'Create Standard Token',
      description:
        'Create {{symbol}} standard tokens in one minute. Fast, simple, and low-cost {{tokenType}} token creation with no coding required, clean contracts, and one-click issuance.',
      seo: {
        title: 'Create {{chain}} Token | {{symbol}} Token Maker | Fast & Easy & Cheap',
        description:
          'Secure and convenient, create tokens on {{chain}} in just one minute. No coding required—launch your {{symbol}} Chain token with a single click.',
        keywords: '{{chain}} Create Token, Token Maker, {{symbol}} Token Creator',
      },
      fields: {
        name: 'Token Full Name',
        symbol: 'Token Symbol',
        totalSupply: 'Supply',
        decimals: 'Precision',
      },
      labels: {
        factory: 'Factory Contract',
        creationFee: 'Creation Fee',
        explorer: 'Explorer',
        walletAddress: 'Connected Wallet',
      },
      placeholders: {
        name: 'Please enter the token full name',
        symbol: 'Please enter the token symbol',
        totalSupply: 'Please enter the supply',
        decimals: 'Please enter the precision',
      },
      hints: {
        fee: 'The creation fee is read directly from the target factory contract on the selected chain.',
        decimals: 'Use 18 decimals as the default release setting unless your token economics require a different precision.',
        status: 'Submission state and the final token address stay aligned across every theme.',
      },
      tooltips: {
        name: 'The full token name shown in wallets, explorers, and trading interfaces. It is recommended to keep it consistent with your project brand.',
        symbol: 'The short token symbol displayed in wallets and trading interfaces. It is usually made up of letters or numbers.',
        totalSupply: 'The initial total supply of the token. Please confirm it matches your issuance plan before creation.',
        decimals: 'Defines the smallest divisible unit of the token. In most cases, 18 is the recommended default setting.',
        creationFee: 'The creation fee is read from the factory contract on the selected chain. Network gas is charged separately when the transaction is submitted.',
      },
      actions: {
        submit: 'Create Token',
        submitting: 'Submitting...',
        close: 'Close',
        retry: 'Try Again',
      },
      status: {
        idle: 'Fill the form, connect the wallet, and create the token.',
        loadingFee: 'Reading creation fee from the selected chain...',
        preparing: 'Preparing token parameters...',
        waitingWallet: 'Waiting for wallet signature...',
        pending: 'Transaction sent. Waiting for confirmation...',
        success: 'Token created successfully.',
      },
      steps: {
        preparing: 'Generate token information',
        waitingWallet: 'Please sign the transaction',
        pending: 'Token creation in progress',
        completed: 'Creation completed',
        failed: 'Creation failed',
      },
      errors: {
        nameRequired: 'Token name is required.',
        nameTooLong: 'Token name can be at most 100 characters.',
        symbolRequired: 'Token symbol is required.',
        symbolTooLong: 'Token symbol can be at most 100 characters.',
        supplyRequired: 'Total supply is required.',
        supplyInvalid: 'Total supply must be a positive integer.',
        decimalsInvalid: 'Decimals must be between 0 and 18.',
        walletRequired: 'Connect a wallet before submitting.',
        walletUnavailable: 'Injected wallet was not found in this browser.',
        factoryUnavailable: 'Factory contract is not configured for this chain.',
        insufficientBalance: 'Insufficient balance to pay gas and the creation fee.',
        txFailed: 'Transaction failed. Please try again.',
      },
      success: {
        title: 'Token created',
        banner: 'Token created successfully',
        tokenAddress: 'Token Address',
        txHash: 'Transaction Hash',
        openExplorer: 'Open in explorer',
      },
      permission: {
        title: 'Standard Token',
        description:
          'Deploy a standard fungible token contract on an EVM-compatible chain for basic asset issuance, wallet display, and later DEX market setup.',
        highlights: {
          core: 'Standard interface',
          factory: 'Factory deployment',
          noAdmin: 'No admin extensions',
        },
        cards: {
          basicInfo: {
            title: 'Basic Information',
            description:
              'After the token is created successfully, the returned token address can be used for wallet import, explorer lookup, and later liquidity configuration.',
          },
          permissions: {
            title: 'Permissions',
            description:
              'This template is positioned as a base standard token and does not include additional admin-control modules. It does not provide mint, pause, blacklist, whitelist, trading tax, fee receiver, auto-liquidity, or buyback logic.',
          },
          tradingFlow: {
            title: 'Trading Enablement Flow',
            description:
              'Successful deployment only means the token contract exists on-chain. To make the token tradable, you usually still need to import it into wallets, create a DEX pair, add initial liquidity, validate the buy/sell route, and complete logo plus metadata submission.',
          },
        },
        noteOne: 'The current creation flow includes the token name, symbol, total supply, and decimals.',
        noteTwo:
          'This version does not include advanced token logic such as trading tax, blacklist, whitelist, pause, buyback, or automatic liquidity features.',
        noteThree:
          'After token creation, wallet display, liquidity setup, trading access, and metadata submission still need to be handled separately.',
        noteFour: 'Please review the token name, symbol, total supply, and decimals carefully before submitting the transaction.',
      },
      successSummary: {
        title: 'Creation Summary',
        description:
          'Your token has been created successfully. Please keep the following information for wallet display, trading setup, and metadata submission.',
        chain: 'Network',
        name: 'Token Name',
        symbol: 'Token Symbol',
        totalSupply: 'Total Supply',
        decimals: 'Decimals',
        tokenAddress: 'Token Address',
        txHash: 'Transaction Hash',
      },
      nextSteps: {
        title: 'Next Steps',
        description:
          'After your token is created, we recommend completing the following steps to help users identify, view, and trade your token more easily.',
        addWallet: {
          title: 'Add to Wallet',
          description:
            'Add the token address, symbol, and decimals to common wallets and confirm the token information is displayed correctly.',
          action: 'View Guide',
        },
        addLiquidity: {
          title: 'Create Liquidity (DEX)',
          description:
            'Create a trading pair on your target DEX and add the initial liquidity to prepare for market trading.',
          action: 'View Steps',
        },
        goLive: {
          title: 'Enable Trading',
          description:
            'After liquidity is added, check whether the token can already be searched and traded through the target trading entry.',
          action: 'View Suggestions',
        },
        metadata: {
          title: 'Add Logo & Metadata',
          description:
            'Complete the logo, token name, description, website, and social links to improve visibility and recognition.',
          action: 'Complete Info',
        },
        note:
          'Display and listing times may vary across wallets, DEXs, and data platforms. Please refer to each platform for actual availability.',
      },
      modal: {
        progressTitle: 'Creating standard token',
        successTitle: 'Token created successfully',
        errorTitle: 'Token creation failed',
        errorDescription: 'The transaction did not complete on-chain. Check your wallet state and balance, then try again.',
        progressTip: 'Token information is being prepared and the wallet will ask you to confirm the transaction before it is broadcast on-chain.',
        errorReasonLabel: 'Possible reasons',
        errorReasonOne: 'The selected wallet balance is not enough to cover gas and the creation fee.',
        errorReasonTwo: 'The current chain or factory contract is unavailable, or the transaction was rejected in the wallet.',
      },
      themes: {
        orange: 'Atlas theme',
        purple: 'Pulse theme',
        green: 'Forge theme',
      },
    },
    acceptance: {
      eyebrow: 'Internal Workspace',
      title: 'Project Acceptance',
      description:
        'A static, role-based acceptance workspace for reviewing feature progress, task status, risks, and next milestones.',
      seo: {
        title: 'Project Acceptance Workspace | {{chain}} Delivery Board',
        description:
          'Track feature completion, task progress, role-based delivery status, and launch readiness for the current {{chain}} workspace.',
        keywords: '{{chain}} project acceptance, delivery board, role progress, launch readiness',
      },
      summary: {
        project: 'Project',
        stage: 'Current Stage',
        completion: 'Overall Completion',
        risks: 'High Risks',
        completedFeatures: 'Completed Features',
        inProgressFeatures: 'In Progress',
        backlogFeatures: 'Backlog',
      },
      sections: {
        functions: 'Function Acceptance',
        roles: 'Role Progress Board',
        tasks: 'Task Breakdown',
        risks: 'Risks & Next Steps',
        links: 'Links',
      },
      labels: {
        completion: 'Completion',
        status: 'Status',
        owner: 'Owner',
        updatedAt: 'Updated',
        role: 'Role',
        priority: 'Priority',
        blocked: 'Blocked',
        note: 'Note',
        themes: 'Themes',
      },
      roles: {
        productDiscovery: 'Product Discovery',
        productDelivery: 'Product Delivery',
        engineering: 'Engineering',
        qa: 'QA',
        lead: 'Project Lead',
        userAcceptance: 'User Acceptance',
      },
      statuses: {
        not_started: 'Not Started',
        in_progress: 'In Progress',
        blocked: 'Blocked',
        done: 'Done',
      },
      priorities: {
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      },
      actions: {
        openFeature: 'Open feature page',
      },
    },
  },
  'zh-cn': {
    common: {
      overview: '概览',
      exception: {
        possibleReasons: '失败的原因',
        errorReason1: '{{chain}}链上拥堵，请稍后再试。',
        errorReason2: '请确保您的账户有足够的余额进行上链操作。',
        contactOfficialSupport: '如果您仍无法找到解决方案，请联系官方客服以获取帮助。',
      },
    },
    mobile: {
      menu: '菜单',
      routes: '页面导航',
      settings: '页面设置',
      controls: '页面控制',
    },
    app: {
      name: 'Web3 代币',
      tagline: '代币工具站',
    },
    footer: {
      copyright: 'Web3 Token © 2026',
      emailLabel: 'Email',
    },
    nav: {
      tokenCreation: '标准代币',
      projectAcceptance: '项目验收',
    },
    topbar: {
      language: '语言',
      theme: '主题',
      themeColor: '主题色',
      chain: '链',
    },
    theme: {
      light: '白天',
      dark: '黑暗',
      orange: '橙色',
      purple: '紫色',
      green: '绿色',
    },
    wallet: {
      connect: '连接钱包',
      connecting: '连接中...',
      connected: '已连接',
      disconnect: '断开连接',
      wrongChain: '切换网络',
    },
    tokenCreation: {
      eyebrow: '',
      title: '创建普通代币',
      description:
        '{{symbol}}标准代币创建，一分钟快速创建{{tokenType}}代币，快速简单且便宜，无需任何编程，干净合约，无税无功能，一键发行你的专属代币。',
      seo: {
        title: '创建{{chain}}代币 | {{symbol}} 一键发币 | 快速、简单且便宜',
        description: '安全便捷，一分钟快速在 {{chain}} 上创建代币，无需任何编程，一键发行您的 {{symbol}} Chain 代币！',
        keywords: '{{chain}} Create Token,Token Maker,{{symbol}} Token Creator',
      },
      fields: {
        name: '代币全称',
        symbol: '代币简称',
        totalSupply: '发行量',
        decimals: '精度',
      },
      labels: {
        factory: '工厂合约',
        creationFee: '创建费',
        explorer: '浏览器',
        walletAddress: '当前钱包',
      },
      placeholders: {
        name: '请输入代币全称',
        symbol: '请输入代币简称',
        totalSupply: '请输入发行量',
        decimals: '请输入精度',
      },
      hints: {
        fee: '创建费会直接从当前链的工厂合约里读取。',
        decimals: '除非你的代币经济模型有特殊要求，否则建议沿用 18 位小数。',
        status: '提交状态和最终代币地址会在 3 套主题里保持一致。',
      },
      tooltips: {
        name: '代币在钱包、区块浏览器和交易界面中展示的完整名称，建议与项目品牌名称保持一致。',
        symbol: '代币在钱包和交易界面中展示的简称，通常由字母或数字组成。',
        totalSupply: '代币的初始总发行量，创建前请确认是否符合你的发行计划。',
        decimals: '决定代币最小可分割单位，常规场景下建议使用 18 作为默认值。',
        creationFee: '创建费会从当前所选链的工厂合约中读取，提交交易时仍需另外支付链上 Gas。',
      },
      actions: {
        submit: '创建代币',
        submitting: '提交中...',
        close: '关闭',
        retry: '重试',
      },
      status: {
        idle: '填写表单并连接钱包后，即可发起标准代币创建。',
        loadingFee: '正在读取当前链的创建费...',
        preparing: '正在生成代币参数...',
        waitingWallet: '等待钱包签名...',
        pending: '交易已发送，等待链上确认...',
        success: '代币创建成功。',
      },
      steps: {
        preparing: '生成代币信息',
        waitingWallet: '请签名确认交易',
        pending: '正在创建代币',
        completed: '创建完成',
        failed: '创建失败',
      },
      errors: {
        nameRequired: '请输入代币名称。',
        nameTooLong: '代币名称最多 100 个字符。',
        symbolRequired: '请输入代币符号。',
        symbolTooLong: '代币符号最多 100 个字符。',
        supplyRequired: '请输入总量。',
        supplyInvalid: '总量必须是正整数。',
        decimalsInvalid: '小数位必须在 0 到 18 之间。',
        walletRequired: '提交前请先连接钱包。',
        walletUnavailable: '当前浏览器没有检测到注入钱包。',
        factoryUnavailable: '当前链没有配置标准代币工厂合约。',
        insufficientBalance: '当前余额不足以支付 gas 和创建费。',
        txFailed: '交易执行失败，请稍后再试。',
      },
      success: {
        title: '代币已创建',
        banner: '代币创建成功',
        tokenAddress: '代币地址',
        txHash: '交易哈希',
        openExplorer: '打开区块浏览器',
      },
      permission: {
        title: '标准代币',
        description:
          '在 EVM 兼容链上部署标准同质化代币合约，适用于基础资产发行、钱包展示以及后续在 DEX 建立交易市场。',
        highlights: {
          core: '标准接口代币',
          factory: '工厂合约部署',
          noAdmin: '无扩展管理权限',
        },
        cards: {
          basicInfo: {
            title: '基础信息',
            description:
              '代币创建成功后，返回的代币地址可用于钱包导入、浏览器查询以及后续的流动性配置。',
          },
          permissions: {
            title: '权限',
            description:
              '定位为基础标准代币，不集成额外的管理权限模块。默认不包含增发、暂停、黑白名单、交易税、手续费接收地址、自动流动性或回购等扩展控制逻辑。',
          },
          tradingFlow: {
            title: '实现交易流程',
            description:
              '代币创建成功仅代表合约已经部署，不等于已经具备可交易性。通常仍需完成钱包导入、DEX 建对、注入初始流动性、验证买卖路径，以及提交 Logo 与 Metadata 等后续步骤。',
          },
        },
        noteOne: '当前创建流程包含代币名称、简称、发行量和精度四项基础信息。',
        noteTwo: '当前版本不包含交易税、黑白名单、暂停、回购、自动流动性等复杂逻辑。',
        noteThree: '代币创建完成后，钱包展示、流动性配置、交易入口和资料提交仍需你后续单独处理。',
        noteFour: '提交交易前，请重点确认代币名称、简称、发行量和精度是否填写正确。',
      },
      successSummary: {
        title: '创建摘要',
        description: '代币已创建成功，请保存以下信息，便于后续添加钱包、配置交易和补充资料。',
        chain: '所在网络',
        name: '代币名称',
        symbol: '代币简称',
        totalSupply: '发行量',
        decimals: '精度',
        tokenAddress: '代币地址',
        txHash: '交易哈希',
      },
      nextSteps: {
        title: '下一步建议',
        description: '代币创建成功后，建议继续完成以下步骤，帮助用户更快识别、查看并交易你的代币。',
        addWallet: {
          title: '添加到钱包',
          description: '将代币地址、简称和精度添加到常用钱包，确认代币信息显示正常。',
          action: '查看添加方式',
        },
        addLiquidity: {
          title: '创建流动性（DEX）',
          description: '在目标 DEX 创建交易对并添加首笔流动性，为后续交易做好准备。',
          action: '查看操作步骤',
        },
        goLive: {
          title: '开启交易支持',
          description: '完成流动性配置后，检查代币是否已可在目标交易入口中搜索和交易。',
          action: '查看交易建议',
        },
        metadata: {
          title: '完善 Logo 与代币资料',
          description: '补充 Logo、名称、简介、官网和社媒等资料，提升展示完整度与识别度。',
          action: '去完善资料',
        },
        note: '不同钱包、DEX 和数据平台的展示与收录时间可能存在差异，请以各平台实际生效情况为准。',
      },
      modal: {
        progressTitle: '正在创建标准代币',
        successTitle: '代币创建成功',
        errorTitle: '代币创建失败',
        errorDescription: '本次交易没有在链上成功完成，请检查钱包状态和余额后再试。',
        progressTip: '系统会先生成代币参数，然后由钱包弹出签名确认，确认后再把交易广播到链上。',
        errorReasonLabel: '可能原因',
        errorReasonOne: '当前钱包余额不足以支付 gas 和创建费。',
        errorReasonTwo: '当前链或工厂合约不可用，或者交易在钱包侧被拒绝。',
      },
      themes: {
        orange: 'Atlas 工具主题',
        purple: 'Pulse 营销主题',
        green: 'Forge 控制台主题',
      },
    },
    acceptance: {
      eyebrow: '内部工作台',
      title: '项目功能验收',
      description:
        '一个静态配置驱动的角色化验收工作台，用来查看功能进展、任务状态、风险和下一阶段里程碑。',
      seo: {
        title: '{{chain}} 项目功能验收工作台',
        description: '查看当前 {{chain}} 工作区下的功能完成度、岗位进度、任务状态与上线准备情况。',
        keywords: '{{chain}} 项目验收, 功能进度, 岗位看板, 上线准备',
      },
      summary: {
        project: '项目',
        stage: '当前阶段',
        completion: '总体完成度',
        risks: '高风险项',
        completedFeatures: '已完成功能',
        inProgressFeatures: '进行中功能',
        backlogFeatures: '待启动功能',
      },
      sections: {
        functions: '功能验收列表',
        roles: '岗位进度板',
        tasks: '任务级明细',
        risks: '风险与下一步',
        links: '相关链接',
      },
      labels: {
        completion: '完成度',
        status: '状态',
        owner: '负责人',
        updatedAt: '更新时间',
        role: '岗位',
        priority: '优先级',
        blocked: '是否阻塞',
        note: '备注',
        themes: '主题试点',
      },
      roles: {
        productDiscovery: '产品构思',
        productDelivery: '产品落地',
        engineering: '开发',
        qa: '测试',
        lead: '总负责',
        userAcceptance: '用户验收',
      },
      statuses: {
        not_started: '未开始',
        in_progress: '进行中',
        blocked: '阻塞',
        done: '已完成',
      },
      priorities: {
        high: '高',
        medium: '中',
        low: '低',
      },
      actions: {
        openFeature: '打开功能页',
      },
    },
  },
} satisfies Record<SupportedLang, MessageTree>

function lookupMessage(tree: MessageTree, path: string) {
  return path.split('.').reduce<string | MessageTree | undefined>((current, key) => {
    if (!current || typeof current === 'string') return current
    return current[key]
  }, tree)
}

export function createTranslator(lang: SupportedLang) {
  return (key: string, vars?: Record<string, string | number>) => {
    const localeTree = messages[lang] ?? messages[DEFAULT_LANG]
    const raw = lookupMessage(localeTree, key)
    if (typeof raw !== 'string') {
      return key
    }
    return Object.entries(vars ?? {}).reduce((message, [token, value]) => {
      return message.replaceAll(`{{${token}}}`, String(value))
    }, raw)
  }
}

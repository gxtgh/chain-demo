import { DEFAULT_LANG, type SupportedLang } from '@/config/chains'

interface MessageTree {
  [key: string]: string | MessageTree
}

const messages = {
  'en-us': {
    common: {
      overview: 'Overview',
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
      },
      hints: {
        fee: 'The creation fee is read directly from the target factory contract on the selected chain.',
        decimals: 'Use 18 decimals as the default release setting unless your token economics require a different precision.',
        status: 'Submission state and the final token address stay aligned across every theme.',
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
        txFailed: 'Transaction failed. Please try again.',
      },
      success: {
        title: 'Token created',
        banner: 'Token created successfully',
        tokenAddress: 'Token Address',
        txHash: 'Transaction Hash',
        openExplorer: 'Open in explorer',
      },
      modal: {
        progressTitle: 'Creating standard token',
        successTitle: 'Token created successfully',
        errorTitle: 'Token creation failed',
        errorDescription: 'The transaction did not complete on-chain. Check your wallet state and balance, then try again.',
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
      },
      hints: {
        fee: '创建费会直接从当前链的工厂合约里读取。',
        decimals: '除非你的代币经济模型有特殊要求，否则建议沿用 18 位小数。',
        status: '提交状态和最终代币地址会在 3 套主题里保持一致。',
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
        txFailed: '交易执行失败，请稍后再试。',
      },
      success: {
        title: '代币已创建',
        banner: '代币创建成功',
        tokenAddress: '代币地址',
        txHash: '交易哈希',
        openExplorer: '打开区块浏览器',
      },
      modal: {
        progressTitle: '正在创建标准代币',
        successTitle: '代币创建成功',
        errorTitle: '代币创建失败',
        errorDescription: '本次交易没有在链上成功完成，请检查钱包状态和余额后再试。',
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

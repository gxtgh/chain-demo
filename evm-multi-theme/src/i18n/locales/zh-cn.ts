import type { MessageTree } from '../message-tree'

export const zhCnMessages = {
  common: {
    overview: '概览',
    backToTop: '回到顶部',
    nativeToken: '原生币',
    copy: {
      idle: '复制',
      copied: '已复制',
      success: '复制成功',
      failed: '复制失败',
    },
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
    tagline: '专业代币工具',
  },
  footer: {
    copyright: 'Web3 Token © 2026',
    emailLabel: 'Email',
  },
  nav: {
    tokenCreation: '标准代币',
    tokenTaxCreation: '税费代币',
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
    title: '创建标准代币',
    description:
      '{{standard}} 标准代币创建，一分钟快速创建 {{tokenType}} 代币，快速简单且便宜，无需任何编程，干净合约，无税无功能，一键发行你的专属代币。',
    seo: {
      title: '创建 {{chain}} {{tokenType}} 代币 | 快速、简单且便宜',
      description: '安全便捷，一分钟快速在 {{chain}} 上创建 {{tokenType}} 代币，无需任何编程，适合标准代币发行场景。',
      keywords: '创建 {{tokenType}} 代币, {{tokenType}} 发币, {{chain}} Token Maker',
    },
    fields: {
      name: '代币全称',
      symbol: '代币简称',
      totalSupply: '发行量',
      decimals: '精度',
    },
    labels: {
      creationFee: '创建费',
    },
    placeholders: {
      name: '请输入代币全称',
      symbol: '请输入代币简称',
      totalSupply: '请输入发行量',
      decimals: '请输入精度',
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
      },
      addLiquidity: {
        title: '创建流动性（DEX）',
        description: '在目标 DEX 创建交易对并添加首笔流动性，为后续交易做好准备。',
      },
      goLive: {
        title: '开启交易支持',
        description: '完成流动性配置后，检查代币是否已可在目标交易入口中搜索和交易。',
      },
      metadata: {
        title: '完善 Logo 与代币资料',
        description: '补充 Logo、名称、简介、官网和社媒等资料，提升展示完整度与识别度。',
      },
      note: '不同钱包、DEX 和数据平台的展示与收录时间可能存在差异，请以各平台实际生效情况为准。',
    },
    seoBody: {
      highlights: {
        title: '适用目标人群',
        builder: {
          title: '项目方与运营团队',
          description:
            '当你需要为产品积分、社区发行、访问凭证或试点资产创建一个干净的标准代币合约时，这个流程更适合快速落地。',
        },
        agency: {
          title: '代发团队与自由职业者',
          description:
            '如果你需要为多个客户项目重复执行代币发行，这套共享流程可以减少反复维护自定义样板合约的成本。',
        },
        noCode: {
          title: '没有 Solidity 开发资源的团队',
          description:
            '你仍然需要钱包、Gas 和基本参数判断，但标准 {{tokenType}} 发币并不要求你自己编写合约代码。',
        },
      },
      faq: {
        title: '常见问题',
        noCode: {
          question: '在 {{chain}} 上创建代币需要会写代码吗？',
          answer:
            '不需要写代码。标准代币创建流程已经封装好了主要逻辑，但你仍需要理解代币名称、发行量、精度、钱包操作和创建后的基础上线步骤。',
        },
        fee: {
          question: '创建费里包含 Gas 吗？',
          answer:
            '不包含。创建费和链上 Gas 是两笔独立成本。页面会读取工厂创建费，真正提交交易时则由钱包再估算并支付 Gas。',
        },
        standard: {
          question: '当前创建出来的是什么类型的代币合约？',
          answer:
            '当前流程定位为 {{chain}} 上的标准同质化代币，适合基础发行场景；默认不额外集成复杂管理权限模块。',
        },
        trade: {
          question: '代币创建后会立刻可以交易吗？',
          answer:
            '不会自动可交易。合约部署成功只代表代币存在了，通常还需要导入钱包、建立 DEX 交易对、注入初始流动性，并验证买卖路径是否正常。',
        },
        decimals: {
          question: '精度可以在创建完成后再修改吗？',
          answer:
            '不能。精度属于部署时就写入合约的核心参数，标准代币创建完成后不能再改，所以签名前务必确认。',
        },
        chainChoice: {
          question: '为什么要选择 {{chain}} 发币？',
          answer:
            '{{chain}} 和其他 EVM 链相比，可能在 Gas 成本、钱包普及度、生态用户和上线后的分发效率上都不同。选链时应优先匹配你的受众和预算，而不是只看是否便宜。',
        },
      },
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
  tokenTaxCreation: {
    eyebrow: '',
    title: '创建税费代币',
    description:
      '在 {{chain}} 上快速创建 {{tokenType}} 税费代币，支持买入税、卖出税、税费接收地址以及默认交易对配置，无需编写合约代码。',
    seo: {
      title: '创建 {{chain}} {{tokenType}} 税费代币 | 买卖税快速部署',
      description:
        '一页完成 {{chain}} {{tokenType}} 税费代币创建，支持买入税、卖出税、税费接收地址和交易对底池币设置，适合需要交易税逻辑的代币发行场景。',
      keywords: '创建 {{tokenType}} 税费代币, 买卖税代币, {{chain}} Tax Token Maker, Token Tax Creator',
    },
    fields: {
      name: '代币全称',
      symbol: '代币简称',
      totalSupply: '发行量',
      decimals: '精度',
      buyTax: '买入税',
      sellTax: '卖出税',
      taxReceiver: '税费接收地址',
      exchange: '添加流动性的交易所',
      poolToken: '底池配对币种',
    },
    labels: {
      creationFee: '创建费',
      taxConfiguration: '税费配置',
      taxConfigurationNote: '税费代币模式下，交易产生的税费将自动转入至代币创建者的钱包地址中。',
      taxReceiverDefault: '留空时默认使用当前连接钱包地址作为税费接收地址。',
      poolTokenNote: '用于记录默认配对币种信息，支持从预设币种中选择，也支持输入自定义代币地址。',
    },
    placeholders: {
      name: '请输入代币全称',
      symbol: '请输入代币简称',
      totalSupply: '请输入发行量',
      decimals: '请输入精度',
      buyTax: '请输入买入税，例如 5',
      sellTax: '请输入卖出税，例如 5',
      taxReceiver: '请输入税费接收地址，留空默认当前钱包地址',
      poolToken: '请选择或输入底池币种地址',
    },
    tooltips: {
      name: '代币在钱包、区块浏览器和交易界面中展示的完整名称，建议与项目品牌名称保持一致。',
      symbol: '代币在钱包和交易界面中展示的简称，通常由字母或数字组成。',
      totalSupply: '代币的初始总发行量，创建前请确认是否符合你的发行计划。',
      decimals: '决定代币最小可分割单位，常规场景下建议使用 18 作为默认值。',
      buyTax: '买入税按百分比填写，支持最多两位小数，当前限制在 0 到 25 之间。',
      sellTax: '卖出税按百分比填写，支持最多两位小数，当前限制在 0 到 25 之间。',
      taxReceiver: '税费接收地址用于接收买卖产生的税费；如果留空，则默认使用当前提交交易的钱包地址。',
      exchange: '税费代币部署后，支持在该交易所执行税费模式。',
      poolToken:
        '请选择交易底池代币（如 {{nativeSymbol}}、{{stableSymbol}} 等），后续流动性必须使用相同底池代币，确保代币交易正常运行。',
      creationFee: '创建费会从当前所选税费工厂中读取，提交交易时仍需另外支付链上 Gas。',
    },
    actions: {
      submit: '创建税费代币',
      submitting: '提交中...',
      close: '关闭',
      retry: '重试',
    },
    status: {
      searchingToken: '正在链上搜索代币...',
      noTokenInfo: '暂无代币信息',
    },
    steps: {
      preparing: '生成税费代币参数',
      waitingWallet: '请签名确认交易',
      pending: '正在创建税费代币',
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
      buyTaxInvalid: '买入税必须是 0 到 25 之间、最多两位小数的数值。',
      sellTaxInvalid: '卖出税必须是 0 到 25 之间、最多两位小数的数值。',
      taxReceiverInvalid: '请输入有效的 EVM 地址。',
      exchangeRequired: '请选择默认交易所。',
      poolTokenRequired: '请选择或输入底池币种。',
      tokenLookupFailed: '代币地址解析失败，请确认该地址为有效 ERC20 合约。',
      walletRequired: '提交前请先连接钱包。',
      walletUnavailable: '当前浏览器没有检测到注入钱包。',
      factoryUnavailable: '当前链没有配置税费代币工厂合约。',
      insufficientBalance: '当前余额不足以支付 gas 和创建费。',
    },
    success: {
      title: '税费代币已创建',
      banner: '税费代币创建成功',
      tokenAddress: '代币地址',
      txHash: '交易哈希',
    },
    overview: {
      title: '税费代币',
      description:
        '该流程适用于需要链上买卖税配置的 {{tokenType}} 代币发行场景，适合在发币阶段同步确认税率、接收地址和默认配对设置。',
      highlights: {
        base: '税费发行',
        buy: '买入税配置',
        sell: '卖出税配置',
        receiver: '税费接收地址',
      },
      cards: {
        taxPlan: {
          title: '税率计划',
          description:
            '买入税和卖出税会在部署时写入合约初始配置，适合需要明确费率展示、交易路径验证和后续运营对账的发行场景。',
        },
        receiver: {
          title: '接收地址',
          description:
            '税费接收地址支持单独指定；如未填写，则默认使用当前连接钱包地址，适合快速部署，也方便后续切换到独立运营或归集钱包。',
        },
        trading: {
          title: '交易准备',
          description:
            '当前页面仅负责部署代币并记录默认交易所与配对币种，不会自动创建流动性、加池或做市；如需开始交易，仍需自行完成建对与首笔流动性配置。',
        },
      },
    },
    successSummary: {
      title: '创建摘要',
      description: '税费代币已创建成功，请保存以下参数和链上信息，便于后续核对费率设置、钱包展示和资料补充。',
      chain: '所在网络',
      name: '代币名称',
      symbol: '代币简称',
      totalSupply: '发行量',
      decimals: '精度',
      buyTax: '买入税',
      sellTax: '卖出税',
      exchange: '默认交易所',
      poolToken: '底池配对币种',
      taxReceiver: '税费接收地址',
      tokenAddress: '代币地址',
      txHash: '交易哈希',
    },
    nextSteps: {
      title: '下一步建议',
      description: '税费代币部署完成后，建议继续完成以下步骤，帮助团队更快完成展示准备、流动性配置和交易验证。',
      addWallet: {
        title: '添加到钱包',
        description: '将代币地址、简称和精度添加到常用钱包，确认代币信息显示正常。',
      },
      verifyFees: {
        title: '创建流动性（DEX）',
        description: '在目标 DEX 使用本次选定的默认配对币种创建交易对并添加首笔流动性，为后续买卖测试做好准备。',
      },
      reviewPairing: {
        title: '验证税率与交易路径',
        description: '完成加池后，用小额买入和卖出确认税率、税费接收地址以及默认交易路径是否符合预期。',
      },
      metadata: {
        title: '完善 Logo 与代币资料',
        description: '补充 Logo、简介、官网和社媒等资料，提升钱包、浏览器和资料页的展示完整度。',
      },
      note: '当前页面只负责部署税费代币，不包含创建流动性、加池或做市操作。',
    },
    seoBody: {
      highlights: {
        title: '适用场景',
        template: {
          title: '需要交易税逻辑的项目',
          description:
            '如果你的 {{tokenType}} 代币发行需要明确的买卖税设置，这个流程会比标准代币流程更适合，因为税率相关参数会在创建阶段一并确认。',
        },
        control: {
          title: '代发团队与运营协作',
          description:
            '对代发团队、工作室或运营团队来说，税率、税费接收地址、默认交易所与配对币种能在单页里集中确认，减少交付和沟通成本。',
        },
        receiver: {
          title: '需要独立税费归集地址',
          description:
            '如果项目需要将交易税统一归集到指定地址，这个流程可以在部署时直接记录税费接收地址，而不需要后续再通过其他页面补配置。',
        },
      },
      faq: {
        title: '常见问题',
        noCode: {
          question: '在 {{chain}} 上创建税费代币需要自己写合约吗？',
          answer:
            '不需要自己编写 Solidity 合约。当前流程基于预设税费工厂完成部署，但你仍需要确认代币名称、发行量、税率和税费接收地址等关键参数。',
        },
        fee: {
          question: '创建费里包含 Gas 吗？',
          answer:
            '不包含。创建费来自税费工厂合约本身，而链上 Gas 由钱包在提交交易时单独估算和支付。',
        },
        template: {
          question: '这个页面创建的是标准代币还是税费代币？',
          answer:
            '当前页面固定为税费代币创建流程，不提供切换到标准代币创建流程的开关。买入税、卖出税、税费接收地址和默认配对设置都属于当前部署流程的一部分。',
        },
        receiver: {
          question: '税费接收地址可以留空吗？',
          answer:
            '可以。留空时系统会默认使用当前提交交易的钱包地址作为税费接收地址。如果你的项目有单独的运营或归集地址，建议在创建前直接填入。',
        },
        poolToken: {
          question: '为什么要选择底池配对币种？',
          answer:
            '底池币种用于记录这个税费代币默认面向哪种配对资产，常见选择包括链原生币和稳定币。它不会替你自动创建流动性，但能帮助你保存当前的市场配置意图，后续建池时通常也应与这里保持一致。',
        },
        liquidity: {
          question: '页面会自动帮我创建流动性或交易池吗？',
          answer:
            '不会。当前页面仅负责部署税费代币，并返回代币地址与交易哈希，不包含创建流动性、加池或做市功能。',
        },
      },
    },
    modal: {
      progressTitle: '正在创建税费代币',
      successTitle: '税费代币创建成功',
      errorTitle: '税费代币创建失败',
      errorDescription: '本次交易没有在链上成功完成，请检查钱包状态、网络和余额后再试。',
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
} satisfies MessageTree

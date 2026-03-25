export type Locale = "zh-CN" | "en-US";

export const messages = {
  "zh-CN": {
    shell: {
      brandTitle: "Sui 工具案例",
      brandDescription: "从 sui_dev_cp 抽功能，重组为更轻量、更便于继续扩展的案例工作台。",
      workspace: "工作台",
      network: "网络",
      mainnet: "主网",
      testnet: "测试网",
      devnet: "开发网",
      localnet: "本地网络",
      connectHint: "连接 Sui 钱包后开始操作",
      theme: "主题",
      language: "语言",
      light: "浅色",
      dark: "深色"
    },
    nav: {
      dashboard: "概览",
      overview: "总览",
      tokens: "代币",
      tokenCases: "代币案例",
      standardToken: "标准代币",
      wallets: "钱包",
      walletCases: "钱包案例",
      batchGenerate: "批量生成",
      transfers: "转账",
      transferCases: "转账案例",
      oneToMany: "一转多",
      manyToOne: "多转一",
      manyToMany: "多转多",
      relay: "中转",
      liquidity: "流动性",
      liquidityCases: "流动性案例",
      createLiquidity: "创建流动性",
      addLiquidity: "添加流动性",
      trading: "交易",
      trade: "交易"
    },
    home: {
      eyebrow: "概览",
      title: "Sui Demo 工作台",
      description:
        "这个案例项目参考了 solana-demo 的分区路由结构，同时从 eth-tools 的 sui_dev_cp 分支里抽出可复用的 Sui 核心能力，重新整理成一个更易读、便于继续扩展的 Demo。",
      openCase: "打开案例",
      cards: {
        standardToken: {
          title: "标准代币",
          description: "使用 Move 模板包发布标准代币，并完成 init_currency 初始化。"
        },
        wallets: {
          title: "批量生成钱包",
          description: "本地生成 Ed25519 钱包并导出 JSON / CSV。"
        },
        transfers: {
          title: "批量转账",
          description: "覆盖一转多、多转一、多转多和中转场景，聚焦 SUI 原生币。"
        },
        liquidity: {
          title: "流动性",
          description: "对接 Cetus SDK，支持创建池子和添加流动性。"
        },
        trade: {
          title: "交易",
          description: "使用 Cetus Aggregator 获取路由并执行交易。"
        }
      }
    },
    sections: {
      tokens: {
        eyebrow: "代币",
        title: "代币案例",
        description: "当前先落标准代币案例，重点保留 sui_dev_cp 里真正有链上动作的模板发布与 init_currency 流程。",
        overviewTitle: "标准代币",
        overviewDescription: "发布标准 Sui 代币模板包并初始化货币信息，适合做基础代币案例。"
      },
      wallets: {
        eyebrow: "钱包",
        title: "钱包案例",
        description: "钱包案例目前先保留最直观的批量生成功能，后续可以继续叠加余额查询、迁移等扩展。",
        overviewTitle: "批量生成钱包",
        overviewDescription: "本地生成钱包、导出文件、复制地址和私钥，适合作为 Sui 私钥工具能力的基础案例。"
      },
      transfers: {
        eyebrow: "转账",
        title: "转账案例",
        description: "批量转账页统一围绕 SUI 原生币构建，这样案例链路更稳定，后面要扩展 Coin<T> 也有明确落点。",
        cards: {
          oneToMany: { title: "一转多", description: "支持连接钱包或单私钥，将 SUI 拆分后批量发送。" },
          manyToOne: { title: "多转一", description: "从多组私钥归集到一个目标地址，支持逐行覆盖数量。" },
          manyToMany: { title: "多转多", description: "按私钥、接收地址、金额三列批量执行。" },
          relay: { title: "中转", description: "生成中继钱包并逐跳转发，适合案例演示中转路径。" }
        }
      },
      liquidity: {
        eyebrow: "流动性",
        title: "流动性案例",
        description: "这部分直接复用 sui_dev_cp 里的 Cetus 思路，保留创建池子和添加流动性两块核心案例。",
        cards: {
          create: { title: "创建流动性", description: "创建 Cetus CLMM 池子，并用固定侧金额完成初始入池。" },
          add: { title: "添加流动性", description: "基于现有池子估算另一侧数量，然后打开新区间头寸。" }
        }
      }
    },
    common: {
      connectedWallet: "已连接钱包",
      connected: "已连接",
      notConnected: "未连接",
      address: "地址",
      status: "状态",
      executionLogs: "执行日志",
      items: "项",
      noLogs: "还没有执行日志。",
      walletMode: "钱包签名",
      privateMode: "私钥签名",
      privateKey: "Sui 私钥",
      submit: "提交",
      preview: "预览",
      success: "成功",
      error: "错误",
      info: "信息"
    }
  },
  "en-US": {
    shell: {
      brandTitle: "Sui Tool Cases",
      brandDescription:
        "A lighter, cleaner workspace rebuilt from the sui_dev_cp branch for easier demos and follow-up expansion.",
      workspace: "Workspace",
      network: "Network",
      mainnet: "Mainnet",
      testnet: "Testnet",
      devnet: "Devnet",
      localnet: "Localnet",
      connectHint: "Connect a Sui wallet to start",
      theme: "Theme",
      language: "Language",
      light: "Light",
      dark: "Dark"
    },
    nav: {
      dashboard: "Dashboard",
      overview: "Overview",
      tokens: "Tokens",
      tokenCases: "Token Cases",
      standardToken: "Standard Token",
      wallets: "Wallets",
      walletCases: "Wallet Cases",
      batchGenerate: "Batch Generate",
      transfers: "Transfers",
      transferCases: "Transfer Cases",
      oneToMany: "One To Many",
      manyToOne: "Many To One",
      manyToMany: "Many To Many",
      relay: "Relay",
      liquidity: "Liquidity",
      liquidityCases: "Liquidity Cases",
      createLiquidity: "Create Liquidity",
      addLiquidity: "Add Liquidity",
      trading: "Trading",
      trade: "Trade"
    },
    home: {
      eyebrow: "Overview",
      title: "Sui Demo Workspace",
      description:
        "This case project follows the sectioned routing style from solana-demo and rebuilds reusable Sui capabilities from the sui_dev_cp branch into a cleaner demo workspace.",
      openCase: "Open case",
      cards: {
        standardToken: {
          title: "Standard Token",
          description: "Publish a Move token template package and run init_currency to initialize it."
        },
        wallets: {
          title: "Batch Wallets",
          description: "Generate Ed25519 wallets locally and export them as JSON or CSV."
        },
        transfers: {
          title: "Batch Transfers",
          description: "Cover one-to-many, many-to-one, many-to-many, and relay flows with native SUI."
        },
        liquidity: {
          title: "Liquidity",
          description: "Integrate Cetus SDK for creating pools and adding liquidity."
        },
        trade: {
          title: "Trade",
          description: "Use the Cetus aggregator to fetch routes and execute swaps."
        }
      }
    },
    sections: {
      tokens: {
        eyebrow: "Tokens",
        title: "Token Cases",
        description:
          "The first token case focuses on a standard token flow, keeping the real package publish and init_currency steps from sui_dev_cp.",
        overviewTitle: "Standard Token",
        overviewDescription: "Publish a standard Sui token package and initialize the currency as a baseline token case."
      },
      wallets: {
        eyebrow: "Wallets",
        title: "Wallet Cases",
        description:
          "The wallet section starts with the clearest batch generation case, leaving room for balances and migration flows later.",
        overviewTitle: "Batch Wallet Generation",
        overviewDescription: "Generate wallets locally, export files, and inspect address and private-key data for Sui utility flows."
      },
      transfers: {
        eyebrow: "Transfers",
        title: "Transfer Cases",
        description:
          "Transfer cases currently focus on native SUI so the demo path stays stable and easy to extend to Coin<T> later.",
        cards: {
          oneToMany: { title: "One To Many", description: "Split funds from one wallet or one private key and send them in batch." },
          manyToOne: { title: "Many To One", description: "Collect from many private keys into one receiver with per-line amounts." },
          manyToMany: { title: "Many To Many", description: "Run transfers with private-key, recipient, and amount mappings." },
          relay: { title: "Relay", description: "Generate relay wallets and forward step by step for relay-path demos." }
        }
      },
      liquidity: {
        eyebrow: "Liquidity",
        title: "Liquidity Cases",
        description:
          "This section keeps the Cetus-oriented implementation from sui_dev_cp, focused on pool creation and liquidity adding.",
        cards: {
          create: { title: "Create Liquidity", description: "Create a Cetus CLMM pool and seed its initial liquidity with a fixed side amount." },
          add: { title: "Add Liquidity", description: "Estimate the counter token on an existing pool and open a new ranged position." }
        }
      }
    },
    common: {
      connectedWallet: "Connected Wallet",
      connected: "Connected",
      notConnected: "Not connected",
      address: "Address",
      status: "Status",
      executionLogs: "Execution Logs",
      items: "items",
      noLogs: "No execution logs yet.",
      walletMode: "Wallet Sign",
      privateMode: "Private Key Sign",
      privateKey: "Sui Private Key",
      submit: "Submit",
      preview: "Preview",
      success: "Success",
      error: "Error",
      info: "Info"
    }
  }
} as const;

export type MessageDictionary = (typeof messages)[Locale];

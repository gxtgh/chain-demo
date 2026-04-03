import type { MessageTree } from '../message-tree'

export const enUsMessages = {
  common: {
    overview: 'Overview',
    backToTop: 'Back to top',
    copy: {
      idle: 'Copy',
      copied: 'Copied',
      success: 'Copied successfully',
      failed: 'Copy failed',
    },
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
    tagline: 'Professional Token Toolkit',
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
      'Create a {{standard}} token in one minute. Fast, simple, and low-cost {{tokenType}} token creation with no coding required, clean contracts, and one-click issuance.',
    seo: {
      title: 'Create {{tokenType}} Token on {{chain}} | Fast & Easy',
      description:
        'Secure and convenient {{tokenType}} token creation on {{chain}} in just one minute. No coding required. Launch a standard token with a simple guided flow.',
      keywords: 'Create {{tokenType}} Token, {{tokenType}} Token Creator, {{chain}} Token Maker',
    },
    fields: {
      name: 'Token Full Name',
      symbol: 'Token Symbol',
      totalSupply: 'Supply',
      decimals: 'Precision',
    },
    labels: {
      creationFee: 'Creation Fee',
    },
    placeholders: {
      name: 'Please enter the token full name',
      symbol: 'Please enter the token symbol',
      totalSupply: 'Please enter the supply',
      decimals: 'Please enter the precision',
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
      },
      addLiquidity: {
        title: 'Create Liquidity (DEX)',
        description:
          'Create a trading pair on your target DEX and add the initial liquidity to prepare for market trading.',
      },
      goLive: {
        title: 'Enable Trading',
        description:
          'After liquidity is added, check whether the token can already be searched and traded through the target trading entry.',
      },
      metadata: {
        title: 'Add Logo & Metadata',
        description:
          'Complete the logo, token name, description, website, and social links to improve visibility and recognition.',
      },
      note:
        'Display and listing times may vary across wallets, DEXs, and data platforms. Please refer to each platform for actual availability.',
    },
    seoBody: {
      highlights: {
        title: 'Target audience',
        builder: {
          title: 'Founders and operators',
          description:
            'Use the standard flow when you need a clean fungible token contract for product rewards, community launches, access utility, or pilot asset issuance.',
        },
        agency: {
          title: 'Agencies and freelancers',
          description:
            'The shared creator is useful when you need a repeatable token launch process across multiple client projects without maintaining custom boilerplate every time.',
        },
        noCode: {
          title: 'Teams without Solidity development',
          description:
            'You still need a wallet and on-chain gas, but you do not need to write a custom contract for a basic {{tokenType}} launch path.',
        },
      },
      faq: {
        title: 'Frequently asked questions',
        noCode: {
          question: 'Do I need coding knowledge to create a token on {{chain}}?',
          answer:
            'No coding is required for this standard token flow. You still need to understand the token name, supply, decimals, wallet operations, and the basic launch steps after deployment.',
        },
        fee: {
          question: 'Does the creation fee include gas?',
          answer:
            'No. The creation fee and network gas are separate costs. The interface reads the factory fee, while the wallet estimates and charges gas when you submit the transaction.',
        },
        standard: {
          question: 'What kind of token contract is deployed?',
          answer:
            'The current flow is positioned for a standard fungible token template on {{chain}}. It is suitable for straightforward issuance, but it does not add advanced admin modules by default.',
        },
        trade: {
          question: 'Can people trade the token immediately after creation?',
          answer:
            'Not automatically. Deployment creates the token contract, but trading usually requires wallet import, DEX pair creation, initial liquidity, and validation that buy and sell routes work as expected.',
        },
        decimals: {
          question: 'Can I change decimals after the token is deployed?',
          answer:
            'No. Decimals are part of the deployed contract settings. Decide on the precision before you sign the transaction because it cannot be changed later in a standard token deployment.',
        },
        chainChoice: {
          question: 'Why launch on {{chain}} instead of another EVM chain?',
          answer:
            '{{chain}} may differ from other EVM networks in gas cost, wallet familiarity, ecosystem audience, and the speed of post-launch distribution. Choose the chain that matches your user base and budget, not just the cheapest option.',
        },
      },
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
} satisfies MessageTree

import type { MessageTree } from '../message-tree'

export const enUsMessages = {
  common: {
    overview: 'Overview',
    backToTop: 'Back to top',
    nativeToken: 'Native Token',
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
    tokenTaxCreation: 'Tax Token',
    projectAcceptance: 'Project Acceptance',
  },
  topbar: {
    language: 'Language',
    theme: 'Theme',
    themeColor: 'Theme Color',
    chain: 'Chain',
    more: 'More',
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
  share: {
    menuItem: 'Share',
    eyebrow: 'Share Web3 Token',
    title: 'Create Your Token',
    description: 'Share Web3 Token with founders, communities, and partners so they can launch tokens across EVM chains with a simpler workflow.',
    featureTokens: 'Supports standard tokens, tax tokens, vanity-token workflows, and more.',
    chainSummary: 'Create your token on {{count}} chains including {{chains}}.',
    featureNoCode: 'No coding required. Connect a wallet and follow the guided creation flow.',
    shareLink: 'Share link',
    copyLink: 'Copy Link',
    downloadImage: 'Save Screenshot',
    close: 'Close',
    copySuccess: 'Share link copied',
    copyFailed: 'Copy failed. Please copy the link manually.',
    downloadSuccess: 'Screenshot saved',
    downloadFailed: 'Failed to save the screenshot. Please try again.',
    qrTitle: 'Official QR Code',
    qrText: 'Scan to open the Web3 Token website and jump into the token creation toolkit.',
    visualLabel: 'Token launch toolkit',
    toolsTitle: 'Token creation suite',
    toolsText: 'Standard tokens, tax tokens, vanity-token workflows, and more capabilities are expanding.',
    chainsTitle: 'Multi-chain support',
    support: 'Email',
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
            'This flow is positioned as a base standard token and does not include additional admin-control modules. It does not provide mint, pause, blacklist, whitelist, trading tax, fee receiver, auto-liquidity, or buyback logic.',
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
            'The current flow is positioned for a standard fungible token on {{chain}}. It is suitable for straightforward issuance, but it does not add advanced admin modules by default.',
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
  tokenTaxCreation: {
    eyebrow: '',
    title: 'Create Tax Token',
    description:
      'Create a {{tokenType}} tax token on {{chain}} with buy tax, sell tax, fee receiver, and default pairing settings in a single guided flow, without writing contract code.',
    seo: {
      title: 'Create {{tokenType}} Tax Token on {{chain}} | Buy & Sell Tax Setup',
      description:
        'Launch a {{tokenType}} tax token on {{chain}} with configurable buy tax, sell tax, fee receiver, exchange selection, and paired token defaults.',
      keywords: 'Create Tax Token, {{tokenType}} Tax Token Creator, {{chain}} Tax Token Maker, Buy Sell Tax Token',
    },
    fields: {
      name: 'Token Full Name',
      symbol: 'Token Symbol',
      totalSupply: 'Supply',
      decimals: 'Precision',
      buyTax: 'Buy Tax',
      sellTax: 'Sell Tax',
      taxReceiver: 'Fee Receiver Address',
      exchange: 'Liquidity Exchange',
      poolToken: 'Paired Pool Token',
    },
    labels: {
      creationFee: 'Creation Fee',
      taxConfiguration: 'Tax Configuration',
      taxConfigurationNote:
        'In tax-token mode, trading fees are automatically transferred to the token creator wallet address.',
      taxReceiverDefault: 'If left empty, the connected wallet address will be used as the fee receiver by default.',
      poolTokenNote:
        'Use this field to record the default paired token. You can choose a preset token or enter a custom ERC20 address.',
    },
    placeholders: {
      name: 'Please enter the token full name',
      symbol: 'Please enter the token symbol',
      totalSupply: 'Please enter the supply',
      decimals: 'Please enter the precision',
      buyTax: 'Enter buy tax, for example 5',
      sellTax: 'Enter sell tax, for example 5',
      taxReceiver: 'Enter fee receiver address, or leave blank to use the connected wallet',
      poolToken: 'Select or enter the paired token address',
    },
    tooltips: {
      name: 'The full token name shown in wallets, explorers, and trading interfaces. It is recommended to keep it consistent with your project brand.',
      symbol: 'The short token symbol displayed in wallets and trading interfaces. It is usually made up of letters or numbers.',
      totalSupply: 'The initial total supply of the token. Please confirm it matches your issuance plan before creation.',
      decimals: 'Defines the smallest divisible unit of the token. In most cases, 18 is the recommended default setting.',
      buyTax: 'Enter the buy tax as a percentage with up to two decimal places. The current flow supports values between 0 and 25.',
      sellTax: 'Enter the sell tax as a percentage with up to two decimal places. The current flow supports values between 0 and 25.',
      taxReceiver:
        'The fee receiver address collects the trading-tax proceeds. If it is left empty, the connected wallet address is used by default.',
      exchange: 'After the tax token is deployed, tax-mode trading is supported on this exchange.',
      poolToken:
        'Please choose the pool token used for trading, such as {{nativeSymbol}} or {{stableSymbol}}. Future liquidity must use the same pool token to keep token trading working correctly.',
      creationFee: 'The creation fee is read from the selected tax-token factory. Network gas is charged separately when the transaction is submitted.',
    },
    actions: {
      submit: 'Create Tax Token',
      submitting: 'Submitting...',
      close: 'Close',
      retry: 'Try Again',
    },
    status: {
      searchingToken: 'Searching token on-chain...',
      noTokenInfo: 'No token information found',
    },
    steps: {
      preparing: 'Prepare tax-token parameters',
      waitingWallet: 'Please sign the transaction',
      pending: 'Tax-token creation in progress',
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
      buyTaxInvalid: 'Buy tax must be a number between 0 and 25 with up to two decimal places.',
      sellTaxInvalid: 'Sell tax must be a number between 0 and 25 with up to two decimal places.',
      taxReceiverInvalid: 'Please enter a valid EVM address.',
      exchangeRequired: 'Select a default exchange.',
      poolTokenRequired: 'Select or enter the paired token.',
      tokenLookupFailed: 'Token lookup failed. Please confirm the address is a valid ERC20 contract.',
      walletRequired: 'Connect a wallet before submitting.',
      walletUnavailable: 'Injected wallet was not found in this browser.',
      factoryUnavailable: 'Tax-token factory is not configured for this chain.',
      insufficientBalance: 'Insufficient balance to pay gas and the creation fee.',
    },
    success: {
      title: 'Tax token created',
      banner: 'Tax token created successfully',
      tokenAddress: 'Token Address',
      txHash: 'Transaction Hash',
    },
    overview: {
      title: 'Tax Token',
      description:
        'This flow is designed for {{tokenType}} launches that require on-chain buy and sell tax settings, making it easier to confirm rates, receiver settings, and the default pairing setup during deployment.',
      highlights: {
        base: 'Tax launch',
        buy: 'Buy tax',
        sell: 'Sell tax',
        receiver: 'Fee receiver',
      },
      cards: {
        taxPlan: {
          title: 'Tax Plan',
          description:
            'Buy tax and sell tax are written into the initial contract configuration during deployment, which fits launches that need clear rate communication, route validation, and later operations tracking.',
        },
        receiver: {
          title: 'Receiver Address',
          description:
            'You can set a dedicated fee receiver address during deployment. If you leave it blank, the connected wallet address is used, which works for quick launches and later migration to a dedicated operations wallet.',
        },
        trading: {
          title: 'Trading Preparation',
          description:
            'This page deploys the token and records the default exchange plus paired token, but it does not create liquidity, add a pool, or handle market making. You still need to complete pair setup and initial liquidity separately.',
        },
      },
    },
    successSummary: {
      title: 'Creation Summary',
      description:
        'Your tax token has been created successfully. Keep the following configuration and on-chain details for future review, display setup, and documentation.',
      chain: 'Network',
      name: 'Token Name',
      symbol: 'Token Symbol',
      totalSupply: 'Total Supply',
      decimals: 'Decimals',
      buyTax: 'Buy Tax',
      sellTax: 'Sell Tax',
      exchange: 'Default Exchange',
      poolToken: 'Paired Token',
      taxReceiver: 'Fee Receiver',
      tokenAddress: 'Token Address',
      txHash: 'Transaction Hash',
    },
    nextSteps: {
      title: 'Next Steps',
      description:
        'After deployment, we recommend completing the following steps so the team can move more smoothly into wallet display, liquidity setup, and live trading checks.',
      addWallet: {
        title: 'Add to Wallet',
        description: 'Import the token into common wallets using the contract address, symbol, and decimals and confirm it displays correctly.',
      },
      verifyFees: {
        title: 'Create Liquidity (DEX)',
        description:
          'Create the trading pair on your target DEX with the selected paired token and add the initial liquidity for follow-up trading checks.',
      },
      reviewPairing: {
        title: 'Verify Tax & Trade Path',
        description:
          'After liquidity is added, run small buy and sell tests to confirm the tax rates, fee receiver, and default trading route behave as expected.',
      },
      metadata: {
        title: 'Complete Logo & Metadata',
        description:
          'Prepare the logo, description, website, and social links to improve how the token appears across wallets, explorers, and documentation pages.',
      },
      note: 'This page only deploys the tax token. It does not create liquidity, add a pool, or handle market-making steps.',
    },
    seoBody: {
      highlights: {
        title: 'Best-fit scenarios',
        template: {
          title: 'Projects that need trading-tax logic',
          description:
            'If your {{tokenType}} launch requires explicit buy and sell tax settings, this flow is a better fit than the standard-token flow because those rate-related parameters are confirmed during deployment.',
        },
        control: {
          title: 'Agencies and operations teams',
          description:
            'For agencies, launch teams, or operators, collecting the tax rates, fee receiver, default exchange, and paired token in one flow reduces handoff mistakes and makes delivery clearer.',
        },
        receiver: {
          title: 'Projects with a dedicated treasury path',
          description:
            'If trading-tax proceeds need to be routed to a specific operations or treasury wallet, this flow lets you set that address during deployment instead of handling it elsewhere later.',
        },
      },
      faq: {
        title: 'Frequently asked questions',
        noCode: {
          question: 'Do I need to write a contract to create a tax token on {{chain}}?',
          answer:
            'No custom Solidity contract is required for this flow. The deployment uses a preconfigured tax-token factory, but you still need to confirm the token name, supply, tax rates, and fee receiver settings.',
        },
        fee: {
          question: 'Does the creation fee include gas?',
          answer:
            'No. The creation fee comes from the factory contract, while gas is estimated and charged separately by the wallet when you submit the transaction.',
        },
        template: {
          question: 'Is this page for standard tokens or tax tokens?',
          answer:
            'This page is fixed to the tax-token creation flow. There is no toggle to fall back to the standard-token flow here. Buy tax, sell tax, fee receiver, and default pairing settings are all part of this deployment path.',
        },
        receiver: {
          question: 'Can I leave the fee receiver address empty?',
          answer:
            'Yes. If the field is empty, the connected wallet address is used as the fee receiver by default. If your project has a dedicated treasury or operations address, it is better to enter it before deployment.',
        },
        poolToken: {
          question: 'Why do I need to choose a paired token?',
          answer:
            'The paired token records the market asset this tax token is intended to trade against, such as the native token or a stablecoin. It does not create liquidity for you, but it preserves the intended market setup and should usually match your later liquidity plan.',
        },
        liquidity: {
          question: 'Will this page create liquidity or a trading pool automatically?',
          answer:
            'No. The current page only deploys the tax token and returns the token address plus transaction hash. It does not create liquidity, add a pool, or perform market-making tasks.',
        },
      },
    },
    modal: {
      progressTitle: 'Creating tax token',
      successTitle: 'Tax token created successfully',
      errorTitle: 'Tax token creation failed',
      errorDescription: 'The transaction did not complete on-chain. Check the wallet status, network, and balance, then try again.',
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

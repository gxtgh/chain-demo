import { renderToString } from "react-dom/server";
import { Navigate, Outlet, Route, Routes, StaticRouter, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, ConfigProvider, Drawer, Dropdown, Input, InputNumber, Modal, Select, Spin, Tooltip, message, theme } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { WagmiProvider, useAccount, useSwitchChain } from "wagmi";
import { base, bsc, bscTestnet, mainnet } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit, useAppKit, useAppKitAccount, useAppKitNetwork, useWalletInfo } from "@reown/appkit/react";
import { http } from "viem";
import { base as base$1, bsc as bsc$1, bscTestnet as bscTestnet$1, mainnet as mainnet$1 } from "wagmi/chains";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { CheckCircleFilled, CheckCircleOutlined, CheckOutlined, CloseCircleFilled, CloseOutlined, CopyOutlined, DeploymentUnitOutlined, ExclamationCircleFilled, FileDoneOutlined, FileSearchOutlined, FlagOutlined, GlobalOutlined, InfoCircleOutlined, LineChartOutlined, LoadingOutlined, MessageOutlined, PercentageOutlined, PictureOutlined, RocketOutlined, SafetyCertificateOutlined, WalletOutlined } from "@ant-design/icons";
import { BrowserProvider, Contract, Interface, JsonRpcProvider, ZeroAddress, formatEther, getAddress, isAddress } from "ethers";
//#region src/config/chains.ts
var DEFAULT_LANG = "en-us";
var DEFAULT_PAGE = "token-creation";
var ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
var supportedLanguages = [{
	key: "en-us",
	label: "English"
}, {
	key: "zh-cn",
	label: "简体中文"
}];
var supportedChains = [
	{
		isEnable: true,
		seoIndex: true,
		key: "bsc",
		chainId: 56,
		network: bsc$1,
		defaultChain: true,
		defaultDex: "PancakeSwap",
		EIP1559: false,
		name: "BSC",
		fullName: "BNB Smart Chain",
		icon: "/img/chain/bsc.svg",
		tokenType: "BEP20",
		deployUrl: "",
		rpcList: ["https://bnb-mainnet.g.alchemy.com/v2/374gG-HMqDJzG0oFzVjLm"],
		dexs: [{
			type: "PancakeSwap",
			version: "v2",
			name: "PancakeSwap V2",
			logo: "/img/dex/pancake.svg",
			routerAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
			factoryAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
			rates: [2500]
		}, {
			type: "PancakeSwap",
			version: "v3",
			name: "PancakeSwap V3",
			logo: "/img/dex/pancake.svg",
			routerAddress: "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4",
			factoryAddress: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
			quoterV2Address: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
			nonfungiblePositionManager: "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364",
			rates: [
				100,
				500,
				2500,
				1e4
			]
		}],
		explorerBaseUrl: "https://bscscan.com",
		nativeToken: {
			address: ZERO_ADDRESS,
			name: "BNB",
			symbol: "BNB",
			decimals: 18,
			logo: "/img/token/BNB.svg",
			isNative: true
		},
		wtoken: {
			address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
			name: "Wrapped BNB",
			symbol: "WBNB",
			decimals: 18,
			logo: "/img/token/BNB.svg"
		},
		stableCoins: [
			{
				name: "Binance Pegged USDT",
				symbol: "USDT",
				address: "0x55d398326f99059fF775485246999027B3197955",
				decimals: 18,
				logo: "/img/token/USDT.svg"
			},
			{
				name: "World Liberty Financial USD",
				symbol: "USD1",
				address: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
				decimals: 18,
				logo: "/img/token/USD1.png"
			},
			{
				name: "Binance-Peg USD Coin",
				symbol: "USDC",
				address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
				decimals: 18,
				logo: "/img/token/USDC.svg"
			}
		],
		contractList: [{
			key: "tokenFactory",
			label: "Token Creation",
			address: "0x78B84D2A29eA3e199aB81C48B687630AEA124A33"
		}, {
			key: "tokenTaxFactory",
			label: "Tax Token Creation",
			address: "0x95547365Ef339A7dF41feEB38A4029A9476107Ed",
			dex: "PancakeSwap",
			version: "v2"
		}]
	},
	{
		isEnable: true,
		seoIndex: false,
		key: "bsc-testnet",
		chainId: 97,
		network: bscTestnet$1,
		defaultDex: "PancakeSwap",
		EIP1559: false,
		name: "BSC Testnet",
		fullName: "BNB Smart Chain Testnet",
		icon: "/img/chain/bsc.svg",
		tokenType: "BEP20",
		deployUrl: "",
		rpcList: ["https://bnb-testnet.g.alchemy.com/v2/374gG-HMqDJzG0oFzVjLm"],
		dexs: [{
			type: "PancakeSwap",
			version: "v2",
			name: "PancakeSwap V2",
			logo: "/img/dex/pancake.svg",
			routerAddress: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
			factoryAddress: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",
			rates: [2500]
		}, {
			type: "PancakeSwap",
			version: "v3",
			name: "PancakeSwap V3",
			logo: "/img/dex/pancake.svg",
			routerAddress: "0x9a489505a00cE272eAa5e07Dba6491314CaE3796",
			factoryAddress: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
			quoterV2Address: "0xB048BBC1Ee6B733FFfcfb9e9CEF7375518e25997",
			nonfungiblePositionManager: "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364",
			rates: [
				100,
				500,
				2500,
				1e4
			]
		}],
		explorerBaseUrl: "https://testnet.bscscan.com",
		nativeToken: {
			address: ZERO_ADDRESS,
			name: "BNB Testnet",
			symbol: "tBNB",
			decimals: 18,
			logo: "/img/token/BNB.svg",
			isNative: true
		},
		wtoken: {
			address: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
			name: "Wrapped BNB",
			symbol: "WBNB",
			decimals: 18,
			logo: "/img/token/BNB.svg"
		},
		stableCoins: [{
			name: "USDT",
			symbol: "USDT",
			address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
			decimals: 18,
			logo: "/img/token/USDT.svg"
		}, {
			name: "BUSD",
			symbol: "BUSD",
			address: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
			decimals: 18
		}],
		contractList: [{
			key: "tokenFactory",
			label: "Token Creation",
			address: "0x1C47E37f13299d9989587edCb3875c5FcED57E99"
		}, {
			key: "tokenTaxFactory",
			label: "Tax Token Creation",
			address: "0xDbE4ec6610980A0Ea951F7f813A8078013b634eA",
			dex: "PancakeSwap",
			version: "v2"
		}]
	},
	{
		isEnable: true,
		seoIndex: true,
		key: "eth",
		chainId: 1,
		network: mainnet$1,
		defaultDex: "Uniswap",
		EIP1559: true,
		name: "ETH",
		fullName: "Ethereum",
		icon: "/img/chain/eth.svg",
		tokenType: "ERC20",
		deployUrl: "",
		rpcList: ["https://eth-mainnet.g.alchemy.com/v2/374gG-HMqDJzG0oFzVjLm"],
		dexs: [{
			type: "Uniswap",
			version: "v2",
			name: "Uniswap V2",
			logo: "/img/dex/uniswap.png",
			routerAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
			factoryAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
			rates: [3e3]
		}, {
			type: "Uniswap",
			version: "v3",
			name: "Uniswap V3",
			logo: "/img/dex/uniswap.png",
			routerAddress: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
			factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
			quoterV2Address: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
			swapRouterAddress: "0x080c3C30683eAdE41DFb9EA3b3862F15b24BE57A",
			rates: [
				100,
				500,
				3e3,
				1e4
			]
		}],
		explorerBaseUrl: "https://etherscan.io",
		nativeToken: {
			address: ZERO_ADDRESS,
			name: "Ether",
			symbol: "ETH",
			decimals: 18,
			logo: "/img/chain/eth.svg",
			isNative: true
		},
		wtoken: {
			address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
			name: "Wrapped Ether",
			symbol: "WETH",
			decimals: 18,
			logo: "/img/token/WETH.png"
		},
		stableCoins: [{
			name: "Tether USD",
			symbol: "USDT",
			address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
			decimals: 6,
			logo: "/img/token/USDT.svg"
		}, {
			name: "USD Coin",
			symbol: "USDC",
			address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
			decimals: 6,
			logo: "/img/token/USDC.svg"
		}],
		contractList: [{
			key: "tokenFactory",
			label: "Token Creation",
			address: "0x7dD9CE2799D1877bCb3a4f9528CE2c61e5879449"
		}, {
			key: "tokenTaxFactory",
			label: "Tax Token Creation",
			address: "0x31551329E6fe50a6db1A3858175dc652F194239C",
			dex: "Uniswap",
			version: "v2"
		}]
	},
	{
		isEnable: true,
		seoIndex: true,
		key: "base",
		chainId: 8453,
		network: base$1,
		defaultDex: "Uniswap",
		EIP1559: true,
		name: "BASE",
		fullName: "Base",
		icon: "/img/chain/base.svg",
		tokenType: "ERC20",
		deployUrl: "",
		rpcList: ["https://base-mainnet.g.alchemy.com/v2/374gG-HMqDJzG0oFzVjLm"],
		dexs: [{
			type: "Uniswap",
			version: "v2",
			name: "Uniswap V2",
			logo: "/img/dex/uniswap.png",
			routerAddress: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
			factoryAddress: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
			rates: [3e3]
		}, {
			type: "Uniswap",
			version: "v3",
			name: "Uniswap V3",
			logo: "/img/dex/uniswap.png",
			routerAddress: "0x2626664c2603336E57B271c5C0b26F421741e481",
			factoryAddress: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
			quoterV2Address: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
			rates: [
				100,
				500,
				3e3,
				1e4
			]
		}],
		explorerBaseUrl: "https://basescan.org",
		nativeToken: {
			address: ZERO_ADDRESS,
			name: "Ether",
			symbol: "ETH",
			decimals: 18,
			logo: "/img/chain/base.svg",
			isNative: true
		},
		wtoken: {
			address: "0x4200000000000000000000000000000000000006",
			name: "Wrapped Ether",
			symbol: "WETH",
			decimals: 18,
			logo: "/img/token/WETH.png"
		},
		stableCoins: [{
			name: "Tether USD",
			symbol: "USDT",
			address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
			decimals: 6,
			logo: "/img/token/USDT.svg"
		}, {
			name: "USD Coin",
			symbol: "USDC",
			address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
			decimals: 6,
			logo: "/img/token/USDC.svg"
		}],
		contractList: [{
			key: "tokenFactory",
			label: "Token Creation",
			address: "0x4D09F42905E7481d3A8E39AB8777170f6D598A3b"
		}, {
			key: "tokenTaxFactory",
			label: "Tax Token Creation",
			address: "0xd9C578C35255988681dCAe665206EC443624FD6a",
			dex: "Uniswap",
			version: "v2"
		}]
	}
];
function isSupportedLang(value) {
	return supportedLanguages.some((language) => language.key === value);
}
function isSupportedChain(value) {
	return supportedChains.some((chain) => chain.key === value);
}
function isSupportedPage(value) {
	return value === "token-creation" || value === "tax-token-creation" || value === "project-acceptance";
}
function getChainDefinition(chainKey) {
	return supportedChains.find((chain) => chain.key === chainKey) ?? supportedChains[0];
}
function getChainFullName(chain) {
	return chain.fullName;
}
function getChainRpcUrl(chain) {
	return chain.rpcList[0] ?? "";
}
function getChainContractAddress(chain, contractKey) {
	return chain.contractList.find((contract) => contract.key === contractKey)?.address;
}
function getExplorerUrl(chain, type, value) {
	if (!value) return "";
	const template = chain.explorer?.[type] ?? {
		hash: "/tx/{value}",
		token: "/token/{value}",
		address: "/address/{value}"
	}[type];
	if (/^https?:\/\//.test(template)) return template.replace("{value}", value);
	return `${chain.explorerBaseUrl.replace(/\/+$/, "")}${(template.startsWith("/") ? template : `/${template}`).replace("{value}", value)}`;
}
//#endregion
//#region src/config/theme-registry.ts
var DEFAULT_THEME = "light";
var DEFAULT_THEME_COLOR = "orange";
var themeModeRegistry = [{
	id: "light",
	label: "Light"
}, {
	id: "dark",
	label: "Dark"
}];
var themeColorRegistry = [
	{
		id: "orange",
		label: "Orange",
		accent: "#ff6b2d",
		mood: "Utility-first token creator"
	},
	{
		id: "purple",
		label: "Purple",
		accent: "#8b5cf6",
		mood: "Editorial launch theme"
	},
	{
		id: "green",
		label: "Green",
		accent: "#1dbf73",
		mood: "Control room dashboard"
	}
];
function isThemeModeId(value) {
	return themeModeRegistry.some((theme) => theme.id === value);
}
function isThemeColorId(value) {
	return themeColorRegistry.some((theme) => theme.id === value);
}
function getThemeColorDefinition(themeId) {
	return themeColorRegistry.find((theme) => theme.id === themeId) ?? themeColorRegistry[0];
}
//#endregion
//#region src/config/routes.ts
function buildPagePath(lang = DEFAULT_LANG, chain = "bsc", page = DEFAULT_PAGE, options) {
	const search = new URLSearchParams();
	if (options?.theme && options.theme !== "light") search.set("theme", options.theme);
	if (options?.themeColor && options.themeColor !== "orange") search.set("themeColor", options.themeColor);
	const query = search.toString();
	return `/${lang}/${chain}/${page}${query ? `?${query}` : ""}`;
}
//#endregion
//#region src/config/site.ts
var SITE_NAME = "Web3 Token";
var SITE_URL = normalizeSiteUrl("https://token-tools.pages.dev");
var DEFAULT_OG_IMAGE = "/img/common/logo-orange.png";
function normalizeSiteUrl(value) {
	return value.replace(/\/+$/, "");
}
function buildAbsoluteUrl(pathname) {
	return new URL(pathname, `${SITE_URL}/`).toString();
}
function buildCanonicalPageUrl(lang, chain, page) {
	return buildAbsoluteUrl(buildPagePath(lang, chain, page));
}
function normalizeLocaleTag(lang) {
	return lang === "zh-cn" ? "zh-CN" : "en-US";
}
function buildAlternatePageLinks(chain, page) {
	return [...supportedLanguages.map((language) => ({
		hrefLang: language.key,
		href: buildCanonicalPageUrl(language.key, chain, page)
	})), {
		hrefLang: "x-default",
		href: buildCanonicalPageUrl("en-us", chain, page)
	}];
}
//#endregion
//#region src/app/preferences.ts
var STORAGE_KEY = "evm-multi-theme.preferences";
function resolveAppPreferences(urlPreferences) {
	const sessionPreferences = readStoredPreferences("session");
	const localPreferences = readStoredPreferences("local");
	const lang = resolvePreference(urlPreferences.lang, sessionPreferences.lang, localPreferences.lang, DEFAULT_LANG, isSupportedLang);
	const chain = resolvePreference(urlPreferences.chain, sessionPreferences.chain, localPreferences.chain, "bsc", isSupportedChain);
	const theme = resolvePreference(urlPreferences.theme, sessionPreferences.theme, localPreferences.theme, DEFAULT_THEME, isThemeModeId);
	const themeColor = resolvePreference(urlPreferences.themeColor, sessionPreferences.themeColor, localPreferences.themeColor, DEFAULT_THEME_COLOR, isThemeColorId);
	return {
		lang: lang.value,
		chain: chain.value,
		theme: theme.value,
		themeColor: themeColor.value,
		sources: {
			lang: lang.source,
			chain: chain.source,
			theme: theme.source,
			themeColor: themeColor.source
		}
	};
}
function rememberSessionPreferences(preferences) {
	writeStoredPreferences("session", preferences);
}
function rememberUserPreferences(preferences) {
	const sanitized = sanitizePreferences(preferences);
	writeStoredPreferences("session", sanitized);
	writeStoredPreferences("local", sanitized);
}
function resolvePreference(urlValue, sessionValue, localValue, fallbackValue, validator) {
	if (validator(urlValue ?? void 0)) return {
		value: urlValue,
		source: "url"
	};
	if (validator(sessionValue)) return {
		value: sessionValue,
		source: "session"
	};
	if (validator(localValue)) return {
		value: localValue,
		source: "local"
	};
	return {
		value: fallbackValue,
		source: "default"
	};
}
function sanitizePreferences(preferences) {
	const sanitized = {};
	if (isSupportedLang(preferences.lang)) sanitized.lang = preferences.lang;
	if (isSupportedChain(preferences.chain)) sanitized.chain = preferences.chain;
	if (isThemeModeId(preferences.theme)) sanitized.theme = preferences.theme;
	if (isThemeColorId(preferences.themeColor)) sanitized.themeColor = preferences.themeColor;
	return sanitized;
}
function readStoredPreferences(storageType) {
	const storage = getSafeStorage(storageType);
	if (!storage) return {};
	try {
		const rawValue = storage.getItem(STORAGE_KEY);
		if (!rawValue) return {};
		return sanitizePreferences(JSON.parse(rawValue));
	} catch {
		return {};
	}
}
function writeStoredPreferences(storageType, preferences) {
	const storage = getSafeStorage(storageType);
	if (!storage) return;
	try {
		const nextPreferences = {
			...readStoredPreferences(storageType),
			...sanitizePreferences(preferences)
		};
		storage.setItem(STORAGE_KEY, JSON.stringify(nextPreferences));
	} catch {}
}
function getSafeStorage(storageType) {
	if (typeof window === "undefined") return null;
	try {
		return storageType === "session" ? window.sessionStorage : window.localStorage;
	} catch {
		return null;
	}
}
//#endregion
//#region src/app/providers.tsx
var queryClient = new QueryClient();
var projectId = "630c648c23af10f1fe6798c3a8eb3e4e";
var networks = [
	bsc,
	bscTestnet,
	mainnet,
	base
];
var walletRuntime = null;
var metadata = {
	name: SITE_NAME,
	description: "Create standard EVM tokens with a multi-theme launch toolkit.",
	url: SITE_URL,
	icons: [buildAbsoluteUrl(DEFAULT_OG_IMAGE)]
};
function getWalletRuntime() {
	if (walletRuntime) return walletRuntime;
	const wagmiAdapter = new WagmiAdapter({
		projectId,
		networks,
		transports: {
			[bsc.id]: http(),
			[bscTestnet.id]: http("https://data-seed-prebsc-1-s1.binance.org:8545"),
			[mainnet.id]: http(),
			[base.id]: http()
		}
	});
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
			history: false
		}
	});
	walletRuntime = { wagmiAdapter };
	return walletRuntime;
}
function AppProviders({ children, mode = "interactive" }) {
	const location = useLocation();
	const content = useMemo(() => children, [children]);
	const configProvider = /* @__PURE__ */ jsx(ConfigProvider, {
		theme: useMemo(() => {
			const [lang, chain] = location.pathname.split("/").filter(Boolean);
			const searchParams = new URLSearchParams(location.search);
			const preferences = resolveAppPreferences({
				lang,
				chain,
				theme: searchParams.get("theme"),
				themeColor: searchParams.get("themeColor")
			});
			const accent = getThemeColorDefinition(preferences.themeColor).accent;
			const isDark = preferences.theme === "dark";
			const accentSoft = toRgba(accent, isDark ? .14 : .08);
			const accentHover = toRgba(accent, isDark ? .1 : .05);
			const accentOutline = toRgba(accent, isDark ? .18 : .12);
			return {
				algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
				token: {
					colorPrimary: accent,
					colorText: isDark ? "#f6efe9" : "#20140f",
					colorTextPlaceholder: isDark ? "rgba(197, 184, 176, 0.72)" : "#7d655b",
					colorBorder: isDark ? "rgba(255, 255, 255, 0.09)" : "rgba(76, 40, 20, 0.1)",
					colorBgContainer: isDark ? "rgba(28, 28, 36, 0.94)" : "rgba(255, 255, 255, 0.96)",
					colorBgElevated: isDark ? "rgba(24, 24, 31, 0.98)" : "rgba(255, 255, 255, 0.98)",
					borderRadius: 18,
					controlHeight: 54,
					fontFamily: "'SF Pro Display', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', sans-serif"
				},
				components: { Select: {
					selectorBg: isDark ? "rgba(28, 28, 36, 0.94)" : "rgba(255, 255, 255, 0.96)",
					clearBg: isDark ? "rgba(28, 28, 36, 0.94)" : "rgba(255, 255, 255, 0.96)",
					optionSelectedBg: accentSoft,
					optionActiveBg: accentHover,
					activeBorderColor: accent,
					hoverBorderColor: accent,
					activeOutlineColor: accentOutline
				} }
			};
		}, [location.pathname, location.search]),
		children: content
	});
	if (mode === "static") return configProvider;
	const { wagmiAdapter } = getWalletRuntime();
	return /* @__PURE__ */ jsx(WagmiProvider, {
		config: wagmiAdapter.wagmiConfig,
		children: /* @__PURE__ */ jsx(QueryClientProvider, {
			client: queryClient,
			children: configProvider
		})
	});
}
function toRgba(hex, alpha) {
	const sanitized = hex.replace("#", "");
	const normalized = sanitized.length === 3 ? sanitized.split("").map((char) => `${char}${char}`).join("") : sanitized;
	return `rgba(${Number.parseInt(normalized.slice(0, 2), 16)}, ${Number.parseInt(normalized.slice(2, 4), 16)}, ${Number.parseInt(normalized.slice(4, 6), 16)}, ${alpha})`;
}
//#endregion
//#region src/app/render-mode.tsx
var RenderModeContext = createContext("interactive");
function RenderModeProvider({ children, mode }) {
	return /* @__PURE__ */ jsx(RenderModeContext.Provider, {
		value: mode,
		children
	});
}
function useRenderMode() {
	return useContext(RenderModeContext);
}
//#endregion
//#region src/app/app-frame.tsx
function AppFrame({ children, mode }) {
	return /* @__PURE__ */ jsx(RenderModeProvider, {
		mode,
		children: /* @__PURE__ */ jsx(AppProviders, {
			mode,
			children
		})
	});
}
//#endregion
//#region src/i18n/locales/en-us.ts
var enUsMessages = {
	common: {
		overview: "Overview",
		backToTop: "Back to top",
		nativeToken: "Native Token",
		copy: {
			idle: "Copy",
			copied: "Copied",
			success: "Copied successfully",
			failed: "Copy failed"
		},
		exception: {
			possibleReasons: "Reasons for failure",
			errorReason1: "The {{chain}} network is congested. Please try again later.",
			errorReason2: "Please make sure your account has enough balance for the on-chain transaction.",
			contactOfficialSupport: "If you still cannot find a solution, please contact official support for help."
		}
	},
	mobile: {
		menu: "Menu",
		routes: "Pages",
		settings: "Settings",
		controls: "Controls"
	},
	app: {
		name: "Web3 Token",
		tagline: "Professional Token Toolkit"
	},
	footer: {
		copyright: "Web3 Token © 2026",
		emailLabel: "Email"
	},
	nav: {
		tokenCreation: "Token Creation",
		tokenTaxCreation: "Tax Token",
		projectAcceptance: "Project Acceptance"
	},
	topbar: {
		language: "Language",
		theme: "Theme",
		themeColor: "Theme Color",
		chain: "Chain"
	},
	theme: {
		light: "Light",
		dark: "Dark",
		orange: "Orange",
		purple: "Purple",
		green: "Green"
	},
	wallet: {
		connect: "Connect Wallet",
		connecting: "Connecting...",
		connected: "Connected",
		disconnect: "Disconnect",
		wrongChain: "Switch Chain"
	},
	tokenCreation: {
		eyebrow: "",
		title: "Create Standard Token",
		description: "Create a {{standard}} token in one minute. Fast, simple, and low-cost {{tokenType}} token creation with no coding required, clean contracts, and one-click issuance.",
		seo: {
			title: "Create {{tokenType}} Token on {{chain}} | Fast & Easy",
			description: "Secure and convenient {{tokenType}} token creation on {{chain}} in just one minute. No coding required. Launch a standard token with a simple guided flow.",
			keywords: "Create {{tokenType}} Token, {{tokenType}} Token Creator, {{chain}} Token Maker"
		},
		fields: {
			name: "Token Full Name",
			symbol: "Token Symbol",
			totalSupply: "Supply",
			decimals: "Precision"
		},
		labels: { creationFee: "Creation Fee" },
		placeholders: {
			name: "Please enter the token full name",
			symbol: "Please enter the token symbol",
			totalSupply: "Please enter the supply",
			decimals: "Please enter the precision"
		},
		tooltips: {
			name: "The full token name shown in wallets, explorers, and trading interfaces. It is recommended to keep it consistent with your project brand.",
			symbol: "The short token symbol displayed in wallets and trading interfaces. It is usually made up of letters or numbers.",
			totalSupply: "The initial total supply of the token. Please confirm it matches your issuance plan before creation.",
			decimals: "Defines the smallest divisible unit of the token. In most cases, 18 is the recommended default setting.",
			creationFee: "The creation fee is read from the factory contract on the selected chain. Network gas is charged separately when the transaction is submitted."
		},
		actions: {
			submit: "Create Token",
			submitting: "Submitting...",
			close: "Close",
			retry: "Try Again"
		},
		status: {
			idle: "Fill the form, connect the wallet, and create the token.",
			loadingFee: "Reading creation fee from the selected chain...",
			preparing: "Preparing token parameters...",
			waitingWallet: "Waiting for wallet signature...",
			pending: "Transaction sent. Waiting for confirmation...",
			success: "Token created successfully."
		},
		steps: {
			preparing: "Generate token information",
			waitingWallet: "Please sign the transaction",
			pending: "Token creation in progress",
			completed: "Creation completed",
			failed: "Creation failed"
		},
		errors: {
			nameRequired: "Token name is required.",
			nameTooLong: "Token name can be at most 100 characters.",
			symbolRequired: "Token symbol is required.",
			symbolTooLong: "Token symbol can be at most 100 characters.",
			supplyRequired: "Total supply is required.",
			supplyInvalid: "Total supply must be a positive integer.",
			decimalsInvalid: "Decimals must be between 0 and 18.",
			walletRequired: "Connect a wallet before submitting.",
			walletUnavailable: "Injected wallet was not found in this browser.",
			factoryUnavailable: "Factory contract is not configured for this chain.",
			insufficientBalance: "Insufficient balance to pay gas and the creation fee.",
			txFailed: "Transaction failed. Please try again."
		},
		success: {
			title: "Token created",
			banner: "Token created successfully",
			tokenAddress: "Token Address",
			txHash: "Transaction Hash",
			openExplorer: "Open in explorer"
		},
		permission: {
			title: "Standard Token",
			description: "Deploy a standard fungible token contract on an EVM-compatible chain for basic asset issuance, wallet display, and later DEX market setup.",
			highlights: {
				core: "Standard interface",
				factory: "Factory deployment",
				noAdmin: "No admin extensions"
			},
			cards: {
				basicInfo: {
					title: "Basic Information",
					description: "After the token is created successfully, the returned token address can be used for wallet import, explorer lookup, and later liquidity configuration."
				},
				permissions: {
					title: "Permissions",
					description: "This flow is positioned as a base standard token and does not include additional admin-control modules. It does not provide mint, pause, blacklist, whitelist, trading tax, fee receiver, auto-liquidity, or buyback logic."
				},
				tradingFlow: {
					title: "Trading Enablement Flow",
					description: "Successful deployment only means the token contract exists on-chain. To make the token tradable, you usually still need to import it into wallets, create a DEX pair, add initial liquidity, validate the buy/sell route, and complete logo plus metadata submission."
				}
			}
		},
		successSummary: {
			title: "Creation Summary",
			description: "Your token has been created successfully. Please keep the following information for wallet display, trading setup, and metadata submission.",
			chain: "Network",
			name: "Token Name",
			symbol: "Token Symbol",
			totalSupply: "Total Supply",
			decimals: "Decimals",
			tokenAddress: "Token Address",
			txHash: "Transaction Hash"
		},
		nextSteps: {
			title: "Next Steps",
			description: "After your token is created, we recommend completing the following steps to help users identify, view, and trade your token more easily.",
			addWallet: {
				title: "Add to Wallet",
				description: "Add the token address, symbol, and decimals to common wallets and confirm the token information is displayed correctly."
			},
			addLiquidity: {
				title: "Create Liquidity (DEX)",
				description: "Create a trading pair on your target DEX and add the initial liquidity to prepare for market trading."
			},
			goLive: {
				title: "Enable Trading",
				description: "After liquidity is added, check whether the token can already be searched and traded through the target trading entry."
			},
			metadata: {
				title: "Add Logo & Metadata",
				description: "Complete the logo, token name, description, website, and social links to improve visibility and recognition."
			},
			note: "Display and listing times may vary across wallets, DEXs, and data platforms. Please refer to each platform for actual availability."
		},
		seoBody: {
			highlights: {
				title: "Target audience",
				builder: {
					title: "Founders and operators",
					description: "Use the standard flow when you need a clean fungible token contract for product rewards, community launches, access utility, or pilot asset issuance."
				},
				agency: {
					title: "Agencies and freelancers",
					description: "The shared creator is useful when you need a repeatable token launch process across multiple client projects without maintaining custom boilerplate every time."
				},
				noCode: {
					title: "Teams without Solidity development",
					description: "You still need a wallet and on-chain gas, but you do not need to write a custom contract for a basic {{tokenType}} launch path."
				}
			},
			faq: {
				title: "Frequently asked questions",
				noCode: {
					question: "Do I need coding knowledge to create a token on {{chain}}?",
					answer: "No coding is required for this standard token flow. You still need to understand the token name, supply, decimals, wallet operations, and the basic launch steps after deployment."
				},
				fee: {
					question: "Does the creation fee include gas?",
					answer: "No. The creation fee and network gas are separate costs. The interface reads the factory fee, while the wallet estimates and charges gas when you submit the transaction."
				},
				standard: {
					question: "What kind of token contract is deployed?",
					answer: "The current flow is positioned for a standard fungible token on {{chain}}. It is suitable for straightforward issuance, but it does not add advanced admin modules by default."
				},
				trade: {
					question: "Can people trade the token immediately after creation?",
					answer: "Not automatically. Deployment creates the token contract, but trading usually requires wallet import, DEX pair creation, initial liquidity, and validation that buy and sell routes work as expected."
				},
				decimals: {
					question: "Can I change decimals after the token is deployed?",
					answer: "No. Decimals are part of the deployed contract settings. Decide on the precision before you sign the transaction because it cannot be changed later in a standard token deployment."
				},
				chainChoice: {
					question: "Why launch on {{chain}} instead of another EVM chain?",
					answer: "{{chain}} may differ from other EVM networks in gas cost, wallet familiarity, ecosystem audience, and the speed of post-launch distribution. Choose the chain that matches your user base and budget, not just the cheapest option."
				}
			}
		},
		modal: {
			progressTitle: "Creating standard token",
			successTitle: "Token created successfully",
			errorTitle: "Token creation failed",
			errorDescription: "The transaction did not complete on-chain. Check your wallet state and balance, then try again.",
			progressTip: "Token information is being prepared and the wallet will ask you to confirm the transaction before it is broadcast on-chain.",
			errorReasonLabel: "Possible reasons",
			errorReasonOne: "The selected wallet balance is not enough to cover gas and the creation fee.",
			errorReasonTwo: "The current chain or factory contract is unavailable, or the transaction was rejected in the wallet."
		},
		themes: {
			orange: "Atlas theme",
			purple: "Pulse theme",
			green: "Forge theme"
		}
	},
	tokenTaxCreation: {
		eyebrow: "",
		title: "Create Tax Token",
		description: "Create a {{tokenType}} tax token on {{chain}} with buy tax, sell tax, fee receiver, and default pairing settings in a single guided flow, without writing contract code.",
		seo: {
			title: "Create {{tokenType}} Tax Token on {{chain}} | Buy & Sell Tax Setup",
			description: "Launch a {{tokenType}} tax token on {{chain}} with configurable buy tax, sell tax, fee receiver, exchange selection, and paired token defaults.",
			keywords: "Create Tax Token, {{tokenType}} Tax Token Creator, {{chain}} Tax Token Maker, Buy Sell Tax Token"
		},
		fields: {
			name: "Token Full Name",
			symbol: "Token Symbol",
			totalSupply: "Supply",
			decimals: "Precision",
			buyTax: "Buy Tax",
			sellTax: "Sell Tax",
			taxReceiver: "Fee Receiver Address",
			exchange: "Liquidity Exchange",
			poolToken: "Paired Pool Token"
		},
		labels: {
			creationFee: "Creation Fee",
			taxConfiguration: "Tax Configuration",
			taxConfigurationNote: "In tax-token mode, trading fees are automatically transferred to the token creator wallet address.",
			taxReceiverDefault: "If left empty, the connected wallet address will be used as the fee receiver by default.",
			poolTokenNote: "Use this field to record the default paired token. You can choose a preset token or enter a custom ERC20 address."
		},
		placeholders: {
			name: "Please enter the token full name",
			symbol: "Please enter the token symbol",
			totalSupply: "Please enter the supply",
			decimals: "Please enter the precision",
			buyTax: "Enter buy tax, for example 5",
			sellTax: "Enter sell tax, for example 5",
			taxReceiver: "Enter fee receiver address, or leave blank to use the connected wallet",
			poolToken: "Select or enter the paired token address"
		},
		tooltips: {
			name: "The full token name shown in wallets, explorers, and trading interfaces. It is recommended to keep it consistent with your project brand.",
			symbol: "The short token symbol displayed in wallets and trading interfaces. It is usually made up of letters or numbers.",
			totalSupply: "The initial total supply of the token. Please confirm it matches your issuance plan before creation.",
			decimals: "Defines the smallest divisible unit of the token. In most cases, 18 is the recommended default setting.",
			buyTax: "Enter the buy tax as a percentage with up to two decimal places. The current flow supports values between 0 and 25.",
			sellTax: "Enter the sell tax as a percentage with up to two decimal places. The current flow supports values between 0 and 25.",
			taxReceiver: "The fee receiver address collects the trading-tax proceeds. If it is left empty, the connected wallet address is used by default.",
			exchange: "After the tax token is deployed, tax-mode trading is supported on this exchange.",
			poolToken: "Please choose the pool token used for trading, such as {{nativeSymbol}} or {{stableSymbol}}. Future liquidity must use the same pool token to keep token trading working correctly.",
			creationFee: "The creation fee is read from the selected tax-token factory. Network gas is charged separately when the transaction is submitted."
		},
		actions: {
			submit: "Create Tax Token",
			submitting: "Submitting...",
			close: "Close",
			retry: "Try Again"
		},
		status: {
			searchingToken: "Searching token on-chain...",
			noTokenInfo: "No token information found"
		},
		steps: {
			preparing: "Prepare tax-token parameters",
			waitingWallet: "Please sign the transaction",
			pending: "Tax-token creation in progress",
			completed: "Creation completed",
			failed: "Creation failed"
		},
		errors: {
			nameRequired: "Token name is required.",
			nameTooLong: "Token name can be at most 100 characters.",
			symbolRequired: "Token symbol is required.",
			symbolTooLong: "Token symbol can be at most 100 characters.",
			supplyRequired: "Total supply is required.",
			supplyInvalid: "Total supply must be a positive integer.",
			decimalsInvalid: "Decimals must be between 0 and 18.",
			buyTaxInvalid: "Buy tax must be a number between 0 and 25 with up to two decimal places.",
			sellTaxInvalid: "Sell tax must be a number between 0 and 25 with up to two decimal places.",
			taxReceiverInvalid: "Please enter a valid EVM address.",
			exchangeRequired: "Select a default exchange.",
			poolTokenRequired: "Select or enter the paired token.",
			tokenLookupFailed: "Token lookup failed. Please confirm the address is a valid ERC20 contract.",
			walletRequired: "Connect a wallet before submitting.",
			walletUnavailable: "Injected wallet was not found in this browser.",
			factoryUnavailable: "Tax-token factory is not configured for this chain.",
			insufficientBalance: "Insufficient balance to pay gas and the creation fee."
		},
		success: {
			title: "Tax token created",
			banner: "Tax token created successfully",
			tokenAddress: "Token Address",
			txHash: "Transaction Hash"
		},
		overview: {
			title: "Tax Token",
			description: "This flow is designed for {{tokenType}} launches that require on-chain buy and sell tax settings, making it easier to confirm rates, receiver settings, and the default pairing setup during deployment.",
			highlights: {
				base: "Tax launch",
				buy: "Buy tax",
				sell: "Sell tax",
				receiver: "Fee receiver"
			},
			cards: {
				taxPlan: {
					title: "Tax Plan",
					description: "Buy tax and sell tax are written into the initial contract configuration during deployment, which fits launches that need clear rate communication, route validation, and later operations tracking."
				},
				receiver: {
					title: "Receiver Address",
					description: "You can set a dedicated fee receiver address during deployment. If you leave it blank, the connected wallet address is used, which works for quick launches and later migration to a dedicated operations wallet."
				},
				trading: {
					title: "Trading Preparation",
					description: "This page deploys the token and records the default exchange plus paired token, but it does not create liquidity, add a pool, or handle market making. You still need to complete pair setup and initial liquidity separately."
				}
			}
		},
		successSummary: {
			title: "Creation Summary",
			description: "Your tax token has been created successfully. Keep the following configuration and on-chain details for future review, display setup, and documentation.",
			chain: "Network",
			name: "Token Name",
			symbol: "Token Symbol",
			totalSupply: "Total Supply",
			decimals: "Decimals",
			buyTax: "Buy Tax",
			sellTax: "Sell Tax",
			exchange: "Default Exchange",
			poolToken: "Paired Token",
			taxReceiver: "Fee Receiver",
			tokenAddress: "Token Address",
			txHash: "Transaction Hash"
		},
		nextSteps: {
			title: "Next Steps",
			description: "After deployment, we recommend completing the following steps so the team can move more smoothly into wallet display, liquidity setup, and live trading checks.",
			addWallet: {
				title: "Add to Wallet",
				description: "Import the token into common wallets using the contract address, symbol, and decimals and confirm it displays correctly."
			},
			verifyFees: {
				title: "Create Liquidity (DEX)",
				description: "Create the trading pair on your target DEX with the selected paired token and add the initial liquidity for follow-up trading checks."
			},
			reviewPairing: {
				title: "Verify Tax & Trade Path",
				description: "After liquidity is added, run small buy and sell tests to confirm the tax rates, fee receiver, and default trading route behave as expected."
			},
			metadata: {
				title: "Complete Logo & Metadata",
				description: "Prepare the logo, description, website, and social links to improve how the token appears across wallets, explorers, and documentation pages."
			},
			note: "This page only deploys the tax token. It does not create liquidity, add a pool, or handle market-making steps."
		},
		seoBody: {
			highlights: {
				title: "Best-fit scenarios",
				template: {
					title: "Projects that need trading-tax logic",
					description: "If your {{tokenType}} launch requires explicit buy and sell tax settings, this flow is a better fit than the standard-token flow because those rate-related parameters are confirmed during deployment."
				},
				control: {
					title: "Agencies and operations teams",
					description: "For agencies, launch teams, or operators, collecting the tax rates, fee receiver, default exchange, and paired token in one flow reduces handoff mistakes and makes delivery clearer."
				},
				receiver: {
					title: "Projects with a dedicated treasury path",
					description: "If trading-tax proceeds need to be routed to a specific operations or treasury wallet, this flow lets you set that address during deployment instead of handling it elsewhere later."
				}
			},
			faq: {
				title: "Frequently asked questions",
				noCode: {
					question: "Do I need to write a contract to create a tax token on {{chain}}?",
					answer: "No custom Solidity contract is required for this flow. The deployment uses a preconfigured tax-token factory, but you still need to confirm the token name, supply, tax rates, and fee receiver settings."
				},
				fee: {
					question: "Does the creation fee include gas?",
					answer: "No. The creation fee comes from the factory contract, while gas is estimated and charged separately by the wallet when you submit the transaction."
				},
				template: {
					question: "Is this page for standard tokens or tax tokens?",
					answer: "This page is fixed to the tax-token creation flow. There is no toggle to fall back to the standard-token flow here. Buy tax, sell tax, fee receiver, and default pairing settings are all part of this deployment path."
				},
				receiver: {
					question: "Can I leave the fee receiver address empty?",
					answer: "Yes. If the field is empty, the connected wallet address is used as the fee receiver by default. If your project has a dedicated treasury or operations address, it is better to enter it before deployment."
				},
				poolToken: {
					question: "Why do I need to choose a paired token?",
					answer: "The paired token records the market asset this tax token is intended to trade against, such as the native token or a stablecoin. It does not create liquidity for you, but it preserves the intended market setup and should usually match your later liquidity plan."
				},
				liquidity: {
					question: "Will this page create liquidity or a trading pool automatically?",
					answer: "No. The current page only deploys the tax token and returns the token address plus transaction hash. It does not create liquidity, add a pool, or perform market-making tasks."
				}
			}
		},
		modal: {
			progressTitle: "Creating tax token",
			successTitle: "Tax token created successfully",
			errorTitle: "Tax token creation failed",
			errorDescription: "The transaction did not complete on-chain. Check the wallet status, network, and balance, then try again."
		}
	},
	acceptance: {
		eyebrow: "Internal Workspace",
		title: "Project Acceptance",
		description: "A static, role-based acceptance workspace for reviewing feature progress, task status, risks, and next milestones.",
		seo: {
			title: "Project Acceptance Workspace | {{chain}} Delivery Board",
			description: "Track feature completion, task progress, role-based delivery status, and launch readiness for the current {{chain}} workspace.",
			keywords: "{{chain}} project acceptance, delivery board, role progress, launch readiness"
		},
		summary: {
			project: "Project",
			stage: "Current Stage",
			completion: "Overall Completion",
			risks: "High Risks",
			completedFeatures: "Completed Features",
			inProgressFeatures: "In Progress",
			backlogFeatures: "Backlog"
		},
		sections: {
			functions: "Function Acceptance",
			roles: "Role Progress Board",
			tasks: "Task Breakdown",
			risks: "Risks & Next Steps",
			links: "Links"
		},
		labels: {
			completion: "Completion",
			status: "Status",
			owner: "Owner",
			updatedAt: "Updated",
			role: "Role",
			priority: "Priority",
			blocked: "Blocked",
			note: "Note",
			themes: "Themes"
		},
		roles: {
			productDiscovery: "Product Discovery",
			productDelivery: "Product Delivery",
			engineering: "Engineering",
			qa: "QA",
			lead: "Project Lead",
			userAcceptance: "User Acceptance"
		},
		statuses: {
			not_started: "Not Started",
			in_progress: "In Progress",
			blocked: "Blocked",
			done: "Done"
		},
		priorities: {
			high: "High",
			medium: "Medium",
			low: "Low"
		},
		actions: { openFeature: "Open feature page" }
	}
};
//#endregion
//#region src/i18n/locales/zh-cn.ts
var zhCnMessages = {
	common: {
		overview: "概览",
		backToTop: "回到顶部",
		nativeToken: "原生币",
		copy: {
			idle: "复制",
			copied: "已复制",
			success: "复制成功",
			failed: "复制失败"
		},
		exception: {
			possibleReasons: "失败的原因",
			errorReason1: "{{chain}}链上拥堵，请稍后再试。",
			errorReason2: "请确保您的账户有足够的余额进行上链操作。",
			contactOfficialSupport: "如果您仍无法找到解决方案，请联系官方客服以获取帮助。"
		}
	},
	mobile: {
		menu: "菜单",
		routes: "页面导航",
		settings: "页面设置",
		controls: "页面控制"
	},
	app: {
		name: "Web3 代币",
		tagline: "专业代币工具"
	},
	footer: {
		copyright: "Web3 Token © 2026",
		emailLabel: "Email"
	},
	nav: {
		tokenCreation: "标准代币",
		tokenTaxCreation: "税费代币",
		projectAcceptance: "项目验收"
	},
	topbar: {
		language: "语言",
		theme: "主题",
		themeColor: "主题色",
		chain: "链"
	},
	theme: {
		light: "白天",
		dark: "黑暗",
		orange: "橙色",
		purple: "紫色",
		green: "绿色"
	},
	wallet: {
		connect: "连接钱包",
		connecting: "连接中...",
		connected: "已连接",
		disconnect: "断开连接",
		wrongChain: "切换网络"
	},
	tokenCreation: {
		eyebrow: "",
		title: "创建标准代币",
		description: "{{standard}} 标准代币创建，一分钟快速创建 {{tokenType}} 代币，快速简单且便宜，无需任何编程，干净合约，无税无功能，一键发行你的专属代币。",
		seo: {
			title: "创建 {{chain}} {{tokenType}} 代币 | 快速、简单且便宜",
			description: "安全便捷，一分钟快速在 {{chain}} 上创建 {{tokenType}} 代币，无需任何编程，适合标准代币发行场景。",
			keywords: "创建 {{tokenType}} 代币, {{tokenType}} 发币, {{chain}} Token Maker"
		},
		fields: {
			name: "代币全称",
			symbol: "代币简称",
			totalSupply: "发行量",
			decimals: "精度"
		},
		labels: { creationFee: "创建费" },
		placeholders: {
			name: "请输入代币全称",
			symbol: "请输入代币简称",
			totalSupply: "请输入发行量",
			decimals: "请输入精度"
		},
		tooltips: {
			name: "代币在钱包、区块浏览器和交易界面中展示的完整名称，建议与项目品牌名称保持一致。",
			symbol: "代币在钱包和交易界面中展示的简称，通常由字母或数字组成。",
			totalSupply: "代币的初始总发行量，创建前请确认是否符合你的发行计划。",
			decimals: "决定代币最小可分割单位，常规场景下建议使用 18 作为默认值。",
			creationFee: "创建费会从当前所选链的工厂合约中读取，提交交易时仍需另外支付链上 Gas。"
		},
		actions: {
			submit: "创建代币",
			submitting: "提交中...",
			close: "关闭",
			retry: "重试"
		},
		status: {
			idle: "填写表单并连接钱包后，即可发起标准代币创建。",
			loadingFee: "正在读取当前链的创建费...",
			preparing: "正在生成代币参数...",
			waitingWallet: "等待钱包签名...",
			pending: "交易已发送，等待链上确认...",
			success: "代币创建成功。"
		},
		steps: {
			preparing: "生成代币信息",
			waitingWallet: "请签名确认交易",
			pending: "正在创建代币",
			completed: "创建完成",
			failed: "创建失败"
		},
		errors: {
			nameRequired: "请输入代币名称。",
			nameTooLong: "代币名称最多 100 个字符。",
			symbolRequired: "请输入代币符号。",
			symbolTooLong: "代币符号最多 100 个字符。",
			supplyRequired: "请输入总量。",
			supplyInvalid: "总量必须是正整数。",
			decimalsInvalid: "小数位必须在 0 到 18 之间。",
			walletRequired: "提交前请先连接钱包。",
			walletUnavailable: "当前浏览器没有检测到注入钱包。",
			factoryUnavailable: "当前链没有配置标准代币工厂合约。",
			insufficientBalance: "当前余额不足以支付 gas 和创建费。",
			txFailed: "交易执行失败，请稍后再试。"
		},
		success: {
			title: "代币已创建",
			banner: "代币创建成功",
			tokenAddress: "代币地址",
			txHash: "交易哈希",
			openExplorer: "打开区块浏览器"
		},
		permission: {
			title: "标准代币",
			description: "在 EVM 兼容链上部署标准同质化代币合约，适用于基础资产发行、钱包展示以及后续在 DEX 建立交易市场。",
			highlights: {
				core: "标准接口代币",
				factory: "工厂合约部署",
				noAdmin: "无扩展管理权限"
			},
			cards: {
				basicInfo: {
					title: "基础信息",
					description: "代币创建成功后，返回的代币地址可用于钱包导入、浏览器查询以及后续的流动性配置。"
				},
				permissions: {
					title: "权限",
					description: "定位为基础标准代币，不集成额外的管理权限模块。默认不包含增发、暂停、黑白名单、交易税、手续费接收地址、自动流动性或回购等扩展控制逻辑。"
				},
				tradingFlow: {
					title: "实现交易流程",
					description: "代币创建成功仅代表合约已经部署，不等于已经具备可交易性。通常仍需完成钱包导入、DEX 建对、注入初始流动性、验证买卖路径，以及提交 Logo 与 Metadata 等后续步骤。"
				}
			}
		},
		successSummary: {
			title: "创建摘要",
			description: "代币已创建成功，请保存以下信息，便于后续添加钱包、配置交易和补充资料。",
			chain: "所在网络",
			name: "代币名称",
			symbol: "代币简称",
			totalSupply: "发行量",
			decimals: "精度",
			tokenAddress: "代币地址",
			txHash: "交易哈希"
		},
		nextSteps: {
			title: "下一步建议",
			description: "代币创建成功后，建议继续完成以下步骤，帮助用户更快识别、查看并交易你的代币。",
			addWallet: {
				title: "添加到钱包",
				description: "将代币地址、简称和精度添加到常用钱包，确认代币信息显示正常。"
			},
			addLiquidity: {
				title: "创建流动性（DEX）",
				description: "在目标 DEX 创建交易对并添加首笔流动性，为后续交易做好准备。"
			},
			goLive: {
				title: "开启交易支持",
				description: "完成流动性配置后，检查代币是否已可在目标交易入口中搜索和交易。"
			},
			metadata: {
				title: "完善 Logo 与代币资料",
				description: "补充 Logo、名称、简介、官网和社媒等资料，提升展示完整度与识别度。"
			},
			note: "不同钱包、DEX 和数据平台的展示与收录时间可能存在差异，请以各平台实际生效情况为准。"
		},
		seoBody: {
			highlights: {
				title: "适用目标人群",
				builder: {
					title: "项目方与运营团队",
					description: "当你需要为产品积分、社区发行、访问凭证或试点资产创建一个干净的标准代币合约时，这个流程更适合快速落地。"
				},
				agency: {
					title: "代发团队与自由职业者",
					description: "如果你需要为多个客户项目重复执行代币发行，这套共享流程可以减少反复维护自定义样板合约的成本。"
				},
				noCode: {
					title: "没有 Solidity 开发资源的团队",
					description: "你仍然需要钱包、Gas 和基本参数判断，但标准 {{tokenType}} 发币并不要求你自己编写合约代码。"
				}
			},
			faq: {
				title: "常见问题",
				noCode: {
					question: "在 {{chain}} 上创建代币需要会写代码吗？",
					answer: "不需要写代码。标准代币创建流程已经封装好了主要逻辑，但你仍需要理解代币名称、发行量、精度、钱包操作和创建后的基础上线步骤。"
				},
				fee: {
					question: "创建费里包含 Gas 吗？",
					answer: "不包含。创建费和链上 Gas 是两笔独立成本。页面会读取工厂创建费，真正提交交易时则由钱包再估算并支付 Gas。"
				},
				standard: {
					question: "当前创建出来的是什么类型的代币合约？",
					answer: "当前流程定位为 {{chain}} 上的标准同质化代币，适合基础发行场景；默认不额外集成复杂管理权限模块。"
				},
				trade: {
					question: "代币创建后会立刻可以交易吗？",
					answer: "不会自动可交易。合约部署成功只代表代币存在了，通常还需要导入钱包、建立 DEX 交易对、注入初始流动性，并验证买卖路径是否正常。"
				},
				decimals: {
					question: "精度可以在创建完成后再修改吗？",
					answer: "不能。精度属于部署时就写入合约的核心参数，标准代币创建完成后不能再改，所以签名前务必确认。"
				},
				chainChoice: {
					question: "为什么要选择 {{chain}} 发币？",
					answer: "{{chain}} 和其他 EVM 链相比，可能在 Gas 成本、钱包普及度、生态用户和上线后的分发效率上都不同。选链时应优先匹配你的受众和预算，而不是只看是否便宜。"
				}
			}
		},
		modal: {
			progressTitle: "正在创建标准代币",
			successTitle: "代币创建成功",
			errorTitle: "代币创建失败",
			errorDescription: "本次交易没有在链上成功完成，请检查钱包状态和余额后再试。",
			progressTip: "系统会先生成代币参数，然后由钱包弹出签名确认，确认后再把交易广播到链上。",
			errorReasonLabel: "可能原因",
			errorReasonOne: "当前钱包余额不足以支付 gas 和创建费。",
			errorReasonTwo: "当前链或工厂合约不可用，或者交易在钱包侧被拒绝。"
		},
		themes: {
			orange: "Atlas 工具主题",
			purple: "Pulse 营销主题",
			green: "Forge 控制台主题"
		}
	},
	tokenTaxCreation: {
		eyebrow: "",
		title: "创建税费代币",
		description: "在 {{chain}} 上快速创建 {{tokenType}} 税费代币，支持买入税、卖出税、税费接收地址以及默认交易对配置，无需编写合约代码。",
		seo: {
			title: "创建 {{chain}} {{tokenType}} 税费代币 | 买卖税快速部署",
			description: "一页完成 {{chain}} {{tokenType}} 税费代币创建，支持买入税、卖出税、税费接收地址和交易对底池币设置，适合需要交易税逻辑的代币发行场景。",
			keywords: "创建 {{tokenType}} 税费代币, 买卖税代币, {{chain}} Tax Token Maker, Token Tax Creator"
		},
		fields: {
			name: "代币全称",
			symbol: "代币简称",
			totalSupply: "发行量",
			decimals: "精度",
			buyTax: "买入税",
			sellTax: "卖出税",
			taxReceiver: "税费接收地址",
			exchange: "添加流动性的交易所",
			poolToken: "底池配对币种"
		},
		labels: {
			creationFee: "创建费",
			taxConfiguration: "税费配置",
			taxConfigurationNote: "税费代币模式下，交易产生的税费将自动转入至代币创建者的钱包地址中。",
			taxReceiverDefault: "留空时默认使用当前连接钱包地址作为税费接收地址。",
			poolTokenNote: "用于记录默认配对币种信息，支持从预设币种中选择，也支持输入自定义代币地址。"
		},
		placeholders: {
			name: "请输入代币全称",
			symbol: "请输入代币简称",
			totalSupply: "请输入发行量",
			decimals: "请输入精度",
			buyTax: "请输入买入税，例如 5",
			sellTax: "请输入卖出税，例如 5",
			taxReceiver: "请输入税费接收地址，留空默认当前钱包地址",
			poolToken: "请选择或输入底池币种地址"
		},
		tooltips: {
			name: "代币在钱包、区块浏览器和交易界面中展示的完整名称，建议与项目品牌名称保持一致。",
			symbol: "代币在钱包和交易界面中展示的简称，通常由字母或数字组成。",
			totalSupply: "代币的初始总发行量，创建前请确认是否符合你的发行计划。",
			decimals: "决定代币最小可分割单位，常规场景下建议使用 18 作为默认值。",
			buyTax: "买入税按百分比填写，支持最多两位小数，当前限制在 0 到 25 之间。",
			sellTax: "卖出税按百分比填写，支持最多两位小数，当前限制在 0 到 25 之间。",
			taxReceiver: "税费接收地址用于接收买卖产生的税费；如果留空，则默认使用当前提交交易的钱包地址。",
			exchange: "税费代币部署后，支持在该交易所执行税费模式。",
			poolToken: "请选择交易底池代币（如 {{nativeSymbol}}、{{stableSymbol}} 等），后续流动性必须使用相同底池代币，确保代币交易正常运行。",
			creationFee: "创建费会从当前所选税费工厂中读取，提交交易时仍需另外支付链上 Gas。"
		},
		actions: {
			submit: "创建税费代币",
			submitting: "提交中...",
			close: "关闭",
			retry: "重试"
		},
		status: {
			searchingToken: "正在链上搜索代币...",
			noTokenInfo: "暂无代币信息"
		},
		steps: {
			preparing: "生成税费代币参数",
			waitingWallet: "请签名确认交易",
			pending: "正在创建税费代币",
			completed: "创建完成",
			failed: "创建失败"
		},
		errors: {
			nameRequired: "请输入代币名称。",
			nameTooLong: "代币名称最多 100 个字符。",
			symbolRequired: "请输入代币符号。",
			symbolTooLong: "代币符号最多 100 个字符。",
			supplyRequired: "请输入总量。",
			supplyInvalid: "总量必须是正整数。",
			decimalsInvalid: "小数位必须在 0 到 18 之间。",
			buyTaxInvalid: "买入税必须是 0 到 25 之间、最多两位小数的数值。",
			sellTaxInvalid: "卖出税必须是 0 到 25 之间、最多两位小数的数值。",
			taxReceiverInvalid: "请输入有效的 EVM 地址。",
			exchangeRequired: "请选择默认交易所。",
			poolTokenRequired: "请选择或输入底池币种。",
			tokenLookupFailed: "代币地址解析失败，请确认该地址为有效 ERC20 合约。",
			walletRequired: "提交前请先连接钱包。",
			walletUnavailable: "当前浏览器没有检测到注入钱包。",
			factoryUnavailable: "当前链没有配置税费代币工厂合约。",
			insufficientBalance: "当前余额不足以支付 gas 和创建费。"
		},
		success: {
			title: "税费代币已创建",
			banner: "税费代币创建成功",
			tokenAddress: "代币地址",
			txHash: "交易哈希"
		},
		overview: {
			title: "税费代币",
			description: "该流程适用于需要链上买卖税配置的 {{tokenType}} 代币发行场景，适合在发币阶段同步确认税率、接收地址和默认配对设置。",
			highlights: {
				base: "税费发行",
				buy: "买入税配置",
				sell: "卖出税配置",
				receiver: "税费接收地址"
			},
			cards: {
				taxPlan: {
					title: "税率计划",
					description: "买入税和卖出税会在部署时写入合约初始配置，适合需要明确费率展示、交易路径验证和后续运营对账的发行场景。"
				},
				receiver: {
					title: "接收地址",
					description: "税费接收地址支持单独指定；如未填写，则默认使用当前连接钱包地址，适合快速部署，也方便后续切换到独立运营或归集钱包。"
				},
				trading: {
					title: "交易准备",
					description: "当前页面仅负责部署代币并记录默认交易所与配对币种，不会自动创建流动性、加池或做市；如需开始交易，仍需自行完成建对与首笔流动性配置。"
				}
			}
		},
		successSummary: {
			title: "创建摘要",
			description: "税费代币已创建成功，请保存以下参数和链上信息，便于后续核对费率设置、钱包展示和资料补充。",
			chain: "所在网络",
			name: "代币名称",
			symbol: "代币简称",
			totalSupply: "发行量",
			decimals: "精度",
			buyTax: "买入税",
			sellTax: "卖出税",
			exchange: "默认交易所",
			poolToken: "底池配对币种",
			taxReceiver: "税费接收地址",
			tokenAddress: "代币地址",
			txHash: "交易哈希"
		},
		nextSteps: {
			title: "下一步建议",
			description: "税费代币部署完成后，建议继续完成以下步骤，帮助团队更快完成展示准备、流动性配置和交易验证。",
			addWallet: {
				title: "添加到钱包",
				description: "将代币地址、简称和精度添加到常用钱包，确认代币信息显示正常。"
			},
			verifyFees: {
				title: "创建流动性（DEX）",
				description: "在目标 DEX 使用本次选定的默认配对币种创建交易对并添加首笔流动性，为后续买卖测试做好准备。"
			},
			reviewPairing: {
				title: "验证税率与交易路径",
				description: "完成加池后，用小额买入和卖出确认税率、税费接收地址以及默认交易路径是否符合预期。"
			},
			metadata: {
				title: "完善 Logo 与代币资料",
				description: "补充 Logo、简介、官网和社媒等资料，提升钱包、浏览器和资料页的展示完整度。"
			},
			note: "当前页面只负责部署税费代币，不包含创建流动性、加池或做市操作。"
		},
		seoBody: {
			highlights: {
				title: "适用场景",
				template: {
					title: "需要交易税逻辑的项目",
					description: "如果你的 {{tokenType}} 代币发行需要明确的买卖税设置，这个流程会比标准代币流程更适合，因为税率相关参数会在创建阶段一并确认。"
				},
				control: {
					title: "代发团队与运营协作",
					description: "对代发团队、工作室或运营团队来说，税率、税费接收地址、默认交易所与配对币种能在单页里集中确认，减少交付和沟通成本。"
				},
				receiver: {
					title: "需要独立税费归集地址",
					description: "如果项目需要将交易税统一归集到指定地址，这个流程可以在部署时直接记录税费接收地址，而不需要后续再通过其他页面补配置。"
				}
			},
			faq: {
				title: "常见问题",
				noCode: {
					question: "在 {{chain}} 上创建税费代币需要自己写合约吗？",
					answer: "不需要自己编写 Solidity 合约。当前流程基于预设税费工厂完成部署，但你仍需要确认代币名称、发行量、税率和税费接收地址等关键参数。"
				},
				fee: {
					question: "创建费里包含 Gas 吗？",
					answer: "不包含。创建费来自税费工厂合约本身，而链上 Gas 由钱包在提交交易时单独估算和支付。"
				},
				template: {
					question: "这个页面创建的是标准代币还是税费代币？",
					answer: "当前页面固定为税费代币创建流程，不提供切换到标准代币创建流程的开关。买入税、卖出税、税费接收地址和默认配对设置都属于当前部署流程的一部分。"
				},
				receiver: {
					question: "税费接收地址可以留空吗？",
					answer: "可以。留空时系统会默认使用当前提交交易的钱包地址作为税费接收地址。如果你的项目有单独的运营或归集地址，建议在创建前直接填入。"
				},
				poolToken: {
					question: "为什么要选择底池配对币种？",
					answer: "底池币种用于记录这个税费代币默认面向哪种配对资产，常见选择包括链原生币和稳定币。它不会替你自动创建流动性，但能帮助你保存当前的市场配置意图，后续建池时通常也应与这里保持一致。"
				},
				liquidity: {
					question: "页面会自动帮我创建流动性或交易池吗？",
					answer: "不会。当前页面仅负责部署税费代币，并返回代币地址与交易哈希，不包含创建流动性、加池或做市功能。"
				}
			}
		},
		modal: {
			progressTitle: "正在创建税费代币",
			successTitle: "税费代币创建成功",
			errorTitle: "税费代币创建失败",
			errorDescription: "本次交易没有在链上成功完成，请检查钱包状态、网络和余额后再试。"
		}
	},
	acceptance: {
		eyebrow: "内部工作台",
		title: "项目功能验收",
		description: "一个静态配置驱动的角色化验收工作台，用来查看功能进展、任务状态、风险和下一阶段里程碑。",
		seo: {
			title: "{{chain}} 项目功能验收工作台",
			description: "查看当前 {{chain}} 工作区下的功能完成度、岗位进度、任务状态与上线准备情况。",
			keywords: "{{chain}} 项目验收, 功能进度, 岗位看板, 上线准备"
		},
		summary: {
			project: "项目",
			stage: "当前阶段",
			completion: "总体完成度",
			risks: "高风险项",
			completedFeatures: "已完成功能",
			inProgressFeatures: "进行中功能",
			backlogFeatures: "待启动功能"
		},
		sections: {
			functions: "功能验收列表",
			roles: "岗位进度板",
			tasks: "任务级明细",
			risks: "风险与下一步",
			links: "相关链接"
		},
		labels: {
			completion: "完成度",
			status: "状态",
			owner: "负责人",
			updatedAt: "更新时间",
			role: "岗位",
			priority: "优先级",
			blocked: "是否阻塞",
			note: "备注",
			themes: "主题试点"
		},
		roles: {
			productDiscovery: "产品构思",
			productDelivery: "产品落地",
			engineering: "开发",
			qa: "测试",
			lead: "总负责",
			userAcceptance: "用户验收"
		},
		statuses: {
			not_started: "未开始",
			in_progress: "进行中",
			blocked: "阻塞",
			done: "已完成"
		},
		priorities: {
			high: "高",
			medium: "中",
			low: "低"
		},
		actions: { openFeature: "打开功能页" }
	}
};
//#endregion
//#region src/i18n/messages.ts
var messages = {
	"en-us": enUsMessages,
	"zh-cn": zhCnMessages
};
function lookupMessage(tree, path) {
	return path.split(".").reduce((current, key) => {
		if (!current || typeof current === "string") return current;
		return current[key];
	}, tree);
}
function createTranslator(lang) {
	return (key, vars) => {
		const raw = lookupMessage(messages[lang] ?? messages["en-us"], key);
		if (typeof raw !== "string") return key;
		return Object.entries(vars ?? {}).reduce((message, [token, value]) => {
			return message.replaceAll(`{{${token}}}`, String(value));
		}, raw);
	};
}
//#endregion
//#region src/app/use-route-context.ts
function getPageFromPathname(pathname) {
	return pathname.split("/").filter(Boolean)[2];
}
function useRouteContext() {
	const params = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const rawTheme = searchParams.get("theme");
	const rawThemeColor = searchParams.get("themeColor");
	const resolvedPreferences = useMemo(() => resolveAppPreferences({
		lang: params.lang,
		chain: params.chain,
		theme: rawTheme,
		themeColor: rawThemeColor
	}), [
		params.chain,
		params.lang,
		rawTheme,
		rawThemeColor
	]);
	const lang = resolvedPreferences.lang;
	const chain = resolvedPreferences.chain;
	const rawPage = getPageFromPathname(location.pathname);
	const page = isSupportedPage(rawPage) ? rawPage : DEFAULT_PAGE;
	const hasThemeQuery = Boolean(rawTheme || rawThemeColor);
	const theme = resolvedPreferences.theme;
	const themeColor = resolvedPreferences.themeColor;
	const chainDefinition = getChainDefinition(chain);
	const themeColorDefinition = getThemeColorDefinition(themeColor);
	const t = useMemo(() => createTranslator(lang), [lang]);
	useEffect(() => {
		rememberSessionPreferences({
			lang,
			chain,
			theme,
			themeColor
		});
	}, [
		chain,
		lang,
		theme,
		themeColor
	]);
	function navigateToPage(nextPage, options) {
		const nextPreferences = {
			lang: options?.nextLang ?? lang,
			chain: options?.nextChain ?? chain,
			theme: options?.nextTheme ?? theme,
			themeColor: options?.nextThemeColor ?? themeColor
		};
		if (options?.persist === "session") rememberSessionPreferences(nextPreferences);
		else if ((options?.persist ?? "session+local") === "session+local") rememberUserPreferences(nextPreferences);
		navigate(buildPagePath(nextPreferences.lang, nextPreferences.chain, nextPage, {
			theme: nextPreferences.theme,
			themeColor: nextPreferences.themeColor
		}), { replace: options?.replace ?? false });
	}
	return {
		lang,
		chain,
		page,
		theme,
		themeColor,
		hasThemeQuery,
		t,
		chainDefinition,
		themeColorDefinition,
		navigateToPage
	};
}
//#endregion
//#region src/components/common/topbar-icons.tsx
function BaseIcon(props) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "1.8",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": "true",
		...props
	});
}
function LanguageIcon() {
	return /* @__PURE__ */ jsx(GlobalOutlined, {});
}
function ThemeIcon(props) {
	return /* @__PURE__ */ jsx(BaseIcon, {
		...props,
		children: /* @__PURE__ */ jsx("path", { d: "M12 3a9 9 0 109 9c0-.3-.2-.5-.5-.5A7.5 7.5 0 0112.5 4c0-.3-.2-.5-.5-.5z" })
	});
}
function SunIcon(props) {
	return /* @__PURE__ */ jsxs(BaseIcon, {
		...props,
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "4"
			}),
			/* @__PURE__ */ jsx("path", { d: "M12 2.5v2.5" }),
			/* @__PURE__ */ jsx("path", { d: "M12 19v2.5" }),
			/* @__PURE__ */ jsx("path", { d: "M4.9 4.9l1.8 1.8" }),
			/* @__PURE__ */ jsx("path", { d: "M17.3 17.3l1.8 1.8" }),
			/* @__PURE__ */ jsx("path", { d: "M2.5 12H5" }),
			/* @__PURE__ */ jsx("path", { d: "M19 12h2.5" }),
			/* @__PURE__ */ jsx("path", { d: "M4.9 19.1l1.8-1.8" }),
			/* @__PURE__ */ jsx("path", { d: "M17.3 6.7l1.8-1.8" })
		]
	});
}
function PaletteIcon(props) {
	return /* @__PURE__ */ jsxs(BaseIcon, {
		...props,
		children: [
			/* @__PURE__ */ jsx("path", { d: "M12 4a8 8 0 100 16h1a2 2 0 000-4h-1a2 2 0 010-4h5a3 3 0 003-3 5 5 0 00-5-5h-3z" }),
			/* @__PURE__ */ jsx("circle", {
				cx: "7.5",
				cy: "10",
				r: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "10",
				cy: "7.5",
				r: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "15",
				cy: "7.5",
				r: "1"
			})
		]
	});
}
function SettingsIcon(props) {
	return /* @__PURE__ */ jsxs(BaseIcon, {
		...props,
		children: [/* @__PURE__ */ jsx("circle", {
			cx: "12",
			cy: "12",
			r: "3"
		}), /* @__PURE__ */ jsx("path", { d: "M19 12a7 7 0 00-.08-1l2.05-1.6-2-3.46-2.48.77a7 7 0 00-1.73-1L14.4 2h-4.8l-.36 2.71a7 7 0 00-1.73 1l-2.48-.77-2 3.46L5.08 11a7 7 0 000 2l-2.05 1.6 2 3.46 2.48-.77a7 7 0 001.73 1L9.6 22h4.8l.36-2.71a7 7 0 001.73-1l2.48.77 2-3.46L18.92 13c.05-.33.08-.66.08-1z" })]
	});
}
function ArrowUpIcon(props) {
	return /* @__PURE__ */ jsxs(BaseIcon, {
		...props,
		children: [/* @__PURE__ */ jsx("path", { d: "M12 19V5" }), /* @__PURE__ */ jsx("path", { d: "M6 11l6-6 6 6" })]
	});
}
//#endregion
//#region src/components/common/topbar-menu-button.tsx
function TopbarMenuButton({ ariaLabel, icon, value, options, onChange, showValue = false, className = "" }) {
	const activeOption = options.find((option) => option.key === value);
	return /* @__PURE__ */ jsx(Dropdown, {
		trigger: ["click"],
		placement: "bottom",
		classNames: { root: "topbar-menu-popup" },
		getPopupContainer: (triggerNode) => triggerNode.parentElement ?? document.body,
		menu: {
			items: options.map((option) => ({
				key: option.key,
				label: /* @__PURE__ */ jsx("div", {
					className: `topbar-menu-option ${option.key === value ? "active" : ""}`,
					children: /* @__PURE__ */ jsxs("div", {
						className: "topbar-menu-option-main",
						children: [option.prefix ? /* @__PURE__ */ jsx("span", {
							className: "topbar-menu-option-prefix",
							children: option.prefix
						}) : null, /* @__PURE__ */ jsx("span", { children: option.label })]
					})
				})
			})),
			selectable: false,
			onClick: ({ key }) => onChange(key)
		},
		children: /* @__PURE__ */ jsxs("button", {
			type: "button",
			className: `topbar-menu-button ${className}`.trim(),
			"aria-label": ariaLabel,
			children: [/* @__PURE__ */ jsxs("span", {
				className: "topbar-menu-button-main",
				children: [/* @__PURE__ */ jsx("span", {
					className: "topbar-menu-button-icon",
					children: icon
				}), showValue ? /* @__PURE__ */ jsx("span", {
					className: "topbar-menu-button-value",
					children: activeOption?.label ?? ariaLabel
				}) : null]
			}), /* @__PURE__ */ jsx("span", {
				className: "topbar-menu-button-arrow",
				"aria-hidden": "true",
				children: "▾"
			})]
		})
	});
}
//#endregion
//#region src/components/language/language-switcher.tsx
function LanguageSwitcher({ showValue = false, className } = {}) {
	const { t, lang, page, chain, theme, themeColor, navigateToPage } = useRouteContext();
	return /* @__PURE__ */ jsx(TopbarMenuButton, {
		ariaLabel: t("topbar.language"),
		className,
		icon: /* @__PURE__ */ jsx(LanguageIcon, {}),
		value: lang,
		showValue,
		options: supportedLanguages.map((language) => ({
			key: language.key,
			label: language.label,
			code: language.key === "zh-cn" ? "ZH" : "EN",
			prefix: language.key === "zh-cn" ? "🇨🇳" : "🇺🇸"
		})),
		onChange: (nextLang) => navigateToPage(page, {
			nextLang,
			nextChain: chain,
			nextTheme: theme,
			nextThemeColor: themeColor
		})
	});
}
//#endregion
//#region src/config/navigation.ts
var navigationItems = [{
	page: "token-creation",
	titleKey: "nav.tokenCreation",
	slug: "token-creation"
}, {
	page: "tax-token-creation",
	titleKey: "nav.tokenTaxCreation",
	slug: "tax-token-creation"
}];
//#endregion
//#region src/components/theme/theme-switcher.tsx
function ThemeSwitcher({ showValue = false, className } = {}) {
	const { t, page, theme, themeColor, navigateToPage } = useRouteContext();
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(TopbarMenuButton, {
		ariaLabel: t("topbar.theme"),
		className,
		icon: theme === "light" ? /* @__PURE__ */ jsx(SunIcon, {}) : /* @__PURE__ */ jsx(ThemeIcon, {}),
		value: theme,
		showValue,
		options: themeModeRegistry.map((themeOption) => ({
			key: themeOption.id,
			label: t(`theme.${themeOption.id}`),
			code: themeOption.id === "light" ? "DAY" : "NIGHT",
			prefix: themeOption.id === "light" ? /* @__PURE__ */ jsx(SunIcon, {}) : /* @__PURE__ */ jsx(ThemeIcon, {})
		})),
		onChange: (nextTheme) => navigateToPage(page, { nextTheme })
	}), /* @__PURE__ */ jsx(TopbarMenuButton, {
		ariaLabel: t("topbar.themeColor"),
		className,
		icon: /* @__PURE__ */ jsx(PaletteIcon, {}),
		value: themeColor,
		showValue,
		options: themeColorRegistry.map((themeOption) => ({
			key: themeOption.id,
			label: t(`theme.${themeOption.id}`),
			code: themeOption.id.toUpperCase(),
			prefix: /* @__PURE__ */ jsx("span", { className: `theme-color-dot ${themeOption.id}` })
		})),
		onChange: (nextThemeColor) => navigateToPage(page, { nextThemeColor })
	})] });
}
//#endregion
//#region src/components/layout/app-footer.tsx
function AppFooter() {
	const { t } = useRouteContext();
	return /* @__PURE__ */ jsx("footer", {
		className: "app-footer",
		children: /* @__PURE__ */ jsxs("div", {
			className: "app-footer-inner",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "app-footer-brand",
				children: [/* @__PURE__ */ jsx("strong", { children: "Web3 Token" }), /* @__PURE__ */ jsx("span", { children: t("footer.copyright") })]
			}), /* @__PURE__ */ jsxs("a", {
				className: "app-footer-email",
				href: "mailto:support@create-solana-token.com",
				children: [/* @__PURE__ */ jsxs("span", { children: [t("footer.emailLabel"), ":"] }), /* @__PURE__ */ jsx("strong", { children: "support@create-solana-token.com" })]
			})]
		})
	});
}
//#endregion
//#region src/components/chain/chain-switcher.tsx
function ChainLogo({ src, alt }) {
	return /* @__PURE__ */ jsx("img", {
		className: "chain-menu-logo",
		src,
		alt
	});
}
function ChainSwitcher() {
	if (useRenderMode() === "static") return /* @__PURE__ */ jsx(StaticChainSwitcher, {});
	return /* @__PURE__ */ jsx(InteractiveChainSwitcher, {});
}
function StaticChainSwitcher() {
	const { t, chain } = useRouteContext();
	const currentChain = supportedChains.find((chainOption) => chainOption.key === chain) ?? supportedChains[0];
	return /* @__PURE__ */ jsx(TopbarMenuButton, {
		ariaLabel: t("topbar.chain"),
		icon: /* @__PURE__ */ jsx(ChainLogo, {
			src: currentChain.icon,
			alt: currentChain.fullName
		}),
		value: chain,
		options: supportedChains.map((chainOption) => ({
			value: chainOption.key,
			key: chainOption.key,
			label: chainOption.fullName,
			code: chainOption.name,
			prefix: /* @__PURE__ */ jsx(ChainLogo, {
				src: chainOption.icon,
				alt: chainOption.fullName
			})
		})),
		onChange: () => void 0
	});
}
function InteractiveChainSwitcher() {
	const { t, chain, page, lang, theme, themeColor, navigateToPage } = useRouteContext();
	const { isConnected, chainId } = useAccount();
	const { switchChainAsync } = useSwitchChain();
	const currentChain = supportedChains.find((chainOption) => chainOption.key === chain) ?? supportedChains[0];
	return /* @__PURE__ */ jsx(TopbarMenuButton, {
		ariaLabel: t("topbar.chain"),
		icon: /* @__PURE__ */ jsx(ChainLogo, {
			src: currentChain.icon,
			alt: currentChain.fullName
		}),
		value: chain,
		options: supportedChains.map((chainOption) => ({
			value: chainOption.key,
			key: chainOption.key,
			label: chainOption.fullName,
			code: chainOption.name,
			prefix: /* @__PURE__ */ jsx(ChainLogo, {
				src: chainOption.icon,
				alt: chainOption.fullName
			})
		})),
		onChange: (nextChain) => {
			const nextChainKey = nextChain;
			if (nextChainKey === chain) return;
			const target = supportedChains.find((item) => item.key === nextChainKey);
			if (isConnected && target) {
				if (chainId === target.chainId) {
					navigateToPage(page, {
						nextLang: lang,
						nextChain: nextChainKey,
						nextTheme: theme,
						nextThemeColor: themeColor,
						replace: true
					});
					return;
				}
				switchChainAsync({ chainId: target.chainId }).catch(() => void 0);
				return;
			}
			navigateToPage(page, {
				nextLang: lang,
				nextChain: nextChainKey,
				nextTheme: theme,
				nextThemeColor: themeColor,
				replace: true
			});
		}
	});
}
//#endregion
//#region src/components/wallet/connect-wallet-button.tsx
function shortAddress(value) {
	return `${value.slice(0, 6)}...${value.slice(-4)}`;
}
function SwitchNetworkIcon() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "10",
				stroke: "currentColor",
				strokeWidth: "1.8"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M12 6.9l4.3 7.45a.7.7 0 01-.61 1.05H8.3a.7.7 0 01-.61-1.05L12 6.9z",
				fill: "currentColor",
				stroke: "none"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M12 10.2v2.35",
				stroke: "#fff",
				strokeWidth: "1.6",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "14.2",
				r: "0.95",
				fill: "#fff"
			})
		]
	});
}
function ConnectWalletButton() {
	if (useRenderMode() === "static") return /* @__PURE__ */ jsx(StaticConnectWalletButton, {});
	return /* @__PURE__ */ jsx(InteractiveConnectWalletButton, {});
}
function StaticConnectWalletButton() {
	const { t } = useRouteContext();
	return /* @__PURE__ */ jsx("button", {
		className: "wallet-button",
		type: "button",
		children: t("wallet.connect")
	});
}
function InteractiveConnectWalletButton() {
	const { t, chain, page, lang, theme, themeColor, chainDefinition, navigateToPage } = useRouteContext();
	const { open } = useAppKit();
	const { address, isConnected, status } = useAppKitAccount();
	const { chainId, switchNetwork } = useAppKitNetwork();
	const { walletInfo } = useWalletInfo();
	const isConnecting = status === "connecting";
	const walletChain = useMemo(() => chainId == null ? void 0 : supportedChains.find((item) => item.chainId === chainId), [chainId]);
	const isRouteSyncPending = isConnected && walletChain != null && walletChain.key !== chain;
	const isWrongChain = isConnected && !isRouteSyncPending && !(isConnected && address != null && chainId == null) && chainId !== chainDefinition.chainId;
	const targetNetwork = chainDefinition.key === "bsc" ? bsc : chainDefinition.key === "bsc-testnet" ? bscTestnet : chainDefinition.key === "base" ? base : mainnet;
	useLayoutEffect(() => {
		if (!isConnected || walletChain == null) return;
		if (walletChain.key === chain) return;
		navigateToPage(page, {
			nextLang: lang,
			nextChain: walletChain.key,
			nextTheme: theme,
			nextThemeColor: themeColor,
			persist: "session",
			replace: true
		});
	}, [
		chain,
		isConnected,
		lang,
		navigateToPage,
		page,
		theme,
		themeColor,
		walletChain
	]);
	if (isConnected && address) {
		if (isWrongChain) return /* @__PURE__ */ jsxs("button", {
			className: "wallet-button wallet-button-danger",
			onClick: () => void switchNetwork?.(targetNetwork),
			type: "button",
			children: [/* @__PURE__ */ jsx("span", {
				className: "wallet-button-switch-icon",
				children: /* @__PURE__ */ jsx(SwitchNetworkIcon, {})
			}), t("wallet.wrongChain")]
		});
		return /* @__PURE__ */ jsxs("button", {
			className: "wallet-button wallet-button-connected",
			type: "button",
			onClick: () => void open(),
			children: [walletInfo?.icon ? /* @__PURE__ */ jsx("img", {
				className: "wallet-button-icon",
				src: walletInfo.icon,
				alt: "wallet"
			}) : null, shortAddress(address)]
		});
	}
	return /* @__PURE__ */ jsx("button", {
		className: "wallet-button",
		disabled: isConnecting,
		onClick: () => void open(),
		type: "button",
		children: isConnecting ? t("wallet.connecting") : t("wallet.connect")
	});
}
//#endregion
//#region src/components/layout/topbar.tsx
function Topbar({ onOpenMobileControls }) {
	const { t, themeColor } = useRouteContext();
	return /* @__PURE__ */ jsxs("div", {
		className: "topbar",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "brand",
			children: [/* @__PURE__ */ jsx("div", {
				className: "brand-mark",
				children: /* @__PURE__ */ jsx("img", {
					src: `/img/common/logo-${themeColor}.png`,
					alt: `${t("app.name")} logo`
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "description",
				children: [/* @__PURE__ */ jsx("strong", { children: t("app.name") }), /* @__PURE__ */ jsx("span", { children: t("app.tagline") })]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "topbar-actions",
			children: [
				/* @__PURE__ */ jsx(ChainSwitcher, {}),
				/* @__PURE__ */ jsxs("div", {
					className: "topbar-desktop-controls",
					children: [/* @__PURE__ */ jsx(LanguageSwitcher, {}), /* @__PURE__ */ jsx(ThemeSwitcher, {})]
				}),
				/* @__PURE__ */ jsx(ConnectWalletButton, {}),
				/* @__PURE__ */ jsx("button", {
					className: "topbar-utility-button mobile-only",
					onClick: onOpenMobileControls,
					type: "button",
					"aria-label": t("mobile.controls"),
					children: /* @__PURE__ */ jsx(SettingsIcon, {})
				})
			]
		})]
	});
}
//#endregion
//#region src/components/layout/app-shell.tsx
function AppShell({ children }) {
	const { t, page, theme, themeColor, navigateToPage } = useRouteContext();
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
	const [showScrollTop, setShowScrollTop] = useState(false);
	const logoSrc = `/img/common/logo-${themeColor}.png`;
	const navItems = useMemo(() => navigationItems.map((item) => ({
		...item,
		label: t(item.titleKey)
	})), [t]);
	useEffect(() => {
		const faviconHref = `/img/common/favicon-${themeColor}.ico`;
		let faviconLink = document.querySelector("link[data-app-favicon]");
		if (!faviconLink) {
			faviconLink = document.createElement("link");
			faviconLink.rel = "icon";
			faviconLink.type = "image/x-icon";
			faviconLink.setAttribute("data-app-favicon", "true");
			document.head.appendChild(faviconLink);
		}
		faviconLink.href = faviconHref;
	}, [themeColor]);
	useEffect(() => {
		const body = document.body;
		const themeClass = `app-theme-${theme}`;
		const themeColorClass = `app-theme-color-${themeColor}`;
		body.classList.add("app-theme", themeClass, themeColorClass);
		return () => {
			body.classList.remove("app-theme", themeClass, themeColorClass);
		};
	}, [theme, themeColor]);
	useEffect(() => {
		function updateScrollTopVisibility() {
			const nextVisible = window.scrollY > 100;
			setShowScrollTop((currentVisible) => currentVisible === nextVisible ? currentVisible : nextVisible);
		}
		updateScrollTopVisibility();
		window.addEventListener("scroll", updateScrollTopVisibility, { passive: true });
		return () => {
			window.removeEventListener("scroll", updateScrollTopVisibility);
		};
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: `app-shell theme-${theme} theme-color-${themeColor}`,
		children: [
			/* @__PURE__ */ jsx(Topbar, { onOpenMobileControls: () => setMobileDrawerOpen(true) }),
			/* @__PURE__ */ jsx(Drawer, {
				className: "mobile-drawer mobile-only",
				closeIcon: false,
				onClose: () => setMobileDrawerOpen(false),
				open: mobileDrawerOpen,
				placement: "right",
				title: /* @__PURE__ */ jsxs("div", {
					className: "mobile-drawer-brand",
					children: [/* @__PURE__ */ jsx("div", {
						className: "mobile-drawer-brand-mark",
						children: /* @__PURE__ */ jsx("img", {
							src: logoSrc,
							alt: `${t("app.name")} logo`
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "mobile-drawer-brand-copy",
						children: [/* @__PURE__ */ jsx("strong", { children: t("app.name") }), /* @__PURE__ */ jsx("span", { children: t("app.tagline") })]
					})]
				}),
				width: 320,
				children: /* @__PURE__ */ jsxs("div", {
					className: "mobile-drawer-sections",
					children: [/* @__PURE__ */ jsxs("section", {
						className: "mobile-drawer-section",
						children: [/* @__PURE__ */ jsx("h3", { children: t("mobile.routes") }), /* @__PURE__ */ jsx("div", {
							className: "mobile-panel-content",
							children: navItems.map((item) => /* @__PURE__ */ jsx("button", {
								className: `sidebar-link ${page === item.page ? "active" : ""}`,
								onClick: () => {
									navigateToPage(item.page);
									setMobileDrawerOpen(false);
								},
								type: "button",
								children: /* @__PURE__ */ jsx("span", { children: item.label })
							}, item.page))
						})]
					}), /* @__PURE__ */ jsxs("section", {
						className: "mobile-drawer-section",
						children: [/* @__PURE__ */ jsx("h3", { children: t("mobile.settings") }), /* @__PURE__ */ jsxs("div", {
							className: "mobile-settings-grid",
							children: [/* @__PURE__ */ jsx(LanguageSwitcher, {
								showValue: true,
								className: "mobile-settings-button"
							}), /* @__PURE__ */ jsx(ThemeSwitcher, {
								showValue: true,
								className: "mobile-settings-button"
							})]
						})]
					})]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "layout-grid",
				children: [/* @__PURE__ */ jsx("aside", {
					className: "sidebar-card",
					children: navItems.map((item) => /* @__PURE__ */ jsx("button", {
						className: `sidebar-link ${page === item.page ? "active" : ""}`,
						onClick: () => navigateToPage(item.page),
						type: "button",
						children: /* @__PURE__ */ jsx("span", { children: item.label })
					}, item.page))
				}), /* @__PURE__ */ jsx("main", {
					className: "page-shell",
					children
				})]
			}),
			/* @__PURE__ */ jsx(AppFooter, {}),
			/* @__PURE__ */ jsx("button", {
				"aria-label": t("common.backToTop"),
				className: `scroll-top-button ${showScrollTop ? "visible" : ""}`,
				onClick: () => window.scrollTo({
					top: 0,
					behavior: "smooth"
				}),
				type: "button",
				children: /* @__PURE__ */ jsx(ArrowUpIcon, {})
			})
		]
	});
}
//#endregion
//#region src/components/common/page-header.tsx
function PageHeader({ eyebrow, title, description, side }) {
	return /* @__PURE__ */ jsxs("header", {
		className: "page-header",
		children: [/* @__PURE__ */ jsxs("div", { children: [
			eyebrow ? /* @__PURE__ */ jsx("p", {
				className: "eyebrow",
				children: eyebrow
			}) : null,
			/* @__PURE__ */ jsx("h1", { children: title }),
			/* @__PURE__ */ jsx("p", {
				className: "page-description",
				children: description
			})
		] }), side ? /* @__PURE__ */ jsx("div", {
			className: "page-header-side",
			children: side
		}) : null]
	});
}
//#endregion
//#region src/components/common/page-seo.tsx
function upsertMetaByName(name, content) {
	if (!content) return;
	let element = document.head.querySelector(`meta[name="${name}"]`);
	if (!element) {
		element = document.createElement("meta");
		element.name = name;
		document.head.appendChild(element);
	}
	element.content = content;
}
function upsertMetaByProperty(property, content) {
	if (!content) return;
	let element = document.head.querySelector(`meta[property="${property}"]`);
	if (!element) {
		element = document.createElement("meta");
		element.setAttribute("property", property);
		document.head.appendChild(element);
	}
	element.content = content;
}
function upsertCanonical(href) {
	if (!href) return;
	let element = document.head.querySelector("link[rel=\"canonical\"]");
	if (!element) {
		element = document.createElement("link");
		element.rel = "canonical";
		document.head.appendChild(element);
	}
	element.href = href;
}
function syncAlternateLinks(alternates) {
	document.head.querySelectorAll("link[data-seo-alternate=\"true\"]").forEach((element) => element.remove());
	alternates.forEach((alternate) => {
		const link = document.createElement("link");
		link.rel = "alternate";
		link.hreflang = alternate.hrefLang;
		link.href = alternate.href;
		link.setAttribute("data-seo-alternate", "true");
		document.head.appendChild(link);
	});
}
function PageSeo({ title, description, keywords, robots = "index,follow", canonicalUrl, image = buildAbsoluteUrl(DEFAULT_OG_IMAGE), type = "website", locale, alternates }) {
	useEffect(() => {
		document.title = title;
		upsertMetaByName("description", description);
		upsertMetaByName("keywords", keywords);
		upsertMetaByName("robots", robots);
		upsertMetaByName("twitter:card", "summary_large_image");
		upsertMetaByName("twitter:title", title);
		upsertMetaByName("twitter:description", description);
		upsertMetaByName("twitter:image", image);
		upsertMetaByProperty("og:site_name", SITE_NAME);
		upsertMetaByProperty("og:type", type);
		upsertMetaByProperty("og:title", title);
		upsertMetaByProperty("og:description", description);
		upsertMetaByProperty("og:url", canonicalUrl);
		upsertMetaByProperty("og:image", image);
		upsertMetaByProperty("og:locale", locale);
		upsertCanonical(canonicalUrl);
		if (alternates?.length) syncAlternateLinks(alternates);
		else document.head.querySelectorAll("link[data-seo-alternate=\"true\"]").forEach((element) => element.remove());
		if (locale) document.documentElement.lang = locale;
	}, [
		alternates,
		canonicalUrl,
		description,
		image,
		keywords,
		locale,
		robots,
		title,
		type
	]);
	return null;
}
//#endregion
//#region src/components/common/structured-data.tsx
function StructuredData({ id, data }) {
	useEffect(() => {
		let script = document.head.querySelector(`script[data-structured-data-id="${id}"]`);
		if (!script) {
			script = document.createElement("script");
			script.type = "application/ld+json";
			script.setAttribute("data-structured-data-id", id);
			document.head.appendChild(script);
		}
		script.text = JSON.stringify(data);
		return () => {
			script?.remove();
		};
	}, [data, id]);
	return null;
}
//#endregion
//#region src/config/seo.ts
function getPageSeo(page, context) {
	if (page === "token-creation") return {
		title: context.t("tokenCreation.seo.title", {
			chain: context.chainName,
			tokenType: context.tokenType
		}),
		description: context.t("tokenCreation.seo.description", {
			chain: context.chainName,
			tokenType: context.tokenType
		}),
		keywords: context.t("tokenCreation.seo.keywords", {
			chain: context.chainName,
			tokenType: context.tokenType
		})
	};
	if (page === "tax-token-creation") return {
		title: context.t("tokenTaxCreation.seo.title", {
			chain: context.chainName,
			tokenType: context.tokenType,
			symbol: context.nativeSymbol ?? ""
		}),
		description: context.t("tokenTaxCreation.seo.description", {
			chain: context.chainName,
			tokenType: context.tokenType,
			symbol: context.nativeSymbol ?? ""
		}),
		keywords: context.t("tokenTaxCreation.seo.keywords", {
			chain: context.chainName,
			tokenType: context.tokenType,
			symbol: context.nativeSymbol ?? ""
		})
	};
	return {
		title: context.t("acceptance.seo.title", { chain: context.chainName }),
		description: context.t("acceptance.seo.description", { chain: context.chainName }),
		keywords: context.t("acceptance.seo.keywords", { chain: context.chainName })
	};
}
//#endregion
//#region src/features/tokenCreation/business/model.ts
var defaultTokenCreationValues = {
	name: "",
	symbol: "",
	totalSupply: "",
	decimals: 18
};
function validateTokenCreation(values, t) {
	const errors = {};
	if (!values.name.trim()) errors.name = t("tokenCreation.errors.nameRequired");
	else if (values.name.trim().length > 100) errors.name = t("tokenCreation.errors.nameTooLong");
	if (!values.symbol.trim()) errors.symbol = t("tokenCreation.errors.symbolRequired");
	else if (values.symbol.trim().length > 100) errors.symbol = t("tokenCreation.errors.symbolTooLong");
	if (!values.totalSupply.trim()) errors.totalSupply = t("tokenCreation.errors.supplyRequired");
	else if (!/^\d+$/.test(values.totalSupply) || BigInt(values.totalSupply) <= 0n) errors.totalSupply = t("tokenCreation.errors.supplyInvalid");
	if (values.decimals == null || !Number.isInteger(values.decimals) || values.decimals < 0 || values.decimals > 18) errors.decimals = t("tokenCreation.errors.decimalsInvalid");
	return errors;
}
//#endregion
//#region src/features/tokenCreation/business/useTokenCreationForm.ts
function useTokenCreationForm(t) {
	const [formValues, setFormValues] = useState(defaultTokenCreationValues);
	const [hasSubmitted, setHasSubmitted] = useState(false);
	const allErrors = useMemo(() => validateTokenCreation(formValues, t), [formValues, t]);
	const errors = hasSubmitted ? allErrors : {};
	function updateField(key, value) {
		setFormValues((current) => ({
			...current,
			[key]: value
		}));
	}
	function markSubmitted() {
		setHasSubmitted(true);
	}
	return {
		formValues,
		errors,
		updateField,
		isValid: Object.keys(allErrors).length === 0,
		hasSubmitted,
		markSubmitted
	};
}
//#endregion
//#region src/assets/abi/TokenFactory.json
var TokenFactory_default = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_symbol",
				"type": "string"
			},
			{
				"internalType": "uint8",
				"name": "_decimals",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "_totalSupply",
				"type": "uint256"
			}
		],
		"name": "createToken",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "emergencyWithdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{
			"internalType": "uint256",
			"name": "_creationFee",
			"type": "uint256"
		}, {
			"internalType": "address payable",
			"name": "_feeReceiver",
			"type": "address"
		}],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [{
			"indexed": false,
			"internalType": "uint256",
			"name": "previousFee",
			"type": "uint256"
		}, {
			"indexed": false,
			"internalType": "uint256",
			"name": "newFee",
			"type": "uint256"
		}],
		"name": "CreationFeeUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [{
			"indexed": true,
			"internalType": "address",
			"name": "previousReceiver",
			"type": "address"
		}, {
			"indexed": true,
			"internalType": "address",
			"name": "newReceiver",
			"type": "address"
		}],
		"name": "FeeReceiverUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [{
			"indexed": true,
			"internalType": "address",
			"name": "previousOwner",
			"type": "address"
		}, {
			"indexed": true,
			"internalType": "address",
			"name": "newOwner",
			"type": "address"
		}],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{
			"internalType": "uint256",
			"name": "_fee",
			"type": "uint256"
		}],
		"name": "setCreationFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{
			"internalType": "address payable",
			"name": "_feeReceiver",
			"type": "address"
		}],
		"name": "setFeeReceiver",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "decimals",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalSupply",
				"type": "uint256"
			}
		],
		"name": "TokenCreated",
		"type": "event"
	},
	{
		"inputs": [{
			"internalType": "address",
			"name": "newOwner",
			"type": "address"
		}],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "creationFee",
		"outputs": [{
			"internalType": "uint256",
			"name": "",
			"type": "uint256"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "feeReceiver",
		"outputs": [{
			"internalType": "address payable",
			"name": "",
			"type": "address"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [{
			"internalType": "address",
			"name": "",
			"type": "address"
		}],
		"stateMutability": "view",
		"type": "function"
	}
];
//#endregion
//#region src/utils/evm-gas.ts
async function getDynamicGasOverrides(provider, chainDefinition, gasLimit, value) {
	const feeData = await provider.getFeeData();
	const overrides = { gasLimit };
	if (typeof value === "bigint") overrides.value = value;
	if (!chainDefinition.EIP1559) {
		if (feeData.gasPrice) overrides.gasPrice = feeData.gasPrice;
		return overrides;
	}
	if (feeData.maxFeePerGas) overrides.maxFeePerGas = feeData.maxFeePerGas;
	if (feeData.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
	if (!feeData.maxFeePerGas && feeData.gasPrice) overrides.gasPrice = feeData.gasPrice;
	return overrides;
}
//#endregion
//#region src/features/tokenCreation/business/tokenCreationService.ts
var factoryInterface$1 = new Interface(TokenFactory_default);
async function readCreationFee(chainDefinition) {
	const rpcUrl = getChainRpcUrl(chainDefinition);
	const tokenFactoryAddress = getChainContractAddress(chainDefinition, "tokenFactory");
	if (!rpcUrl || !tokenFactoryAddress) throw new Error("tokenCreation.errors.factoryUnavailable");
	return await new Contract(tokenFactoryAddress, TokenFactory_default, new JsonRpcProvider(rpcUrl)).creationFee();
}
async function submitTokenCreation(chainDefinition, values, options) {
	if (!window.ethereum) throw new Error("tokenCreation.errors.walletUnavailable");
	const browserProvider = new BrowserProvider(window.ethereum);
	const signer = await browserProvider.getSigner();
	const tokenFactoryAddress = getChainContractAddress(chainDefinition, "tokenFactory");
	if (!tokenFactoryAddress) throw new Error("tokenCreation.errors.factoryUnavailable");
	const contract = new Contract(tokenFactoryAddress, TokenFactory_default, signer);
	const creationFee = await contract.creationFee();
	const totalSupply = BigInt(values.totalSupply);
	const gasLimit = await contract.createToken.estimateGas(values.name, values.symbol, values.decimals, totalSupply, { value: creationFee }) * 12n / 10n;
	options?.onWaitingWallet?.();
	const gasOverrides = await getDynamicGasOverrides(browserProvider, chainDefinition, gasLimit, creationFee);
	const transaction = await contract.createToken(values.name, values.symbol, values.decimals, totalSupply, gasOverrides);
	options?.onPending?.();
	const receipt = await transaction.wait();
	let tokenAddress;
	for (const log of receipt?.logs ?? []) try {
		const parsed = factoryInterface$1.parseLog(log);
		if (parsed?.name === "TokenCreated") {
			tokenAddress = parsed.args.tokenAddress;
			break;
		}
	} catch {
		continue;
	}
	return {
		txHash: transaction.hash,
		tokenAddress
	};
}
//#endregion
//#region src/features/tokenCreation/business/useTokenCreationSubmit.ts
var defaultStep$1 = null;
function useTokenCreationSubmit(chainDefinition, t, validateBeforeSubmit) {
	const { isConnected, chainId } = useAccount();
	const { switchChainAsync } = useSwitchChain();
	const [creationFee, setCreationFee] = useState(null);
	const [feeLoading, setFeeLoading] = useState(true);
	const [loading, setLoading] = useState(false);
	const [submitStep, setSubmitStep] = useState(defaultStep$1);
	const [result, setResult] = useState(null);
	const [successModalOpen, setSuccessModalOpen] = useState(false);
	const [failureModalOpen, setFailureModalOpen] = useState(false);
	const flowIdRef = useRef(0);
	const modalTimerRef = useRef(null);
	function clearModalTimer() {
		if (modalTimerRef.current !== null) {
			window.clearTimeout(modalTimerRef.current);
			modalTimerRef.current = null;
		}
	}
	function isFlowActive(flowId) {
		return flowIdRef.current === flowId;
	}
	function clearResult() {
		clearModalTimer();
		setLoading(false);
		setResult(null);
		setSuccessModalOpen(false);
		setFailureModalOpen(false);
		setSubmitStep(defaultStep$1);
	}
	function cancelFlow() {
		flowIdRef.current += 1;
		clearModalTimer();
		setLoading(false);
		setResult(null);
		setSuccessModalOpen(false);
		setFailureModalOpen(false);
		setSubmitStep(defaultStep$1);
	}
	useEffect(() => {
		let active = true;
		flowIdRef.current += 1;
		clearModalTimer();
		setLoading(false);
		setCreationFee(null);
		setResult(null);
		setSuccessModalOpen(false);
		setFailureModalOpen(false);
		setSubmitStep(defaultStep$1);
		async function loadFee() {
			setFeeLoading(true);
			try {
				const fee = await readCreationFee(chainDefinition);
				if (!active) return;
				setCreationFee(fee);
			} catch {
				if (!active) return;
				setCreationFee(null);
			} finally {
				if (active) setFeeLoading(false);
			}
		}
		loadFee();
		return () => {
			active = false;
		};
	}, [chainDefinition]);
	useEffect(() => {
		return () => {
			clearModalTimer();
		};
	}, []);
	async function submit(values) {
		clearModalTimer();
		setResult(null);
		setFailureModalOpen(false);
		setSuccessModalOpen(false);
		if (!validateBeforeSubmit()) return;
		if (!isConnected) {
			message.warning(t("tokenCreation.errors.walletRequired"));
			return;
		}
		const flowId = flowIdRef.current + 1;
		flowIdRef.current = flowId;
		setLoading(true);
		setSubmitStep({
			id: 1,
			status: "loading"
		});
		try {
			if (chainId !== chainDefinition.chainId) await switchChainAsync({ chainId: chainDefinition.chainId });
			if (!isFlowActive(flowId)) return;
			const nextResult = await submitTokenCreation(chainDefinition, values, {
				onWaitingWallet: () => {
					if (!isFlowActive(flowId)) return;
					setSubmitStep({
						id: 2,
						status: "loading"
					});
				},
				onPending: () => {
					if (!isFlowActive(flowId)) return;
					setSubmitStep({
						id: 3,
						status: "loading"
					});
				}
			});
			if (!isFlowActive(flowId)) return;
			setLoading(false);
			setResult(nextResult);
			setSubmitStep({
				id: 4,
				status: "success"
			});
			modalTimerRef.current = window.setTimeout(() => {
				if (!isFlowActive(flowId)) return;
				setSubmitStep(defaultStep$1);
				setSuccessModalOpen(true);
			}, 1e3);
		} catch {
			if (!isFlowActive(flowId)) return;
			setLoading(false);
			setSubmitStep((prev) => ({
				...prev,
				status: "failed"
			}));
			modalTimerRef.current = window.setTimeout(() => {
				if (!isFlowActive(flowId)) return;
				setSubmitStep(defaultStep$1);
				setFailureModalOpen(true);
			}, 1e3);
		}
	}
	function closeSuccessModal() {
		setSuccessModalOpen(false);
	}
	function closeFailureModal() {
		setFailureModalOpen(false);
		setSubmitStep(defaultStep$1);
	}
	return {
		creationFee,
		feeLoading,
		loading,
		submitStep,
		result,
		successModalOpen,
		failureModalOpen,
		submit,
		cancelFlow,
		clearResult,
		closeSuccessModal,
		closeFailureModal
	};
}
//#endregion
//#region src/components/common/copy-button/index.tsx
function CopyButton({ value, ariaLabel }) {
	const [copied, setCopied] = useState(false);
	const { theme, t } = useRouteContext();
	const isDark = theme === "dark";
	const background = isDark ? "rgba(28, 28, 36, 0.96)" : "rgba(255, 255, 255, 0.98)";
	const color = isDark ? "#f6efe9" : "#20140f";
	const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(76, 40, 20, 0.08)";
	useEffect(() => {
		if (!copied) return;
		const timer = window.setTimeout(() => setCopied(false), 1e3);
		return () => window.clearTimeout(timer);
	}, [copied]);
	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			message.success(t("common.copy.success"));
		} catch {
			message.error(t("common.copy.failed"));
		}
	}
	return /* @__PURE__ */ jsx(Tooltip, {
		rootClassName: `app-tooltip copy-button-tooltip copy-button-tooltip-${theme}`,
		title: copied ? t("common.copy.copied") : t("common.copy.idle"),
		color: background,
		styles: { container: {
			color,
			background,
			border: `1px solid ${borderColor}`,
			boxShadow: isDark ? "0 18px 46px rgba(0, 0, 0, 0.34)" : "0 18px 42px rgba(0, 0, 0, 0.14)"
		} },
		children: /* @__PURE__ */ jsx("button", {
			className: `copy-button ${copied ? "copied" : ""}`,
			onClick: () => void handleCopy(),
			type: "button",
			"aria-label": ariaLabel,
			children: copied ? /* @__PURE__ */ jsx(CheckOutlined, {}) : /* @__PURE__ */ jsx(CopyOutlined, {})
		})
	});
}
//#endregion
//#region src/components/common/modal/index.tsx
function joinClassNames(...values) {
	return values.filter(Boolean).join(" ");
}
function AppModal({ className, title, footer = null, footerClassName, centered, maskClosable, width, ...props }) {
	return /* @__PURE__ */ jsx(Modal, {
		...props,
		className: joinClassNames("app-modal", className),
		centered: centered ?? true,
		footer: footer === null ? null : /* @__PURE__ */ jsx("div", {
			className: joinClassNames("app-modal-footer-layout", footerClassName),
			children: footer
		}),
		mask: { closable: maskClosable ?? false },
		title,
		width: width ?? 520
	});
}
//#endregion
//#region src/components/common/operation-status/index.tsx
function OperationStatus({ width = 440, title, steps, step, tipsText, open, cancelBtnShow = true, onClose }) {
	function getStepStatus(stepId) {
		if (!step) return "default";
		if (stepId === step.id) return step.status;
		if (stepId < step.id) return "success";
		return "default";
	}
	function getStepText(stepItem) {
		if (!step) return stepItem.text;
		if (stepItem.id === step.id && step.status === "failed") return stepItem.errorText ?? stepItem.text;
		return stepItem.text;
	}
	const progressValue = step ? `${Math.min(step.id, steps.length)}/${steps.length}` : `0/${steps.length}`;
	return /* @__PURE__ */ jsxs(AppModal, {
		className: "operation-status-modal",
		closable: cancelBtnShow,
		footer: null,
		onCancel: onClose,
		open,
		title: /* @__PURE__ */ jsxs("div", {
			className: "operation-status-title",
			children: [/* @__PURE__ */ jsx("div", {
				className: "operation-status-title-copy",
				children: /* @__PURE__ */ jsx("span", {
					className: "operation-status-title-text",
					children: title
				})
			}), /* @__PURE__ */ jsx("span", {
				className: `operation-status-pill ${step?.status ?? "default"}`,
				children: progressValue
			})]
		}),
		width,
		children: [tipsText ? /* @__PURE__ */ jsx("div", {
			className: "operation-status-tips",
			children: tipsText
		}) : null, /* @__PURE__ */ jsx("ul", {
			className: "operation-status-list",
			children: steps.map((item, index) => {
				const currentStatus = getStepStatus(item.id);
				return /* @__PURE__ */ jsxs("li", {
					className: `operation-status-item ${currentStatus}`,
					children: [/* @__PURE__ */ jsxs("div", {
						className: "operation-status-main",
						children: [/* @__PURE__ */ jsx("span", {
							className: "operation-status-index",
							children: index + 1
						}), /* @__PURE__ */ jsx("span", {
							className: "operation-status-text",
							children: getStepText(item)
						})]
					}), /* @__PURE__ */ jsxs("span", {
						className: `operation-status-icon ${currentStatus}`,
						children: [
							currentStatus === "loading" ? /* @__PURE__ */ jsx(LoadingOutlined, {}) : null,
							currentStatus === "success" ? /* @__PURE__ */ jsx(CheckCircleFilled, {}) : null,
							currentStatus === "failed" ? /* @__PURE__ */ jsx(CloseCircleFilled, {}) : null
						]
					})]
				}, item.id);
			})
		})]
	});
}
//#endregion
//#region src/components/common/operation-warning/index.tsx
function OperationWarning({ open, title, description, labelText, contents, noteText, footer, onClose }) {
	return /* @__PURE__ */ jsx(AppModal, {
		className: "operation-warning-modal",
		footer,
		onCancel: onClose,
		open,
		title: /* @__PURE__ */ jsxs("div", {
			className: "operation-warning-title",
			children: [/* @__PURE__ */ jsx("span", {
				className: "operation-warning-icon",
				"aria-hidden": "true",
				children: /* @__PURE__ */ jsx(ExclamationCircleFilled, {})
			}), /* @__PURE__ */ jsxs("div", {
				className: "operation-warning-title-copy",
				children: [/* @__PURE__ */ jsx("span", {
					className: "operation-warning-title-text",
					children: title
				}), description ? /* @__PURE__ */ jsx("span", {
					className: "operation-warning-description",
					children: description
				}) : null]
			})]
		}),
		width: 520,
		children: /* @__PURE__ */ jsxs("div", {
			className: "operation-warning-body",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "operation-warning-label",
					children: labelText
				}),
				/* @__PURE__ */ jsx("ol", {
					className: "operation-warning-list",
					children: contents.map((item, index) => /* @__PURE__ */ jsxs("li", {
						className: "operation-warning-item",
						children: [/* @__PURE__ */ jsx("span", {
							className: "operation-warning-item-index",
							children: index + 1
						}), /* @__PURE__ */ jsx("span", { children: item })]
					}, `${index}-${item}`))
				}),
				noteText ? /* @__PURE__ */ jsx("p", {
					className: "operation-warning-note",
					children: noteText
				}) : null
			]
		})
	});
}
//#endregion
//#region src/utils/index.ts
function formatText(addr, s = 6, e = 4) {
	if (!addr) return "";
	addr = `${addr.substring(0, s)}...${addr.substring(addr.length - e, addr.length)}`;
	return addr;
}
//#endregion
//#region src/features/tokenCreation/shared/field-label-with-tooltip.tsx
function FieldLabelWithTooltip({ label, tooltip }) {
	const { theme } = useRouteContext();
	if (!tooltip) return /* @__PURE__ */ jsx("span", { children: label });
	const isDark = theme === "dark";
	const background = isDark ? "rgba(28, 28, 36, 0.96)" : "rgba(255, 255, 255, 0.98)";
	const color = isDark ? "#f6efe9" : "#20140f";
	const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(76, 40, 20, 0.08)";
	return /* @__PURE__ */ jsxs("div", {
		className: "field-label-row",
		children: [/* @__PURE__ */ jsx("span", { children: label }), /* @__PURE__ */ jsx(Tooltip, {
			classNames: `app-tooltip token-creation-tooltip token-creation-tooltip-${theme}`,
			placement: "topLeft",
			title: tooltip,
			trigger: ["hover", "click"],
			color: background,
			styles: { container: {
				color,
				background,
				border: `1px solid ${borderColor}`,
				boxShadow: isDark ? "0 18px 46px rgba(0, 0, 0, 0.34)" : "0 18px 42px rgba(0, 0, 0, 0.14)"
			} },
			children: /* @__PURE__ */ jsx("button", {
				className: "field-tooltip-trigger",
				type: "button",
				"aria-label": label,
				children: /* @__PURE__ */ jsx(InfoCircleOutlined, {})
			})
		})]
	});
}
//#endregion
//#region src/features/tokenCreation/shared/token-creation-summary.tsx
function TokenCreationSummary({ chainDefinition, result, t }) {
	return /* @__PURE__ */ jsx("section", {
		className: "token-success-section",
		children: /* @__PURE__ */ jsx("div", {
			className: "summary-detail-list",
			children: [{
				key: "tokenAddress",
				label: t("tokenCreation.successSummary.tokenAddress"),
				value: result.tokenAddress,
				link: getExplorerUrl(chainDefinition, "token", result.tokenAddress),
				copyLabel: "copy token address"
			}, {
				key: "txHash",
				label: t("tokenCreation.successSummary.txHash"),
				value: result.txHash,
				link: getExplorerUrl(chainDefinition, "hash", result.txHash),
				copyLabel: "copy tx hash"
			}].map((item) => /* @__PURE__ */ jsxs("div", {
				className: "summary-detail-card",
				children: [/* @__PURE__ */ jsx("span", { children: item.label }), item.value ? /* @__PURE__ */ jsxs("div", {
					className: "result-inline-value",
					children: [item.link ? /* @__PURE__ */ jsx("a", {
						className: "value-link",
						href: item.link,
						target: "_blank",
						rel: "noreferrer",
						children: formatText(item.value)
					}) : /* @__PURE__ */ jsx("strong", { children: formatText(item.value) }), /* @__PURE__ */ jsx(CopyButton, {
						ariaLabel: item.copyLabel,
						value: item.value
					})]
				}) : /* @__PURE__ */ jsx("strong", { children: "--" })]
			}, item.key))
		})
	});
}
//#endregion
//#region src/features/tokenCreation/shared/token-creation-form-panel.tsx
function TokenCreationFormPanel({ model }) {
	const { t, chainDefinition, formValues, errors, updateField, creationFee, feeLoading, loading, submitStep, result, successModalOpen, failureModalOpen, onSubmit, onCancelFlow, onCloseSuccessModal, onCloseFailureModal, onClearResult } = model;
	const txExplorerUrl = getExplorerUrl(chainDefinition, "hash", result?.txHash);
	const tokenExplorerUrl = getExplorerUrl(chainDefinition, "token", result?.tokenAddress);
	return /* @__PURE__ */ jsxs("section", {
		className: "surface-card form-card",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "field-grid",
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "field",
						children: [
							/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
								label: t("tokenCreation.fields.name"),
								tooltip: t("tokenCreation.tooltips.name")
							}),
							/* @__PURE__ */ jsx(Input, {
								className: "token-form-input",
								placeholder: t("tokenCreation.placeholders.name"),
								value: formValues.name,
								maxLength: 100,
								allowClear: true,
								onChange: (event) => updateField("name", event.target.value),
								status: errors.name ? "error" : void 0
							}),
							errors.name ? /* @__PURE__ */ jsx("small", {
								className: "field-error",
								children: errors.name
							}) : null
						]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "field",
						children: [
							/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
								label: t("tokenCreation.fields.symbol"),
								tooltip: t("tokenCreation.tooltips.symbol")
							}),
							/* @__PURE__ */ jsx(Input, {
								className: "token-form-input",
								placeholder: t("tokenCreation.placeholders.symbol"),
								value: formValues.symbol,
								maxLength: 100,
								allowClear: true,
								onChange: (event) => updateField("symbol", event.target.value),
								status: errors.symbol ? "error" : void 0
							}),
							errors.symbol ? /* @__PURE__ */ jsx("small", {
								className: "field-error",
								children: errors.symbol
							}) : null
						]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "field",
						children: [
							/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
								label: t("tokenCreation.fields.totalSupply"),
								tooltip: t("tokenCreation.tooltips.totalSupply")
							}),
							/* @__PURE__ */ jsx(InputNumber, {
								className: "token-form-number",
								style: { width: "100%" },
								placeholder: t("tokenCreation.placeholders.totalSupply"),
								value: formValues.totalSupply,
								controls: false,
								precision: 0,
								stringMode: true,
								parser: (value) => value?.replace(/[^\d]/g, "") || "",
								onChange: (value) => updateField("totalSupply", String(value ?? "")),
								status: errors.totalSupply ? "error" : void 0
							}),
							errors.totalSupply ? /* @__PURE__ */ jsx("small", {
								className: "field-error",
								children: errors.totalSupply
							}) : null
						]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "field",
						children: [
							/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
								label: t("tokenCreation.fields.decimals"),
								tooltip: t("tokenCreation.tooltips.decimals")
							}),
							/* @__PURE__ */ jsx(InputNumber, {
								className: "token-form-number",
								min: 0,
								max: 18,
								value: formValues.decimals,
								controls: false,
								placeholder: t("tokenCreation.placeholders.decimals"),
								onChange: (value) => updateField("decimals", value == null ? null : Number(value)),
								status: errors.decimals ? "error" : void 0
							}),
							errors.decimals ? /* @__PURE__ */ jsx("small", {
								className: "field-error",
								children: errors.decimals
							}) : null
						]
					})
				]
			}),
			/* @__PURE__ */ jsx(Button, {
				block: true,
				className: "primary-button ant-primary-button",
				loading,
				onClick: () => void onSubmit(),
				type: "primary",
				size: "large",
				children: loading ? t("tokenCreation.actions.submitting") : t("tokenCreation.actions.submit")
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "fee-inline-note fee-inline-note-after-submit",
				children: [/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
					label: t("tokenCreation.labels.creationFee"),
					tooltip: t("tokenCreation.tooltips.creationFee")
				}), /* @__PURE__ */ jsx("strong", { children: feeLoading || creationFee == null ? "..." : `${formatEther(creationFee)} ${chainDefinition.nativeToken.symbol}` })]
			}),
			result ? /* @__PURE__ */ jsxs("div", {
				className: "result-card success-result-card",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "success-card-head",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "success-banner",
						children: [/* @__PURE__ */ jsx(CheckCircleFilled, {}), /* @__PURE__ */ jsx("span", { children: t("tokenCreation.success.banner") })]
					}), /* @__PURE__ */ jsx("button", {
						className: "result-close-button",
						onClick: onClearResult,
						type: "button",
						"aria-label": t("tokenCreation.actions.close"),
						children: /* @__PURE__ */ jsx(CloseOutlined, {})
					})]
				}), /* @__PURE__ */ jsx(TokenCreationSummary, {
					chainDefinition,
					result,
					t
				})]
			}) : null,
			/* @__PURE__ */ jsx(OperationStatus, {
				open: Boolean(submitStep),
				title: t("tokenCreation.modal.progressTitle"),
				step: submitStep,
				steps: [
					{
						id: 1,
						text: t("tokenCreation.steps.preparing")
					},
					{
						id: 2,
						text: t("tokenCreation.steps.waitingWallet")
					},
					{
						id: 3,
						text: t("tokenCreation.steps.pending")
					},
					{
						id: 4,
						text: t("tokenCreation.steps.completed"),
						errorText: t("tokenCreation.steps.failed")
					}
				],
				cancelBtnShow: false,
				onClose: onCancelFlow
			}),
			/* @__PURE__ */ jsx(AppModal, {
				open: successModalOpen,
				footer: /* @__PURE__ */ jsx(Button, {
					type: "primary",
					onClick: onCloseSuccessModal,
					children: t("tokenCreation.actions.close")
				}),
				onCancel: onCloseSuccessModal,
				className: "token-result-modal",
				title: /* @__PURE__ */ jsx("div", {
					className: "token-result-modal-heading",
					children: t("tokenCreation.modal.successTitle")
				}),
				children: /* @__PURE__ */ jsx("div", {
					className: "result-modal-shell",
					children: /* @__PURE__ */ jsxs("div", {
						className: "result-modal-card",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "result-modal-row",
							children: [/* @__PURE__ */ jsx("span", { children: t("tokenCreation.success.tokenAddress") }), /* @__PURE__ */ jsxs("div", {
								className: "result-modal-value",
								children: [result?.tokenAddress ? /* @__PURE__ */ jsx("a", {
									className: "value-link",
									href: tokenExplorerUrl,
									target: "_blank",
									rel: "noreferrer",
									children: formatText(result.tokenAddress)
								}) : /* @__PURE__ */ jsx("strong", { children: "--" }), result?.tokenAddress ? /* @__PURE__ */ jsx(CopyButton, {
									ariaLabel: "copy token address",
									value: result.tokenAddress
								}) : null]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "result-modal-row",
							children: [/* @__PURE__ */ jsx("span", { children: t("tokenCreation.success.txHash") }), /* @__PURE__ */ jsxs("div", {
								className: "result-modal-value",
								children: [result?.txHash ? /* @__PURE__ */ jsx("a", {
									className: "value-link",
									href: txExplorerUrl,
									target: "_blank",
									rel: "noreferrer",
									children: formatText(result.txHash)
								}) : /* @__PURE__ */ jsx("strong", { children: "--" }), result?.txHash ? /* @__PURE__ */ jsx(CopyButton, {
									ariaLabel: "copy tx hash",
									value: result.txHash
								}) : null]
							})]
						})]
					})
				})
			}),
			/* @__PURE__ */ jsx(OperationWarning, {
				open: failureModalOpen,
				title: t("tokenCreation.modal.errorTitle"),
				labelText: t("common.exception.possibleReasons"),
				contents: [t("common.exception.errorReason1", { chain: chainDefinition.fullName }), t("common.exception.errorReason2")],
				noteText: t("common.exception.contactOfficialSupport"),
				footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Button, {
					onClick: onCloseFailureModal,
					children: t("tokenCreation.actions.close")
				}), /* @__PURE__ */ jsx(Button, {
					type: "primary",
					onClick: () => {
						onCloseFailureModal();
						onSubmit();
					},
					children: t("tokenCreation.actions.retry")
				})] }),
				onClose: onCloseFailureModal
			})
		]
	});
}
//#endregion
//#region src/features/tokenCreation/shared/token-creation-seo-data.ts
var tokenCreationFaqKeys = [
	"noCode",
	"fee",
	"standard",
	"trade",
	"decimals",
	"chainChoice"
];
function getTokenCreationFaqVars(chainDefinition, chainLabel) {
	return {
		chain: chainLabel,
		tokenType: chainDefinition.tokenType,
		symbol: chainDefinition.nativeToken.symbol
	};
}
function buildTokenCreationFaqStructuredData(t, vars) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: tokenCreationFaqKeys.map((key) => ({
			"@type": "Question",
			name: t(`tokenCreation.seoBody.faq.${key}.question`, vars),
			acceptedAnswer: {
				"@type": "Answer",
				text: t(`tokenCreation.seoBody.faq.${key}.answer`, vars)
			}
		}))
	};
}
//#endregion
//#region src/features/tokenCreation/shared/token-creation-seo-content.tsx
var highlightIcons$1 = {
	builder: /* @__PURE__ */ jsx(RocketOutlined, {}),
	agency: /* @__PURE__ */ jsx(FlagOutlined, {}),
	noCode: /* @__PURE__ */ jsx(SafetyCertificateOutlined, {})
};
function TokenCreationSeoContent({ chainDefinition, t }) {
	const vars = {
		chain: getChainFullName(chainDefinition),
		tokenType: chainDefinition.tokenType,
		symbol: chainDefinition.nativeToken.symbol
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "token-seo-stack",
		children: [/* @__PURE__ */ jsxs("section", {
			className: "surface-card token-seo-card",
			children: [/* @__PURE__ */ jsx("div", {
				className: "token-section-copy",
				children: /* @__PURE__ */ jsx("h2", { children: t("tokenCreation.seoBody.highlights.title") })
			}), /* @__PURE__ */ jsx("div", {
				className: "token-seo-grid token-seo-grid-three",
				children: [
					"builder",
					"agency",
					"noCode"
				].map((key) => /* @__PURE__ */ jsxs("article", {
					className: "token-seo-feature",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "token-seo-feature-head",
						children: [/* @__PURE__ */ jsx("div", {
							className: "token-section-icon",
							children: highlightIcons$1[key]
						}), /* @__PURE__ */ jsx("h3", { children: t(`tokenCreation.seoBody.highlights.${key}.title`, vars) })]
					}), /* @__PURE__ */ jsx("p", { children: t(`tokenCreation.seoBody.highlights.${key}.description`, vars) })]
				}, key))
			})]
		}), /* @__PURE__ */ jsxs("section", {
			className: "surface-card token-seo-card token-seo-faq",
			id: "token-creation-faq",
			children: [/* @__PURE__ */ jsx("div", {
				className: "token-section-copy",
				children: /* @__PURE__ */ jsx("h2", { children: t("tokenCreation.seoBody.faq.title") })
			}), /* @__PURE__ */ jsx("div", {
				className: "token-faq-list",
				children: tokenCreationFaqKeys.map((key) => /* @__PURE__ */ jsxs("article", {
					className: "token-faq-item",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "token-faq-question",
						children: [/* @__PURE__ */ jsx(MessageOutlined, {}), /* @__PURE__ */ jsx("h3", { children: t(`tokenCreation.seoBody.faq.${key}.question`, vars) })]
					}), /* @__PURE__ */ jsx("p", { children: t(`tokenCreation.seoBody.faq.${key}.answer`, vars) })]
				}, key))
			})]
		})]
	});
}
//#endregion
//#region src/features/tokenCreation/shared/token-next-steps.tsx
var stepIcons$1 = {
	addWallet: /* @__PURE__ */ jsx(WalletOutlined, {}),
	addLiquidity: /* @__PURE__ */ jsx(DeploymentUnitOutlined, {}),
	goLive: /* @__PURE__ */ jsx(LineChartOutlined, {}),
	metadata: /* @__PURE__ */ jsx(PictureOutlined, {})
};
function TokenNextSteps({ t }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "token-success-section token-next-steps-section",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "token-success-copy",
			children: [
				/* @__PURE__ */ jsx("h3", { children: t("tokenCreation.nextSteps.title") }),
				/* @__PURE__ */ jsx("p", { children: t("tokenCreation.nextSteps.description") }),
				/* @__PURE__ */ jsxs("div", {
					className: "next-steps-note",
					children: [/* @__PURE__ */ jsx(InfoCircleOutlined, {}), /* @__PURE__ */ jsx("span", { children: t("tokenCreation.nextSteps.note") })]
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "next-step-grid",
			children: [
				"addWallet",
				"addLiquidity",
				"goLive",
				"metadata"
			].map((step, index) => /* @__PURE__ */ jsxs("article", {
				className: "next-step-card",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "next-step-card-head",
					children: [/* @__PURE__ */ jsx("div", {
						className: "next-step-icon",
						children: stepIcons$1[step]
					}), /* @__PURE__ */ jsxs("div", {
						className: "next-step-heading",
						children: [/* @__PURE__ */ jsx("span", {
							className: "next-step-index",
							children: String(index + 1).padStart(2, "0")
						}), /* @__PURE__ */ jsx("h4", { children: t(`tokenCreation.nextSteps.${step}.title`) })]
					})]
				}), /* @__PURE__ */ jsx("p", { children: t(`tokenCreation.nextSteps.${step}.description`) })]
			}, step))
		})]
	});
}
//#endregion
//#region src/features/tokenCreation/shared/token-permission-card.tsx
function TokenPermissionCard({ chainDefinition, t }) {
	const highlights = [
		chainDefinition.tokenType,
		t("tokenCreation.permission.highlights.core"),
		t("tokenCreation.permission.highlights.factory"),
		t("tokenCreation.permission.highlights.noAdmin")
	];
	const cards = [
		{
			key: "basicInfo",
			icon: /* @__PURE__ */ jsx(CheckCircleOutlined, {}),
			title: t("tokenCreation.permission.cards.basicInfo.title"),
			description: t("tokenCreation.permission.cards.basicInfo.description")
		},
		{
			key: "permissions",
			icon: /* @__PURE__ */ jsx(SafetyCertificateOutlined, {}),
			title: t("tokenCreation.permission.cards.permissions.title"),
			description: t("tokenCreation.permission.cards.permissions.description")
		},
		{
			key: "tradingFlow",
			icon: /* @__PURE__ */ jsx(DeploymentUnitOutlined, {}),
			title: t("tokenCreation.permission.cards.tradingFlow.title"),
			description: t("tokenCreation.permission.cards.tradingFlow.description")
		}
	];
	return /* @__PURE__ */ jsxs("section", {
		className: "surface-card token-permission-card",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "permission-hero",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "permission-hero-layout",
				children: [/* @__PURE__ */ jsx("div", {
					className: "token-section-icon",
					children: /* @__PURE__ */ jsx(SafetyCertificateOutlined, {})
				}), /* @__PURE__ */ jsx("div", {
					className: "permission-hero-content",
					children: /* @__PURE__ */ jsxs("div", {
						className: "token-section-copy",
						children: [/* @__PURE__ */ jsx("h3", { children: t("tokenCreation.permission.title") }), /* @__PURE__ */ jsx("p", { children: t("tokenCreation.permission.description") })]
					})
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "permission-highlight-row",
				children: highlights.map((highlight) => /* @__PURE__ */ jsx("span", {
					className: "permission-highlight-pill",
					children: highlight
				}, highlight))
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "permission-card-grid",
			children: cards.map((card) => /* @__PURE__ */ jsxs("article", {
				className: "permission-feature-card",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "permission-feature-head",
					children: [/* @__PURE__ */ jsx("div", {
						className: "permission-feature-icon",
						children: card.icon
					}), /* @__PURE__ */ jsx("h4", { children: card.title })]
				}), /* @__PURE__ */ jsx("div", {
					className: "permission-feature-copy",
					children: /* @__PURE__ */ jsx("p", { children: card.description })
				})]
			}, card.key))
		})]
	});
}
//#endregion
//#region src/features/tokenCreation/shared/token-creation-page.tsx
function TokenCreationPage() {
	if (useRenderMode() === "static") return /* @__PURE__ */ jsx(StaticTokenCreationPage, {});
	return /* @__PURE__ */ jsx(InteractiveTokenCreationPage, {});
}
function InteractiveTokenCreationPage() {
	const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext();
	const form = useTokenCreationForm(t);
	const submit = useTokenCreationSubmit(chainDefinition, t, () => form.isValid);
	const chainLabel = getChainFullName(chainDefinition);
	const seo = getPageSeo("token-creation", {
		t,
		chainName: chainLabel,
		tokenType: chainDefinition.tokenType
	});
	const faqStructuredData = buildTokenCreationFaqStructuredData(t, getTokenCreationFaqVars(chainDefinition, chainLabel));
	const model = {
		chainDefinition,
		formValues: form.formValues,
		errors: form.errors,
		updateField: (key, value) => {
			form.updateField(key, value);
			submit.clearResult();
		},
		creationFee: submit.creationFee,
		feeLoading: submit.feeLoading,
		loading: submit.loading,
		submitStep: submit.submitStep,
		result: submit.result,
		successModalOpen: submit.successModalOpen,
		failureModalOpen: submit.failureModalOpen,
		onSubmit: async () => {
			form.markSubmitted();
			if (!form.isValid) return;
			const { name, symbol, totalSupply, decimals } = form.formValues;
			if (decimals == null) return;
			const submitValues = {
				name,
				symbol,
				totalSupply,
				decimals
			};
			await submit.submit(submitValues);
		},
		onCancelFlow: submit.cancelFlow,
		onCloseSuccessModal: submit.closeSuccessModal,
		onCloseFailureModal: submit.closeFailureModal,
		onClearResult: submit.clearResult,
		t
	};
	const header = /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(PageHeader, {
		eyebrow: t("tokenCreation.eyebrow"),
		title: t("tokenCreation.title"),
		description: t("tokenCreation.description", {
			standard: chainDefinition.tokenType,
			tokenType: chainDefinition.tokenType
		})
	}) });
	return /* @__PURE__ */ jsxs("section", {
		className: `page-stack token-creation-page token-creation-${themeColor}`,
		children: [/* @__PURE__ */ jsx("div", {
			className: "hero-banner",
			children: header
		}), /* @__PURE__ */ jsx("div", {
			className: "theme-single-column",
			children: /* @__PURE__ */ jsx("div", {
				className: "theme-main theme-main-centered",
				children: /* @__PURE__ */ jsxs("div", {
					className: "token-creation-stack",
					children: [
						/* @__PURE__ */ jsx(PageSeo, {
							...seo,
							canonicalUrl: buildCanonicalPageUrl(lang, chain, "token-creation"),
							alternates: buildAlternatePageLinks(chain, "token-creation"),
							locale: normalizeLocaleTag(lang),
							robots: hasThemeQuery || !chainDefinition.seoIndex ? "noindex,follow" : "index,follow"
						}),
						hasThemeQuery ? null : /* @__PURE__ */ jsx(StructuredData, {
							id: "token-creation-faq",
							data: faqStructuredData
						}),
						/* @__PURE__ */ jsx("div", {
							id: "token-creation-form",
							children: /* @__PURE__ */ jsx(TokenCreationFormPanel, { model })
						}),
						/* @__PURE__ */ jsxs("section", {
							className: "surface-card token-creation-content-module",
							children: [
								/* @__PURE__ */ jsx(TokenPermissionCard, {
									chainDefinition,
									t
								}),
								/* @__PURE__ */ jsx(TokenNextSteps, { t }),
								/* @__PURE__ */ jsx(TokenCreationSeoContent, {
									chainDefinition,
									t
								})
							]
						})
					]
				})
			})
		})]
	});
}
function StaticTokenCreationPage() {
	const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext();
	const chainLabel = getChainFullName(chainDefinition);
	const seo = getPageSeo("token-creation", {
		t,
		chainName: chainLabel,
		tokenType: chainDefinition.tokenType
	});
	const faqStructuredData = buildTokenCreationFaqStructuredData(t, getTokenCreationFaqVars(chainDefinition, chainLabel));
	return renderTokenCreationLayout({
		seo,
		model: {
			chainDefinition,
			formValues: defaultTokenCreationValues,
			errors: {},
			updateField: createStaticUpdateField$1,
			creationFee: null,
			feeLoading: true,
			loading: false,
			submitStep: null,
			result: null,
			successModalOpen: false,
			failureModalOpen: false,
			onSubmit: async () => void 0,
			onCancelFlow: () => void 0,
			onCloseSuccessModal: () => void 0,
			onCloseFailureModal: () => void 0,
			onClearResult: () => void 0,
			t
		},
		t,
		lang,
		chain,
		themeColor,
		chainDefinition,
		faqStructuredData,
		hasThemeQuery
	});
}
function renderTokenCreationLayout({ seo, model, t, lang, chain, themeColor, chainDefinition, faqStructuredData, hasThemeQuery }) {
	const header = /* @__PURE__ */ jsx(PageHeader, {
		eyebrow: t("tokenCreation.eyebrow"),
		title: t("tokenCreation.title"),
		description: t("tokenCreation.description", {
			standard: chainDefinition.tokenType,
			tokenType: chainDefinition.tokenType
		})
	});
	return /* @__PURE__ */ jsxs("section", {
		className: `page-stack token-creation-page token-creation-${themeColor}`,
		children: [/* @__PURE__ */ jsx("div", {
			className: "hero-banner",
			children: header
		}), /* @__PURE__ */ jsx("div", {
			className: "theme-single-column",
			children: /* @__PURE__ */ jsx("div", {
				className: "theme-main theme-main-centered",
				children: /* @__PURE__ */ jsxs("div", {
					className: "token-creation-stack",
					children: [
						/* @__PURE__ */ jsx(PageSeo, {
							...seo,
							canonicalUrl: buildCanonicalPageUrl(lang, chain, "token-creation"),
							alternates: buildAlternatePageLinks(chain, "token-creation"),
							locale: normalizeLocaleTag(lang),
							robots: hasThemeQuery || !chainDefinition.seoIndex ? "noindex,follow" : "index,follow"
						}),
						hasThemeQuery ? null : /* @__PURE__ */ jsx(StructuredData, {
							id: "token-creation-faq",
							data: faqStructuredData
						}),
						/* @__PURE__ */ jsx("div", {
							id: "token-creation-form",
							children: /* @__PURE__ */ jsx(TokenCreationFormPanel, { model })
						}),
						/* @__PURE__ */ jsxs("section", {
							className: "surface-card token-creation-content-module",
							children: [
								/* @__PURE__ */ jsx(TokenPermissionCard, {
									chainDefinition,
									t
								}),
								/* @__PURE__ */ jsx(TokenNextSteps, { t }),
								/* @__PURE__ */ jsx(TokenCreationSeoContent, {
									chainDefinition,
									t
								})
							]
						})
					]
				})
			})
		})]
	});
}
function createStaticUpdateField$1(_key, _value) {}
//#endregion
//#region src/features/tokenTaxCreation/business/model.ts
function getTaxExchangeOptions(chainDefinition) {
	return chainDefinition.contractList.filter((contract) => contract.key === "tokenTaxFactory" && contract.address).map((contract) => {
		const dex = chainDefinition.dexs?.find((item) => item.type === contract.dex && (item.version ?? "v2") === (contract.version ?? "v2"));
		return {
			value: contract.address,
			label: dex?.name ?? `${contract.dex ?? "Factory"} ${(contract.version ?? "").toUpperCase()}`.trim(),
			dex: contract.dex ?? dex?.type ?? "Factory",
			version: contract.version ?? dex?.version,
			logo: dex?.logo
		};
	});
}
function buildPoolTokenOptions(chainDefinition) {
	const nativeToken = {
		address: normalizeAddress(chainDefinition.nativeToken.address),
		name: chainDefinition.nativeToken.name ?? chainDefinition.nativeToken.symbol,
		symbol: chainDefinition.nativeToken.symbol,
		decimals: chainDefinition.nativeToken.decimals,
		logo: chainDefinition.nativeToken.logo,
		isNative: true
	};
	const stableTokens = chainDefinition.stableCoins?.map((token) => ({
		address: normalizeAddress(token.address),
		name: token.name ?? token.symbol,
		symbol: token.symbol,
		decimals: token.decimals,
		logo: token.logo
	})) ?? [];
	return mergeTokenOptions([nativeToken], stableTokens);
}
function getDefaultTokenTaxValues(chainDefinition) {
	const exchanges = getTaxExchangeOptions(chainDefinition);
	const poolTokens = buildPoolTokenOptions(chainDefinition);
	return {
		name: "",
		symbol: "",
		totalSupply: "",
		decimals: 18,
		buyTax: "",
		sellTax: "",
		taxFeeReceiveAddress: "",
		exchange: exchanges[0]?.value ?? "",
		poolToken: poolTokens[0]?.address ?? ""
	};
}
function validateTokenTax(values, t) {
	const errors = {};
	if (!values.name.trim()) errors.name = t("tokenTaxCreation.errors.nameRequired");
	else if (values.name.trim().length > 100) errors.name = t("tokenTaxCreation.errors.nameTooLong");
	if (!values.symbol.trim()) errors.symbol = t("tokenTaxCreation.errors.symbolRequired");
	else if (values.symbol.trim().length > 100) errors.symbol = t("tokenTaxCreation.errors.symbolTooLong");
	if (!values.totalSupply.trim()) errors.totalSupply = t("tokenTaxCreation.errors.supplyRequired");
	else if (!/^\d+$/.test(values.totalSupply)) errors.totalSupply = t("tokenTaxCreation.errors.supplyInvalid");
	else try {
		if (BigInt(values.totalSupply) <= 0n) errors.totalSupply = t("tokenTaxCreation.errors.supplyInvalid");
	} catch {
		errors.totalSupply = t("tokenTaxCreation.errors.supplyInvalid");
	}
	if (values.decimals == null || !Number.isInteger(values.decimals) || values.decimals < 0 || values.decimals > 18) errors.decimals = t("tokenTaxCreation.errors.decimalsInvalid");
	if (!isValidTaxRate(values.buyTax)) errors.buyTax = t("tokenTaxCreation.errors.buyTaxInvalid");
	if (!isValidTaxRate(values.sellTax)) errors.sellTax = t("tokenTaxCreation.errors.sellTaxInvalid");
	if (values.taxFeeReceiveAddress.trim() && !isAddress(values.taxFeeReceiveAddress.trim())) errors.taxFeeReceiveAddress = t("tokenTaxCreation.errors.taxReceiverInvalid");
	if (!values.exchange) errors.exchange = t("tokenTaxCreation.errors.exchangeRequired");
	if (!values.poolToken) errors.poolToken = t("tokenTaxCreation.errors.poolTokenRequired");
	return errors;
}
function mergeTokenOptions(...lists) {
	const tokenMap = /* @__PURE__ */ new Map();
	for (const list of lists) for (const item of list) {
		if (!item?.address) continue;
		const normalizedAddress = normalizeAddress(item.address);
		tokenMap.set(normalizedAddress, {
			...tokenMap.get(normalizedAddress),
			...item,
			address: normalizedAddress
		});
	}
	return Array.from(tokenMap.values());
}
function isValidTaxRate(value) {
	if (!value.trim()) return false;
	if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return false;
	const numericValue = Number(value);
	return !Number.isNaN(numericValue) && numericValue >= 0 && numericValue <= 25;
}
function normalizeAddress(address) {
	const rawAddress = String(address);
	try {
		return getAddress(rawAddress);
	} catch {
		return rawAddress.trim();
	}
}
//#endregion
//#region src/features/tokenTaxCreation/business/useTokenTaxForm.ts
function useTokenTaxForm(chainDefinition, t) {
	const defaults = useMemo(() => getDefaultTokenTaxValues(chainDefinition), [chainDefinition]);
	const [formValues, setFormValues] = useState(defaults);
	const [hasSubmitted, setHasSubmitted] = useState(false);
	useEffect(() => {
		setFormValues(defaults);
		setHasSubmitted(false);
	}, [defaults]);
	const allErrors = useMemo(() => validateTokenTax(formValues, t), [formValues, t]);
	const errors = hasSubmitted ? allErrors : {};
	function updateField(key, value) {
		setFormValues((current) => ({
			...current,
			[key]: value
		}));
	}
	function markSubmitted() {
		setHasSubmitted(true);
	}
	return {
		formValues,
		errors,
		updateField,
		isValid: Object.keys(allErrors).length === 0,
		markSubmitted
	};
}
//#endregion
//#region src/assets/abi/TokenTax.json
var TokenTax_default = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "defaultRouter_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "creationFee_",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "feeReceiver_",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [{
			"internalType": "address",
			"name": "owner",
			"type": "address"
		}],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [{
			"internalType": "address",
			"name": "account",
			"type": "address"
		}],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [{
			"indexed": false,
			"internalType": "uint256",
			"name": "newFee",
			"type": "uint256"
		}],
		"name": "CreationFeeUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [{
			"indexed": false,
			"internalType": "address",
			"name": "newRouter",
			"type": "address"
		}],
		"name": "DefaultRouterUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [{
			"indexed": true,
			"internalType": "address",
			"name": "creator",
			"type": "address"
		}, {
			"indexed": false,
			"internalType": "uint256",
			"name": "amount",
			"type": "uint256"
		}],
		"name": "FeeCollected",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [{
			"indexed": true,
			"internalType": "address",
			"name": "oldReceiver",
			"type": "address"
		}, {
			"indexed": true,
			"internalType": "address",
			"name": "newReceiver",
			"type": "address"
		}],
		"name": "FeeReceiverUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [{
			"indexed": true,
			"internalType": "address",
			"name": "previousOwner",
			"type": "address"
		}, {
			"indexed": true,
			"internalType": "address",
			"name": "newOwner",
			"type": "address"
		}],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "decimals",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalSupply",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "buyTax",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "sellTax",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "taxReceiver",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "tradingEnabled",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "ownershipRenounced",
				"type": "bool"
			}
		],
		"name": "TokenCreated",
		"type": "event"
	},
	{
		"inputs": [{
			"components": [
				{
					"internalType": "string",
					"name": "name",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "symbol",
					"type": "string"
				},
				{
					"internalType": "uint8",
					"name": "decimals",
					"type": "uint8"
				},
				{
					"internalType": "uint256",
					"name": "totalSupply",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "buyTax",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "sellTax",
					"type": "uint256"
				},
				{
					"internalType": "address",
					"name": "taxReceiver",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "pairedToken",
					"type": "address"
				},
				{
					"internalType": "bool",
					"name": "tradingEnabled",
					"type": "bool"
				},
				{
					"internalType": "bool",
					"name": "renounceOwnership",
					"type": "bool"
				}
			],
			"internalType": "struct TaxTokenFactory.TokenParams",
			"name": "params",
			"type": "tuple"
		}],
		"name": "createTaxToken",
		"outputs": [{
			"internalType": "address",
			"name": "",
			"type": "address"
		}],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [{
			"internalType": "uint256",
			"name": "",
			"type": "uint256"
		}],
		"name": "createdTokens",
		"outputs": [{
			"internalType": "address",
			"name": "",
			"type": "address"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "creationFee",
		"outputs": [{
			"internalType": "uint256",
			"name": "",
			"type": "uint256"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "defaultRouter",
		"outputs": [{
			"internalType": "address",
			"name": "",
			"type": "address"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "feeReceiver",
		"outputs": [{
			"internalType": "address",
			"name": "",
			"type": "address"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{
			"internalType": "uint256",
			"name": "start",
			"type": "uint256"
		}, {
			"internalType": "uint256",
			"name": "end",
			"type": "uint256"
		}],
		"name": "getCreatedTokens",
		"outputs": [{
			"internalType": "address[]",
			"name": "",
			"type": "address[]"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCreatedTokensCount",
		"outputs": [{
			"internalType": "uint256",
			"name": "",
			"type": "uint256"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getFactoryStats",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "_totalTokensCreated",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_totalFeesCollected",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_currentBalance",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_feeReceiver",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getFeeReceiver",
		"outputs": [{
			"internalType": "address",
			"name": "",
			"type": "address"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [{
			"internalType": "address",
			"name": "",
			"type": "address"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{
			"internalType": "uint256",
			"name": "newFee",
			"type": "uint256"
		}],
		"name": "setCreationFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{
			"internalType": "address",
			"name": "newRouter",
			"type": "address"
		}],
		"name": "setDefaultRouter",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{
			"internalType": "address",
			"name": "newFeeReceiver",
			"type": "address"
		}],
		"name": "setFeeReceiver",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{
			"internalType": "address",
			"name": "",
			"type": "address"
		}],
		"name": "tokenCreators",
		"outputs": [{
			"internalType": "address",
			"name": "",
			"type": "address"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalFeesCollected",
		"outputs": [{
			"internalType": "uint256",
			"name": "",
			"type": "uint256"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalTokensCreated",
		"outputs": [{
			"internalType": "uint256",
			"name": "",
			"type": "uint256"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{
			"internalType": "address",
			"name": "newOwner",
			"type": "address"
		}],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawETH",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{
			"internalType": "address",
			"name": "tokenAddress",
			"type": "address"
		}, {
			"internalType": "uint256",
			"name": "amount",
			"type": "uint256"
		}],
		"name": "withdrawTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
];
//#endregion
//#region src/features/tokenTaxCreation/business/tokenTaxCreationService.ts
var factoryInterface = new Interface(TokenTax_default);
async function readTaxCreationFee(chainDefinition, factoryAddress) {
	const rpcUrl = getChainRpcUrl(chainDefinition);
	if (!rpcUrl || !factoryAddress) throw new Error("tokenTaxCreation.errors.factoryUnavailable");
	return await new Contract(factoryAddress, TokenTax_default, new JsonRpcProvider(rpcUrl)).creationFee();
}
async function submitTokenTaxCreation(chainDefinition, factoryAddress, values, options) {
	if (!window.ethereum) throw new Error("tokenTaxCreation.errors.walletUnavailable");
	if (!factoryAddress) throw new Error("tokenTaxCreation.errors.factoryUnavailable");
	const browserProvider = new BrowserProvider(window.ethereum);
	const signer = await browserProvider.getSigner();
	const signerAddress = await signer.getAddress();
	const contract = new Contract(factoryAddress, TokenTax_default, signer);
	const creationFee = await contract.creationFee();
	if (await browserProvider.getBalance(signerAddress) < creationFee) throw new Error("tokenTaxCreation.errors.insufficientBalance");
	const tokenParams = {
		name: values.name,
		symbol: values.symbol,
		decimals: values.decimals,
		totalSupply: BigInt(values.totalSupply),
		buyTax: toBasisPoints(values.buyTax),
		sellTax: toBasisPoints(values.sellTax),
		taxReceiver: values.taxFeeReceiveAddress.trim() || signerAddress,
		pairedToken: values.poolToken || ZeroAddress,
		tradingEnabled: true,
		renounceOwnership: false
	};
	const gasLimit = await contract.createTaxToken.estimateGas(tokenParams, { value: creationFee }) * 12n / 10n;
	options?.onWaitingWallet?.();
	const gasOverrides = await getDynamicGasOverrides(browserProvider, chainDefinition, gasLimit, creationFee);
	const transaction = await contract.createTaxToken(tokenParams, gasOverrides);
	options?.onPending?.();
	const receipt = await transaction.wait();
	let tokenAddress;
	for (const log of receipt?.logs ?? []) try {
		const parsed = factoryInterface.parseLog(log);
		if (parsed?.name === "TokenCreated") {
			tokenAddress = parsed.args.token;
			break;
		}
	} catch {
		continue;
	}
	return {
		txHash: transaction.hash,
		tokenAddress,
		taxReceiverAddress: tokenParams.taxReceiver
	};
}
function toBasisPoints(value) {
	if (!value.trim()) return 0n;
	return BigInt(Math.round(Number(value) * 100));
}
//#endregion
//#region src/features/tokenTaxCreation/business/useTokenTaxSubmit.ts
var defaultStep = null;
function useTokenTaxSubmit(chainDefinition, factoryAddress, t, validateBeforeSubmit) {
	const { isConnected, chainId } = useAccount();
	const { switchChainAsync } = useSwitchChain();
	const [creationFee, setCreationFee] = useState(null);
	const [feeLoading, setFeeLoading] = useState(true);
	const [loading, setLoading] = useState(false);
	const [submitStep, setSubmitStep] = useState(defaultStep);
	const [result, setResult] = useState(null);
	const [successModalOpen, setSuccessModalOpen] = useState(false);
	const [failureModalOpen, setFailureModalOpen] = useState(false);
	const flowIdRef = useRef(0);
	const modalTimerRef = useRef(null);
	function clearModalTimer() {
		if (modalTimerRef.current !== null) {
			window.clearTimeout(modalTimerRef.current);
			modalTimerRef.current = null;
		}
	}
	function isFlowActive(flowId) {
		return flowIdRef.current === flowId;
	}
	function clearResult() {
		clearModalTimer();
		setLoading(false);
		setResult(null);
		setSuccessModalOpen(false);
		setFailureModalOpen(false);
		setSubmitStep(defaultStep);
	}
	function cancelFlow() {
		flowIdRef.current += 1;
		clearModalTimer();
		setLoading(false);
		setResult(null);
		setSuccessModalOpen(false);
		setFailureModalOpen(false);
		setSubmitStep(defaultStep);
	}
	useEffect(() => {
		let active = true;
		flowIdRef.current += 1;
		clearModalTimer();
		setLoading(false);
		setCreationFee(null);
		setResult(null);
		setSuccessModalOpen(false);
		setFailureModalOpen(false);
		setSubmitStep(defaultStep);
		async function loadFee() {
			if (!factoryAddress) {
				setFeeLoading(false);
				setCreationFee(null);
				return;
			}
			setFeeLoading(true);
			try {
				const fee = await readTaxCreationFee(chainDefinition, factoryAddress);
				if (!active) return;
				setCreationFee(fee);
			} catch {
				if (!active) return;
				setCreationFee(null);
			} finally {
				if (active) setFeeLoading(false);
			}
		}
		loadFee();
		return () => {
			active = false;
		};
	}, [chainDefinition, factoryAddress]);
	useEffect(() => {
		return () => {
			clearModalTimer();
		};
	}, []);
	async function submit(values) {
		clearModalTimer();
		setResult(null);
		setFailureModalOpen(false);
		setSuccessModalOpen(false);
		if (!validateBeforeSubmit()) return;
		if (!isConnected) {
			message.warning(t("tokenTaxCreation.errors.walletRequired"));
			return;
		}
		const flowId = flowIdRef.current + 1;
		flowIdRef.current = flowId;
		setLoading(true);
		setSubmitStep({
			id: 1,
			status: "loading"
		});
		try {
			if (chainId !== chainDefinition.chainId) await switchChainAsync({ chainId: chainDefinition.chainId });
			if (!isFlowActive(flowId)) return;
			const nextResult = await submitTokenTaxCreation(chainDefinition, factoryAddress, values, {
				onWaitingWallet: () => {
					if (!isFlowActive(flowId)) return;
					setSubmitStep({
						id: 2,
						status: "loading"
					});
				},
				onPending: () => {
					if (!isFlowActive(flowId)) return;
					setSubmitStep({
						id: 3,
						status: "loading"
					});
				}
			});
			if (!isFlowActive(flowId)) return;
			setLoading(false);
			setResult(nextResult);
			setSubmitStep({
				id: 4,
				status: "success"
			});
			modalTimerRef.current = window.setTimeout(() => {
				if (!isFlowActive(flowId)) return;
				setSubmitStep(defaultStep);
				setSuccessModalOpen(true);
			}, 600);
		} catch (error) {
			if (!isFlowActive(flowId)) return;
			if (error instanceof Error && error.message.startsWith("tokenTaxCreation.errors.")) message.warning(t(error.message));
			setLoading(false);
			setSubmitStep((prev) => ({
				...prev,
				status: "failed"
			}));
			modalTimerRef.current = window.setTimeout(() => {
				if (!isFlowActive(flowId)) return;
				setSubmitStep(defaultStep);
				setFailureModalOpen(true);
			}, 300);
		}
	}
	function closeSuccessModal() {
		setSuccessModalOpen(false);
	}
	function closeFailureModal() {
		setFailureModalOpen(false);
		setSubmitStep(defaultStep);
	}
	return {
		creationFee,
		feeLoading,
		loading,
		submitStep,
		result,
		successModalOpen,
		failureModalOpen,
		submit,
		cancelFlow,
		clearResult,
		closeSuccessModal,
		closeFailureModal
	};
}
//#endregion
//#region src/lib/token/erc20-metadata.ts
var erc20MetadataAbi = [
	"function name() view returns (string)",
	"function symbol() view returns (string)",
	"function decimals() view returns (uint8)"
];
var TokenMetadataLookupError = class extends Error {
	code;
	constructor(code) {
		super(code);
		this.name = "TokenMetadataLookupError";
		this.code = code;
	}
};
async function readErc20Metadata(chainDefinition, address) {
	const rpcUrl = getChainRpcUrl(chainDefinition);
	if (!rpcUrl || !isAddress(address)) throw new TokenMetadataLookupError("UNAVAILABLE");
	const provider = new JsonRpcProvider(rpcUrl);
	const contract = new Contract(getAddress(address), erc20MetadataAbi, provider);
	let name;
	let symbol;
	let decimals;
	try {
		[name, symbol, decimals] = await Promise.all([
			contract.name(),
			contract.symbol(),
			contract.decimals()
		]);
	} catch (error) {
		if (isRpcUnavailableError(error)) throw new TokenMetadataLookupError("UNAVAILABLE");
		throw new TokenMetadataLookupError("NOT_FOUND");
	}
	const resolvedDecimals = normalizeTokenDecimals(decimals);
	if (!name || !symbol || resolvedDecimals == null) throw new TokenMetadataLookupError("NOT_FOUND");
	return {
		address: getAddress(address),
		name,
		symbol,
		decimals: resolvedDecimals
	};
}
function isTokenMetadataLookupError(error, code) {
	return error instanceof TokenMetadataLookupError && (!code || error.code === code);
}
function isRpcUnavailableError(error) {
	if (!error || typeof error !== "object" || !("code" in error)) return false;
	const code = String(error.code);
	return code === "NETWORK_ERROR" || code === "SERVER_ERROR" || code === "TIMEOUT" || code === "TIMEOUT_ERROR";
}
function normalizeTokenDecimals(value) {
	if (typeof value === "number") return Number.isSafeInteger(value) && value >= 0 ? value : null;
	if (typeof value === "bigint") {
		if (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER)) return null;
		return Number(value);
	}
	return null;
}
//#endregion
//#region src/components/common/token-display/index.tsx
var FALLBACK_ICON_SRC$1 = "/img/common/icon-fallback.svg";
function TokenDisplay({ chainDefinition, tokens, value, placeholder, status, disabled = false, allowCustomAddress = false, emptyText, lookupErrorText, noTokenInfoText, searchingText = "Searching token...", nativeLabel = "Native", onChange, onTokenResolved }) {
	const [searchValue, setSearchValue] = useState("");
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [lookupState, setLookupState] = useState({ status: "idle" });
	const [fetchedTokens, setFetchedTokens] = useState([]);
	const lookupSequenceRef = useRef(0);
	const onTokenResolvedRef = useRef(onTokenResolved);
	useEffect(() => {
		onTokenResolvedRef.current = onTokenResolved;
	}, [onTokenResolved]);
	const resolvedTokens = useMemo(() => mergeTokenLists(tokens, fetchedTokens), [fetchedTokens, tokens]);
	const trimmedSearch = searchValue.trim();
	const normalizedSearchAddress = useMemo(() => {
		if (!trimmedSearch || !isAddress(trimmedSearch)) return null;
		return getAddress(trimmedSearch);
	}, [trimmedSearch]);
	const hasLocalAddressMatch = useMemo(() => {
		if (!normalizedSearchAddress) return false;
		return resolvedTokens.some((item) => normalizeTokenAddress(item.address) === normalizedSearchAddress);
	}, [normalizedSearchAddress, resolvedTokens]);
	useEffect(() => {
		if (!allowCustomAddress || !normalizedSearchAddress || hasLocalAddressMatch) {
			lookupSequenceRef.current += 1;
			return;
		}
		const currentSequence = lookupSequenceRef.current + 1;
		lookupSequenceRef.current = currentSequence;
		let disposed = false;
		const loadingFrameId = window.requestAnimationFrame(() => {
			if (disposed || lookupSequenceRef.current !== currentSequence) return;
			setLookupState({
				status: "loading",
				address: normalizedSearchAddress
			});
		});
		const timeoutId = window.setTimeout(() => {
			readErc20Metadata(chainDefinition, normalizedSearchAddress).then((metadata) => {
				if (disposed || lookupSequenceRef.current !== currentSequence) return;
				const nextToken = {
					address: metadata.address,
					name: metadata.name,
					symbol: metadata.symbol,
					decimals: metadata.decimals
				};
				setFetchedTokens((current) => mergeTokenLists(current, [nextToken]));
				onTokenResolvedRef.current?.(nextToken);
				setLookupState({ status: "idle" });
			}).catch((error) => {
				if (disposed || lookupSequenceRef.current !== currentSequence) return;
				if (isTokenMetadataLookupError(error, "NOT_FOUND")) {
					setLookupState({
						status: "not-found",
						address: normalizedSearchAddress
					});
					return;
				}
				setLookupState({ status: "idle" });
				if (lookupErrorText) message.warning(lookupErrorText);
			});
		}, 280);
		return () => {
			disposed = true;
			window.cancelAnimationFrame(loadingFrameId);
			window.clearTimeout(timeoutId);
		};
	}, [
		allowCustomAddress,
		chainDefinition,
		hasLocalAddressMatch,
		lookupErrorText,
		normalizedSearchAddress
	]);
	const visibleTokens = useMemo(() => {
		const nextSearch = searchValue.trim();
		if (!nextSearch) return resolvedTokens;
		if (isAddress(nextSearch)) {
			const normalizedAddress = normalizeTokenAddress(nextSearch);
			return resolvedTokens.filter((item) => normalizeTokenAddress(item.address) === normalizedAddress);
		}
		const loweredSearch = nextSearch.toLowerCase();
		return resolvedTokens.filter((item) => {
			return [
				item.symbol,
				item.name,
				item.address
			].some((candidate) => candidate?.toLowerCase().includes(loweredSearch));
		});
	}, [resolvedTokens, searchValue]);
	const lookupLoading = lookupState.status === "loading" && Boolean(normalizedSearchAddress) && lookupState.address === normalizedSearchAddress;
	const tokenNotFound = lookupState.status === "not-found" && Boolean(normalizedSearchAddress) && lookupState.address === normalizedSearchAddress;
	return /* @__PURE__ */ jsx(Select, {
		className: "token-display-select",
		disabled,
		filterOption: false,
		open: disabled ? false : dropdownOpen,
		status,
		classNames: { popup: { root: "token-display-dropdown" } },
		notFoundContent: lookupLoading ? /* @__PURE__ */ jsxs("div", {
			className: "token-display-empty",
			children: [/* @__PURE__ */ jsx(Spin, {
				indicator: /* @__PURE__ */ jsx(LoadingOutlined, { spin: true }),
				size: "small"
			}), /* @__PURE__ */ jsx("span", { children: searchingText })]
		}) : tokenNotFound && noTokenInfoText ? /* @__PURE__ */ jsx("span", {
			className: "token-display-empty",
			children: noTokenInfoText
		}) : emptyText ? /* @__PURE__ */ jsx("span", {
			className: "token-display-empty",
			children: emptyText
		}) : null,
		onChange: (nextValue) => {
			onChange(nextValue, resolvedTokens.find((item) => normalizeTokenAddress(item.address) === normalizeTokenAddress(nextValue)));
			resetLookupState({
				setDropdownOpen,
				setLookupState,
				setSearchValue,
				lookupSequenceRef
			});
		},
		onOpenChange: (nextOpen) => {
			setDropdownOpen(nextOpen);
			if (!nextOpen) resetLookupState({
				setDropdownOpen,
				setLookupState,
				setSearchValue,
				lookupSequenceRef
			});
		},
		onSearch: (nextSearchValue) => {
			setDropdownOpen(true);
			setSearchValue(nextSearchValue);
		},
		optionLabelProp: "label",
		placeholder,
		searchValue,
		showSearch: true,
		value: searchValue ? void 0 : value,
		children: visibleTokens.map((token) => /* @__PURE__ */ jsx(Select.Option, {
			label: buildSelectedLabel(token, nativeLabel),
			value: token.address,
			children: /* @__PURE__ */ jsxs("div", {
				className: "token-display-option",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "token-display-option-main",
					children: [/* @__PURE__ */ jsx(TokenOptionIcon, { token }), /* @__PURE__ */ jsx("span", {
						className: "token-display-option-symbol",
						children: token.symbol
					})]
				}), /* @__PURE__ */ jsx("span", {
					className: "token-display-option-meta",
					children: getTokenMetaLabel(token, nativeLabel)
				})]
			})
		}, normalizeTokenAddress(token.address)))
	});
}
function TokenOptionIcon({ token }) {
	if (token.logo) return /* @__PURE__ */ jsx("span", {
		className: "token-display-option-icon",
		"aria-hidden": "true",
		children: /* @__PURE__ */ jsx("img", {
			alt: token.symbol,
			onError: handleAssetImageError$1,
			src: token.logo
		})
	});
	return /* @__PURE__ */ jsx("span", {
		className: "token-display-option-icon",
		children: token.symbol.slice(0, 2).toUpperCase()
	});
}
function buildSelectedLabel(token, nativeLabel) {
	return /* @__PURE__ */ jsxs("span", {
		className: "token-display-selected",
		children: [
			/* @__PURE__ */ jsx(TokenOptionIcon, { token }),
			/* @__PURE__ */ jsx("span", {
				className: "token-display-selected-symbol",
				children: token.symbol
			}),
			/* @__PURE__ */ jsx("span", {
				className: "token-display-selected-divider",
				children: "|"
			}),
			/* @__PURE__ */ jsx("span", {
				className: "token-display-selected-meta",
				children: getTokenMetaLabel(token, nativeLabel)
			})
		]
	});
}
function getTokenMetaLabel(token, nativeLabel) {
	if (token.isNative) return nativeLabel;
	return formatText(token.address, 6, 4);
}
function handleAssetImageError$1(event) {
	const target = event.currentTarget;
	target.onerror = null;
	target.src = FALLBACK_ICON_SRC$1;
}
function normalizeTokenAddress(address) {
	const rawAddress = String(address);
	try {
		return getAddress(rawAddress);
	} catch {
		return rawAddress.trim();
	}
}
function mergeTokenLists(...lists) {
	const tokenMap = /* @__PURE__ */ new Map();
	for (const list of lists) for (const item of list) {
		if (!item?.address) continue;
		const key = normalizeTokenAddress(item.address);
		tokenMap.set(key, {
			...tokenMap.get(key),
			...item,
			address: key
		});
	}
	return Array.from(tokenMap.values());
}
function resetLookupState({ setDropdownOpen, setLookupState, setSearchValue, lookupSequenceRef }) {
	lookupSequenceRef.current += 1;
	setDropdownOpen(false);
	setLookupState({ status: "idle" });
	setSearchValue("");
}
//#endregion
//#region src/features/tokenTaxCreation/shared/token-tax-form-panel.tsx
var FALLBACK_ICON_SRC = "/img/common/icon-fallback.svg";
function TokenTaxFormPanel({ model }) {
	const { t, chainDefinition, formValues, errors, exchanges, poolTokens, creationFee, feeLoading, loading, submitStep, result, successModalOpen, failureModalOpen, updateField, onPoolTokenResolved, onSubmit, onCancelFlow, onCloseSuccessModal, onCloseFailureModal, onClearResult } = model;
	const txExplorerUrl = getExplorerUrl(chainDefinition, "hash", result?.txHash);
	const tokenExplorerUrl = getExplorerUrl(chainDefinition, "token", result?.tokenAddress);
	const defaultStableSymbol = chainDefinition.stableCoins?.[0]?.symbol ?? chainDefinition.nativeToken.symbol;
	return /* @__PURE__ */ jsxs("section", {
		className: "surface-card form-card tax-form-card",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "field-grid",
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "field",
						children: [
							/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
								label: t("tokenTaxCreation.fields.name"),
								tooltip: t("tokenTaxCreation.tooltips.name")
							}),
							/* @__PURE__ */ jsx(Input, {
								className: "token-form-input",
								placeholder: t("tokenTaxCreation.placeholders.name"),
								value: formValues.name,
								maxLength: 100,
								allowClear: true,
								onChange: (event) => updateField("name", event.target.value),
								status: errors.name ? "error" : void 0
							}),
							errors.name ? /* @__PURE__ */ jsx("small", {
								className: "field-error",
								children: errors.name
							}) : null
						]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "field",
						children: [
							/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
								label: t("tokenTaxCreation.fields.symbol"),
								tooltip: t("tokenTaxCreation.tooltips.symbol")
							}),
							/* @__PURE__ */ jsx(Input, {
								className: "token-form-input",
								placeholder: t("tokenTaxCreation.placeholders.symbol"),
								value: formValues.symbol,
								maxLength: 100,
								allowClear: true,
								onChange: (event) => updateField("symbol", event.target.value),
								status: errors.symbol ? "error" : void 0
							}),
							errors.symbol ? /* @__PURE__ */ jsx("small", {
								className: "field-error",
								children: errors.symbol
							}) : null
						]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "field",
						children: [
							/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
								label: t("tokenTaxCreation.fields.totalSupply"),
								tooltip: t("tokenTaxCreation.tooltips.totalSupply")
							}),
							/* @__PURE__ */ jsx(InputNumber, {
								className: "token-form-number",
								controls: false,
								parser: (value) => value?.replace(/[^\d]/g, "") || "",
								placeholder: t("tokenTaxCreation.placeholders.totalSupply"),
								precision: 0,
								stringMode: true,
								style: { width: "100%" },
								value: formValues.totalSupply,
								onChange: (value) => updateField("totalSupply", String(value ?? "")),
								status: errors.totalSupply ? "error" : void 0
							}),
							errors.totalSupply ? /* @__PURE__ */ jsx("small", {
								className: "field-error",
								children: errors.totalSupply
							}) : null
						]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "field",
						children: [
							/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
								label: t("tokenTaxCreation.fields.decimals"),
								tooltip: t("tokenTaxCreation.tooltips.decimals")
							}),
							/* @__PURE__ */ jsx(InputNumber, {
								className: "token-form-number",
								controls: false,
								max: 18,
								min: 0,
								placeholder: t("tokenTaxCreation.placeholders.decimals"),
								style: { width: "100%" },
								value: formValues.decimals,
								onChange: (value) => updateField("decimals", value == null ? null : Number(value)),
								status: errors.decimals ? "error" : void 0
							}),
							errors.decimals ? /* @__PURE__ */ jsx("small", {
								className: "field-error",
								children: errors.decimals
							}) : null
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "tax-settings-panel",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "tax-section-copy",
					children: [/* @__PURE__ */ jsx("strong", { children: t("tokenTaxCreation.labels.taxConfiguration") }), /* @__PURE__ */ jsx("p", { children: t("tokenTaxCreation.labels.taxConfigurationNote") })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "field-grid tax-field-grid",
					children: [
						/* @__PURE__ */ jsxs("label", {
							className: "field",
							children: [
								/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
									label: t("tokenTaxCreation.fields.buyTax"),
									tooltip: t("tokenTaxCreation.tooltips.buyTax")
								}),
								/* @__PURE__ */ jsx(Input, {
									className: "token-form-input tax-percent-input",
									placeholder: t("tokenTaxCreation.placeholders.buyTax"),
									suffix: /* @__PURE__ */ jsx("span", {
										className: "tax-percent-suffix",
										children: "%"
									}),
									value: formValues.buyTax,
									onChange: (event) => updateField("buyTax", event.target.value),
									status: errors.buyTax ? "error" : void 0
								}),
								errors.buyTax ? /* @__PURE__ */ jsx("small", {
									className: "field-error",
									children: errors.buyTax
								}) : null
							]
						}),
						/* @__PURE__ */ jsxs("label", {
							className: "field",
							children: [
								/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
									label: t("tokenTaxCreation.fields.sellTax"),
									tooltip: t("tokenTaxCreation.tooltips.sellTax")
								}),
								/* @__PURE__ */ jsx(Input, {
									className: "token-form-input tax-percent-input",
									placeholder: t("tokenTaxCreation.placeholders.sellTax"),
									suffix: /* @__PURE__ */ jsx("span", {
										className: "tax-percent-suffix",
										children: "%"
									}),
									value: formValues.sellTax,
									onChange: (event) => updateField("sellTax", event.target.value),
									status: errors.sellTax ? "error" : void 0
								}),
								errors.sellTax ? /* @__PURE__ */ jsx("small", {
									className: "field-error",
									children: errors.sellTax
								}) : null
							]
						}),
						/* @__PURE__ */ jsxs("label", {
							className: "field",
							children: [
								/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
									label: t("tokenTaxCreation.fields.taxReceiver"),
									tooltip: t("tokenTaxCreation.tooltips.taxReceiver")
								}),
								/* @__PURE__ */ jsx(Input, {
									className: "token-form-input",
									placeholder: t("tokenTaxCreation.placeholders.taxReceiver"),
									value: formValues.taxFeeReceiveAddress,
									allowClear: true,
									onChange: (event) => updateField("taxFeeReceiveAddress", event.target.value),
									status: errors.taxFeeReceiveAddress ? "error" : void 0
								}),
								errors.taxFeeReceiveAddress ? /* @__PURE__ */ jsx("small", {
									className: "field-error",
									children: errors.taxFeeReceiveAddress
								}) : null
							]
						}),
						/* @__PURE__ */ jsxs("label", {
							className: "field",
							children: [
								/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
									label: t("tokenTaxCreation.fields.exchange"),
									tooltip: t("tokenTaxCreation.tooltips.exchange")
								}),
								/* @__PURE__ */ jsx(Select, {
									className: "tax-exchange-select",
									optionLabelProp: "label",
									placeholder: t("tokenTaxCreation.fields.exchange"),
									status: errors.exchange ? "error" : void 0,
									value: formValues.exchange || void 0,
									classNames: { popup: { root: "tax-exchange-dropdown" } },
									onChange: (value) => updateField("exchange", value),
									children: exchanges.map((item) => /* @__PURE__ */ jsx(Select.Option, {
										label: buildExchangeSelectedLabel(item),
										value: item.value,
										children: buildExchangeOptionLabel(item)
									}, item.value))
								}),
								errors.exchange ? /* @__PURE__ */ jsx("small", {
									className: "field-error",
									children: errors.exchange
								}) : null
							]
						}),
						/* @__PURE__ */ jsxs("label", {
							className: "field field-span-full",
							children: [
								/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
									label: t("tokenTaxCreation.fields.poolToken"),
									tooltip: t("tokenTaxCreation.tooltips.poolToken", {
										nativeSymbol: chainDefinition.nativeToken.symbol,
										stableSymbol: defaultStableSymbol
									})
								}),
								/* @__PURE__ */ jsx(TokenDisplay, {
									allowCustomAddress: true,
									chainDefinition,
									emptyText: t("tokenTaxCreation.placeholders.poolToken"),
									lookupErrorText: t("tokenTaxCreation.errors.tokenLookupFailed"),
									noTokenInfoText: t("tokenTaxCreation.status.noTokenInfo"),
									nativeLabel: t("common.nativeToken"),
									onChange: (nextValue) => updateField("poolToken", nextValue),
									onTokenResolved: onPoolTokenResolved,
									placeholder: t("tokenTaxCreation.placeholders.poolToken"),
									searchingText: t("tokenTaxCreation.status.searchingToken"),
									status: errors.poolToken ? "error" : void 0,
									tokens: poolTokens,
									value: formValues.poolToken
								}, chainDefinition.key),
								errors.poolToken ? /* @__PURE__ */ jsx("small", {
									className: "field-error",
									children: errors.poolToken
								}) : null
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx(Button, {
				block: true,
				className: "primary-button ant-primary-button",
				loading,
				onClick: () => void onSubmit(),
				type: "primary",
				size: "large",
				children: loading ? t("tokenTaxCreation.actions.submitting") : t("tokenTaxCreation.actions.submit")
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "fee-inline-note fee-inline-note-after-submit",
				children: [/* @__PURE__ */ jsx(FieldLabelWithTooltip, {
					label: t("tokenTaxCreation.labels.creationFee"),
					tooltip: t("tokenTaxCreation.tooltips.creationFee")
				}), /* @__PURE__ */ jsx("strong", { children: feeLoading || creationFee == null ? "..." : `${formatEther(creationFee)} ${chainDefinition.nativeToken.symbol}` })]
			}),
			result ? /* @__PURE__ */ jsxs("div", {
				className: "result-card success-result-card",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "success-card-head",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "success-banner",
						children: [/* @__PURE__ */ jsx(CheckCircleFilled, {}), /* @__PURE__ */ jsx("span", { children: t("tokenTaxCreation.success.banner") })]
					}), /* @__PURE__ */ jsx("button", {
						className: "result-close-button",
						onClick: onClearResult,
						type: "button",
						"aria-label": t("tokenTaxCreation.actions.close"),
						children: /* @__PURE__ */ jsx(CloseOutlined, {})
					})]
				}), /* @__PURE__ */ jsx(TokenCreationSummary, {
					chainDefinition,
					result,
					t
				})]
			}) : null,
			/* @__PURE__ */ jsx(OperationStatus, {
				open: Boolean(submitStep),
				title: t("tokenTaxCreation.modal.progressTitle"),
				step: submitStep,
				steps: [
					{
						id: 1,
						text: t("tokenTaxCreation.steps.preparing")
					},
					{
						id: 2,
						text: t("tokenTaxCreation.steps.waitingWallet")
					},
					{
						id: 3,
						text: t("tokenTaxCreation.steps.pending")
					},
					{
						id: 4,
						text: t("tokenTaxCreation.steps.completed"),
						errorText: t("tokenTaxCreation.steps.failed")
					}
				],
				cancelBtnShow: submitStep?.id === 1 || submitStep?.id === 2,
				onClose: onCancelFlow
			}),
			/* @__PURE__ */ jsx(AppModal, {
				className: "token-result-modal",
				footer: /* @__PURE__ */ jsx(Button, {
					type: "primary",
					onClick: onCloseSuccessModal,
					children: t("tokenTaxCreation.actions.close")
				}),
				onCancel: onCloseSuccessModal,
				open: successModalOpen,
				title: /* @__PURE__ */ jsx("div", {
					className: "token-result-modal-heading",
					children: t("tokenTaxCreation.modal.successTitle")
				}),
				children: /* @__PURE__ */ jsx("div", {
					className: "result-modal-shell",
					children: /* @__PURE__ */ jsxs("div", {
						className: "result-modal-card",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "result-modal-row",
							children: [/* @__PURE__ */ jsx("span", { children: t("tokenTaxCreation.success.tokenAddress") }), /* @__PURE__ */ jsxs("div", {
								className: "result-modal-value",
								children: [result?.tokenAddress ? /* @__PURE__ */ jsx("a", {
									className: "value-link",
									href: tokenExplorerUrl,
									target: "_blank",
									rel: "noreferrer",
									children: formatText(result.tokenAddress)
								}) : /* @__PURE__ */ jsx("strong", { children: "--" }), result?.tokenAddress ? /* @__PURE__ */ jsx(CopyButton, {
									ariaLabel: "copy token address",
									value: result.tokenAddress
								}) : null]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "result-modal-row",
							children: [/* @__PURE__ */ jsx("span", { children: t("tokenTaxCreation.success.txHash") }), /* @__PURE__ */ jsxs("div", {
								className: "result-modal-value",
								children: [result?.txHash ? /* @__PURE__ */ jsx("a", {
									className: "value-link",
									href: txExplorerUrl,
									target: "_blank",
									rel: "noreferrer",
									children: formatText(result.txHash)
								}) : /* @__PURE__ */ jsx("strong", { children: "--" }), result?.txHash ? /* @__PURE__ */ jsx(CopyButton, {
									ariaLabel: "copy tx hash",
									value: result.txHash
								}) : null]
							})]
						})]
					})
				})
			}),
			/* @__PURE__ */ jsx(OperationWarning, {
				contents: [t("common.exception.errorReason1", { chain: chainDefinition.fullName }), t("common.exception.errorReason2")],
				footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Button, {
					onClick: onCloseFailureModal,
					children: t("tokenTaxCreation.actions.close")
				}), /* @__PURE__ */ jsx(Button, {
					type: "primary",
					onClick: () => {
						onCloseFailureModal();
						onSubmit();
					},
					children: t("tokenTaxCreation.actions.retry")
				})] }),
				labelText: t("common.exception.possibleReasons"),
				noteText: t("common.exception.contactOfficialSupport"),
				onClose: onCloseFailureModal,
				open: failureModalOpen,
				title: t("tokenTaxCreation.modal.errorTitle")
			})
		]
	});
}
function buildExchangeSelectedLabel(exchange) {
	return /* @__PURE__ */ jsxs("span", {
		className: "tax-exchange-selected",
		children: [/* @__PURE__ */ jsx("span", {
			className: "tax-exchange-badge",
			"aria-hidden": "true",
			children: exchange.logo ? /* @__PURE__ */ jsx("img", {
				alt: exchange.label,
				onError: handleAssetImageError,
				src: exchange.logo
			}) : getExchangeBadgeText(exchange)
		}), /* @__PURE__ */ jsx("span", {
			className: "tax-exchange-selected-name",
			children: exchange.label
		})]
	});
}
function buildExchangeOptionLabel(exchange) {
	return /* @__PURE__ */ jsx("div", {
		className: "tax-exchange-option",
		children: /* @__PURE__ */ jsxs("div", {
			className: "tax-exchange-option-main",
			children: [/* @__PURE__ */ jsx("span", {
				className: "tax-exchange-badge",
				"aria-hidden": "true",
				children: exchange.logo ? /* @__PURE__ */ jsx("img", {
					alt: exchange.label,
					onError: handleAssetImageError,
					src: exchange.logo
				}) : getExchangeBadgeText(exchange)
			}), /* @__PURE__ */ jsx("span", {
				className: "tax-exchange-option-name",
				children: exchange.label
			})]
		})
	});
}
function getExchangeBadgeText(exchange) {
	return exchange.dex.slice(0, 2).toUpperCase();
}
function handleAssetImageError(event) {
	const target = event.currentTarget;
	target.onerror = null;
	target.src = FALLBACK_ICON_SRC;
}
//#endregion
//#region src/features/tokenTaxCreation/shared/token-tax-seo-data.ts
var tokenTaxFaqKeys = [
	"noCode",
	"fee",
	"template",
	"receiver",
	"poolToken",
	"liquidity"
];
function getTokenTaxFaqVars(chainDefinition, chainLabel) {
	return {
		chain: chainLabel,
		tokenType: chainDefinition.tokenType,
		symbol: chainDefinition.nativeToken.symbol
	};
}
function buildTokenTaxFaqStructuredData(t, vars) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: tokenTaxFaqKeys.map((key) => ({
			"@type": "Question",
			name: t(`tokenTaxCreation.seoBody.faq.${key}.question`, vars),
			acceptedAnswer: {
				"@type": "Answer",
				text: t(`tokenTaxCreation.seoBody.faq.${key}.answer`, vars)
			}
		}))
	};
}
//#endregion
//#region src/features/tokenTaxCreation/shared/token-tax-seo-content.tsx
var highlightIcons = {
	template: /* @__PURE__ */ jsx(SafetyCertificateOutlined, {}),
	control: /* @__PURE__ */ jsx(PercentageOutlined, {}),
	receiver: /* @__PURE__ */ jsx(FileDoneOutlined, {})
};
function TokenTaxSeoContent({ chainDefinition, t }) {
	const vars = {
		chain: getChainFullName(chainDefinition),
		tokenType: chainDefinition.tokenType,
		symbol: chainDefinition.nativeToken.symbol
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "token-seo-stack",
		children: [/* @__PURE__ */ jsxs("section", {
			className: "surface-card token-seo-card",
			children: [/* @__PURE__ */ jsx("div", {
				className: "token-section-copy",
				children: /* @__PURE__ */ jsx("h2", { children: t("tokenTaxCreation.seoBody.highlights.title") })
			}), /* @__PURE__ */ jsx("div", {
				className: "token-seo-grid token-seo-grid-three",
				children: [
					"template",
					"control",
					"receiver"
				].map((key) => /* @__PURE__ */ jsxs("article", {
					className: "token-seo-feature",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "token-seo-feature-head",
						children: [/* @__PURE__ */ jsx("div", {
							className: "token-section-icon",
							children: highlightIcons[key]
						}), /* @__PURE__ */ jsx("h3", { children: t(`tokenTaxCreation.seoBody.highlights.${key}.title`, vars) })]
					}), /* @__PURE__ */ jsx("p", { children: t(`tokenTaxCreation.seoBody.highlights.${key}.description`, vars) })]
				}, key))
			})]
		}), /* @__PURE__ */ jsxs("section", {
			className: "surface-card token-seo-card token-seo-faq",
			id: "token-tax-creation-faq",
			children: [/* @__PURE__ */ jsx("div", {
				className: "token-section-copy",
				children: /* @__PURE__ */ jsx("h2", { children: t("tokenTaxCreation.seoBody.faq.title") })
			}), /* @__PURE__ */ jsx("div", {
				className: "token-faq-list",
				children: tokenTaxFaqKeys.map((key) => /* @__PURE__ */ jsxs("article", {
					className: "token-faq-item",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "token-faq-question",
						children: [/* @__PURE__ */ jsx(MessageOutlined, {}), /* @__PURE__ */ jsx("h3", { children: t(`tokenTaxCreation.seoBody.faq.${key}.question`, vars) })]
					}), /* @__PURE__ */ jsx("p", { children: t(`tokenTaxCreation.seoBody.faq.${key}.answer`, vars) })]
				}, key))
			})]
		})]
	});
}
//#endregion
//#region src/features/tokenTaxCreation/shared/token-tax-next-steps.tsx
var stepIcons = {
	addWallet: /* @__PURE__ */ jsx(WalletOutlined, {}),
	verifyFees: /* @__PURE__ */ jsx(FileSearchOutlined, {}),
	reviewPairing: /* @__PURE__ */ jsx(InfoCircleOutlined, {}),
	metadata: /* @__PURE__ */ jsx(PictureOutlined, {})
};
function TokenTaxNextSteps({ t }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "token-success-section token-next-steps-section",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "token-success-copy",
			children: [
				/* @__PURE__ */ jsx("h3", { children: t("tokenTaxCreation.nextSteps.title") }),
				/* @__PURE__ */ jsx("p", { children: t("tokenTaxCreation.nextSteps.description") }),
				/* @__PURE__ */ jsxs("div", {
					className: "next-steps-note",
					children: [/* @__PURE__ */ jsx(InfoCircleOutlined, {}), /* @__PURE__ */ jsx("span", { children: t("tokenTaxCreation.nextSteps.note") })]
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "next-step-grid",
			children: [
				"addWallet",
				"verifyFees",
				"reviewPairing",
				"metadata"
			].map((step, index) => /* @__PURE__ */ jsxs("article", {
				className: "next-step-card",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "next-step-card-head",
					children: [/* @__PURE__ */ jsx("div", {
						className: "next-step-icon",
						children: stepIcons[step]
					}), /* @__PURE__ */ jsxs("div", {
						className: "next-step-heading",
						children: [/* @__PURE__ */ jsx("span", {
							className: "next-step-index",
							children: String(index + 1).padStart(2, "0")
						}), /* @__PURE__ */ jsx("h4", { children: t(`tokenTaxCreation.nextSteps.${step}.title`) })]
					})]
				}), /* @__PURE__ */ jsx("p", { children: t(`tokenTaxCreation.nextSteps.${step}.description`) })]
			}, step))
		})]
	});
}
//#endregion
//#region src/features/tokenTaxCreation/shared/token-tax-overview-card.tsx
function TokenTaxOverviewCard({ chainDefinition, t }) {
	const vars = { tokenType: chainDefinition.tokenType };
	const highlights = [
		chainDefinition.tokenType,
		t("tokenTaxCreation.overview.highlights.base"),
		t("tokenTaxCreation.overview.highlights.buy"),
		t("tokenTaxCreation.overview.highlights.sell"),
		t("tokenTaxCreation.overview.highlights.receiver")
	];
	const cards = [
		{
			key: "taxPlan",
			icon: /* @__PURE__ */ jsx(PercentageOutlined, {}),
			title: t("tokenTaxCreation.overview.cards.taxPlan.title"),
			description: t("tokenTaxCreation.overview.cards.taxPlan.description")
		},
		{
			key: "receiver",
			icon: /* @__PURE__ */ jsx(WalletOutlined, {}),
			title: t("tokenTaxCreation.overview.cards.receiver.title"),
			description: t("tokenTaxCreation.overview.cards.receiver.description")
		},
		{
			key: "trading",
			icon: /* @__PURE__ */ jsx(DeploymentUnitOutlined, {}),
			title: t("tokenTaxCreation.overview.cards.trading.title"),
			description: t("tokenTaxCreation.overview.cards.trading.description")
		}
	];
	return /* @__PURE__ */ jsxs("section", {
		className: "surface-card token-permission-card",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "permission-hero",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "permission-hero-layout",
				children: [/* @__PURE__ */ jsx("div", {
					className: "permission-hero-badge",
					children: /* @__PURE__ */ jsx("div", {
						className: "token-section-icon",
						children: /* @__PURE__ */ jsx(SafetyCertificateOutlined, {})
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "permission-hero-content",
					children: /* @__PURE__ */ jsxs("div", {
						className: "token-section-copy",
						children: [/* @__PURE__ */ jsx("h3", { children: t("tokenTaxCreation.overview.title") }), /* @__PURE__ */ jsx("p", { children: t("tokenTaxCreation.overview.description", vars) })]
					})
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "permission-highlight-row",
				children: highlights.map((highlight) => /* @__PURE__ */ jsx("span", {
					className: "permission-highlight-pill",
					children: highlight
				}, highlight))
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "permission-card-grid",
			children: cards.map((card) => /* @__PURE__ */ jsxs("article", {
				className: "permission-feature-card",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "permission-feature-head",
					children: [/* @__PURE__ */ jsx("div", {
						className: "permission-feature-icon",
						children: card.icon
					}), /* @__PURE__ */ jsx("h4", { children: card.title })]
				}), /* @__PURE__ */ jsx("div", {
					className: "permission-feature-copy",
					children: /* @__PURE__ */ jsx("p", { children: card.description })
				})]
			}, card.key))
		})]
	});
}
//#endregion
//#region src/features/tokenTaxCreation/shared/token-tax-creation-page.tsx
function TokenTaxCreationPage() {
	if (useRenderMode() === "static") return /* @__PURE__ */ jsx(StaticTokenTaxCreationPage, {});
	return /* @__PURE__ */ jsx(InteractiveTokenTaxCreationPage, {});
}
function InteractiveTokenTaxCreationPage() {
	const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext();
	const chainLabel = getChainFullName(chainDefinition);
	const form = useTokenTaxForm(chainDefinition, t);
	const exchanges = useMemo(() => getTaxExchangeOptions(chainDefinition), [chainDefinition]);
	const [poolTokens, setPoolTokens] = useState(() => buildPoolTokenOptions(chainDefinition));
	const submit = useTokenTaxSubmit(chainDefinition, form.formValues.exchange, t, () => form.isValid);
	const seo = getPageSeo("tax-token-creation", {
		t,
		chainName: chainLabel,
		nativeSymbol: chainDefinition.nativeToken.symbol,
		tokenType: chainDefinition.tokenType
	});
	const faqStructuredData = buildTokenTaxFaqStructuredData(t, getTokenTaxFaqVars(chainDefinition, chainLabel));
	useEffect(() => {
		setPoolTokens(buildPoolTokenOptions(chainDefinition));
	}, [chainDefinition]);
	return renderTokenTaxCreationLayout({
		seo,
		model: {
			chainDefinition,
			formValues: form.formValues,
			errors: form.errors,
			exchanges,
			poolTokens,
			creationFee: submit.creationFee,
			feeLoading: submit.feeLoading,
			loading: submit.loading,
			submitStep: submit.submitStep,
			result: submit.result,
			successModalOpen: submit.successModalOpen,
			failureModalOpen: submit.failureModalOpen,
			updateField: (key, value) => {
				form.updateField(key, value);
				submit.clearResult();
			},
			onPoolTokenResolved: (token) => {
				setPoolTokens((current) => mergeTokenOptions(current, [token]));
			},
			onSubmit: async () => {
				form.markSubmitted();
				if (!form.isValid) return;
				const { name, symbol, totalSupply, decimals, buyTax, sellTax, taxFeeReceiveAddress, exchange, poolToken } = form.formValues;
				if (decimals == null) return;
				const submitValues = {
					name,
					symbol,
					totalSupply,
					decimals,
					buyTax,
					sellTax,
					taxFeeReceiveAddress,
					exchange,
					poolToken
				};
				await submit.submit(submitValues);
			},
			onCancelFlow: submit.cancelFlow,
			onCloseSuccessModal: submit.closeSuccessModal,
			onCloseFailureModal: submit.closeFailureModal,
			onClearResult: submit.clearResult,
			t
		},
		t,
		lang,
		chain,
		themeColor,
		chainDefinition,
		faqStructuredData,
		hasThemeQuery
	});
}
function StaticTokenTaxCreationPage() {
	const { t, lang, chain, themeColor, chainDefinition, hasThemeQuery } = useRouteContext();
	const chainLabel = getChainFullName(chainDefinition);
	const seo = getPageSeo("tax-token-creation", {
		t,
		chainName: chainLabel,
		nativeSymbol: chainDefinition.nativeToken.symbol,
		tokenType: chainDefinition.tokenType
	});
	const faqStructuredData = buildTokenTaxFaqStructuredData(t, getTokenTaxFaqVars(chainDefinition, chainLabel));
	return renderTokenTaxCreationLayout({
		seo,
		model: {
			chainDefinition,
			formValues: getDefaultTokenTaxValues(chainDefinition),
			errors: {},
			exchanges: getTaxExchangeOptions(chainDefinition),
			poolTokens: buildPoolTokenOptions(chainDefinition),
			creationFee: null,
			feeLoading: true,
			loading: false,
			submitStep: null,
			result: null,
			successModalOpen: false,
			failureModalOpen: false,
			updateField: createStaticUpdateField,
			onPoolTokenResolved: () => void 0,
			onSubmit: async () => void 0,
			onCancelFlow: () => void 0,
			onCloseSuccessModal: () => void 0,
			onCloseFailureModal: () => void 0,
			onClearResult: () => void 0,
			t
		},
		t,
		lang,
		chain,
		themeColor,
		chainDefinition,
		faqStructuredData,
		hasThemeQuery
	});
}
function renderTokenTaxCreationLayout({ seo, model, t, lang, chain, themeColor, chainDefinition, faqStructuredData, hasThemeQuery }) {
	const chainLabel = getChainFullName(chainDefinition);
	const header = /* @__PURE__ */ jsx(PageHeader, {
		eyebrow: t("tokenTaxCreation.eyebrow"),
		title: t("tokenTaxCreation.title"),
		description: t("tokenTaxCreation.description", {
			chain: chainLabel,
			tokenType: chainDefinition.tokenType
		})
	});
	return /* @__PURE__ */ jsxs("section", {
		className: `page-stack token-creation-page token-tax-creation-page token-creation-${themeColor}`,
		children: [/* @__PURE__ */ jsx("div", {
			className: "hero-banner",
			children: header
		}), /* @__PURE__ */ jsx("div", {
			className: "theme-single-column",
			children: /* @__PURE__ */ jsx("div", {
				className: "theme-main theme-main-centered",
				children: /* @__PURE__ */ jsxs("div", {
					className: "token-creation-stack",
					children: [
						/* @__PURE__ */ jsx(PageSeo, {
							...seo,
							canonicalUrl: buildCanonicalPageUrl(lang, chain, "tax-token-creation"),
							alternates: buildAlternatePageLinks(chain, "tax-token-creation"),
							locale: normalizeLocaleTag(lang),
							robots: hasThemeQuery || !chainDefinition.seoIndex ? "noindex,follow" : "index,follow"
						}),
						hasThemeQuery ? null : /* @__PURE__ */ jsx(StructuredData, {
							id: "token-tax-creation-faq",
							data: faqStructuredData
						}),
						/* @__PURE__ */ jsx("div", {
							id: "token-tax-creation-form",
							children: /* @__PURE__ */ jsx(TokenTaxFormPanel, { model })
						}),
						/* @__PURE__ */ jsxs("section", {
							className: "surface-card token-creation-content-module",
							children: [
								/* @__PURE__ */ jsx(TokenTaxOverviewCard, {
									chainDefinition,
									t
								}),
								/* @__PURE__ */ jsx(TokenTaxNextSteps, { t }),
								/* @__PURE__ */ jsx(TokenTaxSeoContent, {
									chainDefinition,
									t
								})
							]
						})
					]
				})
			})
		})]
	});
}
function createStaticUpdateField(_key, _value) {}
//#endregion
//#region src/features/projectAcceptance/components/acceptance-sections.tsx
function AcceptanceHero({ eyebrow, title, description }) {
	return /* @__PURE__ */ jsx("div", {
		className: "acceptance-hero",
		children: /* @__PURE__ */ jsx(PageHeader, {
			eyebrow,
			title,
			description
		})
	});
}
function AcceptanceSummaryCards({ rows }) {
	return /* @__PURE__ */ jsx("section", {
		className: "summary-grid summary-grid-four",
		children: rows.map((row) => /* @__PURE__ */ jsxs("article", {
			className: "surface-card summary-card",
			children: [/* @__PURE__ */ jsx("span", { children: row.label }), /* @__PURE__ */ jsx("strong", { children: row.value })]
		}, row.label))
	});
}
function AcceptanceFunctionTable({ items, title, openLabel }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "surface-card",
		children: [/* @__PURE__ */ jsx("div", {
			className: "section-label",
			children: title
		}), /* @__PURE__ */ jsx("div", {
			className: "acceptance-table",
			children: items.map((item) => /* @__PURE__ */ jsxs("div", {
				className: "acceptance-row",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("strong", { children: item.title }), /* @__PURE__ */ jsx("p", { children: item.summary })] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: item.currentStage }), /* @__PURE__ */ jsxs("strong", { children: [item.completion, "%"] })] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: item.themes.join(" / ") }), /* @__PURE__ */ jsx("a", {
						className: "text-link",
						href: item.route,
						children: openLabel
					})] })
				]
			}, item.id))
		})]
	});
}
function AcceptanceRoleBoard({ rows, title, roleLabel, statusLabel, ownerLabel, updatedLabel, translateRole, translateStatus }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "surface-card",
		children: [/* @__PURE__ */ jsx("div", {
			className: "section-label",
			children: title
		}), /* @__PURE__ */ jsx("div", {
			className: "role-grid",
			children: rows.map((row) => /* @__PURE__ */ jsxs("article", {
				className: "role-card",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "role-card-top",
						children: [/* @__PURE__ */ jsx("strong", { children: translateRole(row.role) }), /* @__PURE__ */ jsxs("span", { children: [row.completion, "%"] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "role-meta",
						children: [/* @__PURE__ */ jsx("span", { children: roleLabel }), /* @__PURE__ */ jsx("strong", { children: translateRole(row.role) })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "role-meta",
						children: [/* @__PURE__ */ jsx("span", { children: statusLabel }), /* @__PURE__ */ jsx("strong", { children: translateStatus(row.status) })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "role-meta",
						children: [/* @__PURE__ */ jsx("span", { children: ownerLabel }), /* @__PURE__ */ jsx("strong", { children: row.owner })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "role-meta",
						children: [/* @__PURE__ */ jsx("span", { children: updatedLabel }), /* @__PURE__ */ jsx("strong", { children: row.updatedAt })]
					}),
					/* @__PURE__ */ jsx("p", { children: row.summary })
				]
			}, row.role))
		})]
	});
}
function AcceptanceTaskList({ tasks, title, labels, translateRole, translateStatus, translatePriority }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "surface-card",
		children: [/* @__PURE__ */ jsx("div", {
			className: "section-label",
			children: title
		}), /* @__PURE__ */ jsx("div", {
			className: "task-list",
			children: tasks.map((task) => /* @__PURE__ */ jsxs("article", {
				className: "task-card",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "task-card-top",
						children: [/* @__PURE__ */ jsx("strong", { children: task.title }), /* @__PURE__ */ jsx("span", { children: translateStatus(task.status) })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "task-meta-grid",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: labels.role }), /* @__PURE__ */ jsx("strong", { children: translateRole(task.role) })] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: labels.priority }), /* @__PURE__ */ jsx("strong", { children: translatePriority(task.priority) })] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: labels.blocked }), /* @__PURE__ */ jsx("strong", { children: task.blocked ? "Yes" : "No" })] })
						]
					}),
					/* @__PURE__ */ jsx("p", { children: task.note }),
					task.link ? /* @__PURE__ */ jsx("a", {
						className: "text-link",
						href: task.link,
						children: task.link
					}) : null
				]
			}, task.id))
		})]
	});
}
function AcceptanceRiskPanel({ items, title }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "surface-card",
		children: [/* @__PURE__ */ jsx("div", {
			className: "section-label",
			children: title
		}), /* @__PURE__ */ jsx("div", {
			className: "risk-list",
			children: items.map((item) => /* @__PURE__ */ jsxs("article", {
				className: `risk-card ${item.level}`,
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "risk-head",
						children: [/* @__PURE__ */ jsx("strong", { children: item.title }), /* @__PURE__ */ jsx("span", { children: item.level.toUpperCase() })]
					}),
					/* @__PURE__ */ jsx("p", { children: item.summary }),
					/* @__PURE__ */ jsx("small", { children: item.action })
				]
			}, item.title))
		})]
	});
}
function AcceptanceLinksPanel({ title, links }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "surface-card",
		children: [/* @__PURE__ */ jsx("div", {
			className: "section-label",
			children: title
		}), /* @__PURE__ */ jsx("div", {
			className: "links-list",
			children: links.map((link) => /* @__PURE__ */ jsxs("a", {
				className: "link-card",
				href: link.href,
				children: [/* @__PURE__ */ jsx("span", { children: link.label }), /* @__PURE__ */ jsx("strong", { children: link.href })]
			}, link.href))
		})]
	});
}
//#endregion
//#region src/features/projectAcceptance/config/acceptance-data.ts
function getAcceptanceData(lang, chain, theme, themeColor) {
	return [{
		id: "token-creation",
		title: "Token Creation Pilot",
		route: buildPagePath(lang, chain, "token-creation", {
			theme,
			themeColor
		}),
		themes: [
			"orange",
			"purple",
			"green"
		],
		status: "in_progress",
		completion: 78,
		currentStage: "Pilot implementation",
		summary: "Shared business logic is live, three themes are connected, and the acceptance workspace tracks all roles.",
		roles: [
			{
				role: "productDiscovery",
				status: "done",
				completion: 100,
				owner: "PM-01",
				updatedAt: "2026-03-31",
				summary: "Pilot scope, value proposition, and theme positioning are locked."
			},
			{
				role: "productDelivery",
				status: "done",
				completion: 100,
				owner: "PD-01",
				updatedAt: "2026-03-31",
				summary: "Route shape, layout zones, and shared-vs-theme boundaries are documented."
			},
			{
				role: "engineering",
				status: "in_progress",
				completion: 82,
				owner: "DEV-01",
				updatedAt: "2026-03-31",
				summary: "Core app shell, wallet layer, theme pages, and token submission flow are implemented."
			},
			{
				role: "qa",
				status: "in_progress",
				completion: 60,
				owner: "QA-01",
				updatedAt: "2026-03-31",
				summary: "Routing, wallet, and theme regressions are covered. On-chain verification still needs final pass."
			},
			{
				role: "lead",
				status: "in_progress",
				completion: 75,
				owner: "LEAD-01",
				updatedAt: "2026-03-31",
				summary: "Progress is healthy, with final chain validation as the remaining gate for wider rollout."
			},
			{
				role: "userAcceptance",
				status: "not_started",
				completion: 30,
				owner: "UAT-POOL",
				updatedAt: "2026-03-31",
				summary: "End-to-end user validation is waiting for the first integrated test pass on all pilot chains."
			}
		],
		tasks: [
			{
				id: "pd-01",
				role: "productDiscovery",
				title: "Define the pilot value proposition",
				status: "done",
				priority: "high",
				blocked: false,
				note: "Locked around multi-theme single-page token creation."
			},
			{
				id: "pd-02",
				role: "productDelivery",
				title: "Freeze route pattern and query-driven theme switching",
				status: "done",
				priority: "high",
				blocked: false,
				note: "Adopted /:lang/:chain/token-creation?theme=color."
			},
			{
				id: "eng-01",
				role: "engineering",
				title: "Build app shell, wallet layer, and route guard",
				status: "done",
				priority: "high",
				blocked: false,
				note: "wagmi injected wallet, lang/chain/page routing, and topbar are in place."
			},
			{
				id: "eng-02",
				role: "engineering",
				title: "Implement shared token creation business service",
				status: "done",
				priority: "high",
				blocked: false,
				note: "Reads creation fee, estimates gas, submits createToken, and parses TokenCreated."
			},
			{
				id: "eng-03",
				role: "engineering",
				title: "Finish purple and green visual polish",
				status: "in_progress",
				priority: "medium",
				blocked: false,
				note: "Layouts are connected, but final visual refinement is still open.",
				link: buildPagePath(lang, chain, "token-creation", {
					theme,
					themeColor: "purple"
				})
			},
			{
				id: "qa-01",
				role: "qa",
				title: "Run route and theme regression",
				status: "done",
				priority: "high",
				blocked: false,
				note: "Main navigation, theme switching, and invalid param fallbacks are covered."
			},
			{
				id: "qa-02",
				role: "qa",
				title: "Validate BSC, ETH, and Base live submission paths",
				status: "in_progress",
				priority: "high",
				blocked: true,
				note: "Needs final wallet-based execution check on each pilot chain.",
				link: buildPagePath(lang, chain, "token-creation", {
					theme,
					themeColor: "orange"
				})
			},
			{
				id: "lead-01",
				role: "lead",
				title: "Review pilot readiness and next milestone",
				status: "in_progress",
				priority: "medium",
				blocked: false,
				note: "Awaiting QA confirmation on the live createToken transaction path."
			},
			{
				id: "uat-01",
				role: "userAcceptance",
				title: "Walk the final user path from open page to token address result",
				status: "not_started",
				priority: "medium",
				blocked: false,
				note: "Planned after live chain verification is complete.",
				link: buildPagePath(lang, chain, "token-creation", {
					theme,
					themeColor: "orange"
				})
			}
		],
		risks: [{
			title: "Live factory validation still pending",
			level: "high",
			summary: "The business flow is implemented, but pilot chains still need fresh wallet-based verification.",
			action: "Run real token creation on BSC, ETH, and Base with wallet confirmation and event parsing checks."
		}, {
			title: "Theme polish is uneven",
			level: "medium",
			summary: "All three themes are live, but the purple and green themes still need more visual refinement to feel product-ready.",
			action: "Refine spacing, hierarchy, and supporting cards after the core pilot path is validated."
		}]
	}];
}
//#endregion
//#region src/features/projectAcceptance/pages/project-acceptance-page.tsx
function ProjectAcceptancePage() {
	const { lang, chain, theme, themeColor, t, chainDefinition } = useRouteContext();
	const functions = useMemo(() => getAcceptanceData(lang, chain, theme, themeColor), [
		chain,
		lang,
		theme,
		themeColor
	]);
	const primaryFunction = functions[0];
	const seo = getPageSeo("project-acceptance", {
		t,
		chainName: getChainFullName(chainDefinition),
		tokenType: chainDefinition.tokenType
	});
	const summaryRows = [
		{
			label: t("acceptance.summary.project"),
			value: t("app.name")
		},
		{
			label: t("acceptance.summary.stage"),
			value: primaryFunction.currentStage
		},
		{
			label: t("acceptance.summary.completion"),
			value: `${primaryFunction.completion}%`
		},
		{
			label: t("acceptance.summary.risks"),
			value: primaryFunction.risks.length
		},
		{
			label: t("acceptance.summary.completedFeatures"),
			value: functions.filter((item) => item.status === "done").length
		},
		{
			label: t("acceptance.summary.inProgressFeatures"),
			value: functions.filter((item) => item.status === "in_progress").length
		},
		{
			label: t("acceptance.summary.backlogFeatures"),
			value: functions.filter((item) => item.status === "not_started").length
		}
	];
	const links = [
		{
			label: t("nav.tokenCreation"),
			href: primaryFunction.route
		},
		{
			label: `${t("nav.tokenCreation")} · ${t("theme.purple")}`,
			href: buildPagePath(lang, chain, "token-creation", {
				theme,
				themeColor: "purple"
			})
		},
		{
			label: `${t("nav.tokenCreation")} · ${t("theme.green")}`,
			href: buildPagePath(lang, chain, "token-creation", {
				theme,
				themeColor: "green"
			})
		}
	];
	return /* @__PURE__ */ jsxs("section", {
		className: "page-stack project-acceptance-page",
		children: [
			/* @__PURE__ */ jsx(PageSeo, {
				...seo,
				canonicalUrl: buildCanonicalPageUrl(lang, chain, "project-acceptance"),
				locale: normalizeLocaleTag(lang),
				robots: "noindex,nofollow"
			}),
			/* @__PURE__ */ jsx(AcceptanceHero, {
				eyebrow: t("acceptance.eyebrow"),
				title: t("acceptance.title"),
				description: t("acceptance.description")
			}),
			/* @__PURE__ */ jsx(AcceptanceSummaryCards, { rows: summaryRows }),
			/* @__PURE__ */ jsx(AcceptanceFunctionTable, {
				items: functions,
				title: t("acceptance.sections.functions"),
				openLabel: t("acceptance.actions.openFeature")
			}),
			/* @__PURE__ */ jsx(AcceptanceRoleBoard, {
				rows: primaryFunction.roles,
				title: t("acceptance.sections.roles"),
				roleLabel: t("acceptance.labels.role"),
				statusLabel: t("acceptance.labels.status"),
				ownerLabel: t("acceptance.labels.owner"),
				updatedLabel: t("acceptance.labels.updatedAt"),
				translateRole: (role) => t(`acceptance.roles.${role}`),
				translateStatus: (status) => t(`acceptance.statuses.${status}`)
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "two-column-grid",
				children: [/* @__PURE__ */ jsx(AcceptanceTaskList, {
					tasks: primaryFunction.tasks,
					title: t("acceptance.sections.tasks"),
					labels: {
						role: t("acceptance.labels.role"),
						status: t("acceptance.labels.status"),
						priority: t("acceptance.labels.priority"),
						blocked: t("acceptance.labels.blocked"),
						note: t("acceptance.labels.note")
					},
					translateRole: (role) => t(`acceptance.roles.${role}`),
					translateStatus: (status) => t(`acceptance.statuses.${status}`),
					translatePriority: (priority) => t(`acceptance.priorities.${priority}`)
				}), /* @__PURE__ */ jsxs("div", {
					className: "stack-column",
					children: [/* @__PURE__ */ jsx(AcceptanceRiskPanel, {
						items: primaryFunction.risks,
						title: t("acceptance.sections.risks")
					}), /* @__PURE__ */ jsx(AcceptanceLinksPanel, {
						title: t("acceptance.sections.links"),
						links
					})]
				})]
			})
		]
	});
}
//#endregion
//#region src/app/router.tsx
function buildPreferredPath(pathname, search, fallbackPage = DEFAULT_PAGE) {
	const [lang, chain, page] = pathname.split("/").filter(Boolean);
	const searchParams = new URLSearchParams(search);
	const resolvedPreferences = resolveAppPreferences({
		lang,
		chain,
		theme: searchParams.get("theme"),
		themeColor: searchParams.get("themeColor")
	});
	return buildPagePath(resolvedPreferences.lang, resolvedPreferences.chain, isSupportedPage(page) ? page : fallbackPage, {
		theme: resolvedPreferences.theme,
		themeColor: resolvedPreferences.themeColor
	});
}
function RootRedirect() {
	const location = useLocation();
	return /* @__PURE__ */ jsx(Navigate, {
		replace: true,
		to: buildPreferredPath(location.pathname, location.search)
	});
}
function RouteGate() {
	const location = useLocation();
	const [lang, chain, page] = location.pathname.split("/").filter(Boolean);
	if (!isSupportedLang(lang) || !isSupportedChain(chain) || !isSupportedPage(page)) return /* @__PURE__ */ jsx(Navigate, {
		replace: true,
		to: buildPreferredPath(location.pathname, location.search)
	});
	return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
function NestedFallback() {
	const location = useLocation();
	return /* @__PURE__ */ jsx(Navigate, {
		replace: true,
		to: buildPreferredPath(location.pathname, location.search)
	});
}
function AppRouter() {
	return /* @__PURE__ */ jsxs(Routes, { children: [
		/* @__PURE__ */ jsx(Route, {
			path: "/",
			element: /* @__PURE__ */ jsx(RootRedirect, {})
		}),
		/* @__PURE__ */ jsxs(Route, {
			path: "/:lang/:chain",
			element: /* @__PURE__ */ jsx(RouteGate, {}),
			children: [
				/* @__PURE__ */ jsx(Route, {
					path: "token-creation",
					element: /* @__PURE__ */ jsx(TokenCreationPage, {})
				}),
				/* @__PURE__ */ jsx(Route, {
					path: "tax-token-creation",
					element: /* @__PURE__ */ jsx(TokenTaxCreationPage, {})
				}),
				/* @__PURE__ */ jsx(Route, {
					path: "project-acceptance",
					element: /* @__PURE__ */ jsx(ProjectAcceptancePage, {})
				}),
				/* @__PURE__ */ jsx(Route, {
					path: "*",
					element: /* @__PURE__ */ jsx(NestedFallback, {})
				})
			]
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "*",
			element: /* @__PURE__ */ jsx(RootRedirect, {})
		})
	] });
}
//#endregion
//#region src/prerender/entry-server.tsx
var prerenderRoutes = supportedLanguages.flatMap((language) => supportedChains.filter((chain) => chain.seoIndex).flatMap((chain) => [`/${language.key}/${chain.key}/token-creation`, `/${language.key}/${chain.key}/tax-token-creation`]));
function render(url) {
	return {
		appHtml: renderToString(/* @__PURE__ */ jsx(StaticRouter, {
			location: url,
			children: /* @__PURE__ */ jsx(AppFrame, {
				mode: "static",
				children: /* @__PURE__ */ jsx(AppRouter, {})
			})
		})),
		...buildDocument(url)
	};
}
function buildDocument(url) {
	const route = resolvePublicRoute(url);
	if (!route) return {
		htmlLang: "en",
		title: SITE_NAME,
		headTags: ""
	};
	const t = createTranslator(route.lang);
	const chainDefinition = getChainDefinition(route.chain);
	const chainLabel = getChainFullName(chainDefinition);
	const seo = getPageSeo(route.page, {
		t,
		chainName: chainLabel,
		tokenType: chainDefinition.tokenType,
		nativeSymbol: chainDefinition.nativeToken.symbol
	});
	const canonicalUrl = buildCanonicalPageUrl(route.lang, route.chain, route.page);
	const imageUrl = buildAbsoluteUrl(DEFAULT_OG_IMAGE);
	const alternates = buildAlternatePageLinks(route.chain, route.page);
	const faqStructuredData = route.page === "tax-token-creation" ? buildTokenTaxFaqStructuredData(t, getTokenTaxFaqVars(chainDefinition, chainLabel)) : buildTokenCreationFaqStructuredData(t, getTokenCreationFaqVars(chainDefinition, chainLabel));
	const headTags = [
		buildMetaTag("description", seo.description),
		seo.keywords ? buildMetaTag("keywords", seo.keywords) : "",
		buildMetaTag("robots", "index,follow"),
		buildMetaTag("twitter:card", "summary_large_image"),
		buildMetaTag("twitter:title", seo.title),
		buildMetaTag("twitter:description", seo.description),
		buildMetaTag("twitter:image", imageUrl),
		buildPropertyMetaTag("og:site_name", SITE_NAME),
		buildPropertyMetaTag("og:type", "website"),
		buildPropertyMetaTag("og:title", seo.title),
		buildPropertyMetaTag("og:description", seo.description),
		buildPropertyMetaTag("og:url", canonicalUrl),
		buildPropertyMetaTag("og:image", imageUrl),
		buildPropertyMetaTag("og:locale", normalizeLocaleTag(route.lang)),
		`<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`,
		...alternates.map((alternate) => `<link rel="alternate" hreflang="${escapeAttribute(alternate.hrefLang)}" href="${escapeAttribute(alternate.href)}" />`),
		`<script type="application/ld+json">${serializeJsonLd(faqStructuredData)}<\/script>`
	].filter(Boolean).join("\n    ");
	return {
		htmlLang: normalizeLocaleTag(route.lang),
		title: seo.title,
		headTags
	};
}
function resolvePublicRoute(url) {
	const [lang, chain, page] = new URL(url, "https://token-tools.pages.dev").pathname.split("/").filter(Boolean);
	if (!isSupportedLang(lang) || !isSupportedChain(chain) || page !== "token-creation" && page !== "tax-token-creation") return null;
	return {
		lang,
		chain,
		page
	};
}
function buildMetaTag(name, content) {
	return `<meta name="${escapeAttribute(name)}" content="${escapeAttribute(content)}" />`;
}
function buildPropertyMetaTag(property, content) {
	return `<meta property="${escapeAttribute(property)}" content="${escapeAttribute(content)}" />`;
}
function escapeAttribute(value) {
	return value.replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function serializeJsonLd(value) {
	return JSON.stringify(value).replaceAll("<", "\\u003c");
}
//#endregion
export { prerenderRoutes, render };

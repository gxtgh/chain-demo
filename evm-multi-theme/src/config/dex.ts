export type DexMeta = {
  name: string
  value: string
  logo: string
}

export const dexList = [
  {
    name: 'Uniswap',
    value: 'Uniswap',
    logo: '/img/dex/uniswap.png',
  },
  {
    name: 'PancakeSwap',
    value: 'PancakeSwap',
    logo: '/img/dex/pancake.svg',
  },
  {
    name: 'SlerfSwap',
    value: 'SlerfSwap',
    logo: '/img/dex/slerfswap.png',
  },
  {
    name: 'Dyorswap',
    value: 'Dyorswap',
    logo: '/img/dex/dyorswap.svg',
  },
  {
    name: 'PotatoSwap',
    value: 'PotatoSwap',
    logo: '/img/dex/potatoswap.svg',
  },
  {
    name: 'Lithos',
    value: 'Lithos',
    logo: '/img/dex/lithos.svg',
  },
  {
    name: 'Shadow',
    value: 'Shadow',
    logo: '/img/dex/shadow.svg',
  },
  {
    name: 'ApeSwap',
    value: 'ApeSwap',
    logo: '/img/dex/apeswap.png',
  },
  {
    name: 'Base Meme',
    value: 'BaseMeme',
    logo: '/img/dex/baseMeme.avif',
  },
  {
    name: 'Biswap',
    value: 'Biswap',
    logo: '/img/dex/biswap.ico',
  },
  {
    name: 'Capricorn',
    value: 'Capricorn',
    logo: '/img/dex/capricorn.jpg',
  },
  {
    name: 'Dexscreener',
    value: 'Dexscreener',
    logo: '/img/dex/dexscreener.png',
  },
  {
    name: 'Flap',
    value: 'Flap',
    logo: '/img/dex/flap.webp',
  },
  {
    name: 'Four',
    value: 'Four',
    logo: '/img/dex/four.svg',
  },
  {
    name: 'Nomiswap',
    value: 'Nomiswap',
    logo: '/img/dex/nomiswap.ico',
  },
  {
    name: 'QuickSwap',
    value: 'QuickSwap',
    logo: '/img/dex/quickswap.avif',
  },
  {
    name: 'Thruster',
    value: 'Thruster',
    logo: '/img/dex/thruster.avif',
  },
] as const satisfies readonly DexMeta[]

export type DexValue = (typeof dexList)[number]['value']

export function getDexMeta(value: DexValue) {
  return dexList.find((item) => item.value === value) ?? dexList[0]
}

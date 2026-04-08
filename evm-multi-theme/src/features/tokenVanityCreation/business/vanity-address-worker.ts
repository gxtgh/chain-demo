import { AbiCoder, concat, getCreate2Address, hexlify, keccak256, randomBytes } from 'ethers'

const REPORT_INTERVAL_COUNT = 500
const REPORT_INTERVAL_MS = 120

type VanityWorkerRequest = {
  workerId: string
  prefix: string
  suffix: string
  factoryAddress: `0x${string}`
  tokenCreationCode: string
  deployer: `0x${string}`
  tokenInfo: {
    name: string
    symbol: string
    decimals: number
    totalSupply: string
  }
}

self.onmessage = function handleVanityWorkerMessage(event: MessageEvent<VanityWorkerRequest>) {
  const { workerId, prefix, suffix, factoryAddress, tokenCreationCode, deployer, tokenInfo } = event.data
  const initCodeHash = keccak256(
    concat([
      tokenCreationCode,
      AbiCoder.defaultAbiCoder().encode(
        ['string', 'string', 'uint8', 'uint256', 'address'],
        [tokenInfo.name, tokenInfo.symbol, tokenInfo.decimals, BigInt(tokenInfo.totalSupply), deployer],
      ),
    ]),
  )

  const normalizedPrefix = prefix.toLowerCase()
  const normalizedSuffix = suffix.toLowerCase()
  let count = 0
  let lastReportedCount = 0
  let lastReportTime = Date.now()

  while (true) {
    count += 1
    const salt = hexlify(randomBytes(32)) as `0x${string}`
    const predictedAddress = getCreate2Address(factoryAddress, salt, initCodeHash)
    const addressHex = predictedAddress.slice(2).toLowerCase()
    const isPrefixMatch = normalizedPrefix ? addressHex.startsWith(normalizedPrefix) : true
    const isSuffixMatch = normalizedSuffix ? addressHex.endsWith(normalizedSuffix) : true
    const isMatch = isPrefixMatch && isSuffixMatch
    const now = Date.now()

    if (isMatch || count - lastReportedCount >= REPORT_INTERVAL_COUNT || now - lastReportTime >= REPORT_INTERVAL_MS) {
      self.postMessage({
        workerId,
        count,
        isMatch,
        address: predictedAddress,
        salt,
      })
      lastReportedCount = count
      lastReportTime = now
    }

    if (isMatch) {
      break
    }
  }
}

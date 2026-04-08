import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { message } from 'antd'
import type { ChainDefinition } from '@/config/chains'
import type { TokenVanityFormValues, VanitySearchState } from './model'

const EMPTY_SEARCH_STATE: VanitySearchState = {
  status: 'idle',
  generatedCount: 0,
  speed: 0,
  progress: 0,
  estimatedSeconds: null,
  difficulty: 1n,
  match: null,
}

export function useVanityAddressSearch({
  chainDefinition,
  factoryAddress,
  tokenCreationCode,
  formValues,
  address,
  t,
  validateBeforeSearch,
}: {
  chainDefinition: ChainDefinition
  factoryAddress: string
  tokenCreationCode: string | null
  formValues: TokenVanityFormValues
  address?: `0x${string}`
  t: (key: string) => string
  validateBeforeSearch: () => boolean
}) {
  const [search, setSearch] = useState<VanitySearchState>({
    ...EMPTY_SEARCH_STATE,
    difficulty: calculateDifficulty(formValues.prefix, formValues.suffix),
  })
  const workersRef = useRef<Worker[]>([])
  const workerCountsRef = useRef<Record<string, number>>({})
  const nextWorkerIdRef = useRef(0)
  const statsFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const stoppedRef = useRef(true)
  const threadCount = useMemo(() => {
    if (typeof navigator === 'undefined') {
      return 4
    }
    return Math.min(Math.max(Math.floor((navigator.hardwareConcurrency || 8) / 2), 2), 6)
  }, [])
  const difficulty = useMemo(() => calculateDifficulty(formValues.prefix, formValues.suffix), [formValues.prefix, formValues.suffix])

  const resetSearch = useCallback(() => {
    if (statsFrameRef.current !== null) {
      window.cancelAnimationFrame(statsFrameRef.current)
      statsFrameRef.current = null
    }
    stoppedRef.current = true
    startTimeRef.current = null
    workerCountsRef.current = {}
    nextWorkerIdRef.current = 0
    setSearch({
      ...EMPTY_SEARCH_STATE,
      difficulty,
    })
  }, [difficulty])

  const stopWorkers = useCallback((nextStatus?: VanitySearchState['status']) => {
    if (statsFrameRef.current !== null) {
      window.cancelAnimationFrame(statsFrameRef.current)
      statsFrameRef.current = null
    }

    for (const worker of workersRef.current) {
      worker.terminate()
    }
    workersRef.current = []
    stoppedRef.current = true

    if (nextStatus) {
      setSearch((current) => ({
        ...current,
        status: nextStatus,
      }))
    }
  }, [])

  const updateStats = useCallback(() => {
    const generatedCount = Object.values(workerCountsRef.current).reduce((sum, count) => sum + count, 0)
    if (!startTimeRef.current) {
      setSearch((current) => ({
        ...current,
        generatedCount,
      }))
      return
    }

    const elapsedSeconds = Math.max((Date.now() - startTimeRef.current) / 1000, 1)
    const speed = Math.max(0, Math.round(generatedCount / elapsedSeconds))
    const progress = difficulty > 0n ? Number((BigInt(generatedCount) * 10000n) / difficulty) / 100 : 0
    const remaining = difficulty > BigInt(generatedCount) ? difficulty - BigInt(generatedCount) : 0n
    const roundedSpeed = Math.max(1, speed)
    const estimatedSecondsBigInt = remaining / BigInt(roundedSpeed)
    const estimatedSeconds =
      estimatedSecondsBigInt > BigInt(Number.MAX_SAFE_INTEGER) ? null : Number(estimatedSecondsBigInt)

    setSearch((current) => ({
      ...current,
      generatedCount,
      speed,
      progress: Math.min(progress, 99.99),
      estimatedSeconds,
    }))
  }, [difficulty])

  const scheduleStatsUpdate = useCallback(() => {
    if (statsFrameRef.current !== null) {
      return
    }

    statsFrameRef.current = window.requestAnimationFrame(() => {
      statsFrameRef.current = null
      updateStats()
    })
  }, [updateStats])

  const handleWorkerMessage = useCallback((event: MessageEvent<{ workerId: string; count: number; isMatch: boolean; address: string; salt: `0x${string}` }>) => {
    if (stoppedRef.current) {
      return
    }

    const { workerId, count, isMatch, address: vanityAddress, salt } = event.data
    workerCountsRef.current[workerId] = count

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now()
    }

    if (isMatch) {
      stoppedRef.current = true
      updateStats()
      message.success(t('tokenVanityCreation.status.readyToCreate'))
      setSearch((current) => ({
        ...current,
        status: 'success',
        progress: 100,
        match: {
          address: vanityAddress,
          salt,
        },
      }))
      stopWorkers()
      return
    }

    scheduleStatsUpdate()
  }, [scheduleStatsUpdate, stopWorkers, t, updateStats])

  const startGenerate = useCallback(async () => {
    if (!validateBeforeSearch()) {
      return
    }

    if (!address) {
      message.warning(t('tokenVanityCreation.errors.walletRequiredForSearch'))
      return
    }

    if (!factoryAddress || !tokenCreationCode) {
      message.warning(t('tokenVanityCreation.errors.searchUnavailable'))
      return
    }

    stoppedRef.current = false
    startTimeRef.current = Date.now()
    workerCountsRef.current = {}
    nextWorkerIdRef.current = 0
    setSearch({
      ...EMPTY_SEARCH_STATE,
      status: 'searching',
      difficulty,
    })

    for (let index = 0; index < threadCount; index += 1) {
      const workerId = `vanity-worker-${nextWorkerIdRef.current++}`
      const worker = new Worker(new URL('./vanity-address-worker.ts', import.meta.url), { type: 'module' })
      worker.onmessage = handleWorkerMessage
      worker.onerror = () => {
        delete workerCountsRef.current[workerId]
        workersRef.current = workersRef.current.filter((item) => item !== worker)
        scheduleStatsUpdate()
        worker.terminate()
      }
      workersRef.current.push(worker)
      worker.postMessage({
        workerId,
        prefix: formValues.prefix.trim().toLowerCase(),
        suffix: formValues.suffix.trim().toLowerCase(),
        factoryAddress,
        tokenCreationCode,
        deployer: address,
        tokenInfo: {
          name: formValues.name,
          symbol: formValues.symbol,
          decimals: Number(formValues.decimals ?? 18),
          totalSupply: formValues.totalSupply,
        },
      })
    }
  }, [
    address,
    difficulty,
    factoryAddress,
    formValues.decimals,
    formValues.name,
    formValues.prefix,
    formValues.suffix,
    formValues.symbol,
    formValues.totalSupply,
    handleWorkerMessage,
    scheduleStatsUpdate,
    t,
    threadCount,
    tokenCreationCode,
    validateBeforeSearch,
  ])

  const stopGenerate = useCallback(() => {
    stopWorkers('stopped')
  }, [stopWorkers])

  useEffect(() => {
    resetSearch()
    stopWorkers()
  }, [
    address,
    chainDefinition.chainId,
    factoryAddress,
    formValues.decimals,
    formValues.name,
    formValues.prefix,
    formValues.suffix,
    formValues.symbol,
    formValues.totalSupply,
    resetSearch,
    stopWorkers,
    tokenCreationCode,
  ])

  useEffect(() => {
    return () => {
      stopWorkers()
    }
  }, [stopWorkers])

  return {
    search,
    startGenerate,
    stopGenerate,
    resetSearch,
  }
}

function calculateDifficulty(prefix: string, suffix: string) {
  const totalLength = prefix.trim().length + suffix.trim().length
  if (totalLength <= 0) {
    return 1n
  }

  return 16n ** BigInt(totalLength)
}

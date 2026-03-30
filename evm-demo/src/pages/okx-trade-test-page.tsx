import { useMemo, useState } from 'react'
import { PageHeader } from '../components/common/page-header'
import { useAppRoute } from '../hooks/use-app-route'
import { getChainConfig } from '../config/chains'
import {
  createTradeClients,
  getAllowance,
  OKX_NATIVE_TOKEN_ADDRESS,
  resolveTradeTokenMetadata,
  sendPreparedTransaction,
  toAtomicAmount,
  toHumanAmount,
  type TokenMetadata,
} from '../services/trade/evm-private-trade'
import {
  getOkxApproveTransaction,
  getOkxChainIndex,
  getOkxQuote,
  getOkxSwapTransaction,
  type OkxApproveTransaction,
  type OkxQuote,
} from '../services/trade/okx-api'

type TradeForm = {
  privateKey: string
  fromTokenAddress: string
  fromTokenAmount: string
  toTokenAddress: string
  slippage: string
}

const initialForm: TradeForm = {
  privateKey: '',
  fromTokenAddress: '',
  fromTokenAmount: '',
  toTokenAddress: '',
  slippage: '0.5',
}

type LogItem = {
  id: string
  kind: 'info' | 'success' | 'error'
  message: string
}

export function OkxTradeTestPage() {
  const { chain, lang, t } = useAppRoute()
  const chainConfig = getChainConfig(chain)
  const [form, setForm] = useState<TradeForm>(initialForm)
  const [treatFromWrappedAsNative, setTreatFromWrappedAsNative] = useState(true)
  const [treatToWrappedAsNative, setTreatToWrappedAsNative] = useState(false)
  const [status, setStatus] = useState('')
  const [logs, setLogs] = useState<LogItem[]>([])
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quote, setQuote] = useState<OkxQuote | null>(null)
  const [approvePayload, setApprovePayload] = useState<OkxApproveTransaction | null>(null)
  const [fromTokenMeta, setFromTokenMeta] = useState<TokenMetadata | null>(null)
  const [toTokenMeta, setToTokenMeta] = useState<TokenMetadata | null>(null)

  const okxChainIndex = useMemo(() => getOkxChainIndex(chain), [chain])

  function appendLog(kind: LogItem['kind'], message: string) {
    setLogs((current) => [{ id: `${Date.now()}-${Math.random()}`, kind, message }, ...current].slice(0, 24))
  }

  function resetPreparedTradeState(options?: { clearFromMeta?: boolean; clearToMeta?: boolean }) {
    setStatus('')
    setQuote(null)
    setApprovePayload(null)
    if (options?.clearFromMeta) {
      setFromTokenMeta(null)
    }
    if (options?.clearToMeta) {
      setToTokenMeta(null)
    }
  }

  function updateFormField<Key extends keyof TradeForm>(key: Key, value: TradeForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))

    if (key === 'privateKey') {
      setStatus('')
      return
    }

    resetPreparedTradeState({
      clearFromMeta: key === 'fromTokenAddress',
      clearToMeta: key === 'toTokenAddress',
    })
  }

  function handleWrappedNativeModeChange(target: 'from' | 'to', nextValue: boolean) {
    if (target === 'from') {
      setTreatFromWrappedAsNative(nextValue)
    } else {
      setTreatToWrappedAsNative(nextValue)
    }
    resetPreparedTradeState({
      clearFromMeta: true,
      clearToMeta: true,
    })
  }

  async function handleQuote() {
    setStatus('')
    setIsLoadingQuote(true)
    try {
      const clients = createTradeClients(chainConfig, form.privateKey)
      const [nextFromMeta, nextToMeta] = await Promise.all([
        resolveTradeTokenMetadata(clients.publicClient, chainConfig, form.fromTokenAddress, {
          preferWrappedNativeAsNative: treatFromWrappedAsNative,
        }),
        resolveTradeTokenMetadata(clients.publicClient, chainConfig, form.toTokenAddress, {
          preferWrappedNativeAsNative: treatToWrappedAsNative,
        }),
      ])
      setFromTokenMeta(nextFromMeta)
      setToTokenMeta(nextToMeta)

      const amountAtomic = toAtomicAmount(form.fromTokenAmount, nextFromMeta.decimals)
      const quoteResult = await getOkxQuote({
        chainIndex: okxChainIndex,
        fromTokenAddress: nextFromMeta.address,
        toTokenAddress: nextToMeta.address,
        amount: amountAtomic.toString(),
        userWalletAddress: clients.account.address,
        slippagePercent: form.slippage,
      })

      const approveResult = nextFromMeta.isNative
        ? null
        : await getOkxApproveTransaction({
            chainIndex: okxChainIndex,
            tokenContractAddress: nextFromMeta.sourceAddress,
            approveAmount: amountAtomic.toString(),
          })

      setQuote(quoteResult)
      setApprovePayload(approveResult)
      appendLog(
        'info',
        nextFromMeta.isNative
          ? lang === 'zh-cn'
            ? `输入代币将按 ${chainConfig.nativeCurrency.symbol} 原生币路径处理，跳过授权。`
            : `Token 1 will be treated as native ${chainConfig.nativeCurrency.symbol} and approval will be skipped.`
          : lang === 'zh-cn'
            ? `输入代币按 ERC20 处理，授权目标为 ${approveResult?.dexContractAddress ?? '--'}。`
            : `Token 1 will be treated as ERC20. Approve spender: ${approveResult?.dexContractAddress ?? '--'}.`,
      )
      appendLog('success', lang === 'zh-cn' ? 'OKX 最优报价已获取。' : 'OKX quote loaded successfully.')
      setStatus(lang === 'zh-cn' ? '报价和交易载荷已准备完成。' : 'Quote and transaction payload are ready.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load quote.'
      appendLog('error', message)
      setStatus(message)
    } finally {
      setIsLoadingQuote(false)
    }
  }

  async function handleTrade() {
    setStatus('')
    setIsSubmitting(true)
    try {
      const clients = createTradeClients(chainConfig, form.privateKey)
      const nextFromMeta =
        fromTokenMeta ??
        (await resolveTradeTokenMetadata(clients.publicClient, chainConfig, form.fromTokenAddress, {
          preferWrappedNativeAsNative: treatFromWrappedAsNative,
        }))
      const nextToMeta =
        toTokenMeta ??
        (await resolveTradeTokenMetadata(clients.publicClient, chainConfig, form.toTokenAddress, {
          preferWrappedNativeAsNative: treatToWrappedAsNative,
        }))
      const amountAtomic = toAtomicAmount(form.fromTokenAmount, nextFromMeta.decimals)
      const nextApprove =
        approvePayload ??
        (nextFromMeta.isNative
          ? null
          : await getOkxApproveTransaction({
              chainIndex: okxChainIndex,
              tokenContractAddress: nextFromMeta.sourceAddress,
              approveAmount: amountAtomic.toString(),
            }))
      appendLog(
        'info',
        lang === 'zh-cn'
          ? '提交前向 OKX 刷新最新 swap 路由。'
          : 'Refreshing the latest swap route from OKX before submission.',
      )
      const nextSwap = await getOkxSwapTransaction({
        chainIndex: okxChainIndex,
        fromTokenAddress: nextFromMeta.address,
        toTokenAddress: nextToMeta.address,
        amount: amountAtomic.toString(),
        userWalletAddress: clients.account.address,
        slippagePercent: form.slippage,
      })

      if (nextFromMeta.isNative) {
        appendLog(
          'info',
          lang === 'zh-cn'
            ? `检测到 ${chainConfig.nativeCurrency.symbol} 原生币路径，跳过授权。`
            : `Native ${chainConfig.nativeCurrency.symbol} path detected, skipping approval.`,
        )
      } else {
        const spender = nextApprove?.dexContractAddress
        if (!spender) {
          throw new Error(lang === 'zh-cn' ? 'OKX 未返回授权合约地址。' : 'OKX did not return an approve spender address.')
        }

        const allowance = await getAllowance(
          clients.publicClient,
          nextFromMeta.sourceAddress,
          clients.account.address,
          spender as `0x${string}`,
        )

        if (allowance < amountAtomic) {
          appendLog('info', lang === 'zh-cn' ? '当前授权不足，先发送 approve 交易。' : 'Allowance is insufficient, sending approve transaction first.')
          const approveTx = await sendPreparedTransaction(clients, {
            to: nextFromMeta.sourceAddress,
            data: nextApprove.data,
            gasLimit: nextApprove.gasLimit,
            gasPrice: nextApprove.gasPrice,
          })
          appendLog('success', `${lang === 'zh-cn' ? '授权成功' : 'Approve succeeded'}: ${approveTx.hash}`)
        } else {
          appendLog('info', lang === 'zh-cn' ? '授权额度已足够，跳过 approve。' : 'Allowance is already sufficient, skipping approve.')
        }
      }

      if (!nextSwap.tx?.to) {
        throw new Error(lang === 'zh-cn' ? 'OKX 未返回可发送的 swap 交易。' : 'OKX did not return a swap transaction payload.')
      }

      const preparedSwapTx = {
        ...nextSwap.tx,
        to: nextSwap.tx.to,
        value: nextFromMeta.isNative ? nextSwap.tx.value ?? amountAtomic.toString() : nextSwap.tx.value,
      }

      const swapTx = await sendPreparedTransaction(clients, preparedSwapTx)
      appendLog('success', `${lang === 'zh-cn' ? '兑换成功' : 'Swap succeeded'}: ${swapTx.hash}`)
      setStatus(lang === 'zh-cn' ? `交易已发送，Hash: ${swapTx.hash}` : `Transaction sent successfully: ${swapTx.hash}`)
      setFromTokenMeta(nextFromMeta)
      setToTokenMeta(nextToMeta)
      setApprovePayload(nextApprove)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Swap failed.'
      appendLog('error', message)
      setStatus(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const quoteRows = useMemo(
    () => [
      {
        label: lang === 'zh-cn' ? '输入路径' : 'Input route',
        value: fromTokenMeta?.isNative
          ? lang === 'zh-cn'
            ? `${chainConfig.nativeCurrency.symbol} 原生币`
            : `Native ${chainConfig.nativeCurrency.symbol}`
          : lang === 'zh-cn'
            ? 'ERC20'
            : 'ERC20',
      },
      {
        label: lang === 'zh-cn' ? '输入代币数量' : 'Input amount',
        value: fromTokenMeta ? `${form.fromTokenAmount} ${fromTokenMeta.symbol}` : form.fromTokenAmount || '--',
      },
      {
        label: lang === 'zh-cn' ? '输出代币预估' : 'Estimated output',
        value:
          quote && toTokenMeta && quote.toTokenAmount
            ? `${toHumanAmount(quote.toTokenAmount, toTokenMeta.decimals)} ${toTokenMeta.symbol}`
            : '--',
      },
      {
        label: lang === 'zh-cn' ? '预估 Gas 费用' : 'Estimated gas fee',
        value: quote?.estimateGasFee || '--',
      },
      {
        label: lang === 'zh-cn' ? '价格影响' : 'Price impact',
        value: quote?.priceImpactPercentage || '--',
      },
    ],
    [chainConfig.nativeCurrency.symbol, form.fromTokenAmount, fromTokenMeta, lang, quote, toTokenMeta],
  )

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow={t('pages.okxTrade.eyebrow')}
        title={t('pages.okxTrade.title')}
        description={t('pages.okxTrade.description')}
      />

      <div className="workspace-grid">
        <section className="form-card">
          <div className="section-head">
            <div>
              <p className="panel-label">{t('common.overview')}</p>
              <h2>{t('pages.okxTrade.title')}</h2>
            </div>
            <div className="network-pill">{`${chainConfig.name} · OKX DEX`}</div>
          </div>

          <div className="warning-box">
            {t('pages.okxTrade.notices.privateKey')}
          </div>

          <div className="info-box" style={{ marginTop: 14 }}>
            {t('pages.okxTrade.notices.erc20Only')}
          </div>

          <div className="form-grid two-columns" style={{ marginTop: 14 }}>
            <label className="toggle-card">
              <div className="toggle-copy">
                <strong>{t('pages.okxTrade.fields.fromWrappedNativeMode')}</strong>
                <span>{t('pages.okxTrade.notices.fromWrappedNativeMode')}</span>
              </div>
              <input
                checked={treatFromWrappedAsNative}
                onChange={(event) => handleWrappedNativeModeChange('from', event.target.checked)}
                type="checkbox"
              />
            </label>
            <label className="toggle-card">
              <div className="toggle-copy">
                <strong>{t('pages.okxTrade.fields.toWrappedNativeMode')}</strong>
                <span>{t('pages.okxTrade.notices.toWrappedNativeMode')}</span>
              </div>
              <input
                checked={treatToWrappedAsNative}
                onChange={(event) => handleWrappedNativeModeChange('to', event.target.checked)}
                type="checkbox"
              />
            </label>
          </div>

          {fromTokenMeta?.isNative ? (
            <div className="success-box" style={{ marginTop: 14 }}>
              {lang === 'zh-cn'
                ? `当前输入地址会被映射为 OKX 原生币地址 ${OKX_NATIVE_TOKEN_ADDRESS}，实际按 ${chainConfig.nativeCurrency.symbol} 原生币路径下单。`
                : `The current Token 1 input is mapped to OKX native token address ${OKX_NATIVE_TOKEN_ADDRESS} and will be swapped as native ${chainConfig.nativeCurrency.symbol}.`}
            </div>
          ) : null}

          <div className="form-grid" style={{ marginTop: 18 }}>
            <label className="field-group">
              <span>{t('pages.okxTrade.fields.privateKey')}</span>
              <textarea
                value={form.privateKey}
                onChange={(event) => updateFormField('privateKey', event.target.value)}
                placeholder="0x..."
              />
            </label>

            <div className="form-grid two-columns">
              <label className="field-group">
                <span>{t('pages.okxTrade.fields.fromTokenAddress')}</span>
                <input
                  value={form.fromTokenAddress}
                  onChange={(event) => updateFormField('fromTokenAddress', event.target.value)}
                  placeholder="0x..."
                />
              </label>
              <label className="field-group">
                <span>{t('pages.okxTrade.fields.fromTokenAmount')}</span>
                <input
                  value={form.fromTokenAmount}
                  onChange={(event) => updateFormField('fromTokenAmount', event.target.value)}
                  placeholder="1.0"
                />
              </label>
            </div>

            <div className="form-grid two-columns">
              <label className="field-group">
                <span>{t('pages.okxTrade.fields.toTokenAddress')}</span>
                <input
                  value={form.toTokenAddress}
                  onChange={(event) => updateFormField('toTokenAddress', event.target.value)}
                  placeholder="0x..."
                />
              </label>
              <label className="field-group">
                <span>{t('pages.okxTrade.fields.slippage')}</span>
                <input
                  value={form.slippage}
                  onChange={(event) => updateFormField('slippage', event.target.value)}
                  placeholder="0.5"
                />
              </label>
            </div>
          </div>

          <section className="action-card">
            <div className="action-copy">
              <p className="panel-label">{t('pages.okxTrade.quoteSummary')}</p>
              <div className="summary-grid">
                {quoteRows.map((item) => (
                  <div className="summary-item" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="button-row">
              <button className="ghost-button" type="button" disabled={isLoadingQuote} onClick={() => void handleQuote()}>
                {isLoadingQuote ? 'Loading...' : t('pages.okxTrade.steps.quote')}
              </button>
              <button className="primary-button" type="button" disabled={isSubmitting} onClick={() => void handleTrade()}>
                {isSubmitting ? 'Submitting...' : t('pages.okxTrade.steps.swap')}
              </button>
            </div>
            {status ? <div className={status.toLowerCase().includes('failed') || status.includes('错误') ? 'warning-box' : 'success-box'}>{status}</div> : null}
          </section>
        </section>

        <aside className="assistant-card">
          <section className="result-block">
            <div className="section-head">
              <div>
                <p className="panel-label">{t('pages.okxTrade.tokenInfo')}</p>
                <h2>{lang === 'zh-cn' ? '输入与输出代币' : 'Input & Output Tokens'}</h2>
              </div>
            </div>
            <div className="summary-grid">
              <div className="summary-item">
                <span>{lang === 'zh-cn' ? '代币1' : 'Token 1'}</span>
                <strong>
                  {fromTokenMeta
                    ? `${fromTokenMeta.symbol} / ${fromTokenMeta.decimals}${fromTokenMeta.isNative ? ` · ${lang === 'zh-cn' ? '原生币' : 'Native'}` : ''}`
                    : '--'}
                </strong>
              </div>
              <div className="summary-item">
                <span>{lang === 'zh-cn' ? '代币2' : 'Token 2'}</span>
                <strong>
                  {toTokenMeta
                    ? `${toTokenMeta.symbol} / ${toTokenMeta.decimals}${toTokenMeta.isNative ? ` · ${lang === 'zh-cn' ? '原生币' : 'Native'}` : ''}`
                    : '--'}
                </strong>
              </div>
              <div className="summary-item">
                <span>{lang === 'zh-cn' ? '授权 Spender' : 'Approve spender'}</span>
                <strong>
                  {fromTokenMeta?.isNative
                    ? lang === 'zh-cn'
                      ? '原生币模式，无需授权'
                      : 'Native mode, no approval'
                    : approvePayload?.dexContractAddress || '--'}
                </strong>
              </div>
              <div className="summary-item">
                <span>{lang === 'zh-cn' ? 'OKX 输入地址' : 'OKX fromToken address'}</span>
                <strong>{fromTokenMeta?.address || '--'}</strong>
              </div>
            </div>
          </section>

          <section className="result-block">
            <div className="section-head">
              <div>
                <p className="panel-label">{t('pages.okxTrade.executionLogs')}</p>
                <h2>{lang === 'zh-cn' ? '流程日志' : 'Execution Flow'}</h2>
              </div>
            </div>
            <div className="suggestion-list">
              {logs.length ? (
                logs.map((item) => (
                  <div className="suggestion-item" key={item.id}>
                    <span>{item.kind.toUpperCase()}</span>
                    <strong>{item.message}</strong>
                  </div>
                ))
              ) : (
                <div className="info-box">
                  {lang === 'zh-cn'
                    ? '先输入私钥、代币地址和数量，然后点击“获取报价”。'
                    : 'Enter the private key, token addresses, and amount first, then click "Get Quote".'}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}

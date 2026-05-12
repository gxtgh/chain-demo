import { useMemo, useState } from 'react'
import { getAddress, isAddress, parseEther, stringToHex, toHex } from 'viem'
import { PageHeader } from '../components/common/page-header'
import { getChainConfig } from '../config/chains'
import { useWallet } from '../contexts/wallet-context'
import { useAppRoute } from '../hooks/use-app-route'
import { addOrSwitchChain, sendInjectedTransaction } from '../services/wallet/evm-wallet'

type MessageTransferForm = {
  recipient: string
  amount: string
  message: string
}

const initialForm: MessageTransferForm = {
  recipient: '',
  amount: '0',
  message: '',
}

function getMessageByteLength(message: string) {
  return new TextEncoder().encode(message).length
}

function getApproximateIntrinsicGas(dataHex: string) {
  const bytes = dataHex.startsWith('0x') ? dataHex.slice(2).match(/.{1,2}/g) ?? [] : []
  return bytes.reduce((total, byte) => total + (byte === '00' ? 4 : 16), 21000)
}

export function CustomMessageTransferPage() {
  const { chain, lang, t } = useAppRoute()
  const chainConfig = getChainConfig(chain)
  const { account, isConnected, walletError } = useWallet()
  const [form, setForm] = useState<MessageTransferForm>(initialForm)
  const [status, setStatus] = useState('')
  const [hash, setHash] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const trimmedRecipient = form.recipient.trim()
  const trimmedMessage = form.message.trim()
  const normalizedAmount = form.amount.trim() || '0'
  const messageHex = useMemo(() => (trimmedMessage ? stringToHex(form.message) : '0x'), [form.message, trimmedMessage])
  const messageBytes = useMemo(() => getMessageByteLength(form.message), [form.message])
  const intrinsicGas = useMemo(() => getApproximateIntrinsicGas(messageHex), [messageHex])
  const explorerUrl = hash ? `${chainConfig.blockExplorerUrls[0]}/tx/${hash}` : ''

  const validationMessage = useMemo(() => {
    if (!isConnected) {
      return walletError || t('common.walletNotConnected')
    }
    if (!isAddress(trimmedRecipient)) {
      return lang === 'zh-cn' ? '请填写有效的 EVM 接收地址。' : 'Enter a valid EVM recipient address.'
    }
    if (!trimmedMessage) {
      return lang === 'zh-cn' ? '请填写要写入 input data 的消息。' : 'Enter a message for the input data field.'
    }
    try {
      const value = parseEther(normalizedAmount)
      if (value < 0n) {
        return lang === 'zh-cn' ? '转账数量不能为负数。' : 'The transfer amount cannot be negative.'
      }
    } catch {
      return lang === 'zh-cn' ? '原生币数量格式不正确。' : 'The native amount is not a valid number.'
    }
    return ''
  }, [isConnected, lang, normalizedAmount, t, trimmedMessage, trimmedRecipient, walletError])

  function updateField<Key extends keyof MessageTransferForm>(key: Key, value: MessageTransferForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
    setStatus('')
    setHash('')
  }

  async function handleSend() {
    if (!account) {
      setStatus(t('common.walletNotConnected'))
      return
    }

    if (validationMessage) {
      setStatus(validationMessage)
      return
    }

    setIsSubmitting(true)
    setStatus('')
    setHash('')

    try {
      await addOrSwitchChain(chainConfig)
      const txHash = await sendInjectedTransaction({
        from: account,
        to: getAddress(trimmedRecipient),
        value: toHex(parseEther(normalizedAmount)),
        data: messageHex,
      })
      setHash(txHash)
      setStatus(lang === 'zh-cn' ? `交易已提交：${txHash}` : `Transaction submitted: ${txHash}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send transaction.'
      setStatus(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const summaryRows = [
    {
      label: lang === 'zh-cn' ? '交易类型' : 'Transaction type',
      value: lang === 'zh-cn' ? '普通转账 + calldata' : 'Native transfer + calldata',
    },
    {
      label: lang === 'zh-cn' ? '链' : 'Chain',
      value: chainConfig.name,
    },
    {
      label: lang === 'zh-cn' ? '发送方' : 'Sender',
      value: account || '--',
    },
    {
      label: lang === 'zh-cn' ? '接收方' : 'Recipient',
      value: isAddress(trimmedRecipient) ? getAddress(trimmedRecipient) : trimmedRecipient || '--',
    },
    {
      label: lang === 'zh-cn' ? '数量' : 'Amount',
      value: `${normalizedAmount} ${chainConfig.nativeCurrency.symbol}`,
    },
    {
      label: lang === 'zh-cn' ? '消息字节数' : 'Message bytes',
      value: `${messageBytes}`,
    },
    {
      label: lang === 'zh-cn' ? '基础 Gas 估算' : 'Intrinsic gas estimate',
      value: `${intrinsicGas}`,
    },
  ]

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow={t('pages.customMessage.eyebrow')}
        title={t('pages.customMessage.title')}
        description={t('pages.customMessage.description')}
      />

      <div className="workspace-grid">
        <section className="form-card">
          <div className="section-head">
            <div>
              <p className="panel-label">{t('common.overview')}</p>
              <h2>{t('pages.customMessage.title')}</h2>
            </div>
            <div className="network-pill">{`${chainConfig.name} · ${chainConfig.nativeCurrency.symbol}`}</div>
          </div>

          <div className="info-box">{t('pages.customMessage.notices.explanation')}</div>
          <div className="warning-box" style={{ marginTop: 14 }}>
            {t('pages.customMessage.notices.amount')}
          </div>

          <div className="form-grid" style={{ marginTop: 18 }}>
            <label className="field-group">
              <span>{t('pages.customMessage.fields.recipient')}</span>
              <input
                value={form.recipient}
                onChange={(event) => updateField('recipient', event.target.value)}
                placeholder="0xCEcC80d6bF801dA28F0c79098d34A5524FE88888"
              />
            </label>

            <label className="field-group">
              <span>{`${t('pages.customMessage.fields.amount')} (${chainConfig.nativeCurrency.symbol})`}</span>
              <input
                value={form.amount}
                onChange={(event) => updateField('amount', event.target.value)}
                placeholder="0"
              />
            </label>

            <label className="field-group">
              <span>{t('pages.customMessage.fields.message')}</span>
              <textarea
                value={form.message}
                onChange={(event) => updateField('message', event.target.value)}
                placeholder={
                  lang === 'zh-cn'
                    ? '例如：Boost Millions of $ Volume Across BSC, ETH, BASE, and SOL!'
                    : 'Example: Boost Millions of $ Volume Across BSC, ETH, BASE, and SOL!'
                }
              />
            </label>
          </div>

          <section className="action-card">
            <div className="action-copy">
              <p className="panel-label">{lang === 'zh-cn' ? '发送交易' : 'Send Transaction'}</p>
              <p className="panel-copy">
                {lang === 'zh-cn'
                  ? '钱包确认后会发送 eth_sendTransaction，data 字段就是下方预览的 UTF-8 hex。'
                  : 'After wallet confirmation, eth_sendTransaction sends the UTF-8 hex preview below as the data field.'}
              </p>
            </div>
            {validationMessage ? <div className="warning-box">{validationMessage}</div> : null}
            <button
              className="primary-button"
              type="button"
              disabled={Boolean(validationMessage) || isSubmitting}
              onClick={() => void handleSend()}
            >
              {isSubmitting ? (lang === 'zh-cn' ? '提交中...' : 'Submitting...') : t('pages.customMessage.steps.send')}
            </button>
            {status ? (
              <div className={hash ? 'success-box' : 'warning-box'}>
                {status}
                {explorerUrl ? (
                  <>
                    {' '}
                    <a href={explorerUrl} target="_blank" rel="noreferrer">
                      {lang === 'zh-cn' ? '查看浏览器' : 'View explorer'}
                    </a>
                  </>
                ) : null}
              </div>
            ) : null}
          </section>
        </section>

        <aside className="assistant-card">
          <section className="result-block">
            <div className="section-head">
              <div>
                <p className="panel-label">{t('pages.customMessage.preview')}</p>
                <h2>{lang === 'zh-cn' ? '链上写入内容' : 'On-chain Payload'}</h2>
              </div>
            </div>
            <div className="summary-grid">
              {summaryRows.map((item) => (
                <div className="summary-item" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="result-block">
            <div className="template-card">
              <div className="template-head">
                <span>{lang === 'zh-cn' ? '交易 data' : 'Transaction data'}</span>
              </div>
              <pre className="template-content">{messageHex}</pre>
            </div>
            <div className="template-card">
              <div className="template-head">
                <span>{lang === 'zh-cn' ? 'UTF-8 文本' : 'UTF-8 text'}</span>
              </div>
              <pre className="template-content">{form.message || '--'}</pre>
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}

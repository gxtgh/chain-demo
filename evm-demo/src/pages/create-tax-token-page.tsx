import { useMemo, useState } from 'react'
import { PageHeader } from '../components/common/page-header'
import { AssistantPanel } from '../components/ai/assistant-panel'
import { FormProgressPanel } from '../components/forms/form-progress-panel'
import { useAppRoute } from '../hooks/use-app-route'
import { getChainConfig } from '../config/chains'
import { useWallet } from '../contexts/wallet-context'
import {
  analyzeFormProgress,
  isEvmAddress,
  isIntegerInRange,
  isNumberInRange,
  isPositiveNumber,
  type FormFieldDescriptor,
} from '../utils/form-progress'

type TaxTokenForm = {
  name: string
  symbol: string
  totalSupply: string
  decimals: string
  isSetTax: boolean
  buyTax: string
  sellTax: string
  taxFeeReceiveAddress: string
  exchange: string
  poolToken: string
}

const initialForm: TaxTokenForm = {
  name: '',
  symbol: '',
  totalSupply: '',
  decimals: '18',
  isSetTax: true,
  buyTax: '',
  sellTax: '',
  taxFeeReceiveAddress: '',
  exchange: '',
  poolToken: '',
}

export function CreateTaxTokenPage() {
  const { chain, lang, t } = useAppRoute()
  const chainConfig = getChainConfig(chain)
  const { isConnected, walletError } = useWallet()
  const [form, setForm] = useState<TaxTokenForm>(initialForm)
  const [status, setStatus] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const exchangeOptions = useMemo(() => getExchangeOptions(chain), [chain])
  const poolTokenOptions = useMemo(() => getPoolTokenOptions(chainConfig), [chainConfig])

  const fieldLabels = useMemo(
    () => ({
      name: t('pages.tax.fields.name'),
      symbol: t('pages.tax.fields.symbol'),
      totalSupply: t('pages.tax.fields.totalSupply'),
      decimals: t('pages.tax.fields.decimals'),
      isSetTax: t('pages.tax.fields.isSetTax'),
      buyTax: t('pages.tax.fields.buyTax'),
      sellTax: t('pages.tax.fields.sellTax'),
      taxFeeReceiveAddress: t('pages.tax.fields.taxFeeReceiveAddress'),
      exchange: t('pages.tax.fields.exchange'),
      poolToken: t('pages.tax.fields.poolToken'),
    }),
    [t],
  )

  const progressDescriptors = useMemo<Array<FormFieldDescriptor<TaxTokenForm>>>(
    () => [
      {
        key: 'name',
        label: fieldLabels.name,
        required: true,
        validate: (value) =>
          String(value).trim().length >= 2
            ? null
            : lang === 'zh-cn'
              ? '名称至少填写 2 个字符。'
              : 'Use at least 2 characters for the token name.',
      },
      {
        key: 'symbol',
        label: fieldLabels.symbol,
        required: true,
        validate: (value) =>
          /^[A-Z0-9]{2,10}$/.test(String(value).trim())
            ? null
            : lang === 'zh-cn'
              ? '符号建议使用 2 到 10 位大写字母或数字。'
              : 'Use 2 to 10 uppercase letters or numbers for the symbol.',
      },
      {
        key: 'totalSupply',
        label: fieldLabels.totalSupply,
        required: true,
        validate: (value) =>
          isPositiveNumber(String(value))
            ? null
            : lang === 'zh-cn'
              ? '总量必须是大于 0 的数字。'
              : 'Total supply must be a number greater than 0.',
      },
      {
        key: 'decimals',
        label: fieldLabels.decimals,
        required: true,
        validate: (value) =>
          isIntegerInRange(String(value), 0, 18)
            ? null
            : lang === 'zh-cn'
              ? '小数位需为 0 到 18 的整数。'
              : 'Decimals must be an integer between 0 and 18.',
      },
      {
        key: 'buyTax',
        label: fieldLabels.buyTax,
        required: form.isSetTax,
        validate: (value) =>
          !form.isSetTax || isNumberInRange(String(value), 0, 25)
            ? null
            : lang === 'zh-cn'
              ? '买税建议填写 0 到 25 之间的数值。'
              : 'Buy tax should be a value between 0 and 25.',
      },
      {
        key: 'sellTax',
        label: fieldLabels.sellTax,
        required: form.isSetTax,
        validate: (value) =>
          !form.isSetTax || isNumberInRange(String(value), 0, 25)
            ? null
            : lang === 'zh-cn'
              ? '卖税建议填写 0 到 25 之间的数值。'
              : 'Sell tax should be a value between 0 and 25.',
      },
      {
        key: 'taxFeeReceiveAddress',
        label: fieldLabels.taxFeeReceiveAddress,
        required: form.isSetTax,
        validate: (value) =>
          !form.isSetTax || isEvmAddress(String(value))
            ? null
            : lang === 'zh-cn'
              ? '税费接收地址必须是有效的 EVM 地址。'
              : 'The tax fee receiver must be a valid EVM address.',
      },
      {
        key: 'exchange',
        label: fieldLabels.exchange,
        required: form.isSetTax,
        validate: (value) =>
          !form.isSetTax || String(value).trim().length > 0
            ? null
            : lang === 'zh-cn'
              ? '请选择用于创建税费代币的交易所。'
              : 'Select the exchange used for the tax token.',
      },
      {
        key: 'poolToken',
        label: fieldLabels.poolToken,
        required: form.isSetTax,
        validate: (value) =>
          !form.isSetTax || String(value).trim().length > 0
            ? null
            : lang === 'zh-cn'
              ? '请选择底池币种。'
              : 'Select the pool token.',
        recommend: (value) =>
          !form.isSetTax || String(value).trim()
            ? null
            : lang === 'zh-cn'
              ? '建议默认使用链原生币或主流稳定币作为底池币种。'
              : 'Consider using the native coin or a major stablecoin as the pool token.',
      },
      {
        key: 'isSetTax',
        label: fieldLabels.isSetTax,
        trackProgress: false,
        recommend: (value) =>
          value
            ? null
            : lang === 'zh-cn'
              ? '如果关闭交易税，当前页面只会保留基础代币信息。'
              : 'If trading tax is turned off, this page will only keep the basic token information.',
      },
    ],
    [fieldLabels, form.isSetTax, lang],
  )

  const progress = useMemo(() => analyzeFormProgress(form, progressDescriptors), [form, progressDescriptors])
  const issueMap = useMemo(
    () =>
      new Map(
        [...progress.missingRequired, ...progress.invalidFields].map((issue) => [
          issue.field as keyof TaxTokenForm,
          issue.message,
        ]),
      ),
    [progress.invalidFields, progress.missingRequired],
  )
  function fieldClassName(field: keyof TaxTokenForm) {
    return issueMap.has(field) ? 'field-group field-group-error' : 'field-group'
  }

  function renderFieldHint(field: keyof TaxTokenForm) {
    const message = issueMap.get(field)
    return message ? <span className="field-help">{message}</span> : null
  }

  function applyAll(patch: Partial<TaxTokenForm>) {
    setForm((current) => ({ ...current, ...pickTaxFields(patch) }))
  }

  function applySafe(patch: Partial<TaxTokenForm>) {
    setForm((current) => {
      const next = { ...current }
      const safePatch = pickTaxFields(patch)
      const nextRecord = next as Record<string, string | boolean>
      const currentRecord = current as Record<string, string | boolean>

      for (const [key, value] of Object.entries(safePatch)) {
        if (currentRecord[key] === '' || currentRecord[key] === false) {
          nextRecord[key] = value as string | boolean
        }
      }
      return next
    })
  }

  function confirmDeployment() {
    setShowConfirmModal(false)
    setStatus(t('common.deploymentPrepared'))
  }

  const canOpenConfirm = progress.missingRequired.length === 0 && progress.invalidFields.length === 0 && isConnected
  const promptTemplate = useMemo(
    () =>
      lang === 'zh-cn'
        ? [
            `请帮我生成一个 ${chainConfig.name} 的税费代币参数：`,
            '名称：你的代币名称',
            '符号：你的代币符号',
            '总量：100000000',
            '小数位：18',
            '开启交易税：是',
            '买税：3%',
            '卖税：5%',
            '税费接收地址：0x你的地址',
            `交易所：${exchangeOptions[0]?.label ?? 'Uniswap V2'}`,
            `底池币种：${poolTokenOptions[0]?.label ?? chainConfig.nativeCurrency.symbol}`,
          ].join('\n')
        : [
            `Help me prepare a tax token on ${chainConfig.name}:`,
            'Name: Your token name',
            'Symbol: YOUR',
            'Total supply: 100000000',
            'Decimals: 18',
            'Enable trading tax: yes',
            'Buy tax: 3%',
            'Sell tax: 5%',
            'Tax fee receiver: 0xYourAddress',
            `Exchange: ${exchangeOptions[0]?.label ?? 'Uniswap V2'}`,
            `Pool token: ${poolTokenOptions[0]?.label ?? chainConfig.nativeCurrency.symbol}`,
          ].join('\n'),
    [chainConfig.name, chainConfig.nativeCurrency.symbol, exchangeOptions, lang, poolTokenOptions],
  )

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow={t('pages.tax.eyebrow')}
        title={t('pages.tax.title')}
        description={t('pages.tax.description')}
      />

      <div className="workspace-grid">
        <section className="form-card">
          <div className="section-head">
            <div>
              <p className="panel-label">{t('common.overview')}</p>
              <h2>{t('pages.tax.title')}</h2>
            </div>
            <div className="network-pill">{`${chainConfig.name} · ${chainConfig.nativeCurrency.symbol}`}</div>
          </div>

          <div className="form-grid two-columns">
            <label className={fieldClassName('name')}>
              <span>{t('pages.tax.fields.name')}</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              {renderFieldHint('name')}
            </label>
            <label className={fieldClassName('symbol')}>
              <span>{t('pages.tax.fields.symbol')}</span>
              <input value={form.symbol} onChange={(event) => setForm((current) => ({ ...current, symbol: event.target.value.toUpperCase() }))} />
              {renderFieldHint('symbol')}
            </label>
            <label className={fieldClassName('totalSupply')}>
              <span>{t('pages.tax.fields.totalSupply')}</span>
              <input value={form.totalSupply} onChange={(event) => setForm((current) => ({ ...current, totalSupply: event.target.value }))} />
              {renderFieldHint('totalSupply')}
            </label>
            <label className={fieldClassName('decimals')}>
              <span>{t('pages.tax.fields.decimals')}</span>
              <input value={form.decimals} onChange={(event) => setForm((current) => ({ ...current, decimals: event.target.value }))} />
              {renderFieldHint('decimals')}
            </label>
          </div>

          <div className="toggle-grid toggle-grid-single">
            <label className="toggle-card">
              <span>{t('pages.tax.fields.isSetTax')}</span>
              <input
                type="checkbox"
                checked={form.isSetTax}
                onChange={(event) => setForm((current) => ({ ...current, isSetTax: event.target.checked }))}
              />
            </label>
          </div>

          {form.isSetTax ? (
            <div className="form-grid two-columns section-split">
              <label className={fieldClassName('buyTax')}>
                <span>{t('pages.tax.fields.buyTax')}</span>
                <input value={form.buyTax} onChange={(event) => setForm((current) => ({ ...current, buyTax: event.target.value }))} />
                {renderFieldHint('buyTax')}
              </label>
              <label className={fieldClassName('sellTax')}>
                <span>{t('pages.tax.fields.sellTax')}</span>
                <input value={form.sellTax} onChange={(event) => setForm((current) => ({ ...current, sellTax: event.target.value }))} />
                {renderFieldHint('sellTax')}
              </label>
              <label className={fieldClassName('taxFeeReceiveAddress')}>
                <span>{t('pages.tax.fields.taxFeeReceiveAddress')}</span>
                <input
                  value={form.taxFeeReceiveAddress}
                  placeholder="0x..."
                  onChange={(event) => setForm((current) => ({ ...current, taxFeeReceiveAddress: event.target.value }))}
                />
                {renderFieldHint('taxFeeReceiveAddress')}
              </label>
              <label className={fieldClassName('exchange')}>
                <span>{t('pages.tax.fields.exchange')}</span>
                <select
                  value={form.exchange}
                  onChange={(event) => setForm((current) => ({ ...current, exchange: event.target.value }))}
                >
                  <option value="">{lang === 'zh-cn' ? '请选择交易所' : 'Select exchange'}</option>
                  {exchangeOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {renderFieldHint('exchange')}
              </label>
              <label className={fieldClassName('poolToken')}>
                <span>{t('pages.tax.fields.poolToken')}</span>
                <select
                  value={form.poolToken}
                  onChange={(event) => setForm((current) => ({ ...current, poolToken: event.target.value }))}
                >
                  <option value="">{lang === 'zh-cn' ? '请选择底池币种' : 'Select pool token'}</option>
                  {poolTokenOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {renderFieldHint('poolToken')}
              </label>
            </div>
          ) : null}

          <FormProgressPanel
            title={lang === 'zh-cn' ? '填写进度' : 'Form Progress'}
            subtitle={
              lang === 'zh-cn'
                ? '这里会提示当前页面还缺哪些关键配置、哪些格式不正确，以及交易税设置是否已经完整。'
                : 'Track missing configuration, invalid values, and whether the tax setup is complete.'
            }
            progress={progress}
            completionLabel={lang === 'zh-cn' ? '当前完成度' : 'Completion'}
            requiredStatusLabel={lang === 'zh-cn' ? '必填完成' : 'Required fields'}
            missingTitle={lang === 'zh-cn' ? '待填写字段' : 'Fields to complete'}
            invalidTitle={lang === 'zh-cn' ? '格式待修正' : 'Fields to fix'}
            recommendationTitle={lang === 'zh-cn' ? '建议说明' : 'Recommendations'}
            allGoodLabel={
              lang === 'zh-cn'
                ? '当前页面字段已经填写完整，格式也通过了基础校验。'
                : 'The form is complete and passed the basic validation checks.'
            }
            expandLabel={lang === 'zh-cn' ? '展开' : 'Expand'}
            collapseLabel={lang === 'zh-cn' ? '收起' : 'Collapse'}
          />

          <section className="action-card">
            <div className="action-copy">
              <p className="panel-label">{lang === 'zh-cn' ? '确认创建' : 'Confirm Creation'}</p>
              <p className="panel-copy">
                {lang === 'zh-cn'
                  ? '税费代币页会在弹窗里展示当前基础参数和税费设置，由你手动确认后再继续。'
                  : 'The tax token page now shows the core parameters and tax setup in a confirmation modal before continuing.'}
              </p>
            </div>
            {!isConnected ? <div className="warning-box">{walletError || t('common.walletNotConnected')}</div> : null}
            <button
              className="primary-button"
              type="button"
              disabled={!canOpenConfirm}
              onClick={() => setShowConfirmModal(true)}
            >
              {lang === 'zh-cn' ? '确认税费参数' : 'Confirm Tax Parameters'}
            </button>
          </section>

          {status ? <div className="success-box">{status}</div> : null}
        </section>

        <AssistantPanel<TaxTokenForm>
          chain={chain}
          lang={lang}
          kind="tax"
          title={t('ai.title')}
          description={t('ai.description')}
          placeholder={t('pages.tax.aiPlaceholder')}
          promptTemplate={promptTemplate}
          onApplyAll={applyAll}
          onApplySafe={applySafe}
        />
      </div>

      {showConfirmModal ? (
        <div className="modal-overlay" role="presentation" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="panel-label">{lang === 'zh-cn' ? '最终确认' : 'Final Confirmation'}</p>
                <h3>{lang === 'zh-cn' ? '请确认税费代币参数' : 'Review Tax Token Parameters'}</h3>
              </div>
              <button className="ghost-button" type="button" onClick={() => setShowConfirmModal(false)}>
                {lang === 'zh-cn' ? '关闭' : 'Close'}
              </button>
            </div>

            <p className="panel-copy">
              {lang === 'zh-cn'
                ? `你正在 ${chainConfig.name} 上准备一个税费代币，当前会使用基础信息、买卖税、税费接收地址、交易所和底池币种。`
                : `You are preparing a tax token on ${chainConfig.name}. The current setup includes core token info, buy/sell tax, fee receiver, exchange, and pool token.`}
            </p>

            <div className="summary-grid">
              {getTaxSummaryFields(form).map(([key, value]) => (
                <div className="summary-item" key={key}>
                  <span>{fieldLabels[key as keyof TaxTokenForm]}</span>
                  <strong>{String(value || '--')}</strong>
                </div>
              ))}
            </div>

            <div className="warning-box">
              {lang === 'zh-cn'
                ? '这一步仍是案例演示，点击继续只会记录“已准备部署”的状态，不会真的发起链上部署。'
                : 'This is still a case-demo flow. Confirming here only marks the deployment as prepared and will not execute a real on-chain deployment.'}
            </div>

            <div className="button-row">
              <button className="ghost-button" type="button" onClick={() => setShowConfirmModal(false)}>
                {lang === 'zh-cn' ? '返回修改' : 'Go Back'}
              </button>
              <button className="primary-button" type="button" onClick={confirmDeployment}>
                {lang === 'zh-cn' ? '我已确认' : 'I Confirm'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function getExchangeOptions(chain: string) {
  if (chain === 'bsc') {
    return [{ value: 'pancakeswap', label: 'PancakeSwap V2' }]
  }

  if (chain === 'base') {
    return [{ value: 'aerodrome', label: 'Aerodrome' }]
  }

  return [{ value: 'uniswap', label: 'Uniswap V2' }]
}

function getPoolTokenOptions(chainConfig: ReturnType<typeof getChainConfig>) {
  return [
    { value: 'native', label: chainConfig.nativeCurrency.symbol },
    { value: 'usdt', label: 'USDT' },
    { value: 'usdc', label: 'USDC' },
  ]
}

function pickTaxFields(patch: Partial<TaxTokenForm> & Record<string, string | boolean | undefined>) {
  const next: Partial<TaxTokenForm> = {}

  if (typeof patch.name === 'string') next.name = patch.name
  if (typeof patch.symbol === 'string') next.symbol = patch.symbol
  if (typeof patch.totalSupply === 'string') next.totalSupply = patch.totalSupply
  if (typeof patch.decimals === 'string') next.decimals = patch.decimals
  if (typeof patch.isSetTax === 'boolean') next.isSetTax = patch.isSetTax
  if (typeof patch.buyTax === 'string') next.buyTax = patch.buyTax
  if (typeof patch.sellTax === 'string') next.sellTax = patch.sellTax
  if (typeof patch.taxFeeReceiveAddress === 'string') next.taxFeeReceiveAddress = patch.taxFeeReceiveAddress
  if (typeof patch.exchange === 'string') next.exchange = patch.exchange
  if (typeof patch.poolToken === 'string') next.poolToken = patch.poolToken

  if (!next.taxFeeReceiveAddress && typeof patch.marketingWallet === 'string') {
    next.taxFeeReceiveAddress = patch.marketingWallet
  }

  return next
}

function getTaxSummaryFields(form: TaxTokenForm) {
  const fields: Array<[string, string | boolean]> = [
    ['name', form.name],
    ['symbol', form.symbol],
    ['totalSupply', form.totalSupply],
    ['decimals', form.decimals],
    ['isSetTax', form.isSetTax ? 'true' : 'false'],
  ]

  if (form.isSetTax) {
    fields.push(
      ['buyTax', form.buyTax],
      ['sellTax', form.sellTax],
      ['taxFeeReceiveAddress', form.taxFeeReceiveAddress],
      ['exchange', form.exchange],
      ['poolToken', form.poolToken],
    )
  }

  return fields
}

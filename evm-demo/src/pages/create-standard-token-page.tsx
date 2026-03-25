import { useMemo, useState } from 'react'
import { PageHeader } from '../components/common/page-header'
import { AssistantPanel } from '../components/ai/assistant-panel'
import { FormProgressPanel } from '../components/forms/form-progress-panel'
import { useAppRoute } from '../hooks/use-app-route'
import { getChainConfig } from '../config/chains'
import { useWallet } from '../contexts/wallet-context'
import {
  analyzeFormProgress,
  isIntegerInRange,
  isPositiveNumber,
  type FormFieldDescriptor,
} from '../utils/form-progress'

type StandardTokenForm = {
  name: string
  symbol: string
  totalSupply: string
  decimals: string
}

const initialForm: StandardTokenForm = {
  name: '',
  symbol: '',
  totalSupply: '',
  decimals: '18',
}

export function CreateStandardTokenPage() {
  const { chain, lang, t } = useAppRoute()
  const chainConfig = getChainConfig(chain)
  const { isConnected, walletError } = useWallet()
  const [form, setForm] = useState<StandardTokenForm>(initialForm)
  const [status, setStatus] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const requiredFields = useMemo(() => ['name', 'symbol', 'totalSupply', 'decimals'] as Array<keyof StandardTokenForm>, [])

  const fieldLabels = useMemo(
    () => ({
      name: t('pages.standard.fields.name'),
      symbol: t('pages.standard.fields.symbol'),
      totalSupply: t('pages.standard.fields.totalSupply'),
      decimals: t('pages.standard.fields.decimals'),
    }),
    [t],
  )

  const progressDescriptors = useMemo<Array<FormFieldDescriptor<StandardTokenForm>>>(
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
    ],
    [fieldLabels, lang],
  )

  const progress = useMemo(() => analyzeFormProgress(form, progressDescriptors), [form, progressDescriptors])
  const issueMap = useMemo(
    () =>
      new Map(
        [...progress.missingRequired, ...progress.invalidFields].map((issue) => [
          issue.field as keyof StandardTokenForm,
          issue.message,
        ]),
      ),
    [progress.invalidFields, progress.missingRequired],
  )
  function fieldClassName(field: keyof StandardTokenForm) {
    return issueMap.has(field) ? 'field-group field-group-error' : 'field-group'
  }

  function renderFieldHint(field: keyof StandardTokenForm) {
    const message = issueMap.get(field)
    return message ? <span className="field-help">{message}</span> : null
  }

  function applyAll(patch: Partial<StandardTokenForm>) {
    setForm((current) => ({ ...current, ...pickStandardFields(patch) }))
  }

  function applySafe(patch: Partial<StandardTokenForm>) {
    setForm((current) => {
      const next = { ...current }
      const safePatch = pickStandardFields(patch)
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
            `请帮我生成一个 ${chainConfig.name} 的标准代币参数：`,
            '名称：你的代币名称',
            '符号：你的代币符号',
            '总量：100000000',
            '小数位：18',
          ].join('\n')
        : [
            `Help me prepare a standard token on ${chainConfig.name}:`,
            'Name: Your token name',
            'Symbol: YOUR',
            'Total supply: 100000000',
            'Decimals: 18',
          ].join('\n'),
    [chainConfig.name, lang],
  )

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow={t('pages.standard.eyebrow')}
        title={t('pages.standard.title')}
        description={t('pages.standard.description')}
      />

      <div className="workspace-grid">
        <section className="form-card">
          <div className="section-head">
            <div>
              <p className="panel-label">{t('common.overview')}</p>
              <h2>{t('pages.standard.title')}</h2>
            </div>
            <div className="network-pill">{`${chainConfig.name} · ${chainConfig.nativeCurrency.symbol}`}</div>
          </div>

          <div className="form-grid two-columns">
            <label className={fieldClassName('name')}>
              <span>{t('pages.standard.fields.name')}</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              {renderFieldHint('name')}
            </label>
            <label className={fieldClassName('symbol')}>
              <span>{t('pages.standard.fields.symbol')}</span>
              <input value={form.symbol} onChange={(event) => setForm((current) => ({ ...current, symbol: event.target.value.toUpperCase() }))} />
              {renderFieldHint('symbol')}
            </label>
            <label className={fieldClassName('totalSupply')}>
              <span>{t('pages.standard.fields.totalSupply')}</span>
              <input value={form.totalSupply} onChange={(event) => setForm((current) => ({ ...current, totalSupply: event.target.value }))} />
              {renderFieldHint('totalSupply')}
            </label>
            <label className={fieldClassName('decimals')}>
              <span>{t('pages.standard.fields.decimals')}</span>
              <input value={form.decimals} onChange={(event) => setForm((current) => ({ ...current, decimals: event.target.value }))} />
              {renderFieldHint('decimals')}
            </label>
          </div>

          <FormProgressPanel
            title={lang === 'zh-cn' ? '填写进度' : 'Form Progress'}
            subtitle={
              lang === 'zh-cn'
                ? '这里会提示当前页面还缺哪些基础字段，以及哪些格式需要修正。'
                : 'Track missing fields, validation errors, and helpful additions before deployment review.'
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
                  ? '标准代币页现在只保留基础入参。点击按钮后会弹出确认说明，由你决定是否继续。'
                  : 'This standard token page now keeps only the core inputs. Clicking the button opens a final confirmation modal.'}
              </p>
            </div>
            {!isConnected ? <div className="warning-box">{walletError || t('common.walletNotConnected')}</div> : null}
            <button
              className="primary-button"
              type="button"
              disabled={!canOpenConfirm}
              onClick={() => setShowConfirmModal(true)}
            >
              {lang === 'zh-cn' ? '确认基础参数' : 'Confirm Basic Parameters'}
            </button>
          </section>

          {status ? <div className="success-box">{status}</div> : null}
        </section>

        <AssistantPanel<StandardTokenForm>
          chain={chain}
          lang={lang}
          kind="standard"
          title={t('ai.title')}
          description={t('ai.description')}
          placeholder={t('pages.standard.aiPlaceholder')}
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
                <h3>{lang === 'zh-cn' ? '请确认标准代币基础参数' : 'Review Standard Token Parameters'}</h3>
              </div>
              <button className="ghost-button" type="button" onClick={() => setShowConfirmModal(false)}>
                {lang === 'zh-cn' ? '关闭' : 'Close'}
              </button>
            </div>

            <p className="panel-copy">
              {lang === 'zh-cn'
                ? `你正在 ${chainConfig.name} 上准备一个标准代币，当前只会使用名称、符号、总量和小数位这四个字段。`
                : `You are preparing a standard token on ${chainConfig.name}. Only name, symbol, total supply, and decimals will be used.`}
            </p>

            <div className="summary-grid">
              {requiredFields.map((field) => (
                <div className="summary-item" key={String(field)}>
                  <span>{fieldLabels[field]}</span>
                  <strong>{String(form[field] || '--')}</strong>
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

function pickStandardFields(patch: Partial<StandardTokenForm>) {
  const next: Partial<StandardTokenForm> = {}
  const allowedKeys: Array<keyof StandardTokenForm> = ['name', 'symbol', 'totalSupply', 'decimals']

  for (const key of allowedKeys) {
    if (key in patch) {
      next[key] = patch[key]
    }
  }

  return next
}

import { useState } from 'react'
import type { SupportedChainKey, SupportedLang } from '../../config/chains'
import {
  assistForm,
  explainField,
  getAssistantRuntimeInfo,
  type AssistantResult,
  type PageKind,
} from '../../services/ai/frontend-assistant'

type AssistantPanelProps<T extends Record<string, string | boolean>> = {
  chain: SupportedChainKey
  lang: SupportedLang
  kind: PageKind
  title: string
  description: string
  placeholder: string
  promptTemplate: string
  onApplyAll: (fields: Partial<T>) => void
  onApplySafe: (fields: Partial<T>) => void
}

export function AssistantPanel<T extends Record<string, string | boolean>>({
  chain,
  lang,
  kind,
  title,
  description,
  placeholder,
  promptTemplate,
  onApplyAll,
  onApplySafe,
}: AssistantPanelProps<T>) {
  const [draft, setDraft] = useState('')
  const [fieldName, setFieldName] = useState('')
  const [result, setResult] = useState<AssistantResult | null>(null)
  const [fieldExplanation, setFieldExplanation] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [templateMessage, setTemplateMessage] = useState('')
  const runtimeInfo = getAssistantRuntimeInfo()

  async function handleGenerate() {
    setIsBusy(true)
    setErrorMessage('')
    try {
      const nextResult = await assistForm({ draft, lang, chain, kind })
      setResult(nextResult)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : lang === 'zh-cn'
            ? 'AI 请求失败。'
            : 'AI request failed.',
      )
    } finally {
      setIsBusy(false)
    }
  }

  async function handleExplain() {
    if (!fieldName.trim()) {
      return
    }
    setErrorMessage('')
    try {
      setFieldExplanation(await explainField(fieldName.trim(), kind, lang))
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : lang === 'zh-cn'
            ? '字段解释失败。'
            : 'Field explanation failed.',
      )
    }
  }

  async function handleCopyTemplate() {
    try {
      await navigator.clipboard.writeText(promptTemplate)
      setTemplateMessage(lang === 'zh-cn' ? '模板已复制，你可以粘贴后再修改。' : 'Template copied. You can paste and edit it.')
    } catch {
      setTemplateMessage(lang === 'zh-cn' ? '复制失败，请手动复制模板内容。' : 'Copy failed. Please copy the template manually.')
    }
  }

  function handleUseTemplate() {
    setDraft(promptTemplate)
    setTemplateMessage(lang === 'zh-cn' ? '模板已填入输入框，可直接修改。' : 'Template inserted into the prompt box. You can edit it directly.')
  }

  return (
    <aside className="assistant-card">
      <div className="panel-label">{title}</div>
      <p className="panel-copy">{description}</p>
      <div className="runtime-badge">
        {lang === 'zh-cn' ? '当前模式' : 'Current mode'}: {runtimeInfo.label}
      </div>

      <label className="field-group">
        <span>Prompt</span>
        <textarea
          rows={7}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
        />
      </label>

      <div className="template-card">
        <div className="template-head">
          <span>{lang === 'zh-cn' ? '快捷模板' : 'Quick Template'}</span>
          <div className="button-row">
            <button className="ghost-button" type="button" onClick={() => void handleCopyTemplate()}>
              {lang === 'zh-cn' ? '复制模板' : 'Copy Template'}
            </button>
            <button className="ghost-button" type="button" onClick={handleUseTemplate}>
              {lang === 'zh-cn' ? '填入模板' : 'Use Template'}
            </button>
          </div>
        </div>
        <pre className="template-content">{promptTemplate}</pre>
      </div>

      <div className="button-row">
        <button className="primary-button" type="button" onClick={() => void handleGenerate()} disabled={isBusy}>
          {isBusy ? '...' : lang === 'zh-cn' ? '生成 AI 建议' : 'Generate AI Suggestions'}
        </button>
      </div>

      <label className="field-group">
        <span>{lang === 'zh-cn' ? '解释某个字段' : 'Explain a field'}</span>
        <div className="inline-row">
          <input
            value={fieldName}
            onChange={(event) => setFieldName(event.target.value)}
            placeholder={lang === 'zh-cn' ? '例如：buyTax' : 'Example: buyTax'}
          />
          <button className="ghost-button" type="button" onClick={() => void handleExplain()}>
            {lang === 'zh-cn' ? '解释' : 'Explain'}
          </button>
        </div>
      </label>

      {fieldExplanation ? <div className="info-box">{fieldExplanation}</div> : null}
      {templateMessage ? <div className="info-box">{templateMessage}</div> : null}
      {errorMessage ? <div className="warning-box">{errorMessage}</div> : null}

      {result ? (
        <>
          <div className="result-block">
            <p className="panel-label">{lang === 'zh-cn' ? '摘要' : 'Summary'}</p>
            <p className="panel-copy">{result.summary}</p>
          </div>

          {Object.keys(result.fields).length ? (
            <div className="result-block">
              <p className="panel-label">{lang === 'zh-cn' ? '识别字段' : 'Detected fields'}</p>
              <div className="suggestion-list">
                {Object.entries(result.fields).map(([key, value]) => (
                  <div className="suggestion-item" key={key}>
                    <span>{key}</span>
                    <strong>{String(value)}</strong>
                  </div>
                ))}
              </div>
              <div className="button-row">
                <button className="primary-button" type="button" onClick={() => onApplyAll(result.fields as Partial<T>)}>
                  {lang === 'zh-cn' ? '应用全部建议' : 'Apply Suggestions'}
                </button>
                <button className="ghost-button" type="button" onClick={() => onApplySafe(result.fields as Partial<T>)}>
                  {lang === 'zh-cn' ? '仅补全空字段' : 'Only Fill Empty Fields'}
                </button>
              </div>
            </div>
          ) : null}

          {result.warnings.length ? (
            <div className="result-block">
              <p className="panel-label">{lang === 'zh-cn' ? '风险提示' : 'Warnings'}</p>
              <ul className="flat-list">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.missingFields.length ? (
            <div className="result-block">
              <p className="panel-label">{lang === 'zh-cn' ? '缺失项' : 'Missing fields'}</p>
              <ul className="flat-list">
                {result.missingFields.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="assistant-note">
        {lang === 'zh-cn'
          ? '当前案例版不会自动签名或自动部署，只做辅助整理和复核。'
          : 'This case version never signs or deploys automatically. It only assists with form filling and review.'}
      </div>
    </aside>
  )
}

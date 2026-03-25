import type { SupportedChainKey, SupportedLang } from '../../config/chains'

export type PageKind = 'standard' | 'tax'

export type AssistantResult = {
  fields: Record<string, string | boolean>
  warnings: string[]
  missingFields: string[]
  summary: string
}

type AssistInput = {
  draft: string
  lang: SupportedLang
  chain: SupportedChainKey
  kind: PageKind
}

type AssistantRuntimeInfo = {
  mode: 'openai-compatible' | 'custom' | 'local-fallback'
  label: string
}

type CustomApiResponse = AssistantResult | { text: string }

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>
    }
  }>
}

const fieldHelp: Record<PageKind, Record<string, { 'en-us': string; 'zh-cn': string }>> = {
  standard: {
    name: {
      'en-us': 'The token name is the human-readable display name shown in wallets and explorers.',
      'zh-cn': '代币名称是钱包和区块浏览器里展示给用户看的可读名称。',
    },
    symbol: {
      'en-us': 'The symbol is the ticker-like short label, usually 3 to 6 uppercase characters.',
      'zh-cn': '代币符号是类似 ticker 的短标签，通常为 3 到 6 位大写字符。',
    },
    mintable: {
      'en-us': 'Mint permission decides whether more supply can be created after deployment.',
      'zh-cn': '增发权限决定部署后是否还能继续增发代币。',
    },
  },
  tax: {
    buyTax: {
      'en-us': 'Buy tax is charged when users purchase the token from the liquidity pool or router path.',
      'zh-cn': '买税是在用户从流动性池或路由路径买入代币时收取的费用。',
    },
    sellTax: {
      'en-us': 'Sell tax is charged when users sell the token back into liquidity.',
      'zh-cn': '卖税是在用户把代币卖回流动性池时收取的费用。',
    },
    taxFeeReceiveAddress: {
      'en-us': 'The tax fee receiver collects the configured trading fees and should always be reviewed carefully.',
      'zh-cn': '税费接收地址用于接收配置好的交易税收益，属于必须认真确认的字段。',
    },
  },
}

export async function assistForm(input: AssistInput) {
  const fallback = await assistFormLocally(input)
  const runtime = getAssistantRuntimeInfo()

  if (runtime.mode === 'local-fallback') {
    return fallback
  }

  try {
    const apiResult =
      runtime.mode === 'custom'
        ? await requestCustomAssistant('assist_form', input)
        : await requestOpenAICompatibleAssistant(input)

    if (isAssistantResult(apiResult)) {
      return mergeAssistantResults(normalizeAssistantResult(apiResult), fallback)
    }

    return fallback
  } catch (error) {
    return {
      ...fallback,
      warnings: [
        ...fallback.warnings,
        input.lang === 'zh-cn'
          ? 'AI API 调用失败，已自动回退到本地规则建议。'
          : 'AI API request failed, so the assistant fell back to local rules.',
        formatAssistantError(error, input.lang),
      ],
    }
  }
}

export async function explainField(
  field: string,
  kind: PageKind,
  lang: SupportedLang,
) {
  const runtime = getAssistantRuntimeInfo()

  if (runtime.mode !== 'local-fallback') {
    try {
      const apiResult =
        runtime.mode === 'custom'
          ? await requestCustomAssistant('explain_field', { field, kind, lang })
          : await requestOpenAICompatibleExplain(field, kind, lang)

      if (typeof apiResult === 'string' && apiResult.trim()) {
        return apiResult.trim()
      }

      if (
        apiResult &&
        typeof apiResult === 'object' &&
        'text' in apiResult &&
        typeof apiResult.text === 'string' &&
        apiResult.text.trim()
      ) {
        return apiResult.text.trim()
      }
    } catch {
      return explainFieldLocally(field, kind, lang)
    }
  }

  return explainFieldLocally(field, kind, lang)
}

export function getAssistantRuntimeInfo(): AssistantRuntimeInfo {
  const kind = readEnv('VITE_AI_API_KIND')
  const apiUrl = readEnv('VITE_AI_API_URL')
  const apiKey = readEnv('VITE_AI_API_KEY')
  const model = readEnv('VITE_AI_MODEL')

  if (kind === 'custom' && apiUrl) {
    return {
      mode: 'custom',
      label: 'Custom API',
    }
  }

  if ((kind === 'openai-compatible' || (!kind && apiUrl && model)) && apiUrl && model && apiKey) {
    return {
      mode: 'openai-compatible',
      label: `OpenAI-compatible API · ${model}`,
    }
  }

  return {
    mode: 'local-fallback',
    label: 'Local fallback rules',
  }
}

async function assistFormLocally(input: AssistInput) {
  const text = input.draft.toLowerCase()
  const fields: Record<string, string | boolean> = {}
  const warnings: string[] = []
  const missingFields: string[] = []

  const detectedChain = detectChain(text) ?? input.chain
  const totalSupply = extractSupply(text)
  const decimals = extractDecimals(text)
  const symbol = extractSymbol(input.draft)
  const name = extractName(input.draft)

  if (name) fields.name = name
  if (symbol) fields.symbol = symbol
  if (totalSupply) fields.totalSupply = totalSupply
  if (decimals) fields.decimals = decimals

  if (text.includes('no mint') || text.includes('without mint') || text.includes('不保留增发')) {
    fields.mintable = false
  }
  if (text.includes('burn')) {
    fields.burnable = true
  }
  if (text.includes('pause') || text.includes('暂停')) {
    fields.pausable = true
  }

  if (input.kind === 'tax') {
    const buyTax = extractPercent(text, ['buy tax', '买税'])
    const sellTax = extractPercent(text, ['sell tax', '卖税'])
    const wallet = extractWallet(input.draft)
    const exchange = extractExchange(text)
    const poolToken = extractPoolToken(text)

    if (buyTax) fields.buyTax = buyTax
    if (sellTax) fields.sellTax = sellTax
    if (wallet) fields.taxFeeReceiveAddress = wallet
    if (exchange) fields.exchange = exchange
    if (poolToken) fields.poolToken = poolToken

    const totalTax = Number(buyTax ?? 0) + Number(sellTax ?? 0)
    if (totalTax > 12) {
      warnings.push(input.lang === 'zh-cn' ? '总税率偏高，建议再次确认用户体验和合规风险。' : 'The combined tax rate is high. Please review UX and compliance risk.')
    }
    if (!wallet) {
      missingFields.push(input.lang === 'zh-cn' ? '税费接收地址' : 'tax fee receiver')
    }
  } else {
    if (text.includes('no mint') || text.includes('without mint') || text.includes('不保留增发')) {
      warnings.push(
        input.lang === 'zh-cn'
          ? '当前标准代币案例页只保留基础字段，权限类配置不会自动回填到表单。'
          : 'This standard token case only keeps basic fields, so permission settings are not filled into the form.',
      )
    }
  }

  if (!name) missingFields.push(input.lang === 'zh-cn' ? '代币名称' : 'token name')
  if (!symbol) missingFields.push(input.lang === 'zh-cn' ? '代币符号' : 'token symbol')
  if (!totalSupply) missingFields.push(input.lang === 'zh-cn' ? '总量' : 'total supply')

  if (input.kind === 'standard' && decimals === '') {
    warnings.push(input.lang === 'zh-cn' ? '没有识别到小数位，建议使用 18 作为常规默认值。' : 'No decimals value was detected. Consider using 18 as the default choice.')
  }

  return {
    fields,
    warnings,
    missingFields,
    summary:
      input.lang === 'zh-cn'
        ? `AI 已根据你的描述整理出一份 ${detectedChain.toUpperCase()} ${input.kind === 'standard' ? '标准代币' : '税费代币'} 参数建议。`
        : `AI prepared a ${input.kind === 'standard' ? 'standard token' : 'tax token'} suggestion for ${detectedChain.toUpperCase()}.`,
  } satisfies AssistantResult
}

function explainFieldLocally(field: string, kind: PageKind, lang: SupportedLang) {
  const help = fieldHelp[kind][field]
  if (!help) {
    return lang === 'zh-cn'
      ? '这个字段用于控制部署参数，建议在最终提交前再次人工确认。'
      : 'This field affects deployment parameters and should be manually reviewed before the final submission.'
  }
  return help[lang]
}

async function requestCustomAssistant(
  task: 'assist_form' | 'explain_field',
  payload: unknown,
) {
  const apiUrl = readEnv('VITE_AI_API_URL')

  if (!apiUrl) {
    throw new Error('Missing VITE_AI_API_URL for custom assistant mode.')
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildOptionalAuthHeaders(),
    } as Record<string, string>,
    body: JSON.stringify({
      task,
      payload,
    }),
  })

  if (!response.ok) {
    throw new Error(`Custom assistant API failed with status ${response.status}.`)
  }

  return (await response.json()) as CustomApiResponse
}

async function requestOpenAICompatibleAssistant(input: AssistInput) {
  const content = await callOpenAICompatibleApi([
    {
      role: 'system',
      content:
        input.kind === 'tax'
          ? 'You are an AI form assistant for an EVM tax token page. Always return strict JSON with keys: fields, warnings, missingFields, summary. fields must be a flat object with string or boolean values only. For tax token pages, use only these exact field keys when applicable: name, symbol, totalSupply, decimals, isSetTax, buyTax, sellTax, taxFeeReceiveAddress, exchange, poolToken. Do not use aliases like pairToken, taxReceiver, marketingWallet, dex, router, or pool. exchange must be one of: pancakeswap, uniswap, aerodrome. poolToken must be one of: native, usdt, usdc. Never include deployment execution steps. Fill only values inferable from the prompt.'
          : 'You are an AI form assistant for an EVM standard token page. Always return strict JSON with keys: fields, warnings, missingFields, summary. fields must be a flat object with string or boolean values only. For standard token pages, use only these exact field keys when applicable: name, symbol, totalSupply, decimals. Never include deployment execution steps. Fill only values inferable from the prompt.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        task: 'assist_form',
        pageKind: input.kind,
        lang: input.lang,
        chain: input.chain,
        userPrompt: input.draft,
      }),
    },
  ], 'json')

  const parsed = parseJsonContent(content)
  return parsed
}

async function requestOpenAICompatibleExplain(
  field: string,
  kind: PageKind,
  lang: SupportedLang,
) {
  const content = await callOpenAICompatibleApi([
    {
      role: 'system',
      content:
        'You are an AI field explainer for an EVM token launch form. Reply with plain text only, maximum 3 short sentences, no markdown bullets.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        task: 'explain_field',
        pageKind: kind,
        lang,
        field,
      }),
    },
  ], 'text')

  return content
}

async function callOpenAICompatibleApi(
  messages: Array<{ role: 'system' | 'user'; content: string }>,
  format: 'json' | 'text',
) {
  const apiUrl = readEnv('VITE_AI_API_URL')
  const apiKey = readEnv('VITE_AI_API_KEY')
  const model = readEnv('VITE_AI_MODEL')

  if (!apiUrl || !apiKey || !model) {
    throw new Error('Missing OpenAI-compatible API config.')
  }

  const response = await fetch(joinPath(apiUrl, 'chat/completions'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      ...(
        format === 'json' && !isKimiThinkingModel(model)
          ? { response_format: { type: 'json_object' } }
          : {}
      ),
      messages,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI-compatible API failed with status ${response.status}.`)
  }

  const data = (await response.json()) as OpenAIChatResponse
  const content = extractChatContent(data)

  if (!content) {
    throw new Error('Empty content from OpenAI-compatible API.')
  }

  return content
}

function extractChatContent(response: OpenAIChatResponse) {
  const content = response.choices?.[0]?.message?.content

  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => item.text ?? '')
      .join('')
      .trim()
  }

  return ''
}

function normalizeAssistantResult(result: AssistantResult): AssistantResult {
  const normalizedFields = normalizeAssistantFields(result.fields ?? {})

  return {
    fields: normalizedFields,
    warnings: Array.isArray(result.warnings) ? result.warnings.filter(isNonEmptyString) : [],
    missingFields: Array.isArray(result.missingFields)
      ? result.missingFields.filter(isNonEmptyString)
      : [],
    summary: isNonEmptyString(result.summary) ? result.summary : '',
  }
}

function normalizeAssistantFields(fields: Record<string, unknown>) {
  const next: Record<string, string | boolean> = {}

  for (const [rawKey, rawValue] of Object.entries(fields)) {
    if (typeof rawValue !== 'string' && typeof rawValue !== 'boolean') {
      continue
    }

    const key = normalizeAssistantFieldKey(rawKey)
    const value = normalizeAssistantFieldValue(key, rawValue)

    if (key && (typeof value === 'string' || typeof value === 'boolean')) {
      next[key] = value
    }
  }

  return next
}

function normalizeAssistantFieldKey(rawKey: string) {
  const key = rawKey.trim()
  const normalizedKey = key.toLowerCase()

  const aliasMap: Record<string, string> = {
    totaltokensupply: 'totalSupply',
    totalsupply: 'totalSupply',
    supply: 'totalSupply',
    tokendecimals: 'decimals',
    buytax: 'buyTax',
    selltax: 'sellTax',
    taxreceiver: 'taxFeeReceiveAddress',
    taxfeereceiver: 'taxFeeReceiveAddress',
    taxfeereceiveaddress: 'taxFeeReceiveAddress',
    taxaddress: 'taxFeeReceiveAddress',
    feeaddress: 'taxFeeReceiveAddress',
    marketingwallet: 'taxFeeReceiveAddress',
    marketingaddress: 'taxFeeReceiveAddress',
    pairtoken: 'poolToken',
    pooltoken: 'poolToken',
    pairedtoken: 'poolToken',
    basetoken: 'poolToken',
    dex: 'exchange',
    dexname: 'exchange',
    router: 'exchange',
  }

  return aliasMap[normalizedKey] ?? key
}

function normalizeAssistantFieldValue(key: string, rawValue: string | boolean) {
  if (typeof rawValue === 'boolean') {
    return rawValue
  }

  const value = rawValue.trim()

  if (key === 'exchange') {
    return normalizeExchangeValue(value)
  }

  if (key === 'poolToken') {
    return normalizePoolTokenValue(value)
  }

  return value
}

function normalizeExchangeValue(value: string) {
  const normalized = value.toLowerCase().replaceAll(/\s+/g, '')

  if (normalized.includes('pancake')) return 'pancakeswap'
  if (normalized.includes('aerodrome')) return 'aerodrome'
  if (normalized.includes('uni')) return 'uniswap'
  return value
}

function normalizePoolTokenValue(value: string) {
  const normalized = value.toLowerCase().trim()

  if (['bnb', 'eth', 'native', 'native token', 'native coin'].includes(normalized)) {
    return 'native'
  }

  if (normalized.includes('usdt')) return 'usdt'
  if (normalized.includes('usdc')) return 'usdc'
  return value
}

function mergeAssistantResults(primary: AssistantResult, fallback: AssistantResult): AssistantResult {
  return {
    fields: {
      ...fallback.fields,
      ...primary.fields,
    },
    warnings: dedupeStrings([...primary.warnings, ...fallback.warnings]),
    missingFields: dedupeStrings(
      fallback.missingFields.filter((item) => !isMissingFieldSatisfied(item, { ...fallback.fields, ...primary.fields }))
        .concat(primary.missingFields.filter((item) => !isMissingFieldSatisfied(item, { ...fallback.fields, ...primary.fields }))),
    ),
    summary: primary.summary || fallback.summary,
  }
}

function dedupeStrings(items: string[]) {
  return [...new Set(items.filter(isNonEmptyString))]
}

function isMissingFieldSatisfied(label: string, fields: Record<string, string | boolean>) {
  const normalized = label.trim().toLowerCase()
  const fieldMap: Record<string, string[]> = {
    name: ['name', 'token name', '代币名称'],
    symbol: ['symbol', 'token symbol', '代币符号'],
    totalSupply: ['totalSupply', 'total supply', '总量'],
    decimals: ['decimals', '小数位'],
    taxFeeReceiveAddress: ['tax fee receiver', 'tax fee receive address', '税费接收地址', '营销钱包'],
    buyTax: ['buy tax', '买税'],
    sellTax: ['sell tax', '卖税'],
    exchange: ['exchange', '交易所'],
    poolToken: ['pool token', 'pair token', '底池币种'],
  }

  for (const [fieldKey, aliases] of Object.entries(fieldMap)) {
    if (aliases.map((item) => item.toLowerCase()).includes(normalized)) {
      const value = fields[fieldKey]
      return typeof value === 'boolean' ? true : typeof value === 'string' && value.trim().length > 0
    }
  }

  return false
}

function isAssistantResult(value: unknown): value is AssistantResult {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<AssistantResult>
  return (
    typeof candidate.summary === 'string' &&
    Array.isArray(candidate.warnings) &&
    Array.isArray(candidate.missingFields) &&
    candidate.fields !== null &&
    typeof candidate.fields === 'object'
  )
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function formatAssistantError(error: unknown, lang: SupportedLang) {
  if (!(error instanceof Error) || !error.message.trim()) {
    return lang === 'zh-cn'
      ? '未获取到具体错误信息。'
      : 'No detailed error message was available.'
  }

  return lang === 'zh-cn'
    ? `接口错误详情：${error.message}`
    : `API error details: ${error.message}`
}

function buildOptionalAuthHeaders() {
  const apiKey = readEnv('VITE_AI_API_KEY')
  return apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
}

function joinPath(base: string, suffix: string) {
  return `${base.replace(/\/+$/, '')}/${suffix.replace(/^\/+/, '')}`
}

function readEnv(key: 'VITE_AI_API_KIND' | 'VITE_AI_API_URL' | 'VITE_AI_API_KEY' | 'VITE_AI_MODEL') {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function detectChain(text: string) {
  if (text.includes('base')) return 'base'
  if (text.includes('ethereum') || text.includes('eth')) return 'eth'
  if (text.includes('bsc') || text.includes('bnb')) return 'bsc'
  return null
}

function extractSupply(text: string) {
  const contextualPatterns = [
    /(?:total\s*supply|supply|总量)(?:\s*(?:is|为|是|:|：))?\s*(\d[\d,.]*)\s*(billion|million|亿|万)?/i,
    /(\d[\d,.]*)\s*(billion|million|亿|万)?\s*(?:total\s*supply|supply|总量)/i,
  ]

  for (const pattern of contextualPatterns) {
    const match = text.match(pattern)
    if (match) {
      return formatSupplyMatch(match[1], match[2])
    }
  }

  return ''
}

function formatSupplyMatch(baseValue: string, unit?: string) {
  const base = Number(baseValue.replaceAll(',', ''))
  if (!Number.isFinite(base)) return ''

  if (unit === 'billion') return String(base * 1_000_000_000)
  if (unit === 'million') return String(base * 1_000_000)
  if (unit === '亿') return String(base * 100_000_000)
  if (unit === '万') return String(base * 10_000)
  return String(base)
}

function extractDecimals(text: string) {
  const patterns = [
    /(?:decimals?|小数位|精度|代币精度)(?:\s*(?:is|为|是|:|：))?\s*(\d{1,2})/i,
    /(\d{1,2})\s*(?:decimals?|位小数|位精度|位)/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1]
  }

  return ''
}

function extractPercent(text: string, aliases: string[]) {
  for (const alias of aliases) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const direct = text.match(new RegExp(`${escaped}[^\\d]{0,12}(\\d{1,2}(?:\\.\\d+)?)`))
    if (direct?.[1]) return direct[1]
  }

  const compactPatterns = [
    /买\s*(\d{1,2}(?:\.\d+)?)\s*%/,
    /卖\s*(\d{1,2}(?:\.\d+)?)\s*%/,
  ]

  if (aliases.includes('买税')) {
    const match = text.match(compactPatterns[0])
    if (match?.[1]) return match[1]
  }

  if (aliases.includes('卖税')) {
    const match = text.match(compactPatterns[1])
    if (match?.[1]) return match[1]
  }

  const generic = text.match(/(\d{1,2}(?:\.\d+)?)\s*%/)
  return generic?.[1] ?? ''
}

function extractExchange(text: string) {
  if (text.includes('pancake')) return 'pancakeswap'
  if (text.includes('uniswap')) return 'uniswap'
  if (text.includes('aerodrome')) return 'aerodrome'
  return ''
}

function extractPoolToken(text: string) {
  if (text.includes('usdt')) return 'usdt'
  if (text.includes('usdc')) return 'usdc'
  if (text.includes('eth')) return 'native'
  if (text.includes('bnb')) return 'native'
  return ''
}

function extractWallet(text: string) {
  return text.match(/0x[a-fA-F0-9]{40}/)?.[0] ?? ''
}

function extractSymbol(text: string) {
  const patterns = [
    /(?:symbol)(?:\s*(?:is|:))?\s*([A-Za-z0-9]{2,10})/i,
    /(?:符号)(?:\s*(?:是|为|:|：))?\s*([A-Za-z0-9]{1,10})/i,
    /\(([A-Za-z0-9]{2,10})\)/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1].toUpperCase()
  }

  return ''
}

function extractName(text: string) {
  const patterns = [
    /(?:name)(?:\s*(?:is|:))?\s*([^,，。\n]+?)(?=(?:[,，。\n]|symbol|符号|total|总量|decimals|精度|小数))/i,
    /(?:called)\s*([^,，。\n]+?)(?=(?:[,，。\n]|symbol|符号|total|总量|decimals|精度|小数))/i,
    /(?:名称|名字)(?:\s*(?:是|叫|为|:|：))?\s*([^,，。\n]+?)(?=(?:[,，。\n]|符号|symbol|总量|total|精度|小数))/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return cleanupName(match[1])
  }

  return ''
}

function cleanupName(value: string) {
  return value.replace(/[,.;，。].*$/, '').trim()
}

function isKimiThinkingModel(model: string) {
  return model.includes('kimi-thinking')
}

function extractJsonLike(value: string) {
  const start = value.indexOf('{')
  const end = value.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    return value
  }

  return value.slice(start, end + 1)
}

function parseJsonContent(value: string) {
  const cleaned = value
    .trim()
    .replace(/^```json/, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim()

  try {
    return JSON.parse(cleaned) as unknown
  } catch {
    return JSON.parse(extractJsonLike(cleaned)) as unknown
  }
}

import { CheckOutlined, CopyOutlined } from '@ant-design/icons'
import { Tooltip, message } from 'antd'
import { useEffect, useState } from 'react'
import { useRouteContext } from '@/app/use-route-context'
import './styles.scss'

export function CopyButton({
  value,
  ariaLabel,
}: {
  value: string
  ariaLabel: string
}) {
  const [copied, setCopied] = useState(false)
  const { theme, t } = useRouteContext()

  const isDark = theme === 'dark'
  const background = isDark ? 'rgba(28, 28, 36, 0.96)' : 'rgba(255, 255, 255, 0.98)'
  const color = isDark ? '#f6efe9' : '#20140f'
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(76, 40, 20, 0.08)'

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1000)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      message.success(t('common.copy.success'))
    } catch {
      message.error(t('common.copy.failed'))
    }
  }

  return (
    <Tooltip
      rootClassName={`app-tooltip copy-button-tooltip copy-button-tooltip-${theme}`}
      title={copied ? t('common.copy.copied') : t('common.copy.idle')}
      color={background}
      styles={{
        container: {
          color,
          background,
          border: `1px solid ${borderColor}`,
          boxShadow: isDark ? '0 18px 46px rgba(0, 0, 0, 0.34)' : '0 18px 42px rgba(0, 0, 0, 0.14)',
        }
      }}
    >
      <button className={`copy-button ${copied ? 'copied' : ''}`} onClick={() => void handleCopy()} type="button" aria-label={ariaLabel}>
        {copied ? <CheckOutlined /> : <CopyOutlined />}
      </button>
    </Tooltip>
  )
}

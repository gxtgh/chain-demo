import type { ReactNode } from 'react'
import type { TooltipProps } from 'antd'
import { Tooltip } from 'antd'
import { useRouteContext } from '@/app/use-route-context'

export function ValueWithTooltip({
  value,
  fullValue,
  className = 'value-with-tooltip-value',
  wrapperClassName = 'value-with-tooltip-trigger',
  rootClassName = 'app-tooltip value-with-tooltip',
  placement = 'topLeft',
}: {
  value: ReactNode
  fullValue?: ReactNode
  className?: string
  wrapperClassName?: string
  rootClassName?: string
  placement?: TooltipProps['placement']
}) {
  const { theme } = useRouteContext()
  const isDark = theme === 'dark'
  const background = isDark ? 'rgba(28, 28, 36, 0.96)' : 'rgba(255, 255, 255, 0.98)'
  const color = isDark ? '#f6efe9' : '#20140f'
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(76, 40, 20, 0.08)'
  const shouldShowTooltip = fullValue != null
  const content = (
    <span className={wrapperClassName}>
      <strong className={className}>{value}</strong>
    </span>
  )

  if (!shouldShowTooltip) {
    return content
  }

  return (
    <Tooltip
      rootClassName={rootClassName}
      placement={placement}
      title={fullValue}
      trigger={['hover', 'click']}
      color={background}
      styles={{
        container: {
          color,
          background,
          border: `1px solid ${borderColor}`,
          boxShadow: isDark ? '0 18px 46px rgba(0, 0, 0, 0.34)' : '0 18px 42px rgba(0, 0, 0, 0.14)',
        },
      }}
    >
      {content}
    </Tooltip>
  )
}

import { InfoCircleOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'
import { Grid, Tooltip } from 'antd'
import { useRouteContext } from '@/app/use-route-context'

const { useBreakpoint } = Grid

type FieldLabelWithTooltipProps = {
  label: string
  tooltip?: ReactNode
}

function getTooltipContainer(triggerNode: HTMLElement) {
  return triggerNode.closest('.app-shell') as HTMLElement | null ?? document.body
}

export function FieldLabelWithTooltip({ label, tooltip }: FieldLabelWithTooltipProps) {
  const { theme } = useRouteContext()
  const screens = useBreakpoint()

  if (!tooltip) {
    return <span>{label}</span>
  }

  const isDark = theme === 'dark'
  const background = isDark ? 'rgba(28, 28, 36, 0.96)' : 'rgba(255, 255, 255, 0.98)'
  const color = isDark ? '#f6efe9' : '#20140f'
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(76, 40, 20, 0.08)'
  const placement = screens.xs && !screens.sm ? 'top' : 'topLeft'

  return (
    <div className="field-label-row">
      <span>{label}</span>
      <Tooltip
        classNames={`app-tooltip token-creation-tooltip token-creation-tooltip-${theme}`}
        getPopupContainer={getTooltipContainer}
        placement={placement}
        title={tooltip}
        trigger={['hover', 'click']}
        zIndex={18}
        color={background}
        styles={{container:{
          color,
          background,
          border: `1px solid ${borderColor}`,
          boxShadow: isDark ? '0 18px 46px rgba(0, 0, 0, 0.34)' : '0 18px 42px rgba(0, 0, 0, 0.14)',

        }}}
      >
        <button className="field-tooltip-trigger" type="button" aria-label={label}>
          <InfoCircleOutlined />
        </button>
      </Tooltip>
    </div>
  )
}

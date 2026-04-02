import { Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import type { ReactNode } from 'react'

type TopbarMenuOption = {
  key: string
  label: string
  code?: string
  prefix?: ReactNode
}

type TopbarMenuButtonProps = {
  ariaLabel: string
  icon: ReactNode
  value: string
  options: TopbarMenuOption[]
  onChange: (value: string) => void
}

export function TopbarMenuButton({ ariaLabel, icon, value, options, onChange }: TopbarMenuButtonProps) {
  const items: MenuProps['items'] = options.map((option) => ({
    key: option.key,
    label: (
      <div className={`topbar-menu-option ${option.key === value ? 'active' : ''}`}>
        <div className="topbar-menu-option-main">
          {option.prefix ? <span className="topbar-menu-option-prefix">{option.prefix}</span> : null}
          <span>{option.label}</span>
        </div>
      </div>
    ),
  }))

  return (
    <Dropdown
      trigger={['click']}
      placement="bottom"
      overlayClassName="topbar-menu-popup"
      getPopupContainer={(triggerNode) => triggerNode.parentElement ?? document.body}
      menu={{
        items,
        selectable: false,
        onClick: ({ key }) => onChange(key),
      }}
    >
      <button type="button" className="topbar-menu-button" aria-label={ariaLabel}>
        <span className="topbar-menu-button-icon">{icon}</span>
        <span className="topbar-menu-button-arrow" aria-hidden="true">
          ▾
        </span>
      </button>
    </Dropdown>
  )
}

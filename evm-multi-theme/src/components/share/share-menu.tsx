import { MoreIcon, ShareIcon } from '@/components/common/topbar-icons'
import { TopbarMenuButton } from '@/components/common/topbar-menu-button'
import { useRouteContext } from '@/app/use-route-context'

type ShareMenuProps = {
  className?: string
  onShare: () => void
  placement?: 'bottom' | 'bottomLeft' | 'bottomRight' | 'top' | 'topLeft' | 'topRight'
  showValue?: boolean
}

export function ShareMenu({ className, onShare, placement = 'bottom', showValue = true }: ShareMenuProps) {
  const { t } = useRouteContext()

  return (
    <TopbarMenuButton
      ariaLabel={t('topbar.more')}
      className={className}
      icon={<MoreIcon />}
      placement={placement}
      onChange={(key) => {
        if (key === 'share') {
          onShare()
        }
      }}
      options={[
        {
          key: 'share',
          label: t('share.menuItem'),
          prefix: <ShareIcon />,
        },
      ]}
      showValue={showValue}
      value="more"
    />
  )
}

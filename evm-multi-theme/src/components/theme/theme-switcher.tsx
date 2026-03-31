import { useRouteContext } from '@/app/use-route-context'
import { PaletteIcon, SunIcon, ThemeIcon } from '@/components/common/topbar-icons'
import { TopbarMenuButton } from '@/components/common/topbar-menu-button'
import { themeColorRegistry, themeModeRegistry, type ThemeColorId, type ThemeModeId } from '@/config/theme-registry'

export function ThemeSwitcher() {
  const { t, page, theme, themeColor, navigateToPage } = useRouteContext()

  return (
    <>
      <TopbarMenuButton
        ariaLabel={t('topbar.theme')}
        icon={<ThemeIcon />}
        value={theme}
        options={themeModeRegistry.map((themeOption) => ({
          key: themeOption.id,
          label: t(`theme.${themeOption.id}`),
          code: themeOption.id === 'light' ? 'DAY' : 'NIGHT',
          prefix: themeOption.id === 'light' ? <SunIcon /> : <ThemeIcon />,
        }))}
        onChange={(nextTheme) => navigateToPage(page, { nextTheme: nextTheme as ThemeModeId })}
      />

      <TopbarMenuButton
        ariaLabel={t('topbar.themeColor')}
        icon={<PaletteIcon />}
        value={themeColor}
        options={themeColorRegistry.map((themeOption) => ({
          key: themeOption.id,
          label: t(`theme.${themeOption.id}`),
          code: themeOption.id.toUpperCase(),
          prefix: <span className={`theme-color-dot ${themeOption.id}`} />,
        }))}
        onChange={(nextThemeColor) => navigateToPage(page, { nextThemeColor: nextThemeColor as ThemeColorId })}
      />
    </>
  )
}

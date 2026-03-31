import { supportedLanguages } from '@/config/chains'
import { useRouteContext } from '@/app/use-route-context'
import { LanguageIcon } from '@/components/common/topbar-icons'
import { TopbarMenuButton } from '@/components/common/topbar-menu-button'

export function LanguageSwitcher() {
  const { t, lang, page, chain, theme, themeColor, navigateToPage } = useRouteContext()

  return (
    <TopbarMenuButton
      ariaLabel={t('topbar.language')}
      icon={<LanguageIcon />}
      value={lang}
      options={supportedLanguages.map((language) => ({
        key: language.key,
        label: language.label,
        code: language.key === 'zh-cn' ? 'ZH' : 'EN',
        prefix: language.key === 'zh-cn' ? '🇨🇳' : '🇺🇸',
      }))}
      onChange={(nextLang) =>
        navigateToPage(page, {
          nextLang: nextLang as typeof lang,
          nextChain: chain,
          nextTheme: theme,
          nextThemeColor: themeColor,
        })
      }
    />
  )
}

import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  DEFAULT_CHAIN,
  DEFAULT_LANG,
  DEFAULT_PAGE,
  isSupportedChainKey,
  isSupportedLang,
  isSupportedPageKey,
  type SupportedChainKey,
  type SupportedLang,
  type SupportedPageKey,
} from '../config/chains'
import { translate } from '../config/translations'

export function useAppRoute() {
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const pathnameParts = location.pathname.split('/').filter(Boolean)
  const page = isSupportedPageKey(pathnameParts[0] ?? '') ? (pathnameParts[0] as SupportedPageKey) : DEFAULT_PAGE
  const chain = isSupportedChainKey(params.chain ?? '') ? (params.chain as SupportedChainKey) : DEFAULT_CHAIN
  const lang = isSupportedLang(params.lang ?? '') ? (params.lang as SupportedLang) : DEFAULT_LANG

  useEffect(() => {
    const routePage = pathnameParts[0] ?? ''
    if (!isSupportedPageKey(routePage) || !isSupportedChainKey(params.chain ?? '') || !isSupportedLang(params.lang ?? '')) {
      navigate(`/${page}/${chain}/${lang}`, { replace: true })
    }
  }, [chain, lang, navigate, page, params.chain, params.lang, pathnameParts])

  return {
    page,
    chain,
    lang,
    navigateTo: (nextPage: SupportedPageKey, nextChain: SupportedChainKey, nextLang: SupportedLang) => {
      navigate(`/${nextPage}/${nextChain}/${nextLang}`)
    },
    t: (key: string) => translate(lang, key),
  }
}

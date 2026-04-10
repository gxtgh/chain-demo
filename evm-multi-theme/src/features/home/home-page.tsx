import {
  BgColorsOutlined,
  CheckCircleFilled,
  DeploymentUnitOutlined,
  GlobalOutlined,
  LeftOutlined,
  RightOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { useRouteContext } from '@/app/use-route-context'
import { PageSeo } from '@/components/common/page-seo'
import { getChainFullName, supportedChains, type ChainDefinition } from '@/config/chains'
import { buildPagePath, getPageSupportedChains } from '@/config/routes'
import { getPageSeo } from '@/config/seo'
import { buildAlternatePageLinks, buildCanonicalPageUrl, normalizeLocaleTag } from '@/config/site'
import './styles.scss'

const HERO_PRIMARY_TRANSITION_MS = 300
const HERO_QUEUE_TRANSITION_MS = 220
const HERO_QUEUE_STAGGER_MS = 60
const HERO_TOTAL_TRANSITION_MS = HERO_PRIMARY_TRANSITION_MS + HERO_QUEUE_TRANSITION_MS + HERO_QUEUE_STAGGER_MS * 2

type HeroAnimationDirection = 'next' | 'prev'

type HeroAnimationState = {
  direction: HeroAnimationDirection
  fromIndex: number
  toIndex: number
  phase: 'promoting' | 'queueing'
}

export function HomePage() {
  const { t, lang, chain, theme, themeColor, chainDefinition, hasThemeQuery } = useRouteContext()
  const chainLabel = getChainFullName(chainDefinition)
  const seo = getPageSeo('home', {
    t,
    chainName: chainLabel,
    tokenType: chainDefinition.tokenType,
    nativeSymbol: chainDefinition.nativeToken.symbol,
  })

  const launchModels = [
    {
      page: 'token-creation' as const,
      icon: <RocketOutlined />,
      title: t('home.models.basic.title'),
      description: t('home.models.basic.description'),
      bullets: [t('home.models.basic.bulletOne'), t('home.models.basic.bulletTwo')],
    },
    {
      page: 'tax-token-creation' as const,
      icon: <ThunderboltOutlined />,
      title: t('home.models.advanced.title'),
      description: t('home.models.advanced.description'),
      bullets: [t('home.models.advanced.bulletOne'), t('home.models.advanced.bulletTwo')],
    },
    {
      page: 'token-vanity-creation' as const,
      icon: <BgColorsOutlined />,
      title: t('home.models.vanity.title'),
      description: t('home.models.vanity.description'),
      bullets: [t('home.models.vanity.bulletOne'), t('home.models.vanity.bulletTwo')],
    },
  ]

  const advantageCards = [
    {
      icon: <DeploymentUnitOutlined />,
      title: t('home.advantages.modular.title'),
      description: t('home.advantages.modular.description'),
    },
    {
      icon: <GlobalOutlined />,
      title: t('home.advantages.networks.title'),
      description: t('home.advantages.networks.description'),
    },
    {
      icon: <BgColorsOutlined />,
      title: t('home.advantages.vanity.title'),
      description: t('home.advantages.vanity.description'),
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: t('home.advantages.transparent.title'),
      description: t('home.advantages.transparent.description'),
    },
  ]

  const flowSteps = [
    {
      title: t('home.flow.stepOne'),
      description: t('home.flow.stepOneDescription'),
    },
    {
      title: t('home.flow.stepTwo'),
      description: t('home.flow.stepTwoDescription'),
    },
    {
      title: t('home.flow.stepThree'),
      description: t('home.flow.stepThreeDescription'),
    },
    {
      title: t('home.flow.stepFour'),
      description: t('home.flow.stepFourDescription'),
    },
  ]

  const securityItems = [
    t('home.security.itemOne'),
    t('home.security.itemTwo'),
    t('home.security.itemThree'),
    t('home.security.itemFour'),
    t('home.security.itemFive'),
  ]

  const expansionCards = [
    {
      status: t('home.expand.live'),
      title: t('home.expand.issuance.title'),
      description: t('home.expand.issuance.description'),
    },
    {
      status: t('home.expand.live'),
      title: t('home.expand.tokenomics.title'),
      description: t('home.expand.tokenomics.description'),
    },
    {
      status: t('home.expand.live'),
      title: t('home.expand.vanity.title'),
      description: t('home.expand.vanity.description'),
    },
    {
      status: t('home.expand.planned'),
      title: t('home.expand.ownership.title'),
      description: t('home.expand.ownership.description'),
    },
  ]

  const featuredChains = supportedChains.slice(0, 12)
  const marqueeRows = useMemo(() => buildMarqueeRows(supportedChains), [])
  const heroSlides = useMemo(() => buildHeroSlides(chainDefinition, featuredChains, t), [chainDefinition, t])
  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const [heroAnimation, setHeroAnimation] = useState<HeroAnimationState | null>(null)
  const [isCompactHeroViewport, setIsCompactHeroViewport] = useState(false)
  const primaryPath = buildPagePath(lang, chain, 'token-creation', { theme, themeColor })
  const modelOverviewPath = '#launch-models'
  const renderHeroSlideIndex =
    heroAnimation?.phase === 'promoting' ? heroAnimation.fromIndex : heroSlideIndex
  const visibleHeroSlides = getVisibleHeroSlides(renderHeroSlideIndex, heroSlides)
  const isHeroAnimating = heroAnimation !== null

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px)')
    const updateViewportMode = () => {
      setIsCompactHeroViewport(mediaQuery.matches)
    }

    updateViewportMode()
    mediaQuery.addEventListener('change', updateViewportMode)

    return () => {
      mediaQuery.removeEventListener('change', updateViewportMode)
    }
  }, [])

  useEffect(() => {
    if (isCompactHeroViewport && heroAnimation) {
      setHeroAnimation(null)
    }
  }, [isCompactHeroViewport, heroAnimation])

  useEffect(() => {
    if (!heroAnimation) {
      return
    }

    const timerId = window.setTimeout(() => {
      if (heroAnimation.phase === 'promoting') {
        setHeroSlideIndex(heroAnimation.toIndex)
        setHeroAnimation({
          ...heroAnimation,
          phase: 'queueing',
        })
        return
      }

      setHeroAnimation(null)
    }, heroAnimation.phase === 'promoting' ? HERO_PRIMARY_TRANSITION_MS : HERO_QUEUE_TRANSITION_MS + HERO_QUEUE_STAGGER_MS * 2)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [heroAnimation])

  const handleHeroSlideChange = (direction: HeroAnimationDirection) => {
    if (heroSlides.length < 2) {
      return
    }

    const offset = direction === 'next' ? 1 : -1
    const nextIndex = getWrappedIndex(heroSlideIndex + offset, heroSlides.length)

    if (isCompactHeroViewport) {
      setHeroSlideIndex(nextIndex)
      return
    }

    if (isHeroAnimating) {
      return
    }

    setHeroAnimation({
      direction,
      fromIndex: heroSlideIndex,
      toIndex: nextIndex,
      phase: 'promoting',
    })
  }

  return (
    <section className={`page-stack home-page home-page-${themeColor}`}>
      <PageSeo
        {...seo}
        canonicalUrl={buildCanonicalPageUrl(lang, chain, 'home')}
        alternates={buildAlternatePageLinks(chain, 'home')}
        locale={normalizeLocaleTag(lang)}
        robots={hasThemeQuery || !chainDefinition.seoIndex ? 'noindex,follow' : 'index,follow'}
      />

      <section className="surface-card home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">{t('home.hero.eyebrow')}</p>
          <h1>{t('home.hero.title')}</h1>
          <p className="home-hero-description">
            {t('home.hero.description', {
              chain: chainLabel,
            })}
          </p>

          <div className="home-hero-actions">
            <a className="primary-button home-primary-action" href={primaryPath}>
              {t('home.hero.primaryCta')}
            </a>
            <a className="home-secondary-action" href={modelOverviewPath}>
              {t('home.hero.secondaryCta')}
            </a>
          </div>

          <div className="home-hero-badges">
            <span>{t('home.hero.badges.multiChain')}</span>
            <span>{t('home.hero.badges.transparent')}</span>
            <span>{t('home.hero.badges.wallet')}</span>
            <span>{t('home.hero.badges.workflow')}</span>
          </div>

          <div className="home-hero-stats">
            <article className="home-stat-card">
              <div className="home-stat-card-head">
                <span className="home-stat-card-label-icon" aria-hidden="true">
                  <GlobalOutlined />
                </span>
                <span className="home-stat-card-label">{t('home.hero.stats.networks')}</span>
              </div>
              <strong>{formatCount(getPageSupportedChains('home').length)}</strong>
            </article>
            <article className="home-stat-card home-stat-card-chain">
              <div className="home-stat-card-head">
                <span className="home-stat-card-label-icon" aria-hidden="true">
                  <DeploymentUnitOutlined />
                </span>
                <span className="home-stat-card-label">{t('home.hero.stats.currentChain')}</span>
              </div>
              <div className="home-stat-chain-row">
                <img className="home-stat-chain-icon" src={chainDefinition.icon} alt={chainDefinition.fullName} />
                <strong>{chainDefinition.name}</strong>
              </div>
            </article>
            <article className="home-stat-card">
              <div className="home-stat-card-head">
                <span className="home-stat-card-label-icon" aria-hidden="true">
                  <BgColorsOutlined />
                </span>
                <span className="home-stat-card-label">{t('home.hero.stats.tokenType')}</span>
              </div>
              <strong>{chainDefinition.tokenType}</strong>
            </article>
          </div>
        </div>

        <div className="home-preview-shell">
          <div className="home-visual-carousel">
            <div
              className={`home-visual-carousel-viewport${isHeroAnimating ? ` is-animating is-animating-${heroAnimation.direction}` : ''}`}
            >
              {visibleHeroSlides.map(({ key, position, slide }) =>
                renderHeroVisualSlide({
                  slide,
                  key,
                  className: getHeroSlideClassName(position, heroAnimation),
                }),
              )}
            </div>

            <div className="home-visual-carousel-controls">
              <button
                aria-label={t('home.preview.actions.previous')}
                className="home-visual-control-button"
                disabled={isHeroAnimating}
                onClick={() => {
                  handleHeroSlideChange('prev')
                }}
                type="button"
              >
                <LeftOutlined />
              </button>
              <button
                aria-label={t('home.preview.actions.next')}
                className="home-visual-control-button"
                disabled={isHeroAnimating}
                onClick={() => {
                  handleHeroSlideChange('next')
                }}
                type="button"
              >
                <RightOutlined />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section" id="launch-models">
        <div className="home-section-header">
          <p className="eyebrow">{t('home.models.eyebrow')}</p>
          <h2>{t('home.models.title')}</h2>
          <p>{t('home.models.description')}</p>
        </div>

        <div className="home-launch-grid">
          {launchModels.map((model) => (
            <article className="surface-card home-launch-card" key={model.page}>
              <div className="home-launch-icon">{model.icon}</div>
              <div className="home-launch-copy">
                <h3>{model.title}</h3>
                <p>{model.description}</p>
                <ul className="home-launch-points">
                  {model.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
              <div className="home-launch-meta">
                <span>{t('home.models.supportedChains', { count: getPageSupportedChains(model.page).length })}</span>
              </div>
              <a
                aria-label={`${t('home.models.cta')}: ${model.title}`}
                className="home-card-link"
                href={buildPagePath(lang, chain, model.page, { theme, themeColor })}
              >
                <RightOutlined />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <p className="eyebrow">{t('home.advantages.eyebrow')}</p>
          <h2>{t('home.advantages.title')}</h2>
          <p>{t('home.advantages.description')}</p>
        </div>

        <div className="home-advantage-grid">
          {advantageCards.map((item) => (
            <article className="surface-card home-advantage-card" key={item.title}>
              <div className="home-advantage-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <p className="eyebrow">{t('home.flow.eyebrow')}</p>
          <h2>{t('home.flow.title')}</h2>
          <p>{t('home.flow.description')}</p>
        </div>

        <div className="home-flow-card">
          <div className="home-flow-grid">
            {flowSteps.map((step, index) => (
              <article className="home-flow-step" key={step.title}>
                <div className="home-flow-step-top">
                  <span className="home-flow-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="home-flow-dot" aria-hidden="true" />
                </div>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-header">
          <p className="eyebrow">{t('home.networks.eyebrow')}</p>
          <h2>{t('home.networks.title')}</h2>
          <p>{t('home.networks.description')}</p>
        </div>

        <div className="home-network-stage">
          <div className="home-network-marquee-shell" aria-label={t('home.networks.title')}>
            {marqueeRows.map((row, rowIndex) => (
              <div className="home-network-marquee-row" key={`marquee-row-${rowIndex}`}>
                <div
                  className="home-network-marquee-track"
                  style={{ ['--marquee-duration' as string]: `${52 + rowIndex * 12}s` }}
                >
                  {[...row, ...row].map((item, itemIndex) => (
                    <article
                      className="home-chain-pill"
                      key={`${rowIndex}-${item.key}-${itemIndex}`}
                    >
                      <img src={item.icon} alt={item.fullName} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.fullName}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-dual-grid">
        <section className="home-section home-dual-panel">
          <div className="home-section-header">
            <p className="eyebrow">{t('home.security.eyebrow')}</p>
            <h2>{t('home.security.title')}</h2>
            <p>{t('home.security.description')}</p>
          </div>

          <article className="home-security-card">
            <div className="home-security-list">
              {securityItems.map((item) => (
                <div className="home-security-item" key={item}>
                  <CheckCircleFilled />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="home-section home-dual-panel">
          <div className="home-section-header">
            <p className="eyebrow">{t('home.expand.eyebrow')}</p>
            <h2>{t('home.expand.title')}</h2>
            <p>{t('home.expand.description')}</p>
          </div>

          <article className="home-expand-card">
            <div className="home-expand-grid">
              {expansionCards.map((item) => (
                <div className="home-expand-item" key={item.title}>
                  <div className="home-expand-head">
                    <strong>{item.title}</strong>
                    <span>{item.status}</span>
                  </div>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>

      <section className="surface-card home-cta-card">
        <div className="home-cta-copy">
          <p className="eyebrow">{t('home.cta.eyebrow')}</p>
          <h2>{t('home.cta.title')}</h2>
          <p>{t('home.cta.description')}</p>
        </div>
        <div className="home-cta-actions">
          <a className="primary-button home-primary-action" href={primaryPath}>
            {t('home.cta.primary')}
          </a>
        </div>
      </section>
    </section>
  )
}

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function getWrappedIndex(index: number, length: number) {
  return (index + length) % length
}

function buildMarqueeRows(chains: ChainDefinition[]) {
  const midpoint = Math.ceil(chains.length / 2)
  return [chains.slice(0, midpoint), chains.slice(midpoint)]
}

function getVisibleHeroSlides(currentIndex: number, slides: ReturnType<typeof buildHeroSlides>) {
  return [
    {
      key: slides[getWrappedIndex(currentIndex - 1, slides.length)].chain.key,
      position: 'prev' as const,
      slide: slides[getWrappedIndex(currentIndex - 1, slides.length)],
    },
    {
      key: slides[currentIndex].chain.key,
      position: 'active' as const,
      slide: slides[currentIndex],
    },
    {
      key: slides[getWrappedIndex(currentIndex + 1, slides.length)].chain.key,
      position: 'peek-1' as const,
      slide: slides[getWrappedIndex(currentIndex + 1, slides.length)],
    },
    {
      key: slides[getWrappedIndex(currentIndex + 2, slides.length)].chain.key,
      position: 'peek-2' as const,
      slide: slides[getWrappedIndex(currentIndex + 2, slides.length)],
    },
    {
      key: slides[getWrappedIndex(currentIndex + 3, slides.length)].chain.key,
      position: 'peek-3' as const,
      slide: slides[getWrappedIndex(currentIndex + 3, slides.length)],
    },
    {
      key: slides[getWrappedIndex(currentIndex + 4, slides.length)].chain.key,
      position: 'peek-4' as const,
      slide: slides[getWrappedIndex(currentIndex + 4, slides.length)],
    },
  ]
}

function getHeroSlideClassName(
  position: ReturnType<typeof getVisibleHeroSlides>[number]['position'],
  animation: HeroAnimationState | null,
) {
  if (!animation) {
    return `home-visual-slide home-visual-slide-${position}`
  }

  if (animation.phase === 'promoting') {
    if (animation.direction === 'next') {
      switch (position) {
        case 'active':
          return 'home-visual-slide home-visual-slide-active home-visual-slide-transition-active-to-prev'
        case 'peek-1':
          return 'home-visual-slide home-visual-slide-peek-1 home-visual-slide-transition-peek1-to-active'
        default:
          return `home-visual-slide home-visual-slide-${position}`
      }
    }

    switch (position) {
      case 'prev':
        return 'home-visual-slide home-visual-slide-prev home-visual-slide-transition-prev-to-active'
      case 'active':
        return 'home-visual-slide home-visual-slide-active home-visual-slide-transition-active-fade-out'
      default:
        return `home-visual-slide home-visual-slide-${position}`
    }
  }

  if (animation.direction === 'next') {
    switch (position) {
      case 'active':
        return 'home-visual-slide home-visual-slide-active'
      case 'peek-1':
        return 'home-visual-slide home-visual-slide-peek-2 home-visual-slide-transition-peek2-to-peek1'
      case 'peek-2':
        return 'home-visual-slide home-visual-slide-peek-3 home-visual-slide-transition-peek3-to-peek2'
      case 'peek-3':
        return 'home-visual-slide home-visual-slide-peek-4 home-visual-slide-transition-peek4-to-peek3'
      case 'peek-4':
        return 'home-visual-slide home-visual-slide-peek-4'
      default:
        return `home-visual-slide home-visual-slide-${position}`
    }
  }

  switch (position) {
    case 'active':
      return 'home-visual-slide home-visual-slide-active'
    case 'peek-1':
      return 'home-visual-slide home-visual-slide-active home-visual-slide-transition-active-to-peek1'
    case 'peek-2':
      return 'home-visual-slide home-visual-slide-peek-1 home-visual-slide-transition-peek1-to-peek2'
    case 'peek-3':
      return 'home-visual-slide home-visual-slide-peek-2 home-visual-slide-transition-peek2-to-peek3'
    case 'peek-4':
      return 'home-visual-slide home-visual-slide-peek-3 home-visual-slide-transition-peek3-to-peek4'
    default:
      return `home-visual-slide home-visual-slide-${position}`
  }
}

function renderHeroVisualSlide({
  slide,
  key,
  className,
}: {
  slide: ReturnType<typeof buildHeroSlides>[number]
  key: string
  className: string
}) {
  return (
    <article className={className} key={key}>
      <div className="home-visual-slide-glow" />
      <div className="home-visual-slide-content">
        <div className="home-visual-slide-top">
          <div className="home-visual-slide-mark">
            <img src={slide.chain.icon} alt={slide.chain.fullName} />
          </div>
          <div className="home-visual-slide-heading">
            <span>{slide.eyebrow}</span>
            <strong>{slide.title}</strong>
          </div>
          <div className="home-visual-slide-network-tag">{slide.networkTag}</div>
        </div>
        <p className="home-visual-slide-summary">{slide.summary}</p>
        <div className="home-visual-slide-metrics">
          {slide.metrics.map((metric) => (
            <div className="home-visual-slide-metric" key={`${slide.chain.key}-${metric.label}`}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
        <div className="home-visual-slide-badges">
          {slide.badges.map((badge) => (
            <span key={`${slide.chain.key}-${badge}`}>{badge}</span>
          ))}
        </div>
      </div>
    </article>
  )
}

function buildHeroSlides(
  currentChain: ChainDefinition,
  chains: ChainDefinition[],
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  const preferredKeys = [currentChain.key, 'bsc', 'eth', 'base', 'x-layer', 'plasma']
  const orderedChains = [
    ...preferredKeys
      .map((key) => chains.find((item) => item.key === key))
      .filter((item): item is ChainDefinition => Boolean(item)),
    ...chains.filter((item) => !preferredKeys.includes(item.key)),
  ]

  const uniqueChains = orderedChains.filter((item, index, list) => list.findIndex((entry) => entry.key === item.key) === index)
  return uniqueChains.map((chain) => ({
    chain,
    title: chain.fullName,
    eyebrow: t('home.preview.cardEyebrow'),
    networkTag: t('home.preview.networkTag', { chainId: chain.chainId }),
    summary: t('home.preview.summary', {
      chain: chain.fullName,
      tokenType: chain.tokenType,
      nativeSymbol: chain.nativeToken.symbol,
      dex: chain.defaultDex ?? chain.dexs?.[0]?.name ?? t('home.preview.defaults.routingVenue'),
    }),
    metrics: [
      {
        label: t('home.preview.metrics.tokenStandard'),
        value: chain.tokenType,
      },
      {
        label: t('home.preview.metrics.gasAsset'),
        value: chain.nativeToken.symbol,
      },
      {
        label: t('home.preview.metrics.routingVenue'),
        value: chain.defaultDex ?? chain.dexs?.[0]?.name ?? t('home.preview.defaults.routingVenue'),
      },
      {
        label: t('home.preview.metrics.execution'),
        value: chain.EIP1559 ? t('home.preview.execution.eip1559') : t('home.preview.execution.legacy'),
      },
    ],
    badges: [
      t('home.preview.badges.walletExecution'),
      chain.dexs && chain.dexs.length > 1 ? t('home.preview.badges.multiDex') : t('home.preview.badges.dexReady'),
      chain.EIP1559 ? t('home.preview.badges.eip1559') : t('home.preview.badges.legacyGas'),
    ],
  }))
}

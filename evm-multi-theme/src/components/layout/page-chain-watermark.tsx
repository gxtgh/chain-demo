import { useRouteContext } from '@/app/use-route-context'

export function PageChainWatermark() {
  const { chainDefinition } = useRouteContext()

  return (
    <div className="page-chain-watermark" aria-hidden="true">
      <span className="page-chain-watermark-left">{chainDefinition.fullName}</span>
      <span className="page-chain-watermark-right">{chainDefinition.fullName}</span>
    </div>
  )
}

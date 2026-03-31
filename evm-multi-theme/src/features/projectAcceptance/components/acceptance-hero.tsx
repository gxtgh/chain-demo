import { PageHeader } from '@/components/common/page-header'

export function AcceptanceHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="acceptance-hero">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
    </div>
  )
}

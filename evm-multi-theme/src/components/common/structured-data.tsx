import { useEffect } from 'react'

type StructuredDataProps = {
  id: string
  data: unknown
}

export function StructuredData({ id, data }: StructuredDataProps) {
  useEffect(() => {
    let script = document.head.querySelector(`script[data-structured-data-id="${id}"]`) as HTMLScriptElement | null

    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-structured-data-id', id)
      document.head.appendChild(script)
    }

    script.text = JSON.stringify(data)

    return () => {
      script?.remove()
    }
  }, [data, id])

  return null
}

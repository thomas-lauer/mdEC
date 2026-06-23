import { useMemo } from 'react'
import { renderMarkdown } from '../lib/markdown'

interface PreviewProps {
  markdown: string
}

// Gerenderte, bereinigte Vorschau. Das HTML stammt ausschliesslich aus
// renderMarkdown und ist damit bereits durch DOMPurify gegangen.
export default function Preview({ markdown }: PreviewProps) {
  const html = useMemo(() => renderMarkdown(markdown), [markdown])
  return (
    <div
      className="preview markdown-body"
      // Inhalt ist sanitisiert (siehe lib/markdown.ts).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

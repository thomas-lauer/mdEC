import { useMemo } from 'react'
import { renderMarkdownWithLines } from '../lib/markdown'

interface PreviewProps {
  markdown: string
}

// Gerenderte, bereinigte Vorschau. Das HTML stammt ausschliesslich aus
// renderMarkdownWithLines (DOMPurify-bereinigt) und traegt pro Block die
// Quell-Zeile (data-source-line) fuer den Sprung in den Editor.
export default function Preview({ markdown }: PreviewProps) {
  const html = useMemo(() => renderMarkdownWithLines(markdown), [markdown])
  return (
    <div
      className="preview markdown-body"
      // Inhalt ist sanitisiert (siehe lib/markdown.ts).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

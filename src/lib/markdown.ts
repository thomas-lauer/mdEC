import { Marked } from 'marked'
import DOMPurify from 'dompurify'

// marked mit GitHub-Flavored-Markdown. Eine eigene Instanz haelt die
// Konfiguration lokal und unabhaengig von globalen marked-Defaults.
const marked = new Marked({
  gfm: true,
  breaks: false,
})

/**
 * Rendert Markdown zu bereinigtem HTML.
 * Unterstreichung kennt Markdown nicht nativ; die Toolbar fuegt <u>...</u>
 * ein. DOMPurify muss dieses Tag deshalb bewusst durchlassen.
 */
export function renderMarkdown(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['u'],
    ADD_ATTR: ['target', 'rel'],
  })
}

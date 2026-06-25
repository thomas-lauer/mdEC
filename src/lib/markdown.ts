import { Marked, type Token } from 'marked'
import DOMPurify from 'dompurify'

// marked mit GitHub-Flavored-Markdown. Eine eigene Instanz haelt die
// Konfiguration lokal und unabhaengig von globalen marked-Defaults.
const marked = new Marked({
  gfm: true,
  breaks: false,
})

function sanitize(html: string): string {
  // Unterstreichung kennt Markdown nicht nativ; die Toolbar fuegt <u>...</u>
  // ein. DOMPurify muss dieses Tag deshalb bewusst durchlassen.
  // data-*-Attribute (z. B. data-source-line) laesst DOMPurify standardmaessig zu.
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['u'],
    ADD_ATTR: ['target', 'rel'],
  })
}

/** Rendert Markdown zu bereinigtem HTML (GFM + DOMPurify). */
export function renderMarkdown(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string
  return sanitize(rawHtml)
}

/**
 * Wie renderMarkdown, versieht aber jedes Block-Element mit der Quell-Zeile
 * (`data-source-line`, 0-basiert). So kann ein Klick in die Vorschau auf die
 * passende Stelle im Markdown-Code abgebildet werden.
 *
 * Es wird Token fuer Token gerendert: Da `lexer` die Inline-Token (inkl.
 * Referenz-Links) bereits aufloest, liefert das pro Block korrektes HTML.
 */
export function renderMarkdownWithLines(markdown: string): string {
  const tokens = marked.lexer(markdown)
  const parts: string[] = []
  let line = 0
  for (const token of tokens as Token[]) {
    const raw = (token as { raw?: string }).raw ?? ''
    const html = marked.parser([token])
    if (html.trim()) parts.push(injectLine(html, line))
    line += (raw.match(/\n/g) ?? []).length
  }
  return sanitize(parts.join('\n'))
}

/** Setzt `data-source-line` auf alle Wurzel-Elemente eines HTML-Fragments. */
function injectLine(htmlFragment: string, line: number): string {
  const doc = new DOMParser().parseFromString(htmlFragment, 'text/html')
  for (const el of Array.from(doc.body.children)) {
    el.setAttribute('data-source-line', String(line))
  }
  return doc.body.innerHTML
}

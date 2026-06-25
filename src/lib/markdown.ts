import { Marked, type Token, type Tokens } from 'marked'
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
 * Wie renderMarkdown, versieht aber Block-Elemente mit der Quell-Zeile
 * (`data-source-line`, 0-basiert) – bis hinunter zu einzelnen Listenpunkten
 * (`<li>`) und Tabellenzeilen (`<tr>`), auch in verschachtelten Listen. So
 * kann ein Klick in die Vorschau praezise auf die Markdown-Stelle abgebildet
 * werden.
 *
 * Es wird Token fuer Token gerendert: Da `lexer` die Inline-Token (inkl.
 * Referenz-Links) bereits aufloest, liefert das pro Block korrektes HTML.
 */
export function renderMarkdownWithLines(markdown: string): string {
  const tokens = marked.lexer(markdown)
  const parts: string[] = []
  let line = 0
  for (const token of tokens as Token[]) {
    const html = marked.parser([token])
    if (html.trim()) parts.push(annotate(html, token, line))
    line += countNewlines(token.raw ?? '')
  }
  return sanitize(parts.join('\n'))
}

function countNewlines(text: string): number {
  return (text.match(/\n/g) ?? []).length
}

/** Setzt die Quell-Zeile auf die Wurzel-Elemente und verfeinert Listen/Tabellen. */
function annotate(htmlFragment: string, token: Token, startLine: number): string {
  const doc = new DOMParser().parseFromString(htmlFragment, 'text/html')
  for (const el of Array.from(doc.body.children)) {
    el.setAttribute('data-source-line', String(startLine))
    if (token.type === 'list') annotateList(el, token as Tokens.List, startLine)
    else if (token.type === 'table') annotateTable(el, startLine)
  }
  return doc.body.innerHTML
}

/** Verteilt die Quell-Zeilen auf die einzelnen Listenpunkte (rekursiv). */
function annotateList(listEl: Element, token: Tokens.List, startLine: number): void {
  const items = token.items ?? []
  const lis = Array.from(listEl.children).filter((c) => c.tagName === 'LI')
  let line = startLine
  for (let i = 0; i < lis.length; i++) {
    const li = lis[i]
    const item = items[i]
    li.setAttribute('data-source-line', String(line))
    if (item) annotateItemChildren(li, item, line)
    line += countNewlines(item?.raw ?? '')
  }
}

/** Verfeinert verschachtelte Listen/Tabellen innerhalb eines Listenpunkts. */
function annotateItemChildren(li: Element, item: Tokens.ListItem, baseLine: number): void {
  const nestedLists = Array.from(li.querySelectorAll(':scope > ul, :scope > ol'))
  const nestedTables = Array.from(li.querySelectorAll(':scope > table'))
  let line = baseLine
  let listIdx = 0
  let tableIdx = 0
  for (const t of item.tokens ?? []) {
    if (t.type === 'list') {
      const el = nestedLists[listIdx++]
      if (el) annotateList(el, t as Tokens.List, line)
    } else if (t.type === 'table') {
      const el = nestedTables[tableIdx++]
      if (el) annotateTable(el, line)
    }
    line += countNewlines(t.raw ?? '')
  }
}

/** Verteilt die Quell-Zeilen auf die Tabellenzeilen (Kopf, dann Datenzeilen). */
function annotateTable(tableEl: Element, startLine: number): void {
  const rows = Array.from(tableEl.querySelectorAll('tr'))
  rows.forEach((tr, i) => {
    // i === 0: Kopfzeile (startLine); danach folgt die Trennzeile (+1),
    // deshalb beginnen die Datenzeilen bei startLine + 2.
    tr.setAttribute('data-source-line', String(i === 0 ? startLine : startLine + 1 + i))
  })
}

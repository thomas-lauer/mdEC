// Reine Funktionen für die Editor-Symbolleiste. Sie arbeiten auf dem
// Textarea-Wert plus Selektionsbereich und liefern den neuen Wert sowie
// die neue Selektion zurück. Dadurch bleibt die Logik testbar und die
// React-Komponente dünn.

export type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'link'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'ul'
  | 'ol'
  | 'quote'
  | 'code'
  | 'codeblock'
  | 'table'
  | 'hr'

export interface EditState {
  value: string
  selectionStart: number
  selectionEnd: number
}

const TABLE_TEMPLATE = `| Spalte 1 | Spalte 2 |
| -------- | -------- |
| Zelle    | Zelle    |
`

/** Umschließt die Selektion mit Präfix/Suffix (z. B. **fett**). */
function wrap(state: EditState, prefix: string, suffix: string, placeholder: string): EditState {
  const { value, selectionStart, selectionEnd } = state
  const selected = value.slice(selectionStart, selectionEnd) || placeholder
  const before = value.slice(0, selectionStart)
  const after = value.slice(selectionEnd)
  const inserted = `${prefix}${selected}${suffix}`
  return {
    value: before + inserted + after,
    selectionStart: selectionStart + prefix.length,
    selectionEnd: selectionStart + prefix.length + selected.length,
  }
}

/** Setzt vor jede betroffene Zeile ein Präfix (Listen, Zitate, Überschriften). */
function prefixLines(
  state: EditState,
  makePrefix: (lineIndex: number) => string,
  placeholder: string,
): EditState {
  const { value, selectionStart, selectionEnd } = state
  // Zeilenanfang der Selektion ermitteln.
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const rawBlock = value.slice(lineStart, selectionEnd)
  const block = rawBlock.length > 0 ? rawBlock : placeholder
  const lines = block.split('\n')
  const transformed = lines.map((line, i) => makePrefix(i) + line).join('\n')
  const before = value.slice(0, lineStart)
  const after = value.slice(selectionEnd)
  return {
    value: before + transformed + after,
    selectionStart: lineStart,
    selectionEnd: lineStart + transformed.length,
  }
}

/** Fügt einen Block am Zeilenanfang ein (Tabelle, Trennlinie, Codeblock). */
function insertBlock(state: EditState, block: string, selectInner?: [number, number]): EditState {
  const { value, selectionStart, selectionEnd } = state
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const needsLeadingNewline = lineStart > 0 && value[lineStart - 1] !== '\n'
  const lead = needsLeadingNewline ? '\n' : ''
  const before = value.slice(0, selectionStart)
  const after = value.slice(selectionEnd)
  const insert = `${lead}${block}`
  const base = before.length + lead.length
  return {
    value: before + insert + after,
    selectionStart: selectInner ? base + selectInner[0] : before.length + insert.length,
    selectionEnd: selectInner ? base + selectInner[1] : before.length + insert.length,
  }
}

export function applyAction(action: ToolbarAction, state: EditState): EditState {
  switch (action) {
    case 'bold':
      return wrap(state, '**', '**', 'fetter Text')
    case 'italic':
      return wrap(state, '*', '*', 'kursiver Text')
    case 'underline':
      return wrap(state, '<u>', '</u>', 'unterstrichener Text')
    case 'link':
      return wrap(state, '[', '](https://)', 'Linktext')
    case 'code':
      return wrap(state, '`', '`', 'Code')
    case 'h1':
      return prefixLines(state, () => '# ', 'Überschrift 1')
    case 'h2':
      return prefixLines(state, () => '## ', 'Überschrift 2')
    case 'h3':
      return prefixLines(state, () => '### ', 'Überschrift 3')
    case 'ul':
      return prefixLines(state, () => '- ', 'Listenpunkt')
    case 'ol':
      return prefixLines(state, (i) => `${i + 1}. `, 'Listenpunkt')
    case 'quote':
      return prefixLines(state, () => '> ', 'Zitat')
    case 'codeblock':
      return insertBlock(state, '```\nCode\n```\n', [4, 8])
    case 'table':
      return insertBlock(state, TABLE_TEMPLATE)
    case 'hr':
      return insertBlock(state, '---\n')
    default:
      return state
  }
}

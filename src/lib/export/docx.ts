import { downloadBlob } from './html'

// DOCX-Export: DOCX ist kein HTML-Container. Der Export bildet die wichtigsten
// Markdown-Strukturen gezielt auf Word-Elemente ab. Komplexe HTML-Sonderfälle
// können dabei vereinfacht dargestellt werden. docx wird dynamisch geladen.

export async function exportDocx(renderedHtml: string, fileName: string): Promise<void> {
  const docx = await import('docx')
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
  } = docx

  const root = new DOMParser().parseFromString(renderedHtml, 'text/html').body

  const HEADINGS: Record<string, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
    h1: HeadingLevel.HEADING_1,
    h2: HeadingLevel.HEADING_2,
    h3: HeadingLevel.HEADING_3,
    h4: HeadingLevel.HEADING_4,
    h5: HeadingLevel.HEADING_5,
    h6: HeadingLevel.HEADING_6,
  }

  // Inline-Knoten in TextRuns mit einfachen Stilen (fett/kursiv/code) umsetzen.
  const inlineRuns = (node: Node): InstanceType<typeof TextRun>[] => {
    const runs: InstanceType<typeof TextRun>[] = []
    const walk = (n: Node, bold: boolean, italics: boolean, mono: boolean) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const text = n.textContent ?? ''
        if (text) runs.push(new TextRun({ text, bold, italics, font: mono ? 'Consolas' : undefined }))
        return
      }
      if (n.nodeType !== Node.ELEMENT_NODE) return
      const el = n as Element
      const tag = el.tagName.toLowerCase()
      const nextBold = bold || tag === 'strong' || tag === 'b'
      const nextItalic = italics || tag === 'em' || tag === 'i'
      const nextMono = mono || tag === 'code'
      el.childNodes.forEach((child) => walk(child, nextBold, nextItalic, nextMono))
    }
    node.childNodes.forEach((child) => walk(child, false, false, false))
    return runs.length > 0 ? runs : [new TextRun('')]
  }

  const blocks: Array<InstanceType<typeof Paragraph> | InstanceType<typeof Table>> = []

  const handle = (el: Element) => {
    const tag = el.tagName.toLowerCase()
    if (tag in HEADINGS) {
      blocks.push(new Paragraph({ heading: HEADINGS[tag], children: inlineRuns(el) }))
      return
    }
    switch (tag) {
      case 'p':
        blocks.push(new Paragraph({ children: inlineRuns(el) }))
        break
      case 'blockquote':
        el.querySelectorAll('p').forEach((p) => {
          blocks.push(new Paragraph({ children: inlineRuns(p), indent: { left: 480 }, style: undefined }))
        })
        if (el.querySelectorAll('p').length === 0) {
          blocks.push(new Paragraph({ children: inlineRuns(el), indent: { left: 480 } }))
        }
        break
      case 'ul':
        el.querySelectorAll(':scope > li').forEach((li) => {
          blocks.push(new Paragraph({ children: inlineRuns(li), bullet: { level: 0 } }))
        })
        break
      case 'ol':
        el.querySelectorAll(':scope > li').forEach((li) => {
          blocks.push(new Paragraph({ children: inlineRuns(li), numbering: { reference: 'mdec-ol', level: 0 } }))
        })
        break
      case 'pre': {
        const code = (el.textContent ?? '').replace(/\n+$/, '')
        code.split('\n').forEach((line) => {
          blocks.push(new Paragraph({ children: [new TextRun({ text: line || ' ', font: 'Consolas', size: 20 })] }))
        })
        break
      }
      case 'table':
        blocks.push(buildTable(el))
        break
      case 'hr':
        blocks.push(new Paragraph({ text: '', border: { bottom: { color: 'CCCCCC', size: 6, style: docx.BorderStyle.SINGLE, space: 1 } } }))
        break
      default:
        if ((el.textContent ?? '').trim()) {
          blocks.push(new Paragraph({ children: inlineRuns(el) }))
        }
    }
  }

  const buildTable = (table: Element): InstanceType<typeof Table> => {
    const rows = Array.from(table.querySelectorAll('tr')).map((row) => {
      const cells = Array.from(row.querySelectorAll('th, td')).map(
        (cell) =>
          new TableCell({
            children: [new Paragraph({ children: inlineRuns(cell) })],
          }),
      )
      return new TableRow({ children: cells })
    })
    return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } })
  }

  Array.from(root.children).forEach(handle)

  if (blocks.length === 0) {
    blocks.push(new Paragraph({ children: [new TextRun('')] }))
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'mdec-ol',
          levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: docx.AlignmentType.START }],
        },
      ],
    },
    sections: [{ children: blocks }],
  })

  const blob = await Packer.toBlob(doc)
  const title = fileName.replace(/\.(md|markdown)$/i, '') || 'Dokument'
  downloadBlob(blob, `${title}.docx`)
}

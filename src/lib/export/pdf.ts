import { downloadBlob } from './html'

// PDF-Export: erzeugt ein A4-Dokument aus der gerenderten Dokumentstruktur.
// jspdf ist gross und wird deshalb dynamisch importiert, damit der Editor-
// Start klein und schnell bleibt.

interface Cursor {
  y: number
}

const MARGIN = 56 // pt
const LINE_GAP = 4

export async function exportPdf(renderedHtml: string, fileName: string): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - MARGIN * 2
  const cursor: Cursor = { y: MARGIN }

  // Gerendertes HTML in ein DOM parsen, um die Struktur zu durchlaufen.
  const root = new DOMParser().parseFromString(renderedHtml, 'text/html').body

  const ensureSpace = (needed: number) => {
    if (cursor.y + needed > pageHeight - MARGIN) {
      doc.addPage()
      cursor.y = MARGIN
    }
  }

  const writeText = (text: string, fontSize: number, style: 'normal' | 'bold' | 'italic', indent = 0) => {
    if (!text.trim()) return
    doc.setFont('helvetica', style)
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text, contentWidth - indent) as string[]
    const lineHeight = fontSize + LINE_GAP
    for (const line of lines) {
      ensureSpace(lineHeight)
      doc.text(line, MARGIN + indent, cursor.y + fontSize)
      cursor.y += lineHeight
    }
  }

  const gap = (amount: number) => {
    cursor.y += amount
  }

  const handleBlock = (el: Element) => {
    const tag = el.tagName.toLowerCase()
    const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
    switch (tag) {
      case 'h1':
        gap(8)
        writeText(text, 22, 'bold')
        gap(4)
        break
      case 'h2':
        gap(6)
        writeText(text, 18, 'bold')
        gap(4)
        break
      case 'h3':
        gap(4)
        writeText(text, 15, 'bold')
        gap(2)
        break
      case 'h4':
      case 'h5':
      case 'h6':
        gap(4)
        writeText(text, 13, 'bold')
        break
      case 'p':
        writeText(text, 11, 'normal')
        gap(6)
        break
      case 'blockquote':
        writeText(text, 11, 'italic', 16)
        gap(6)
        break
      case 'ul':
        el.querySelectorAll(':scope > li').forEach((li) => {
          writeText('•  ' + (li.textContent ?? '').replace(/\s+/g, ' ').trim(), 11, 'normal', 12)
        })
        gap(6)
        break
      case 'ol':
        el.querySelectorAll(':scope > li').forEach((li, i) => {
          writeText(`${i + 1}.  ` + (li.textContent ?? '').replace(/\s+/g, ' ').trim(), 11, 'normal', 12)
        })
        gap(6)
        break
      case 'pre':
        doc.setFont('courier', 'normal')
        doc.setFontSize(10)
        ;(el.textContent ?? '').replace(/\n+$/, '').split('\n').forEach((line) => {
          const wrapped = doc.splitTextToSize(line || ' ', contentWidth - 16) as string[]
          for (const w of wrapped) {
            ensureSpace(14)
            doc.text(w, MARGIN + 8, cursor.y + 10)
            cursor.y += 14
          }
        })
        gap(8)
        break
      case 'table':
        renderTable(el)
        gap(6)
        break
      case 'hr':
        ensureSpace(12)
        doc.setDrawColor(180)
        doc.line(MARGIN, cursor.y + 6, pageWidth - MARGIN, cursor.y + 6)
        cursor.y += 14
        break
      default:
        if (text) {
          writeText(text, 11, 'normal')
          gap(4)
        }
    }
  }

  const renderTable = (table: Element) => {
    const rows = Array.from(table.querySelectorAll('tr'))
    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('th, td')).map((c) =>
        (c.textContent ?? '').replace(/\s+/g, ' ').trim(),
      )
      writeText(cells.join('   |   '), 10, rowIndex === 0 ? 'bold' : 'normal', 8)
    })
  }

  Array.from(root.children).forEach(handleBlock)

  const title = fileName.replace(/\.(md|markdown)$/i, '') || 'Dokument'
  const blob = doc.output('blob')
  downloadBlob(blob, `${title}.pdf`)
}

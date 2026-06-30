import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Table as TableIcon,
  Minus,
} from 'lucide-react'
import type { ToolbarAction } from '../lib/toolbar'

interface ToolbarProps {
  onAction: (action: ToolbarAction) => void
}

interface ToolItem {
  action: ToolbarAction
  label: string
  Icon: typeof Bold
}

interface ToolGroup {
  items: ToolItem[]
}

const GROUPS: ToolGroup[] = [
  {
    items: [
      { action: 'bold', label: 'Fett', Icon: Bold },
      { action: 'italic', label: 'Kursiv', Icon: Italic },
      { action: 'underline', label: 'Unterstrichen', Icon: Underline },
      { action: 'link', label: 'Link', Icon: LinkIcon },
    ],
  },
  {
    items: [
      { action: 'h1', label: 'Überschrift 1', Icon: Heading1 },
      { action: 'h2', label: 'Überschrift 2', Icon: Heading2 },
      { action: 'h3', label: 'Überschrift 3', Icon: Heading3 },
    ],
  },
  {
    items: [
      { action: 'ul', label: 'Aufzählung', Icon: List },
      { action: 'ol', label: 'Nummerierte Liste', Icon: ListOrdered },
      { action: 'quote', label: 'Zitat', Icon: Quote },
    ],
  },
  {
    items: [
      { action: 'code', label: 'Inline-Code', Icon: Code },
      { action: 'codeblock', label: 'Codeblock', Icon: Code2 },
      { action: 'table', label: 'Tabelle', Icon: TableIcon },
      { action: 'hr', label: 'Trennlinie', Icon: Minus },
    ],
  },
]

// Symbolleiste für häufige Markdown-Formatierungen direkt über der
// Schreibfläche.
export default function Toolbar({ onAction }: ToolbarProps) {
  return (
    <div className="toolbar" role="toolbar" aria-label="Formatierungen">
      {GROUPS.map((group, gi) => (
        <div className="toolbar-group" key={gi}>
          {group.items.map(({ action, label, Icon }) => (
            <button
              key={action}
              type="button"
              className="toolbar-btn"
              title={label}
              aria-label={label}
              onClick={() => onAction(action)}
            >
              <Icon size={18} aria-hidden />
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

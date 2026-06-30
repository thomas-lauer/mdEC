import { forwardRef, useEffect, useRef, type MouseEvent } from 'react'
import Toolbar from './Toolbar'
import Editor from './Editor'
import Preview from './Preview'
import type { ToolbarAction } from '../lib/toolbar'
import { lineStartIndex, scrollTextareaToIndex } from '../lib/caret'

interface WorkspaceProps {
  content: string
  mode: 'edit' | 'preview'
  onChange: (value: string) => void
  onAction: (action: ToolbarAction) => void
  onEditRequest: () => void
  onPreviewRequest: () => void
}

// Einzelansicht: im selben Fenster wird entweder die Vorschau oder der
// Markdown-Code angezeigt.
// - Klick in die Vorschau wechselt in den Editor und springt zur Quell-Zeile.
// - Rechtsklick im Editor wechselt zurück zur Vorschau.
const Workspace = forwardRef<HTMLTextAreaElement, WorkspaceProps>(function Workspace(
  { content, mode, onChange, onAction, onEditRequest, onPreviewRequest },
  ref,
) {
  // Zeile, zu der nach dem Wechsel in den Editor gesprungen werden soll.
  const pendingLineRef = useRef<number | null>(null)

  // Klick in der Vorschau: nächstes Element mit Quell-Zeile suchen, merken
  // und in den Editor wechseln.
  const handlePreviewClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    let el = event.target as HTMLElement | null
    while (el && el !== event.currentTarget && !el.hasAttribute('data-source-line')) {
      el = el.parentElement
    }
    const attr = el?.getAttribute('data-source-line')
    pendingLineRef.current = attr != null ? Number(attr) : null
    onEditRequest()
  }

  // Nach dem Wechsel in den Editor fokussieren und ggf. zur Zeile springen.
  useEffect(() => {
    if (mode !== 'edit') return
    const textarea = ref && typeof ref !== 'function' ? ref.current : null
    if (!textarea) return
    textarea.focus()
    const line = pendingLineRef.current
    if (line != null) {
      const index = lineStartIndex(textarea.value, line)
      textarea.setSelectionRange(index, index)
      scrollTextareaToIndex(textarea, index)
    }
    pendingLineRef.current = null
  }, [mode, ref])

  return (
    <main className="workspace">
      {mode === 'edit' ? (
        <section
          className="pane editor-pane"
          onContextMenu={(e) => {
            e.preventDefault()
            onPreviewRequest()
          }}
        >
          <Toolbar onAction={onAction} />
          <div className="pane-body">
            <Editor ref={ref} value={content} onChange={onChange} />
          </div>
        </section>
      ) : (
        <section className="pane preview-pane">
          <div
            className="pane-body preview-clickable"
            onClick={handlePreviewClick}
            title="Klicken, um an dieser Stelle zu bearbeiten"
          >
            <Preview markdown={content} />
          </div>
        </section>
      )}
    </main>
  )
})

export default Workspace

import { forwardRef, useEffect } from 'react'
import Toolbar from './Toolbar'
import Editor from './Editor'
import Preview from './Preview'
import type { ToolbarAction } from '../lib/toolbar'

interface WorkspaceProps {
  content: string
  mode: 'edit' | 'preview'
  onChange: (value: string) => void
  onAction: (action: ToolbarAction) => void
  onEditRequest: () => void
}

// Einzelansicht: im selben Fenster wird entweder die Vorschau oder der
// Markdown-Code angezeigt. Ein Klick in die Vorschau wechselt in den Editor.
const Workspace = forwardRef<HTMLTextAreaElement, WorkspaceProps>(function Workspace(
  { content, mode, onChange, onAction, onEditRequest },
  ref,
) {
  // Beim Wechsel in den Bearbeiten-Modus den Editor fokussieren.
  useEffect(() => {
    if (mode === 'edit' && ref && typeof ref !== 'function') {
      ref.current?.focus()
    }
  }, [mode, ref])

  return (
    <main className="workspace">
      {mode === 'edit' ? (
        <section className="pane editor-pane">
          <Toolbar onAction={onAction} />
          <div className="pane-body">
            <Editor ref={ref} value={content} onChange={onChange} />
          </div>
        </section>
      ) : (
        <section className="pane preview-pane">
          <div
            className="pane-body preview-clickable"
            onClick={onEditRequest}
            title="Zum Bearbeiten klicken"
          >
            <Preview markdown={content} />
          </div>
        </section>
      )}
    </main>
  )
})

export default Workspace

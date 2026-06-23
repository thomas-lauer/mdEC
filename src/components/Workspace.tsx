import { forwardRef } from 'react'
import Toolbar from './Toolbar'
import Editor from './Editor'
import Preview from './Preview'
import type { ToolbarAction } from '../lib/toolbar'

interface WorkspaceProps {
  content: string
  showPreview: boolean
  onChange: (value: string) => void
  onAction: (action: ToolbarAction) => void
}

// Zweigeteilte Arbeitsflaeche: links Editor (mit Symbolleiste), rechts die
// Vorschau. Ist die Vorschau ausgeblendet, nutzt der Editor die volle Breite.
const Workspace = forwardRef<HTMLTextAreaElement, WorkspaceProps>(function Workspace(
  { content, showPreview, onChange, onAction },
  ref,
) {
  return (
    <main className={`workspace ${showPreview ? 'with-preview' : 'editor-only'}`}>
      <section className="pane editor-pane">
        <Toolbar onAction={onAction} />
        <div className="pane-body">
          <Editor ref={ref} value={content} onChange={onChange} />
        </div>
      </section>
      {showPreview && (
        <section className="pane preview-pane">
          <div className="pane-body">
            <Preview markdown={content} />
          </div>
        </section>
      )}
    </main>
  )
})

export default Workspace

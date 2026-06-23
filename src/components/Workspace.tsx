import { forwardRef, useCallback, useLayoutEffect, useRef } from 'react'
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
  const previewBodyRef = useRef<HTMLDivElement>(null)

  // Vorschau anhand der relativen Editor-Scrollposition mitfuehren.
  const syncPreview = useCallback(() => {
    const editor = ref && typeof ref !== 'function' ? ref.current : null
    const preview = previewBodyRef.current
    if (!editor || !preview) return
    const editorMax = editor.scrollHeight - editor.clientHeight
    if (editorMax <= 0) {
      preview.scrollTop = 0
      return
    }
    const previewMax = preview.scrollHeight - preview.clientHeight
    preview.scrollTop = (editor.scrollTop / editorMax) * previewMax
  }, [ref])

  // Nach jeder Inhaltsaenderung neu ausrichten. Sonst springt die Vorschau
  // durch das Neu-Rendern (innerHTML wird ersetzt) nach oben.
  useLayoutEffect(() => {
    if (showPreview) syncPreview()
  }, [content, showPreview, syncPreview])

  return (
    <main className={`workspace ${showPreview ? 'with-preview' : 'editor-only'}`}>
      <section className="pane editor-pane">
        <Toolbar onAction={onAction} />
        <div className="pane-body">
          <Editor ref={ref} value={content} onChange={onChange} onScroll={syncPreview} />
        </div>
      </section>
      {showPreview && (
        <section className="pane preview-pane">
          <div className="pane-body" ref={previewBodyRef}>
            <Preview markdown={content} />
          </div>
        </section>
      )}
    </main>
  )
})

export default Workspace

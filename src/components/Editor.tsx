import { forwardRef } from 'react'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

// Schreibflaeche. Die Textarea-Ref wird nach oben gereicht, damit die
// Toolbar Selektion und Cursorposition lesen und setzen kann.
const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(function Editor({ value, onChange }, ref) {
  return (
    <textarea
      ref={ref}
      className="editor"
      value={value}
      spellCheck={false}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Hier Markdown schreiben …"
      aria-label="Markdown-Editor"
    />
  )
})

export default Editor

import { forwardRef } from 'react'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  onScroll?: () => void
}

// Schreibfläche. Die Textarea-Ref wird nach oben gereicht, damit die
// Toolbar Selektion und Cursorposition lesen und setzen kann.
const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(function Editor(
  { value, onChange, onScroll },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className="editor"
      value={value}
      spellCheck={false}
      onChange={(e) => onChange(e.target.value)}
      onScroll={onScroll}
      placeholder="Hier Markdown schreiben …"
      aria-label="Markdown-Editor"
    />
  )
})

export default Editor

import { useCallback, useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import Workspace from './components/Workspace'
import { applyAction, type ToolbarAction } from './lib/toolbar'
import { renderMarkdown } from './lib/markdown'
import { SAMPLE_DOC } from './lib/sampleDoc'
import {
  loadContent,
  loadFileName,
  loadTheme,
  saveContent,
  saveFileName,
  saveTheme,
} from './lib/storage'
import { exportHtml, downloadBlob } from './lib/export/html'
import type { ExportFormat, MenuCommand, Theme } from './types'

const DEFAULT_FILENAME = 'dokument.md'
const GITHUB_URL = 'https://github.com/thomas-lauer/mdEC'

export default function App() {
  const isDesktop = typeof window !== 'undefined' && !!window.mdECApi

  // Im Desktop-Modus ist die Datei die Quelle der Wahrheit. Inhalt/Dateiname
  // werden dort nicht im localStorage zwischengespeichert, damit sich mehrere
  // gleichzeitig laufende Instanzen nicht gegenseitig überschreiben.
  const [content, setContent] = useState<string>(() =>
    isDesktop ? SAMPLE_DOC : loadContent(SAMPLE_DOC),
  )
  // Zuletzt gespeicherter Stand (Basis für "ungespeicherte Änderungen").
  const [savedContent, setSavedContent] = useState<string>(content)
  const [fileName, setFileName] = useState<string>(() =>
    isDesktop ? DEFAULT_FILENAME : loadFileName(DEFAULT_FILENAME),
  )
  const [theme, setTheme] = useState<Theme>(() => loadTheme())
  // Einzelansicht: entweder die Vorschau ('preview', Standard) oder der
  // Markdown-Code ('edit'). Es ist immer nur eine der beiden sichtbar.
  const [mode, setMode] = useState<'edit' | 'preview'>('preview')
  // Aktueller Dateipfad im Desktop-Modus (für "Speichern" und die Anzeige
  // des vollen Pfads im Dateinamen-Feld).
  const [filePath, setFilePath] = useState<string | undefined>(undefined)

  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Ungespeicherte Änderungen, sobald der Inhalt vom gespeicherten Stand abweicht.
  const dirty = content !== savedContent

  // --- Persistenz & Theme ---------------------------------------------------
  useEffect(() => {
    if (!isDesktop) saveContent(content)
  }, [content, isDesktop])

  useEffect(() => {
    if (!isDesktop) saveFileName(fileName)
  }, [fileName, isDesktop])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    saveTheme(theme)
  }, [theme])

  // Zustand an den Electron-Main-Prozess melden (für die Beenden-Nachfrage).
  useEffect(() => {
    window.mdECApi?.updateState({
      dirty,
      name: fileName,
      content,
      path: filePath,
    })
  }, [content, fileName, dirty, filePath])

  // --- Toolbar --------------------------------------------------------------
  const handleAction = useCallback((action: ToolbarAction) => {
    const textarea = editorRef.current
    if (!textarea) return
    // Scrollposition merken, damit die Ansicht nach dem Re-Render nicht springt.
    const scrollTop = textarea.scrollTop
    const result = applyAction(action, {
      value: textarea.value,
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
    })
    setContent(result.value)
    // Selektion und Scrollposition nach dem Re-Render wiederherstellen.
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd)
      textarea.scrollTop = scrollTop
    })
  }, [])

  // --- Datei-Aktionen (Web) -------------------------------------------------
  const handleUpload = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,text/markdown'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        setContent(String(reader.result ?? ''))
        setFileName(file.name)
      }
      reader.readAsText(file)
    }
    input.click()
  }, [])

  const handleDownload = useCallback(() => {
    const name = /\.(md|markdown)$/i.test(fileName) ? fileName : `${fileName || 'dokument'}.md`
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    downloadBlob(blob, name)
    setMode('preview')
  }, [content, fileName])

  // --- Datei-Aktionen (Desktop) --------------------------------------------
  const handleOpen = useCallback(async () => {
    const api = window.mdECApi
    if (!api) return
    const file = await api.openFile()
    if (!file) return
    setContent(file.content)
    setSavedContent(file.content)
    setFileName(file.name)
    setFilePath(file.path)
  }, [])

  const handleSave = useCallback(async () => {
    const api = window.mdECApi
    if (!api) return
    const result = await api.saveFile({ path: filePath, name: fileName, content })
    if (!result.canceled && result.path) {
      setFilePath(result.path)
      if (result.name) setFileName(result.name)
      setSavedContent(content)
      setMode('preview')
    }
  }, [content, fileName, filePath])

  const handleSaveAs = useCallback(async () => {
    const api = window.mdECApi
    if (!api) return
    const result = await api.saveFileAs({ name: fileName, content })
    if (!result.canceled && result.path) {
      setFilePath(result.path)
      if (result.name) setFileName(result.name)
      setSavedContent(content)
      setMode('preview')
    }
  }, [content, fileName])

  // --- Sonstiges ------------------------------------------------------------
  const handleResetSample = useCallback(() => {
    setContent(SAMPLE_DOC)
  }, [])

  // Eingabe im Dateinamen-Feld. Enthält sie einen Pfad-Trenner, wird sie als
  // vollständiger Pfad behandelt; sonst als reiner Dateiname.
  const handleFileNameChange = useCallback((input: string) => {
    const sep = Math.max(input.lastIndexOf('/'), input.lastIndexOf('\\'))
    if (sep >= 0) {
      setFilePath(input)
      setFileName(input.slice(sep + 1))
    } else {
      setFilePath(undefined)
      setFileName(input)
    }
  }, [])

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      const html = renderMarkdown(content)
      if (format === 'html') {
        exportHtml(html, fileName)
        return
      }
      if (format === 'pdf') {
        const { exportPdf } = await import('./lib/export/pdf')
        await exportPdf(html, fileName)
        return
      }
      if (format === 'docx') {
        const { exportDocx } = await import('./lib/export/docx')
        await exportDocx(html, fileName)
      }
    },
    [content, fileName],
  )

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  // In den Markdown-Code wechseln (Klick in die Vorschau).
  const showEditor = useCallback(() => setMode('edit'), [])
  // Zur Vorschau wechseln (Rechtsklick im Editor).
  const showPreview = useCallback(() => setMode('preview'), [])
  // Augen-Button: zwischen Vorschau und Code umschalten.
  const toggleMode = useCallback(() => setMode((m) => (m === 'edit' ? 'preview' : 'edit')), [])

  // --- Electron-Verdrahtung -------------------------------------------------
  // Refs auf die aktuellen Handler, damit der einmalige Listener stets die
  // frische Closure (mit aktuellem content/fileName) aufruft.
  const handlersRef = useRef({
    handleOpen,
    handleSave,
    handleSaveAs,
    handleExport,
    toggleMode,
    handleResetSample,
  })
  handlersRef.current = {
    handleOpen,
    handleSave,
    handleSaveAs,
    handleExport,
    toggleMode,
    handleResetSample,
  }

  useEffect(() => {
    const api = window.mdECApi
    if (!api) return

    api.onOpenFile((file) => {
      setContent(file.content)
      setSavedContent(file.content)
      setFileName(file.name)
      setFilePath(file.path)
    })

    api.onMenuCommand((command: MenuCommand) => {
      const h = handlersRef.current
      switch (command) {
        case 'open':
          void h.handleOpen()
          break
        case 'save':
          void h.handleSave()
          break
        case 'save-as':
          void h.handleSaveAs()
          break
        case 'export-html':
          void h.handleExport('html')
          break
        case 'export-pdf':
          void h.handleExport('pdf')
          break
        case 'export-docx':
          void h.handleExport('docx')
          break
        case 'toggle-preview':
          h.toggleMode()
          break
        case 'reset-sample':
          h.handleResetSample()
          break
      }
    })
  }, [])

  return (
    <div className="app-shell">
      <Header
        fileName={fileName}
        filePath={filePath}
        onFileNameChange={handleFileNameChange}
        isDesktop={isDesktop}
        theme={theme}
        mode={mode}
        onToggleTheme={toggleTheme}
        onToggleMode={toggleMode}
        onResetSample={handleResetSample}
        onExport={handleExport}
        onUpload={handleUpload}
        onDownload={handleDownload}
        onOpen={handleOpen}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        githubUrl={GITHUB_URL}
      />
      <Workspace
        ref={editorRef}
        content={content}
        mode={mode}
        onChange={setContent}
        onAction={handleAction}
        onEditRequest={showEditor}
        onPreviewRequest={showPreview}
      />
    </div>
  )
}

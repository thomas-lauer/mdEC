import {
  Upload,
  Download,
  Save,
  FolderOpen,
  FileDown,
  FileText,
  FileType,
  RotateCcw,
  Sun,
  Moon,
  PanelRightClose,
  PanelRightOpen,
  Github,
  ChevronDown,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ExportFormat, Theme } from '../types'

interface HeaderProps {
  fileName: string
  onFileNameChange: (name: string) => void
  isDesktop: boolean
  theme: Theme
  showPreview: boolean
  onToggleTheme: () => void
  onTogglePreview: () => void
  onResetSample: () => void
  onExport: (format: ExportFormat) => void
  // Web-Modus
  onUpload: () => void
  onDownload: () => void
  // Desktop-Modus
  onOpen: () => void
  onSave: () => void
  onSaveAs: () => void
  githubUrl?: string
}

const GITHUB_URL = 'https://github.com/thomas-lauer/mdEC'

export default function Header(props: HeaderProps) {
  const {
    fileName,
    onFileNameChange,
    isDesktop,
    theme,
    showPreview,
    onToggleTheme,
    onTogglePreview,
    onResetSample,
    onExport,
    onUpload,
    onDownload,
    onOpen,
    onSave,
    onSaveAs,
    githubUrl = GITHUB_URL,
  } = props

  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  // Export-Menue schliessen, wenn ausserhalb geklickt wird.
  useEffect(() => {
    if (!exportOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [exportOpen])

  const handleExport = (format: ExportFormat) => {
    setExportOpen(false)
    onExport(format)
  }

  const openGithub = () => {
    window.open(githubUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">mdEC</span>
        <input
          className="filename-input"
          value={fileName}
          onChange={(e) => onFileNameChange(e.target.value)}
          spellCheck={false}
          aria-label="Dateiname"
        />
      </div>

      <div className="header-actions">
        {isDesktop ? (
          <>
            <button className="btn" type="button" onClick={onOpen} title="Oeffnen (Strg+O)">
              <FolderOpen size={16} aria-hidden />
              <span>Oeffnen</span>
            </button>
            <button className="btn" type="button" onClick={onSave} title="Speichern (Strg+S)">
              <Save size={16} aria-hidden />
              <span>Speichern</span>
            </button>
            <button className="btn" type="button" onClick={onSaveAs} title="Speichern unter (Strg+Umschalt+S)">
              <FileDown size={16} aria-hidden />
              <span>Speichern unter</span>
            </button>
          </>
        ) : (
          <>
            <button className="btn" type="button" onClick={onUpload} title="Markdown-Datei hochladen">
              <Upload size={16} aria-hidden />
              <span>Hochladen</span>
            </button>
            <button className="btn" type="button" onClick={onDownload} title="Als Markdown herunterladen">
              <Download size={16} aria-hidden />
              <span>Herunterladen</span>
            </button>
          </>
        )}

        <div className="export-wrap" ref={exportRef}>
          <button
            className="btn"
            type="button"
            onClick={() => setExportOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={exportOpen}
            title="Vorschau exportieren"
          >
            <FileType size={16} aria-hidden />
            <span>Export</span>
            <ChevronDown size={14} aria-hidden />
          </button>
          {exportOpen && (
            <div className="export-menu" role="menu">
              <button role="menuitem" type="button" onClick={() => handleExport('html')}>
                <FileText size={15} aria-hidden /> HTML
              </button>
              <button role="menuitem" type="button" onClick={() => handleExport('pdf')}>
                <FileText size={15} aria-hidden /> PDF
              </button>
              <button role="menuitem" type="button" onClick={() => handleExport('docx')}>
                <FileText size={15} aria-hidden /> DOCX
              </button>
            </div>
          )}
        </div>

        <button className="btn btn-icon" type="button" onClick={onResetSample} title="Beispiel zuruecksetzen">
          <RotateCcw size={16} aria-hidden />
        </button>

        <button
          className="btn btn-icon"
          type="button"
          onClick={onTogglePreview}
          title={showPreview ? 'Vorschau ausblenden' : 'Vorschau einblenden'}
          aria-pressed={showPreview}
        >
          {showPreview ? <PanelRightClose size={16} aria-hidden /> : <PanelRightOpen size={16} aria-hidden />}
        </button>

        <button
          className="btn btn-icon"
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Helles Design' : 'Dunkles Design'}
        >
          {theme === 'dark' ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
        </button>

        <button className="btn btn-icon" type="button" onClick={openGithub} title="GitHub oeffnen">
          <Github size={16} aria-hidden />
        </button>
      </div>
    </header>
  )
}

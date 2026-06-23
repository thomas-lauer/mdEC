export type Theme = 'light' | 'dark'

export type ExportFormat = 'html' | 'pdf' | 'docx'

/** Eine vom Electron-Main-Prozess geoeffnete Datei. */
export interface OpenedFile {
  path: string
  name: string
  content: string
}

/** Ergebnis eines Speicher-Vorgangs im Electron-Main-Prozess. */
export interface SaveResult {
  canceled: boolean
  path?: string
  name?: string
}

/**
 * Eng begrenzte Preload-API, die der Electron-Main-Prozess dem Renderer
 * ueber contextBridge bereitstellt. Im Web-Modus ist `window.mdECApi`
 * nicht vorhanden.
 */
export interface MdECApi {
  readonly isDesktop: true
  /** Datei-Dialog oeffnen und Inhalt einlesen. */
  openFile(): Promise<OpenedFile | null>
  /** An bekannten Pfad speichern; ohne Pfad wie saveFileAs. */
  saveFile(payload: { path?: string; name: string; content: string }): Promise<SaveResult>
  /** Speichern-unter-Dialog. */
  saveFileAs(payload: { name: string; content: string }): Promise<SaveResult>
  /** Beim Start uebergebene Datei (z. B. EXE-Argument). */
  onOpenFile(callback: (file: OpenedFile) => void): void
  /** Menue-Kommandos aus dem nativen Menue (oeffnen/speichern/export/...). */
  onMenuCommand(callback: (command: MenuCommand) => void): void
}

export type MenuCommand =
  | 'open'
  | 'save'
  | 'save-as'
  | 'export-html'
  | 'export-pdf'
  | 'export-docx'
  | 'toggle-preview'
  | 'reset-sample'

declare global {
  interface Window {
    mdECApi?: MdECApi
  }
}

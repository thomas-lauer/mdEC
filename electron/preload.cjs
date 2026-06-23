// Preload-Skript. Stellt dem Renderer ueber contextBridge nur die eng
// begrenzte API `mdECApi` bereit. nodeIntegration ist aus, contextIsolation an.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('mdECApi', {
  isDesktop: true,

  // Datei-Dialog oeffnen und Inhalt einlesen (im Main-Prozess).
  openFile: () => ipcRenderer.invoke('mdec:open-file'),

  // An bekannten Pfad speichern; ohne Pfad oeffnet der Main-Prozess den Dialog.
  saveFile: (payload) => ipcRenderer.invoke('mdec:save-file', payload),

  // Speichern-unter-Dialog.
  saveFileAs: (payload) => ipcRenderer.invoke('mdec:save-file-as', payload),

  // Aktuellen Zustand (dirty/Pfad/Inhalt) an den Main-Prozess melden.
  updateState: (state) => ipcRenderer.send('mdec:update-state', state),

  // Beim Start uebergebene Datei (EXE-Argument).
  onOpenFile: (callback) => {
    ipcRenderer.on('mdec:opened-file', (_event, file) => callback(file))
  },

  // Native Menue-Kommandos.
  onMenuCommand: (callback) => {
    ipcRenderer.on('mdec:menu-command', (_event, command) => callback(command))
  },
})

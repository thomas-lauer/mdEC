// Electron-Main-Prozess fuer mdEC.
// Dateioperationen laufen ausschliesslich hier; der Renderer erhaelt nur die
// Preload-API `mdECApi`. nodeIntegration bleibt aus, contextIsolation an.
const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron')
const path = require('node:path')
const fs = require('node:fs/promises')

const isDev = process.env.MDEC_DEV === '1'
const DEV_URL = 'http://localhost:5173'
const GITHUB_URL = 'https://github.com/thomas-lauer/mdEC'

/** @type {BrowserWindow | null} */
let mainWindow = null
// Beim Start uebergebener Dateipfad (EXE-Argument), bis der Renderer bereit ist.
let pendingFilePath = filePathFromArgv(process.argv)

function filePathFromArgv(argv) {
  // Erstes Argument, das wie eine Markdown-Datei aussieht.
  const candidate = argv.slice(1).find((arg) => /\.(md|markdown)$/i.test(arg))
  return candidate ? path.resolve(candidate) : null
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 640,
    minHeight: 480,
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  // Externe Links (z. B. GitHub) im Standardbrowser oeffnen, nicht im Fenster.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      void shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  // Falls eine Datei beim Start uebergeben wurde, nach dem Laden ausliefern.
  mainWindow.webContents.on('did-finish-load', () => {
    void deliverPendingFile()
  })

  if (isDev) {
    void mainWindow.loadURL(DEV_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    void mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function deliverPendingFile() {
  if (!pendingFilePath || !mainWindow) return
  try {
    const content = await fs.readFile(pendingFilePath, 'utf-8')
    mainWindow.webContents.send('mdec:opened-file', {
      path: pendingFilePath,
      name: path.basename(pendingFilePath),
      content,
    })
  } catch (err) {
    console.error('Startdatei konnte nicht gelesen werden:', err)
  } finally {
    pendingFilePath = null
  }
}

function sendMenuCommand(command) {
  mainWindow?.webContents.send('mdec:menu-command', command)
}

function buildMenu() {
  const template = [
    {
      label: 'Datei',
      submenu: [
        { label: 'Oeffnen …', accelerator: 'CmdOrCtrl+O', click: () => sendMenuCommand('open') },
        { label: 'Speichern', accelerator: 'CmdOrCtrl+S', click: () => sendMenuCommand('save') },
        {
          label: 'Speichern unter …',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => sendMenuCommand('save-as'),
        },
        { type: 'separator' },
        {
          label: 'Exportieren',
          submenu: [
            { label: 'HTML …', click: () => sendMenuCommand('export-html') },
            { label: 'PDF …', click: () => sendMenuCommand('export-pdf') },
            { label: 'DOCX …', click: () => sendMenuCommand('export-docx') },
          ],
        },
        { type: 'separator' },
        { label: 'Beenden', role: 'quit' },
      ],
    },
    {
      label: 'Ansicht',
      submenu: [
        { label: 'Vorschau ein/aus', accelerator: 'CmdOrCtrl+P', click: () => sendMenuCommand('toggle-preview') },
        { label: 'Beispiel zuruecksetzen', click: () => sendMenuCommand('reset-sample') },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Hilfe',
      submenu: [{ label: 'mdEC auf GitHub', click: () => shell.openExternal(GITHUB_URL) }],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// --- IPC: Dateioperationen --------------------------------------------------
ipcMain.handle('mdec:open-file', async () => {
  if (!mainWindow) return null
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Markdown-Datei oeffnen',
    properties: ['openFile'],
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
  })
  if (canceled || filePaths.length === 0) return null
  const filePath = filePaths[0]
  const content = await fs.readFile(filePath, 'utf-8')
  return { path: filePath, name: path.basename(filePath), content }
})

ipcMain.handle('mdec:save-file', async (_event, payload) => {
  const { path: filePath, name, content } = payload ?? {}
  if (filePath) {
    await fs.writeFile(filePath, content ?? '', 'utf-8')
    return { canceled: false, path: filePath, name: path.basename(filePath) }
  }
  return saveAs(name, content)
})

ipcMain.handle('mdec:save-file-as', async (_event, payload) => {
  const { name, content } = payload ?? {}
  return saveAs(name, content)
})

async function saveAs(name, content) {
  if (!mainWindow) return { canceled: true }
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Speichern unter',
    defaultPath: name || 'dokument.md',
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
  })
  if (canceled || !filePath) return { canceled: true }
  await fs.writeFile(filePath, content ?? '', 'utf-8')
  return { canceled: false, path: filePath, name: path.basename(filePath) }
}

// --- App-Lebenszyklus -------------------------------------------------------
// Einzelinstanz: ein zweiter Start mit Datei-Argument reicht die Datei durch.
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    const filePath = filePathFromArgv(argv)
    if (filePath) {
      pendingFilePath = filePath
      void deliverPendingFile()
    }
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    buildMenu()
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}

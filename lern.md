# Lernprotokoll

## Probleme und Fehler

- Das Ziel-Repository `thomas-lauer/mdEC` existierte zu Beginn noch nicht. Es wird deshalb als neues öffentliches Repository angelegt.
- Der lokale Projektordner war noch kein Git-Repository. Git wird nach der Implementierung initialisiert.
- Die Referenz Polypost ist eine gebaute Vite-App. Die genaue Komponentenstruktur ist dadurch nicht direkt sichtbar; mdEC orientiert sich am Bedienkonzept und an der zweigeteilten Arbeitsfläche, bleibt aber eine eigenständige Implementierung.
- Markdown aus Dateien oder Eingaben kann HTML enthalten. Deshalb wird die gerenderte Vorschau vor der Ausgabe mit DOMPurify bereinigt.
- GitHub Pages benötigt bei Vite-Projekten eine passende `base`-Konfiguration. Für dieses Repository ist `/mdEC/` gesetzt.
- Der erste Build scheiterte, weil TypeScript mit klassischer `Node`-Modulauflösung die Typen von `@vitejs/plugin-react` nicht korrekt auflösen konnte. Die Konfiguration wurde auf `Bundler` umgestellt.
- `npm audit` meldete für die initiale Vite-Version einen High-Severity-Hinweis über `esbuild`. Vite wurde auf die aktuelle Version 8.0.16 aktualisiert.
- Eine separate TypeScript-Projekt-Referenz für `vite.config.ts` erzeugte Build-Zwischenartefakte und war für diese kleine App unnötig. Der Build nutzt nun `tsc --noEmit` plus `vite build`.
- Der erste GitHub-Pages-Lauf war erfolgreich, meldete aber eine Warnung zur bevorstehenden Node-20-Actions-Abkündigung. Der Workflow setzt `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` und nutzt die aktuellen Major-Versionen der GitHub-Actions.
- Markdown kennt keine native Unterstreichung. Die Toolbar nutzt dafür bewusst `<u>...</u>`, das in der bereinigten Vorschau gerendert wird.
- Beim ersten Electron-Packaging-Versuch blockierte Windows/OneDrive das Umbenennen des generierten `release/win-unpacked.tmp`-Ordners mit `EPERM`. Der Release-Ordner wurde bereinigt und der Packaging-Lauf danach erneut ausgeführt.
- Das `EPERM` trat auch ausserhalb von OneDrive auf, solange electron-builder die Electron-Laufzeit selbst entpacken wollte. Die Loesung ist `electronDist: node_modules/electron/dist`, wodurch die bereits lokal installierte Electron-Runtime kopiert wird.
- Fuer den NSIS-Installer trat das gleiche Rename-Problem im lokalen electron-builder-Cache auf. Nach manuellem Umbenennen der vollstaendig entpackten Cache-Ordner `nsis-3.0.4.1-...tmp` und `nsis-resources-3.4.1-...tmp` lief `npm run electron:dist` erfolgreich durch.
- Externe Links in der Electron-App duerfen nicht die lokale Editor-Ansicht ersetzen. Der GitHub-Link wird deshalb ueber `setWindowOpenHandler` abgefangen und mit `shell.openExternal` im Standardbrowser geoeffnet.
- Startargumente fuer die Electron-EXE muessen im Main-Prozess verarbeitet werden, damit der Renderer keinen direkten Dateisystemzugriff bekommt. Die Datei wird ueber IPC an den Renderer uebergeben und bleibt als aktueller Speicherpfad erhalten.
- Die neue Versionierung nutzt SemVer-kompatible Hauptversionen wie `2.0.0`, zeigt nach aussen aber Version `2`. Der GitHub-Workflow erhoeht bei normalen Pushes auf `main` automatisch die Hauptversion.
- Das Scrollproblem in kleineren Fenstern lag an `min-height`-basierten Grid-Bereichen. Root, App-Shell, Workspace und Pane-Inhalte nutzen nun echte begrenzte Hoehen mit `minmax(0, 1fr)`, sodass Editor und Vorschau intern scrollen.
- Die experimentelle Go-Variante wurde wieder entfernt. Der aktuelle Projektstand fokussiert sich wieder auf Web-App und Electron-Desktop-App.
- PDF- und DOCX-Export benoetigen groessere Browser-Bibliotheken. Sie werden deshalb dynamisch geladen, damit der normale Editor-Start klein und schnell bleibt.
- DOCX ist kein HTML-Container. Der Export bildet die wichtigsten Markdown-Strukturen gezielt auf Word-Elemente ab; komplexe HTML-Sonderfaelle koennen im DOCX vereinfacht dargestellt werden.
- `npm audit` meldete fuer `jspdf` bis einschliesslich Version 4.2.0 eine kritische Luecke (u. a. Path Traversal, PDF-Injection). Die Abhaengigkeit wurde auf `4.2.1` angehoben, danach meldet `npm audit` keine Schwachstellen mehr.
- Der Electron-Build nutzt `MDEC_ELECTRON=1`, damit Vite einen relativen `base` (`./`) statt `/mdEC/` setzt. So laedt die App auch aus dem Dateisystem (`file://`) korrekt; der Web-Build bleibt bei `/mdEC/` fuer GitHub Pages.
- PDF und DOCX werden im Renderer aus dem bereits durch DOMPurify bereinigten Vorschau-HTML erzeugt. Das HTML wird per `DOMParser` strukturiert durchlaufen, sodass kein separater, ungesicherter Render-Pfad entsteht.
- Eine zweite Electron-Instanz mit Datei-Argument wuerde sonst ein zweites Fenster oeffnen. Mit `requestSingleInstanceLock` und `second-instance` wird die Datei stattdessen an das bestehende Fenster durchgereicht.
- Die Vorschau sprang beim Formatieren und beim Tippen nach oben, weil `dangerouslySetInnerHTML` das innerHTML komplett ersetzt und der Browser dabei `scrollTop` des Containers auf 0 setzt. Loesung: Die Vorschau wird nach jeder Inhaltsaenderung per `useLayoutEffect` wieder an die relative Editor-Scrollposition ausgerichtet; zusaetzlich bleibt bei Toolbar-Aktionen die Editor-Scrollposition erhalten.
- Das synchrone Scrollen ist bewusst einseitig (Editor steuert die Vorschau). Beidseitiges Sync wuerde leicht Rueckkopplungs-Spruenge erzeugen, weil das programmatische Setzen von `scrollTop` selbst wieder Scroll-Events ausloest.
- Die Beenden-Nachfrage muss im Main-Prozess entschieden werden, der Renderer hat keinen direkten Dateizugriff. Der Renderer meldet seinen Zustand (`dirty`, Name, Inhalt, Pfad) per IPC (`updateState`); der Main-Prozess faengt das `close`-Event ab, zeigt einen `showMessageBoxSync`-Dialog und schliesst das Fenster erst nach der Entscheidung (mit einem `allowClose`-Flag, um keine Endlosschleife auszuloesen).

## Entscheidungen

- Vite und React wurden gewählt, weil die UI-Zustände für Editor, Vorschau, Dateiaktionen und Theme damit gut wartbar bleiben.
- Die App ist komplett clientseitig. Es gibt kein Backend und keine serverseitige Speicherung.
- Browserdaten werden nur lokal per `localStorage` gesichert.
- Exportdateien werden aus der bereinigten Markdown-Vorschau erzeugt. HTML bewahrt das Vorschau-Layout, PDF erzeugt ein A4-Dokument, DOCX nutzt native Word-Strukturen.
- Die fruehere Seite-an-Seite-Ansicht wurde durch eine Einzelansicht ersetzt: im selben Fenster ist entweder die Vorschau (Standard) oder der Markdown-Code sichtbar. Ein `mode`-State (`'edit' | 'preview'`) steuert die Ansicht; Klick in die Vorschau wechselt zum Code, der Augen-/Stift-Button schaltet um, und nach dem Speichern/Herunterladen erscheint wieder die Vorschau.
- Mit der Einzelansicht entfaellt das synchrone Mitscrollen, da Editor und Vorschau nie gleichzeitig sichtbar sind. Der Scroll-Erhalt bei Toolbar-Aktionen bleibt fuer den Editor-Modus erhalten.

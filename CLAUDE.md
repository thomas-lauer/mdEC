# mdEC Konzept

## Ziel

mdEC ist ein schlanker Markdown Editor, der direkt über GitHub Pages läuft. Nutzer können Markdown schreiben, hochladen, ansehen und herunterladen, ohne ein Konto oder Backend zu benötigen.

## Produktidee

Die App übernimmt das fokussierte Editor-Prinzip von Polypost: eine klare Kopfzeile und ein einzelner, ruhiger Arbeitsbereich. Statt Editor und Vorschau gleichzeitig zu zeigen, blendet mdEC im selben Fenster genau eine Ansicht ein: standardmäßig die gerenderte Vorschau, auf Klick den Markdown-Code. Für mdEC steht nicht Multi-Platform-Posting im Mittelpunkt, sondern das schnelle Bearbeiten von Markdown-Dokumenten.

## Zielgruppe

- Personen, die schnell Markdown-Dateien schreiben oder pruefen wollen
- Nutzer, die eine einfache GitHub-Pages-App ohne Backend bevorzugen
- Autoren technischer Notizen, README-Dateien und kleiner Dokumentationen

## Kernfunktionen

- Markdown-Editor mit grosser Schreibflaeche
- Live-Vorschau mit GitHub-Flavored Markdown
- Einzelansicht: zeigt im selben Fenster entweder die Vorschau (Standard) oder den Markdown-Code
- Klick in die Vorschau wechselt zum Markdown-Code und setzt den Cursor an der passenden Quell-Stelle (bis hin zu einzelnen Listenpunkten und Tabellenzeilen)
- Rechtsklick im Markdown-Code wechselt zurück zur Vorschau; nach dem Speichern erscheint wieder die Vorschau
- Symbolleiste für schnelle Standardformatierungen
- Upload vorhandener Markdown-Dateien
- Download des aktuellen Dokuments
- Export der gerenderten Vorschau als HTML, PDF und DOCX
- Editierbarer Dateiname
- Helles und dunkles Design
- Lokale Zwischenspeicherung im Browser

## Architektur

- Framework: Vite mit React und TypeScript
- Markdown: `marked` mit GFM-Unterstuetzung
- Sicherheit: HTML-Sanitizing durch `dompurify`
- Export: HTML als Standalone-Datei, PDF mit `jspdf`, DOCX mit `docx`
- Icons: `lucide-react`
- Desktop: Electron mit isoliertem Preload-Skript und IPC fuer Dateioperationen
- Deployment: GitHub Actions mit `actions/deploy-pages`
- Hosting: GitHub Pages unter `/mdEC/`

## Datenschutz

Die App verarbeitet Dateien ausschließlich im Browser. Upload bedeutet in diesem Kontext nur das lokale Einlesen einer Datei in die Web-App. Export bedeutet das lokale Erzeugen einer Datei aus der gerenderten, bereinigten Vorschau. Es werden keine Inhalte an einen Server gesendet.

In der Electron-Variante laufen Dateioperationen ueber den Main-Prozess. Der Renderer erhaelt nur die eng begrenzte Preload-API `mdECApi` fuer `openFile`, `saveFile`, `saveFileAs`, `updateState`, Startdateien und Menue-Kommandos. Die Exportfunktionen bleiben Renderer-seitig und werden nur per Menue-Kommandos ausgeloest. `nodeIntegration` bleibt deaktiviert und `contextIsolation` bleibt aktiviert.

Beim Start kann der EXE eine `.md`- oder `.markdown`-Datei als Argument uebergeben werden. Der Main-Prozess liest diese Datei ein, uebergibt Inhalt und Pfad an den Renderer und nutzt denselben Pfad spaeter fuer `Speichern`.

Beim Beenden fragt die Desktop-App bei ungespeicherten Aenderungen nach, ob die Datei gespeichert werden soll. Dafuer meldet der Renderer seinen Zustand (`dirty`, Dateiname, Inhalt, Pfad) per `updateState` an den Main-Prozess. Dieser faengt das `close`-Event des Fensters ab und zeigt einen Dialog mit `Speichern`, `Nicht speichern` und `Abbrechen`; beim Speichern ohne bekannten Pfad oeffnet sich der `Speichern unter`-Dialog.

Die App-Version wird als numerische Hauptversion gefuehrt. Version 2 ist der Startpunkt fuer diese Versionierung. Bei normalen Pushes auf `main` erhoeht `.github/workflows/version.yml` die Hauptversion automatisch um `+1`; Commits mit `[skip version]` sind ausgenommen.

## Design

Die Oberfläche ist arbeitsorientiert, dicht und ruhig. Die wichtigsten Aktionen liegen in der Kopfzeile: Datei hochladen, speichern oder herunterladen, Export, Beispiel zurücksetzen, Ansicht umschalten, Theme wechseln und GitHub öffnen. Es ist immer nur eine Ansicht sichtbar: die gerenderte Vorschau als ruhige Standardansicht oder der Markdown-Code mit der Formatierungs-Symbolleiste direkt über der Schreibfläche. Der Wechsel erfolgt per Klick in die Vorschau (der Cursor landet an der zugehörigen Quell-Stelle), per Rechtsklick im Markdown-Code (zurück zur Vorschau), über den Augen-/Stift-Button in der Kopfzeile oder automatisch nach dem Speichern.

## Erweiterungsideen

- Drag-and-drop Upload
- Such- und Ersetzen-Funktion

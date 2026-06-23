# mdEC - Markdown Editor

mdEC ist ein deutschsprachiger, rein clientseitiger Markdown Editor als Web Application. Die App ist für GitHub Pages vorbereitet und bietet einen Editor-Bereich, eine Live-Vorschau und einfache Dateiaktionen für Markdown-Dateien.

## Funktionen

- Live-Vorschau für GitHub-Flavored Markdown
- Vorschau kann ein- und ausgeblendet werden
- Symbolleiste für schnelle Markdown-Formatierungen
- Upload von `.md` und `.markdown` Dateien
- Download des aktuellen Inhalts als Markdown-Datei
- Export als HTML, PDF und DOCX
- Electron-Variante für Windows mit direktem Datei-Öffnen und Speichern
- Dateiname direkt in der Kopfzeile editierbar
- Helles und dunkles Design
- Automatische lokale Zwischenspeicherung im Browser
- GitHub-Link direkt in der Kopfzeile

## Symbolleiste

Die Editor-Symbolleiste fügt Standardformatierungen direkt an der Cursorposition ein oder wendet sie auf markierten Text an. Unterstützt werden Fett, Kursiv, Unterstrichen, Link, Überschriften, Aufzählungen, nummerierte Listen, Zitate, Inline-Code, Codeblöcke, Tabellen und Trennlinien.

## Export

mdEC kann die aktuelle Vorschau in drei Formate exportieren:

- `HTML`: vollständige Standalone-Datei mit eingebettetem Layout
- `PDF`: A4-PDF aus der gerenderten Dokumentstruktur
- `DOCX`: Word-Datei mit Überschriften, Absätzen, Listen, Zitaten, Code und einfachen Tabellen

Die Exportfunktionen laufen clientseitig im Browser. In der Electron-Variante sind sie zusätzlich über `Datei > Exportieren` erreichbar.

## Entwicklung

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Electron für Windows

Die Electron-Variante greift direkt auf lokale Dateien zu. Im Desktop-Modus werden die Schaltflächen zu `Öffnen`, `Speichern` und `Speichern unter`; zusätzlich gibt es ein natives Datei-Menü mit `Strg+O`, `Strg+S` und `Strg+Umschalt+S`.

Eine Markdown-Datei kann auch direkt beim Start übergeben werden:

```bash
mdEC.exe "C:\Pfad\zur\datei.md"
```

Die Datei wird beim Start geöffnet. `Speichern` schreibt danach wieder an denselben Pfad.

```bash
npm run electron:dev
```

Eine entpackte Windows-App wird mit folgendem Befehl erstellt:

```bash
npm run electron:pack
```

Danach liegt die startbare App unter `release/win-unpacked/mdEC.exe`. Installer und portable EXE werden mit folgendem Befehl erzeugt:

```bash
npm run electron:dist
```

Die Release-Dateien enthalten bewusst keine Versionsnummer im Dateinamen:

- `release/mdEC Setup.exe`
- `release/mdEC.exe`

## Versionierung

Die App nutzt eine numerische Hauptversion. Dieser Stand startet bei Version `2`. Bei jedem normalen Push auf `main` erhöht der Workflow `.github/workflows/version.yml` die Version in `package.json` und `package-lock.json` automatisch um `+1`.

## Deployment

Das Projekt enthält einen GitHub-Actions-Workflow unter `.github/workflows/pages.yml`. Bei jedem Push auf `main` wird die App gebaut und per GitHub Pages veröffentlicht.

Die Vite-Konfiguration nutzt `base: '/mdEC/'`, damit die App korrekt unter `https://thomas-lauer.github.io/mdEC/` läuft.

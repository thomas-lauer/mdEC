// Standalone-HTML-Export: erzeugt aus dem bereits gerenderten, bereinigten
// Vorschau-HTML eine eigenstaendige Datei mit eingebettetem Layout.

const STYLE = `
:root { color-scheme: light; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #1f2328;
  background: #ffffff;
  max-width: 860px;
  margin: 0 auto;
  padding: 48px 24px;
}
h1, h2, h3, h4 { line-height: 1.25; margin-top: 1.6em; }
h1 { border-bottom: 1px solid #d0d7de; padding-bottom: .3em; }
h2 { border-bottom: 1px solid #d0d7de; padding-bottom: .3em; }
code {
  background: #f6f8fa;
  border-radius: 6px;
  padding: .2em .4em;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: .9em;
}
pre {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
}
pre code { background: none; padding: 0; }
blockquote {
  border-left: .25em solid #d0d7de;
  color: #57606a;
  margin: 0;
  padding: 0 1em;
}
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #d0d7de; padding: 6px 13px; }
th { background: #f6f8fa; }
img { max-width: 100%; }
a { color: #0969da; }
hr { border: none; border-top: 1px solid #d0d7de; margin: 24px 0; }
`

export function exportHtml(renderedHtml: string, fileName: string): void {
  const title = fileName.replace(/\.(md|markdown)$/i, '') || 'Dokument'
  const doc = `<!doctype html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>${STYLE}</style>
</head>
<body>
${renderedHtml}
</body>
</html>
`
  const blob = new Blob([doc], { type: 'text/html;charset=utf-8' })
  downloadBlob(blob, `${title}.html`)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

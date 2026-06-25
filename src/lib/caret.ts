// Hilfsfunktionen, um in einer Textarea zu einer Quell-Zeile zu navigieren.

/** Zeichen-Index des Anfangs der angegebenen (0-basierten) Zeile. */
export function lineStartIndex(text: string, line: number): number {
  if (line <= 0) return 0
  const parts = text.split('\n')
  let index = 0
  for (let i = 0; i < line && i < parts.length; i++) {
    index += parts[i].length + 1 // +1 fuer das Zeilenumbruch-Zeichen
  }
  return Math.min(index, text.length)
}

// Stil-Eigenschaften, die das Umbruchverhalten und damit die Hoehe bestimmen.
const MIRROR_STYLE_PROPS = [
  'boxSizing',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'lineHeight',
  'letterSpacing',
  'textTransform',
  'wordSpacing',
  'tabSize',
] as const

/**
 * Vertikaler Pixel-Offset des Zeichens an `index` innerhalb der Textarea.
 * Misst ueber ein unsichtbares Spiegel-Element mit identischem Umbruch.
 */
function caretTop(textarea: HTMLTextAreaElement, index: number): number {
  const cs = getComputedStyle(textarea)
  const mirror = document.createElement('div')
  const style = mirror.style
  for (const prop of MIRROR_STYLE_PROPS) {
    style[prop] = cs[prop]
  }
  style.position = 'absolute'
  style.visibility = 'hidden'
  style.whiteSpace = 'pre-wrap'
  style.wordWrap = 'break-word'
  style.overflow = 'hidden'
  style.height = 'auto'
  style.left = '-9999px'
  style.top = '0'
  style.width = `${textarea.clientWidth}px`

  mirror.textContent = textarea.value.slice(0, index)
  const marker = document.createElement('span')
  marker.textContent = '​' // Nullbreiten-Zeichen als Messpunkt
  mirror.appendChild(marker)

  document.body.appendChild(mirror)
  const top = marker.offsetTop
  document.body.removeChild(mirror)
  return top
}

/** Scrollt die Textarea so, dass die Position grob ins obere Drittel rueckt. */
export function scrollTextareaToIndex(textarea: HTMLTextAreaElement, index: number): void {
  const top = caretTop(textarea, index)
  const target = top - textarea.clientHeight / 3
  textarea.scrollTop = Math.max(0, target)
}

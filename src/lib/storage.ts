import type { Theme } from '../types'

// Lokale Zwischenspeicherung im Browser. Es werden ausschließlich
// localStorage-Schlüssel genutzt; keine Server-Kommunikation.
const KEY_CONTENT = 'mdec:content'
const KEY_FILENAME = 'mdec:filename'
const KEY_THEME = 'mdec:theme'

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // localStorage kann blockiert sein (privater Modus o. Ä.) - still ignorieren.
  }
}

export function loadContent(fallback: string): string {
  return safeGet(KEY_CONTENT) ?? fallback
}

export function saveContent(content: string): void {
  safeSet(KEY_CONTENT, content)
}

export function loadFileName(fallback: string): string {
  return safeGet(KEY_FILENAME) ?? fallback
}

export function saveFileName(name: string): void {
  safeSet(KEY_FILENAME, name)
}

export function loadTheme(): Theme {
  const stored = safeGet(KEY_THEME)
  if (stored === 'light' || stored === 'dark') return stored
  // System-Präferenz als Default.
  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function saveTheme(theme: Theme): void {
  safeSet(KEY_THEME, theme)
}

import type { Theme } from '@/domain'

const CACHE_KEY = 'wrkout.theme'
const THEME_COLORS = { dark: '#0b0d10', light: '#f5f6f8' } as const

type ResolvedTheme = keyof typeof THEME_COLORS

function resolve(theme: Theme): ResolvedTheme {
  if (theme !== 'system') {
    return theme
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/** Applies the theme to the document and remembers it for the next cold start. */
export function applyTheme(theme: Theme): void {
  const resolved = resolve(theme)
  document.documentElement.dataset.theme = resolved
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLORS[resolved])
  try {
    localStorage.setItem(CACHE_KEY, theme)
  } catch {
    // Storage can be unavailable (private mode); the theme still applies.
  }
}

/**
 * Settings live in IndexedDB and load asynchronously. The last theme is
 * mirrored in localStorage so the first paint already uses it.
 */
export function applyCachedTheme(): void {
  const cached = readCachedTheme()
  if (cached === 'dark' || cached === 'light' || cached === 'system') {
    applyTheme(cached)
  }
}

function readCachedTheme(): string | null {
  try {
    return localStorage.getItem(CACHE_KEY)
  } catch {
    return null
  }
}

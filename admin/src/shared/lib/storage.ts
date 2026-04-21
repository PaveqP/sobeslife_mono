/** Только админ-панель (JWT aud=admin). Другой origin/port → отдельное localStorage от web. */
const ACCESS_TOKEN_KEY = 'sobeslife.admin.accessToken'
const THEME_KEY = 'sobeslife.admin.theme'

const isBrowser = typeof window !== 'undefined'

export type PersistedTheme = 'light' | 'dark'

export const tokenStorage = {
  getAccessToken: () => (isBrowser ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null),
  setToken: (accessToken: string) => {
    if (!isBrowser) return
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  },
  clear: () => {
    if (!isBrowser) return
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  },
}

export const themeStorage = {
  getTheme: (): PersistedTheme | null => {
    if (!isBrowser) return null
    const value = window.localStorage.getItem(THEME_KEY)
    return value === 'light' || value === 'dark' ? value : null
  },
  setTheme: (theme: PersistedTheme) => {
    if (!isBrowser) return
    window.localStorage.setItem(THEME_KEY, theme)
  },
}

const ACCESS_TOKEN_KEY = 'sobeslife.accessToken'
const REFRESH_TOKEN_KEY = 'sobeslife.refreshToken'
const THEME_KEY = 'sobeslife.theme'

const isBrowser = typeof window !== 'undefined'

export type PersistedTheme = 'light' | 'dark'

export const tokenStorage = {
  getAccessToken: () => (isBrowser ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null),
  getRefreshToken: () => (isBrowser ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null),
  setTokens: (accessToken: string, refreshToken: string) => {
    if (!isBrowser) return
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  clear: () => {
    if (!isBrowser) return
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
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

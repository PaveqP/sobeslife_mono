import * as SecureStore from 'expo-secure-store'

const ACCESS_TOKEN_KEY = 'sobeslife.accessToken'
const REFRESH_TOKEN_KEY = 'sobeslife.refreshToken'
const THEME_KEY = 'sobeslife.theme'

export type PersistedTheme = 'light' | 'dark'

export const tokenStorage = {
  async getTokens() {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ])

    return {
      accessToken,
      refreshToken,
    }
  },
  async setTokens(accessToken: string, refreshToken: string) {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ])
  },
  async clear() {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ])
  },
}

export const themeStorage = {
  async getTheme(): Promise<PersistedTheme | null> {
    const theme = await SecureStore.getItemAsync(THEME_KEY)
    return theme === 'light' || theme === 'dark' ? theme : null
  },
  async setTheme(theme: PersistedTheme) {
    await SecureStore.setItemAsync(THEME_KEY, theme)
  },
}

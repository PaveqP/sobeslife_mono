import * as SecureStore from 'expo-secure-store'

const ACCESS_TOKEN_KEY = 'sobeslife.accessToken'
const REFRESH_TOKEN_KEY = 'sobeslife.refreshToken'
const THEME_KEY = 'sobeslife.theme'

const GOOGLE_STATE_KEY = 'sobeslife.oauth.google.state'
const GOOGLE_CODE_VERIFIER_KEY = 'sobeslife.oauth.google.codeVerifier'
const GITHUB_STATE_KEY = 'sobeslife.oauth.github.state'

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

export const oauthSessionStorage = {
  async setGoogleSession(state: string, codeVerifier: string) {
    await Promise.all([
      SecureStore.setItemAsync(GOOGLE_STATE_KEY, state),
      SecureStore.setItemAsync(GOOGLE_CODE_VERIFIER_KEY, codeVerifier),
    ])
  },
  getGoogleState: () => SecureStore.getItemAsync(GOOGLE_STATE_KEY),
  getGoogleCodeVerifier: () => SecureStore.getItemAsync(GOOGLE_CODE_VERIFIER_KEY),
  async clearGoogleSession() {
    await Promise.all([
      SecureStore.deleteItemAsync(GOOGLE_STATE_KEY),
      SecureStore.deleteItemAsync(GOOGLE_CODE_VERIFIER_KEY),
    ])
  },
  setGithubState: (state: string) => SecureStore.setItemAsync(GITHUB_STATE_KEY, state),
  getGithubState: () => SecureStore.getItemAsync(GITHUB_STATE_KEY),
  clearGithubState: () => SecureStore.deleteItemAsync(GITHUB_STATE_KEY),
}

import { Platform } from 'react-native'

const fallbackApiUrl = Platform.select({
  android: 'http://10.0.2.2:8080',
  ios: 'http://localhost:8080',
  default: 'http://localhost:8080',
})

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? fallbackApiUrl

/** Должны совпадать с OAUTH_*_REDIRECT_URI на бэкенде (как у web). */
export const OAUTH_GOOGLE_REDIRECT_URI =
  process.env.EXPO_PUBLIC_OAUTH_GOOGLE_REDIRECT_URI ?? 'http://localhost:5173/auth/google'

export const OAUTH_GITHUB_REDIRECT_URI =
  process.env.EXPO_PUBLIC_OAUTH_GITHUB_REDIRECT_URI ?? 'http://localhost:5173/auth/github'

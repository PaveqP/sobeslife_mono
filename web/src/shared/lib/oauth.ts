const GOOGLE_STATE_KEY = 'sobeslife.google.state'
const GOOGLE_CODE_VERIFIER_KEY = 'sobeslife.google.codeVerifier'

const isBrowser = typeof window !== 'undefined'

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

const generateRandomString = (byteLength: number) => {
  const bytes = new Uint8Array(byteLength)
  window.crypto.getRandomValues(bytes)
  return toBase64Url(bytes)
}

const createCodeChallenge = async (codeVerifier: string) => {
  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
  return toBase64Url(new Uint8Array(digest))
}

export const prepareGoogleOauthSession = async () => {
  if (!isBrowser) {
    throw new Error('Google OAuth is only available in the browser')
  }

  const state = generateRandomString(24)
  const codeVerifier = generateRandomString(64)
  const codeChallenge = await createCodeChallenge(codeVerifier)

  window.sessionStorage.setItem(GOOGLE_STATE_KEY, state)
  window.sessionStorage.setItem(GOOGLE_CODE_VERIFIER_KEY, codeVerifier)

  return { state, codeChallenge }
}

export const getStoredGoogleOauthState = () => (isBrowser ? window.sessionStorage.getItem(GOOGLE_STATE_KEY) : null)

export const getStoredGoogleCodeVerifier = () =>
  isBrowser ? window.sessionStorage.getItem(GOOGLE_CODE_VERIFIER_KEY) : null

export const clearGoogleOauthSession = () => {
  if (!isBrowser) return
  window.sessionStorage.removeItem(GOOGLE_STATE_KEY)
  window.sessionStorage.removeItem(GOOGLE_CODE_VERIFIER_KEY)
}

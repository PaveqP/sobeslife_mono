const STATE_KEY = 'github_oauth_state'

function generateState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function prepareGithubOauthSession(): string {
  const state = generateState()
  sessionStorage.setItem(STATE_KEY, state)
  return state
}

export function getStoredGithubOauthState(): string | null {
  return sessionStorage.getItem(STATE_KEY)
}

export function clearGithubOauthSession(): void {
  sessionStorage.removeItem(STATE_KEY)
}

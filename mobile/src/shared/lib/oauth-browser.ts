import * as WebBrowser from 'expo-web-browser'

export type OAuthRedirectParams = {
  code: string | null
  state: string | null
  error: string | null
}

export const parseOAuthRedirectUrl = (url: string): OAuthRedirectParams => {
  const parsed = new URL(url)
  return {
    code: parsed.searchParams.get('code'),
    state: parsed.searchParams.get('state'),
    error: parsed.searchParams.get('error'),
  }
}

export const openOAuthBrowserSession = async (
  authUrl: string,
  redirectUri: string,
): Promise<OAuthRedirectParams | null> => {
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)

  if (result.type !== 'success' || !result.url) {
    return null
  }

  return parseOAuthRedirectUrl(result.url)
}

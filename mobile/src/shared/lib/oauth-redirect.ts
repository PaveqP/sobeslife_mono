import * as AuthSession from 'expo-auth-session'

/** Redirect URI for Google OAuth (Expo Go → exp://…; dev build → sobeslife://…). */
export const getGoogleOAuthRedirectUri = () =>
  AuthSession.makeRedirectUri({
    scheme: 'sobeslife',
    path: 'auth/google',
  })

/** Redirect URI for GitHub OAuth. */
export const getGithubOAuthRedirectUri = () =>
  AuthSession.makeRedirectUri({
    scheme: 'sobeslife',
    path: 'auth/github',
  })

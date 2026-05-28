import { baseApi } from './base-api'
import type {
  AuthTokens,
  GithubAuthCallbackRequest,
  GithubAuthUrlRequest,
  GoogleAuthCallbackRequest,
  GoogleAuthUrlRequest,
  OTPSendRequest,
  OTPVerifyRequest,
} from './types'

function tokensFromAuthResponse(response: unknown): AuthTokens {
  const r = response as Record<string, string | undefined>
  const accessToken =
    r.accessToken ?? r.AccessToken ?? (r as { access_token?: string }).access_token
  const refreshToken =
    r.refreshToken ?? r.RefreshToken ?? (r as { refresh_token?: string }).refresh_token
  if (!accessToken || !refreshToken) {
    throw new Error('Auth response missing accessToken or refreshToken')
  }
  return { accessToken, refreshToken }
}

function oauthUrlFromResponse(response: unknown): string {
  if (typeof response === 'string' && response.trim()) {
    return response
  }
  if (response && typeof response === 'object') {
    const record = response as Record<string, unknown>
    if (typeof record.url === 'string') {
      return record.url
    }
  }
  throw new Error('OAuth URL missing in response')
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendOTP: build.mutation<{ message: string }, OTPSendRequest>({
      query: (body) => ({
        url: '/auth/otp/send',
        method: 'POST',
        body,
      }),
    }),
    verifyOTP: build.mutation<AuthTokens, OTPVerifyRequest>({
      query: (body) => ({
        url: '/auth/otp/verify',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown): AuthTokens => tokensFromAuthResponse(response),
      invalidatesTags: ['Auth', 'UserProfile'],
    }),
    startGoogleAuth: build.mutation<string, GoogleAuthUrlRequest>({
      query: ({ state, codeChallenge, redirectUri }) => ({
        url: '/auth/google/url',
        method: 'GET',
        params: {
          state,
          code_challenge: codeChallenge,
          redirect_uri: redirectUri,
        },
      }),
      transformResponse: (response: unknown): string => oauthUrlFromResponse(response),
    }),
    googleCallback: build.mutation<AuthTokens, GoogleAuthCallbackRequest>({
      query: (body) => ({
        url: '/auth/google/callback',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown): AuthTokens => tokensFromAuthResponse(response),
      invalidatesTags: ['Auth', 'UserProfile'],
    }),
    startGithubAuth: build.mutation<string, GithubAuthUrlRequest>({
      query: ({ state, redirectUri }) => ({
        url: '/auth/github/url',
        method: 'GET',
        params: {
          state,
          redirect_uri: redirectUri,
        },
      }),
      transformResponse: (response: unknown): string => oauthUrlFromResponse(response),
    }),
    githubCallback: build.mutation<AuthTokens, GithubAuthCallbackRequest>({
      query: (body) => ({
        url: '/auth/github/callback',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown): AuthTokens => tokensFromAuthResponse(response),
      invalidatesTags: ['Auth', 'UserProfile'],
    }),
  }),
})

export const {
  useGoogleCallbackMutation,
  useStartGoogleAuthMutation,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useStartGithubAuthMutation,
  useGithubCallbackMutation,
} = authApi

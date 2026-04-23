import { baseApi } from '@/shared/api/base-api'
import type {
  AuthTokens,
  GithubAuthCallbackRequest,
  GithubAuthUrlRequest,
  GoogleAuthCallbackRequest,
  GoogleAuthUrlRequest,
  OTPSendRequest,
  OTPVerifyRequest,
} from '@/shared/api/types'

/** Бэкенд отдаёт camelCase (json-теги); без тегов Go шлёт PascalCase — поддерживаем оба варианта. */
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

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Email OTP
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
      invalidatesTags: ['Auth'],
    }),
    // Google OAuth
    startGoogleAuth: build.mutation<string, GoogleAuthUrlRequest>({
      query: ({ state, codeChallenge }) => ({
        url: '/auth/google/url',
        method: 'GET',
        params: {
          state,
          code_challenge: codeChallenge,
        },
      }),
    }),
    googleCallback: build.mutation<AuthTokens, GoogleAuthCallbackRequest>({
      query: (body) => ({
        url: '/auth/google/callback',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown): AuthTokens => tokensFromAuthResponse(response),
      invalidatesTags: ['Auth'],
    }),
    // GitHub OAuth
    startGithubAuth: build.mutation<string, GithubAuthUrlRequest>({
      query: ({ state }) => ({
        url: '/auth/github/url',
        method: 'GET',
        params: { state },
      }),
    }),
    githubCallback: build.mutation<AuthTokens, GithubAuthCallbackRequest>({
      query: (body) => ({
        url: '/auth/github/callback',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown): AuthTokens => tokensFromAuthResponse(response),
      invalidatesTags: ['Auth'],
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

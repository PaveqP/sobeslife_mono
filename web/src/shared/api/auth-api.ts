import { baseApi } from '@/shared/api/base-api'
import type { AuthTokens, GoogleAuthCallbackRequest, GoogleAuthUrlRequest, SignInRequest, SignUpRequest } from '@/shared/api/types'

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
    signIn: build.mutation<AuthTokens, SignInRequest>({
      query: (body) => ({
        url: '/auth/sign-in',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown): AuthTokens => tokensFromAuthResponse(response),
      invalidatesTags: ['Auth'],
    }),
    signUp: build.mutation<string, SignUpRequest>({
      query: (body) => ({
        url: '/auth/sign-up',
        method: 'POST',
        body,
      }),
    }),
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
  }),
})

export const { useGoogleCallbackMutation, useSignInMutation, useSignUpMutation, useStartGoogleAuthMutation } = authApi

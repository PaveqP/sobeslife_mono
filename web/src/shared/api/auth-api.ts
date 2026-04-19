import { baseApi } from '@/shared/api/base-api'
import type { AuthTokens, GoogleAuthCallbackRequest, GoogleAuthUrlRequest, SignInRequest, SignUpRequest } from '@/shared/api/types'

type ServerTokens = {
  AccessToken: string
  RefreshToken: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    signIn: build.mutation<AuthTokens, SignInRequest>({
      query: (body) => ({
        url: '/auth/sign-in',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ServerTokens): AuthTokens => ({
        accessToken: response.AccessToken,
        refreshToken: response.RefreshToken,
      }),
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
      transformResponse: (response: ServerTokens): AuthTokens => ({
        accessToken: response.AccessToken,
        refreshToken: response.RefreshToken,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
})

export const { useGoogleCallbackMutation, useSignInMutation, useSignUpMutation, useStartGoogleAuthMutation } = authApi

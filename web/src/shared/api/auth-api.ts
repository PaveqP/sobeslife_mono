import { baseApi } from '@/shared/api/base-api'
import type { AuthTokens, SignInRequest, SignUpRequest } from '@/shared/api/types'

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
  }),
})

export const { useSignInMutation, useSignUpMutation } = authApi

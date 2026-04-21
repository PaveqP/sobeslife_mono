import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { FetchArgs } from '@reduxjs/toolkit/query'
import { tokenStorage } from '@/shared/lib/storage'
import { clearCredentials } from '@/features/auth/auth-slice'

const rawBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function requestUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url
}

/** 401 при вводе пароля на /auth/* не должен сбрасывать уже сохранённую сессию другого сценария. */
function isWebPublicAuthRequest(url: string): boolean {
  return (
    url.includes('/auth/sign-in') ||
    url.includes('/auth/sign-up') ||
    url.includes('/auth/google/callback')
  )
}

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: async (args, api, extraOptions) => {
    const result = await fetchBaseQuery({
      baseUrl: rawBaseUrl,
      prepareHeaders: (headers) => {
        const accessToken = tokenStorage.getAccessToken()

        if (accessToken) {
          headers.set('Authorization', `Bearer ${accessToken}`)
        }

        return headers
      },
    })(args, api, extraOptions)

    if (result.error?.status === 401 && !isWebPublicAuthRequest(requestUrl(args))) {
      api.dispatch(clearCredentials())
    }

    return result
  },
  tagTypes: ['Auth', 'Tests', 'Lookups', 'Interviews', 'UserProfile'],
  endpoints: () => ({}),
})

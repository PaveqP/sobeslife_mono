import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { tokenStorage } from '@/shared/lib/storage'
import { clearCredentials } from '@/features/auth/auth-slice'

const rawBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

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

    if (result.error?.status === 401) {
      api.dispatch(clearCredentials())
    }

    return result
  },
  tagTypes: ['Auth', 'Tests', 'Lookups'],
  endpoints: () => ({}),
})

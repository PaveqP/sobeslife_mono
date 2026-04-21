import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { FetchArgs } from '@reduxjs/toolkit/query'
import { tokenStorage } from '@/shared/lib/storage'
import { clearCredentials } from '@/features/auth/auth-slice'

const rawBaseUrl = import.meta.env.VITE_ADMIN_API_URL ?? 'http://localhost:8080'

function requestUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url
}

function isAdminLoginRequest(url: string): boolean {
  return url.includes('/admin/auth/sign-in') || url.includes('/admin/auth/sign-up')
}

export const baseApi = createApi({
  reducerPath: 'adminBaseApi',
  baseQuery: async (args, api, extraOptions) => {
    const result = await fetchBaseQuery({
      baseUrl: rawBaseUrl,
      prepareHeaders: (headers) => {
        const token = tokenStorage.getAccessToken()
        if (token) headers.set('Authorization', `Bearer ${token}`)
        return headers
      },
    })(args, api, extraOptions)

    if (result.error?.status === 401 && !isAdminLoginRequest(requestUrl(args))) {
      api.dispatch(clearCredentials())
    }

    return result
  },
  tagTypes: ['AdminAuth', 'WebUsers', 'Tests', 'Interviews', 'Stats', 'Analytics', 'Admins', 'Questions'],
  endpoints: () => ({}),
})

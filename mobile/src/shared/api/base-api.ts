import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { signOut } from '../../features/auth/auth-slice'
import { API_URL } from '../config/env'
import type { RootState } from '../../app/store'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState
    const accessToken = state.auth.accessToken

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    return headers
  },
})

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions)

    if (result.error?.status === 401) {
      void api.dispatch(signOut())
    }

    return result
  },
  tagTypes: ['Auth', 'Tests', 'Lookups', 'Interviews'],
  endpoints: () => ({}),
})

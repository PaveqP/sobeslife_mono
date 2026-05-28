import { baseApi } from './base-api'
import type { TestsStatistics, UpdateUserProfileRequest, UserProfile } from './types'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<UserProfile, void>({
      query: () => '/api/users/me',
      providesTags: ['UserProfile'],
    }),
    updateProfile: build.mutation<UserProfile, UpdateUserProfileRequest>({
      query: (body) => ({
        url: '/api/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['UserProfile'],
    }),
    getTestsStatistics: build.query<TestsStatistics, void>({
      query: () => '/api/tests/statistics',
      providesTags: ['Tests'],
    }),
  }),
})

export const { useGetProfileQuery, useUpdateProfileMutation, useGetTestsStatisticsQuery } = usersApi

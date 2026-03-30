import { baseApi } from '@/shared/api/base-api'
import type {
  CheckAnswerRequest,
  CheckAnswerResponse,
  CompleteTestResponse,
  NamedEntity,
  TestDetails,
  TestListItem,
  TestListParams,
} from '@/shared/api/types'

export const testsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProfessions: build.query<NamedEntity[], void>({
      query: () => '/api/professions/',
      providesTags: ['Lookups'],
    }),
    getModules: build.query<NamedEntity[], string | undefined>({
      query: (profession) => ({
        url: '/api/modules/',
        params: profession ? { profession } : undefined,
      }),
      providesTags: ['Lookups'],
    }),
    getTechnologies: build.query<NamedEntity[], string | undefined>({
      query: (module) => ({
        url: '/api/technologies/',
        params: module ? { module } : undefined,
      }),
      providesTags: ['Lookups'],
    }),
    getTests: build.query<TestListItem[], TestListParams>({
      query: (params) => ({
        url: '/api/tests/',
        params,
      }),
      providesTags: ['Tests'],
    }),
    getTestById: build.query<TestDetails, number>({
      query: (id) => `/api/tests/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Tests', id }],
    }),
    startTest: build.mutation<void, number>({
      query: (id) => ({
        url: `/api/tests/${id}/start`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => ['Tests', { type: 'Tests', id }],
    }),
    checkAnswer: build.mutation<CheckAnswerResponse, CheckAnswerRequest>({
      query: ({ id, question_id, answer }) => ({
        url: `/api/tests/${id}/answer/check`,
        method: 'POST',
        body: {
          question_id: String(question_id),
          answer,
        },
      }),
      invalidatesTags: (_result, _error, { id }) => ['Tests', { type: 'Tests', id }],
    }),
    completeTest: build.mutation<CompleteTestResponse, number>({
      query: (id) => ({
        url: `/api/tests/${id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => ['Tests', { type: 'Tests', id }],
    }),
  }),
})

export const {
  useCheckAnswerMutation,
  useCompleteTestMutation,
  useGetModulesQuery,
  useGetProfessionsQuery,
  useGetTechnologiesQuery,
  useGetTestByIdQuery,
  useGetTestsQuery,
  useStartTestMutation,
} = testsApi

import { baseApi } from './base-api'
import type {
  AdminAnalytics,
  AdminAuthTokens,
  AdminListItem,
  AdminQuestion,
  AdminQuestionFilters,
  AdminSignInRequest,
  AdminSignUpRequest,
  AdminStats,
  AdminTestQuestion,
  CreateQuestionRequest,
  CreateTestRequest,
  CreateWebUserRequest,
  InterviewListItem,
  TestListItem,
  UpdateQuestionRequest,
  UpdateWebUserRequest,
  WebUser,
} from './types'

function adminTokensFromResponse(response: unknown): AdminAuthTokens {
  const r = response as Record<string, string | undefined>
  const accessToken = r.accessToken ?? r.AccessToken
  if (!accessToken) throw new Error('Admin auth response missing accessToken')
  return { accessToken }
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    signIn: build.mutation<AdminAuthTokens, AdminSignInRequest>({
      query: (body) => ({ url: '/admin/auth/sign-in', method: 'POST', body }),
      transformResponse: (r: unknown) => adminTokensFromResponse(r),
    }),
    signUp: build.mutation<AdminAuthTokens, AdminSignUpRequest>({
      query: (body) => ({ url: '/admin/auth/sign-up', method: 'POST', body }),
      transformResponse: (r: unknown) => adminTokensFromResponse(r),
    }),

    // Stats & Analytics
    getStats: build.query<AdminStats, void>({
      query: () => '/admin/api/stats',
      providesTags: ['Stats'],
    }),
    getAnalytics: build.query<AdminAnalytics, void>({
      query: () => '/admin/api/analytics',
      providesTags: ['Analytics'],
    }),

    // Admin management
    getAdmins: build.query<AdminListItem[], void>({
      query: () => '/admin/api/admins',
      providesTags: ['Admins'],
    }),
    createAdmin: build.mutation<AdminAuthTokens, AdminSignUpRequest>({
      query: (body) => ({ url: '/admin/auth/sign-up', method: 'POST', body }),
      transformResponse: (r: unknown) => adminTokensFromResponse(r),
      invalidatesTags: ['Admins'],
    }),
    deleteAdmin: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/api/admins/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admins'],
    }),

    // Web user management
    getWebUsers: build.query<WebUser[], void>({
      query: () => '/admin/api/users',
      providesTags: ['WebUsers'],
      transformResponse: (r: unknown) => (Array.isArray(r) ? r : []) as WebUser[],
    }),
    createWebUser: build.mutation<WebUser, CreateWebUserRequest>({
      query: (body) => ({ url: '/admin/api/users', method: 'POST', body }),
      invalidatesTags: ['WebUsers', 'Stats'],
    }),
    updateWebUser: build.mutation<WebUser, { id: number; body: UpdateWebUserRequest }>({
      query: ({ id, body }) => ({ url: `/admin/api/users/${id}`, method: 'PUT', body }),
      invalidatesTags: ['WebUsers'],
    }),
    deleteWebUser: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/api/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['WebUsers', 'Stats'],
    }),

    // Tests
    getTests: build.query<TestListItem[], void>({
      query: () => '/admin/api/tests',
      providesTags: ['Tests'],
      transformResponse: (r: unknown) => (Array.isArray(r) ? r : []) as TestListItem[],
    }),

    // Tests CRUD
    createTest: build.mutation<TestListItem, CreateTestRequest>({
      query: (body) => ({ url: '/admin/api/tests', method: 'POST', body }),
      invalidatesTags: ['Tests', 'Stats'],
    }),
    deleteTest: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/api/tests/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Tests', 'Stats'],
    }),
    getTestQuestions: build.query<AdminTestQuestion[], number>({
      query: (id) => `/admin/api/tests/${id}/questions`,
      providesTags: (_r, _e, id) => [{ type: 'Tests', id: `questions-${id}` }],
      transformResponse: (r: unknown) => (Array.isArray(r) ? r : []) as AdminTestQuestion[],
    }),
    addQuestionToTest: build.mutation<void, { testId: number; questionId: number }>({
      query: ({ testId, questionId }) => ({
        url: `/admin/api/tests/${testId}/questions`,
        method: 'POST',
        body: { question_id: questionId },
      }),
      invalidatesTags: (_r, _e, { testId }) => [{ type: 'Tests', id: `questions-${testId}` }, 'Tests'],
    }),
    removeQuestionFromTest: build.mutation<void, { testId: number; questionId: number }>({
      query: ({ testId, questionId }) => ({
        url: `/admin/api/tests/${testId}/questions/${questionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { testId }) => [{ type: 'Tests', id: `questions-${testId}` }, 'Tests'],
    }),

    // Questions CRUD
    getQuestions: build.query<AdminQuestion[], AdminQuestionFilters>({
      query: (filters) => ({ url: '/admin/api/questions', params: filters }),
      providesTags: ['Questions'],
      transformResponse: (r: unknown) => (Array.isArray(r) ? r : []) as AdminQuestion[],
    }),
    createQuestion: build.mutation<AdminQuestion, CreateQuestionRequest>({
      query: (body) => ({ url: '/admin/api/questions', method: 'POST', body }),
      invalidatesTags: ['Questions'],
    }),
    updateQuestion: build.mutation<AdminQuestion, { id: number; body: UpdateQuestionRequest }>({
      query: ({ id, body }) => ({ url: `/admin/api/questions/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Questions'],
    }),
    deleteQuestion: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/api/questions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Questions'],
    }),

    // Interviews
    getInterviews: build.query<InterviewListItem[], void>({
      query: () => '/admin/api/interviews',
      providesTags: ['Interviews'],
      transformResponse: (r: unknown) => (Array.isArray(r) ? r : []) as InterviewListItem[],
    }),
    deleteInterview: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/api/interviews/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Interviews', 'Stats'],
    }),
  }),
})

export const {
  useSignInMutation,
  useSignUpMutation,
  useGetStatsQuery,
  useGetAnalyticsQuery,
  useGetAdminsQuery,
  useCreateAdminMutation,
  useDeleteAdminMutation,
  useGetWebUsersQuery,
  useCreateWebUserMutation,
  useUpdateWebUserMutation,
  useDeleteWebUserMutation,
  useGetTestsQuery,
  useCreateTestMutation,
  useDeleteTestMutation,
  useGetTestQuestionsQuery,
  useAddQuestionToTestMutation,
  useRemoveQuestionFromTestMutation,
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetInterviewsQuery,
  useDeleteInterviewMutation,
} = adminApi

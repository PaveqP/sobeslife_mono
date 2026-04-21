import { describe, it, expect } from 'vitest'
import {
  adminApi,
  useSignInMutation,
  useSignUpMutation,
  useGetStatsQuery,
  useGetAnalyticsQuery,
  useGetAdminsQuery,
  useGetWebUsersQuery,
  useCreateWebUserMutation,
  useUpdateWebUserMutation,
  useDeleteWebUserMutation,
  useGetTestsQuery,
  useCreateTestMutation,
  useDeleteTestMutation,
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetInterviewsQuery,
  useDeleteInterviewMutation,
} from '../admin-api'

describe('adminApi endpoints exist', () => {
  it('has signIn endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('signIn')
  })

  it('has signUp endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('signUp')
  })

  it('has getStats endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('getStats')
  })

  it('has getAnalytics endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('getAnalytics')
  })

  it('has getAdmins endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('getAdmins')
  })

  it('has getWebUsers endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('getWebUsers')
  })

  it('has createWebUser endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('createWebUser')
  })

  it('has updateWebUser endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('updateWebUser')
  })

  it('has deleteWebUser endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('deleteWebUser')
  })

  it('has getTests endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('getTests')
  })

  it('has createTest endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('createTest')
  })

  it('has deleteTest endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('deleteTest')
  })

  it('has getQuestions endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('getQuestions')
  })

  it('has createQuestion endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('createQuestion')
  })

  it('has updateQuestion endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('updateQuestion')
  })

  it('has deleteQuestion endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('deleteQuestion')
  })

  it('has getInterviews endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('getInterviews')
  })

  it('has deleteInterview endpoint', () => {
    expect(adminApi.endpoints).toHaveProperty('deleteInterview')
  })
})

describe('adminApi URL / method structure', () => {
  it('signIn initiate returns a thunk function', () => {
    const thunk = adminApi.endpoints.signIn.initiate({ email: 'a@b.com', password: 'pass' })
    expect(typeof thunk).toBe('function')
  })

  it('getStats initiate returns a thunk function', () => {
    const thunk = adminApi.endpoints.getStats.initiate()
    expect(typeof thunk).toBe('function')
  })

  it('getWebUsers initiate returns a thunk function', () => {
    const thunk = adminApi.endpoints.getWebUsers.initiate()
    expect(typeof thunk).toBe('function')
  })

  it('deleteWebUser initiate returns a thunk function', () => {
    const thunk = adminApi.endpoints.deleteWebUser.initiate(42)
    expect(typeof thunk).toBe('function')
  })

  it('getQuestions initiate accepts filter params', () => {
    const thunk = adminApi.endpoints.getQuestions.initiate({ profession: 'Frontend', technology: 'React' })
    expect(typeof thunk).toBe('function')
  })
})

describe('adminApi exported hooks', () => {
  it('exports useSignInMutation', () => {
    expect(typeof useSignInMutation).toBe('function')
  })

  it('exports useSignUpMutation', () => {
    expect(typeof useSignUpMutation).toBe('function')
  })

  it('exports useGetStatsQuery', () => {
    expect(typeof useGetStatsQuery).toBe('function')
  })

  it('exports useGetAnalyticsQuery', () => {
    expect(typeof useGetAnalyticsQuery).toBe('function')
  })

  it('exports useGetAdminsQuery', () => {
    expect(typeof useGetAdminsQuery).toBe('function')
  })

  it('exports useGetWebUsersQuery', () => {
    expect(typeof useGetWebUsersQuery).toBe('function')
  })

  it('exports useCreateWebUserMutation', () => {
    expect(typeof useCreateWebUserMutation).toBe('function')
  })

  it('exports useUpdateWebUserMutation', () => {
    expect(typeof useUpdateWebUserMutation).toBe('function')
  })

  it('exports useDeleteWebUserMutation', () => {
    expect(typeof useDeleteWebUserMutation).toBe('function')
  })

  it('exports useGetTestsQuery', () => {
    expect(typeof useGetTestsQuery).toBe('function')
  })

  it('exports useCreateTestMutation', () => {
    expect(typeof useCreateTestMutation).toBe('function')
  })

  it('exports useDeleteTestMutation', () => {
    expect(typeof useDeleteTestMutation).toBe('function')
  })

  it('exports useGetQuestionsQuery', () => {
    expect(typeof useGetQuestionsQuery).toBe('function')
  })

  it('exports useCreateQuestionMutation', () => {
    expect(typeof useCreateQuestionMutation).toBe('function')
  })

  it('exports useUpdateQuestionMutation', () => {
    expect(typeof useUpdateQuestionMutation).toBe('function')
  })

  it('exports useDeleteQuestionMutation', () => {
    expect(typeof useDeleteQuestionMutation).toBe('function')
  })

  it('exports useGetInterviewsQuery', () => {
    expect(typeof useGetInterviewsQuery).toBe('function')
  })

  it('exports useDeleteInterviewMutation', () => {
    expect(typeof useDeleteInterviewMutation).toBe('function')
  })
})

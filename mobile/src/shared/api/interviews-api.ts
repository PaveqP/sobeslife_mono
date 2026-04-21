import { baseApi } from './base-api'
import type {
  InterviewHistoryItem,
  InterviewStartResponse,
  InterviewTurnResponse,
  StartInterviewRequest,
} from './types'

export const interviewsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    startInterview: build.mutation<InterviewStartResponse, StartInterviewRequest>({
      query: (body) => ({
        url: '/api/interviews/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Interviews'],
    }),
    sendInterviewAnswer: build.mutation<InterviewTurnResponse, { id: number; answer: string }>({
      query: ({ id, answer }) => ({
        url: `/api/interviews/${id}/messages`,
        method: 'POST',
        body: { answer },
      }),
      invalidatesTags: ['Interviews'],
    }),
    completeInterview: build.mutation<InterviewTurnResponse, number>({
      query: (id) => ({
        url: `/api/interviews/${id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: ['Interviews'],
    }),
    getInterviewHistory: build.query<InterviewHistoryItem[], void>({
      query: () => '/api/interviews/history',
      providesTags: ['Interviews'],
    }),
  }),
})

export const {
  useStartInterviewMutation,
  useSendInterviewAnswerMutation,
  useCompleteInterviewMutation,
  useGetInterviewHistoryQuery,
} = interviewsApi

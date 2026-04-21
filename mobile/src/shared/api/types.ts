export type ExpertiseLevel = 'trainee' | 'junior' | 'middle' | 'senior'
export type TestStatus = 'assigned' | 'in_progress' | 'completed' | 'expired' | 'cancelled'

export type NamedEntity = {
  id: string
  name: string
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type SignInRequest = {
  phone_number: string
  password: string
}

export type SignUpRequest = {
  nickname: string
  email: string
  phone_number: string
  password: string
}

export type TestListParams = {
  title?: string
  profession?: string
  chapter?: string
  technology?: string
  expertise_level?: ExpertiseLevel | ''
}

export type TestListItem = {
  id: number
  title: string
  profession: string
  chapter: string | null
  technology: string | null
  expertise_level: ExpertiseLevel
  question_count: number
  status: TestStatus | null
  score: number | null
}

export type QuestionType = 'open' | 'single_choice' | 'multiple_choice'

export type TestQuestion = {
  id: number
  text: string
  question_type: QuestionType
  options?: string[]
  user_answer: string | null
  is_correct: boolean | null
}

export type TestDetails = {
  id: number
  title: string
  profession: string
  chapter: string | null
  technology: string | null
  expertise_level: ExpertiseLevel
  status: TestStatus | null
  questions: TestQuestion[]
}

export type CheckAnswerRequest = {
  id: number
  question_id: number
  answer: string
}

export type CheckAnswerResponse = {
  your_answer: string
  is_correct: boolean
}

export type CompleteTestResponse = {
  id: number
  title: string
  expertise_level: string
  profession_name: string
  chapter_name: string | null
  technology_name: string | null
  test_status: string | null
  score: number | null
  started_at: string
  completed_at: string
  questions: Array<{
    question_id: number
    text: string
    is_correct: boolean | null
    user_answer: string | null
    correct_answer: string
    points: number | null
  }>
}

// Interview types
export type InterviewStatus = 'in_progress' | 'completed' | 'summary_failed'
export type InterviewMessageRole = 'assistant' | 'user'

export type StartInterviewRequest = {
  profession: string
  interview_level: ExpertiseLevel
  duration_minutes: number
  candidate_specialization: string
}

export type InterviewStartResponse = {
  id: number
  status: InterviewStatus
  profession_id: number
  profession: string
  interview_level: ExpertiseLevel
  duration_minutes: number
  candidate_specialization: string | null
  started_at: string
  expires_at: string
  first_question: string
}

export type InterviewTurnResponse = {
  interview_id: number
  status: InterviewStatus
  expires_at?: string
  message?: {
    sequence_no: number
    role: InterviewMessageRole
    content: string
    created_at: string
  }
  verdict_passed?: boolean | null
  summary?: string | null
  strengths?: string[]
  weaknesses?: string[]
  recommendations?: string[]
  finished_at?: string | null
}

export type InterviewHistoryItem = {
  id: number
  profession_id: number
  profession: string
  interview_level: ExpertiseLevel
  status: InterviewStatus
  duration_minutes: number
  candidate_specialization: string | null
  verdict_passed: boolean | null
  summary: string | null
  strengths: string[] | null
  weaknesses: string[] | null
  recommendations: string[] | null
  started_at: string
  expires_at: string
  finished_at: string | null
}

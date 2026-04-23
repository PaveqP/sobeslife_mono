export type ExpertiseLevel = 'trainee' | 'junior' | 'middle' | 'senior'
export type TestStatus = 'assigned' | 'in_progress' | 'completed' | 'expired' | 'cancelled'
export type InterviewStatus = 'in_progress' | 'completed' | 'summary_failed'

// Auth

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface OTPSendRequest {
  email: string
}

export interface OTPVerifyRequest {
  email: string
  code: string
}

export interface GithubAuthUrlRequest {
  state: string
}

export interface GithubAuthCallbackRequest {
  code: string
  state: string
}

export interface GoogleAuthUrlRequest {
  state: string
  codeChallenge: string
}

export interface GoogleAuthCallbackRequest {
  code: string
  code_verifier: string
  state?: string
}

// Lookups

export interface NamedEntity {
  id: string
  name: string
}

// Tests

export interface TestListParams {
  title?: string
  profession?: string
  chapter?: string
  technology?: string
  expertise_level?: string
}

export interface TestListItem {
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

export interface TestQuestionDetails {
  id: number
  text: string
  question_type: QuestionType
  options?: string[]
  user_answer: string | null
  is_correct: boolean | null
}

export interface TestDetails {
  id: number
  title: string
  profession: string
  chapter: string | null
  technology: string | null
  expertise_level: ExpertiseLevel
  status: TestStatus | null
  questions: TestQuestionDetails[]
}

export interface CheckAnswerRequest {
  id: number
  question_id: number
  answer: string
}

export interface CheckAnswerResponse {
  your_answer: string
  is_correct: boolean
}

export interface TestQuestionStats {
  question_id: number
  text: string
  is_correct: boolean | null
  user_answer: string | null
  correct_answer: string
  points: number | null
}

export interface CompleteTestResponse {
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
  questions: TestQuestionStats[]
}

// Users

export interface UserProfile {
  user_id: number
  nickname: string | null
  first_name: string | null
  last_name: string | null
  profession_id: number | null
  profession: string | null
  grade: ExpertiseLevel | null
  years_experience: number | null
  github_url: string | null
  linkedin_url: string | null
  about: string | null
  profile_completed: boolean
}

export interface UpdateUserProfileRequest {
  profession?: string | null
  grade?: string | null
  nickname?: string | null
  first_name?: string | null
  last_name?: string | null
  years_experience?: number | null
  github_url?: string | null
  linkedin_url?: string | null
  about?: string | null
}

export interface TestsStatistics {
  total?: number
  completed?: number
  in_progress?: number
  average_score?: number
}

// Interviews

export interface StartInterviewRequest {
  profession: string
  interview_level: ExpertiseLevel
  duration_minutes: number
  candidate_specialization: string
}

export interface InterviewHistoryItem {
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

export interface InterviewMessageItem {
  sequence_no: number
  role: 'assistant' | 'user'
  content: string
  created_at: string
}

export interface InterviewStartResponse {
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

export interface InterviewTurnResponse {
  interview_id: number
  status: InterviewStatus
  expires_at?: string
  message?: InterviewMessageItem
  verdict_passed?: boolean | null
  summary?: string | null
  strengths?: string[] | null
  weaknesses?: string[] | null
  recommendations?: string[] | null
  finished_at?: string | null
}

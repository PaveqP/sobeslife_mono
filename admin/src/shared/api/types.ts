export type ExpertiseLevel = 'trainee' | 'junior' | 'middle' | 'senior'
export type TestStatus = 'assigned' | 'in_progress' | 'completed' | 'expired' | 'cancelled'
export type InterviewStatus = 'in_progress' | 'completed' | 'summary_failed'

export type AdminAuthTokens = { accessToken: string }
export type AdminSignInRequest = { login: string; password: string }
export type AdminSignUpRequest = { login: string; email?: string; password: string; name: string }

export type AdminListItem = {
  id: number
  name: string
  login: string
  email: string
  created_at: string
}

export type WebUser = {
  id: number
  nickname: string | null
  first_name: string | null
  last_name: string | null
  email: string
  profession: string | null
  expertise_level: ExpertiseLevel | null
  years_experience: number | null
  github_url: string | null
  linkedin_url: string | null
  about: string | null
  profile_completed: boolean
  created_at: string
}

export type CreateWebUserRequest = {
  email: string
  nickname?: string | null
  profession?: string | null
  expertise_level?: string | null
}

export type UpdateWebUserRequest = {
  nickname?: string | null
  email?: string | null
  profession?: string | null
  expertise_level?: string | null
}

export type AdminStats = {
  total_users: number
  total_tests: number
  total_interviews: number
  active_interviews: number
  completed_tests_today: number
  new_users_today: number
  interviews_started_today: number
  interviews_completed_today: number
}

export type TestListItem = {
  id: number
  title: string
  profession: string
  chapter: string | null
  technology: string | null
  expertise_level: ExpertiseLevel
  question_count: number
}

export type InterviewListItem = {
  id: number
  user_id: number
  user_email: string
  profession: string
  interview_level: ExpertiseLevel
  status: InterviewStatus
  duration_minutes: number
  verdict_passed: boolean | null
  started_at: string
  finished_at: string | null
}

export type QuestionType = 'open' | 'single_choice' | 'multiple_choice'

export type AdminQuestion = {
  id: number
  text: string
  correct_answer: string
  question_type: QuestionType
  profession: string
  chapter: string
  technology: string | null
  expertise_level: ExpertiseLevel
}

export type AdminQuestionFilters = {
  profession?: string
  chapter?: string
  technology?: string
  expertise_level?: string
}

export type CreateQuestionRequest = {
  text: string
  correct_answer: string
  question_type: string
  profession: string
  chapter: string
  technology?: string | null
  expertise_level: string
}

export type UpdateQuestionRequest = {
  text?: string | null
  correct_answer?: string | null
  question_type?: string | null
  profession?: string | null
  chapter?: string | null
  technology?: string | null
  expertise_level?: string | null
}

export type AdminTestQuestion = {
  test_question_id: number
  question_id: number
  text: string
  correct_answer: string
  question_type: QuestionType
  expertise_level: ExpertiseLevel
}

export type CreateTestRequest = {
  title: string
  profession: string
  chapter: string
  technology?: string | null
  expertise_level: string
}

export type DailyCount = { date: string; count: number }
export type ProfessionCount = { profession: string; count: number }
export type LevelCount = { level: string; count: number }
export type ProfessionPassRate = {
  profession: string
  total: number
  passed: number
  pass_rate: number
}

export type AdminAnalytics = {
  total_users: number
  total_tests: number
  total_interviews: number
  passed_interviews: number
  failed_interviews: number
  completed_tests: number
  new_users_today: number
  interviews_started_today: number
  interviews_completed_today: number
  tests_completed_today: number
  overall_pass_rate: number
  daily_interviews: DailyCount[]
  daily_test_completes: DailyCount[]
  daily_new_users: DailyCount[]
  interviews_by_profession: ProfessionCount[]
  interviews_by_level: LevelCount[]
  tests_by_level: LevelCount[]
  pass_rate_by_profession: ProfessionPassRate[]
}

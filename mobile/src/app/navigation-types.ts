import type { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  SignIn: { registered?: boolean } | undefined
  SignUp: undefined
  Tests: undefined
  TestRun: { testId: number }
  Interviews: undefined
  InterviewRun: { interviewId: number; firstQuestion: string }
}

export type AppScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>

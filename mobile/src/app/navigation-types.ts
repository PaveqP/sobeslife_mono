import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  SignIn: undefined
  Main: undefined
}

export type MainTabParamList = {
  TestsTab: undefined
  InterviewsTab: undefined
  AnalyticsTab: undefined
  ProfileTab: undefined
}

export type TestsStackParamList = {
  Tests: undefined
  TestRun: { testId: number }
}

export type InterviewsStackParamList = {
  Interviews: undefined
  InterviewRun: { interviewId: number; firstQuestion: string }
}

export type TestsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<TestsStackParamList, 'Tests'>,
  BottomTabScreenProps<MainTabParamList>
>

export type TestRunScreenProps = NativeStackScreenProps<TestsStackParamList, 'TestRun'>

export type InterviewsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<InterviewsStackParamList, 'Interviews'>,
  BottomTabScreenProps<MainTabParamList>
>

export type InterviewRunScreenProps = NativeStackScreenProps<InterviewsStackParamList, 'InterviewRun'>

/** @deprecated Use TestsScreenProps */
export type AppScreenProps<T extends keyof TestsStackParamList> = NativeStackScreenProps<TestsStackParamList, T>

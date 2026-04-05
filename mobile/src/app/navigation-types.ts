import type { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  SignIn: { registered?: boolean } | undefined
  SignUp: undefined
  Tests: undefined
  TestRun: { testId: number }
}

export type AppScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>

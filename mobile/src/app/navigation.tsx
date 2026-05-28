import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useEffect } from 'react'
import { bootstrapSession } from '../features/auth/auth-slice'
import { useAppDispatch, useAppSelector } from './store'
import { SignInScreen } from '../screens/sign-in-screen'
import { useTheme } from '../shared/theme/theme-provider'
import { FullScreenLoader } from '../shared/ui/surfaces'
import { MainTabs } from './main-tabs'
import type { RootStackParamList } from './navigation-types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export const AppNavigation = () => {
  const dispatch = useAppDispatch()
  const { hydrated, accessToken } = useAppSelector((state) => state.auth)
  const { theme } = useTheme()

  useEffect(() => {
    void dispatch(bootstrapSession())
  }, [dispatch])

  if (!hydrated) {
    return <FullScreenLoader />
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.page,
          card: theme.colors.surface,
          text: theme.colors.textPrimary,
          border: theme.colors.borderSubtle,
          primary: theme.colors.accent,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.colors.page,
          },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      >
        {!accessToken ? (
          <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

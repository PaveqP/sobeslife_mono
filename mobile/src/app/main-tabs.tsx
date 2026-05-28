import type { ReactNode } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useGetProfileQuery } from '../shared/api/users-api'
import { TestsScreen } from '../screens/tests-screen'
import { TestRunScreen } from '../screens/test-run-screen'
import { InterviewsScreen } from '../screens/interviews-screen'
import { InterviewRunScreen } from '../screens/interview-run-screen'
import { AnalyticsScreen } from '../screens/analytics-screen'
import { ProfileScreen } from '../screens/profile-screen'
import { useTheme } from '../shared/theme/theme-provider'
import type {
  InterviewsStackParamList,
  MainTabParamList,
  TestsStackParamList,
} from './navigation-types'

const Tab = createBottomTabNavigator<MainTabParamList>()
const TestsStack = createNativeStackNavigator<TestsStackParamList>()
const InterviewsStack = createNativeStackNavigator<InterviewsStackParamList>()

const TestsStackNavigator = () => (
  <TestsStack.Navigator screenOptions={{ headerShown: true }}>
    <TestsStack.Screen name="Tests" component={TestsScreen} options={{ title: 'Тесты' }} />
    <TestsStack.Screen name="TestRun" component={TestRunScreen} options={{ title: 'Прохождение теста' }} />
  </TestsStack.Navigator>
)

const InterviewsStackNavigator = () => (
  <InterviewsStack.Navigator screenOptions={{ headerShown: true }}>
    <InterviewsStack.Screen name="Interviews" component={InterviewsScreen} options={{ title: 'Собеседования' }} />
    <InterviewsStack.Screen
      name="InterviewRun"
      component={InterviewRunScreen}
      options={{ title: 'AI-собеседование' }}
    />
  </InterviewsStack.Navigator>
)

const ProfileGate = ({ children }: { children: ReactNode }) => {
  const navigation = useNavigation()
  const { data: profile } = useGetProfileQuery()

  useEffect(() => {
    if (profile && !profile.profile_completed) {
      const parent = navigation.getParent()
      parent?.navigate('ProfileTab' as never)
    }
  }, [navigation, profile])

  return <>{children}</>
}

export const MainTabs = () => {
  const { theme } = useTheme()

  return (
    <ProfileGate>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.accent,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.borderSubtle,
          },
          tabBarIcon: ({ color, size }) => {
            const iconName =
              route.name === 'TestsTab'
                ? 'book-outline'
                : route.name === 'InterviewsTab'
                  ? 'chatbubbles-outline'
                  : route.name === 'AnalyticsTab'
                    ? 'bar-chart-outline'
                    : 'person-outline'
            return <Ionicons name={iconName} size={size} color={color} />
          },
        })}
      >
        <Tab.Screen name="TestsTab" component={TestsStackNavigator} options={{ title: 'Тесты' }} />
        <Tab.Screen name="InterviewsTab" component={InterviewsStackNavigator} options={{ title: 'Собеседования' }} />
        <Tab.Screen name="AnalyticsTab" component={AnalyticsScreen} options={{ title: 'Аналитика', headerShown: true }} />
        <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Профиль', headerShown: true }} />
      </Tab.Navigator>
    </ProfileGate>
  )
}

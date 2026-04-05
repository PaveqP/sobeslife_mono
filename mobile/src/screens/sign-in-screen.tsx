import { useState } from 'react'
import { Alert, Text, View, StyleSheet } from 'react-native'
import { useSignInMutation } from '../shared/api/auth-api'
import { persistCredentials } from '../features/auth/auth-slice'
import { useAppDispatch } from '../app/store'
import { AppButton } from '../shared/ui/button'
import { AppTextInput } from '../shared/ui/form-controls'
import { Card } from '../shared/ui/surfaces'
import { Screen } from '../shared/ui/screen'
import { ThemeToggle } from '../shared/ui/theme-toggle'
import { useTheme } from '../shared/theme/theme-provider'
import type { AppScreenProps } from '../app/navigation-types'

export const SignInScreen = ({ navigation, route }: AppScreenProps<'SignIn'>) => {
  const { theme } = useTheme()
  const dispatch = useAppDispatch()
  const [formState, setFormState] = useState({
    phone_number: '',
    password: '',
  })
  const [signIn, { isLoading }] = useSignInMutation()

  const handleSubmit = async () => {
    try {
      const tokens = await signIn(formState).unwrap()
      await dispatch(persistCredentials(tokens))
    } catch {
      Alert.alert('Ошибка входа', 'Проверьте номер телефона и пароль.')
    }
  }

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <ThemeToggle />
      <View style={styles.hero}>
        <View style={[styles.chip, { backgroundColor: theme.colors.accentSoft }]}>
          <Text style={[styles.chipText, { color: theme.colors.accent }]}>Dify-inspired mobile UI</Text>
        </View>
        <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
          Готовься к техническим собеседованиям с телефона
        </Text>
        <Text style={[styles.heroDescription, { color: theme.colors.textSecondary }]}>
          Те же тесты, фильтры и сценарий прохождения, что и в web-клиенте.
        </Text>
      </View>

      <Card>
        <View style={styles.section}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Вход</Text>
          <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>
            На текущем сервере авторизация работает по номеру телефона.
          </Text>
          {route.params?.registered ? (
            <View style={[styles.notice, { backgroundColor: theme.colors.successSoft }]}>
              <Text style={[styles.noticeText, { color: theme.colors.success }]}>
                Аккаунт создан. Теперь войдите под своими данными.
              </Text>
            </View>
          ) : null}
          <AppTextInput
            label="Номер телефона"
            placeholder="+7 999 123-45-67"
            value={formState.phone_number}
            onChangeText={(phone_number) => setFormState((state) => ({ ...state, phone_number }))}
            autoCapitalize="none"
            keyboardType="phone-pad"
          />
          <AppTextInput
            label="Пароль"
            placeholder="Введите пароль"
            value={formState.password}
            onChangeText={(password) => setFormState((state) => ({ ...state, password }))}
            secureTextEntry
          />
          <AppButton title="Войти" variant="primary" loading={isLoading} onPress={() => void handleSubmit()} />
          <AppButton title="Создать аккаунт" variant="ghost" onPress={() => navigation.navigate('SignUp')} />
        </View>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screenContent: {
    justifyContent: 'center',
    paddingVertical: 24,
  },
  hero: {
    gap: 12,
    marginBottom: 8,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    gap: 14,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
  },
  notice: {
    borderRadius: 16,
    padding: 14,
  },
  noticeText: {
    fontSize: 14,
    fontWeight: '600',
  },
})

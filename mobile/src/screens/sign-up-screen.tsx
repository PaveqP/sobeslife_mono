import { useState } from 'react'
import { Alert, Text, View, StyleSheet } from 'react-native'
import { useSignUpMutation } from '../shared/api/auth-api'
import { AppButton } from '../shared/ui/button'
import { AppTextInput } from '../shared/ui/form-controls'
import { Card } from '../shared/ui/surfaces'
import { Screen } from '../shared/ui/screen'
import { useTheme } from '../shared/theme/theme-provider'
import type { AppScreenProps } from '../app/navigation-types'

export const SignUpScreen = ({ navigation }: AppScreenProps<'SignUp'>) => {
  const { theme } = useTheme()
  const [formState, setFormState] = useState({
    nickname: '',
    email: '',
    phone_number: '',
    password: '',
  })
  const [signUp, { isLoading }] = useSignUpMutation()

  const handleSubmit = async () => {
    try {
      await signUp(formState).unwrap()
      navigation.replace('SignIn', { registered: true })
    } catch {
      Alert.alert('Ошибка регистрации', 'Проверьте корректность полей и уникальность телефона.')
    }
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Регистрация</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Создайте аккаунт, чтобы проходить тесты и сохранять прогресс.
          </Text>
          <AppTextInput
            label="Никнейм"
            placeholder="frontend_dev"
            value={formState.nickname}
            onChangeText={(nickname) => setFormState((state) => ({ ...state, nickname }))}
          />
          <AppTextInput
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formState.email}
            onChangeText={(email) => setFormState((state) => ({ ...state, email }))}
          />
          <AppTextInput
            label="Телефон"
            placeholder="+7 999 123-45-67"
            keyboardType="phone-pad"
            value={formState.phone_number}
            onChangeText={(phone_number) => setFormState((state) => ({ ...state, phone_number }))}
          />
          <AppTextInput
            label="Пароль"
            placeholder="Минимум 6 символов"
            secureTextEntry
            value={formState.password}
            onChangeText={(password) => setFormState((state) => ({ ...state, password }))}
          />
          <AppButton title="Создать аккаунт" variant="primary" loading={isLoading} onPress={() => void handleSubmit()} />
          <AppButton title="Уже есть аккаунт" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    paddingVertical: 24,
  },
  section: {
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
})

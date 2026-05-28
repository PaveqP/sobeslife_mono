import { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  useGithubCallbackMutation,
  useGoogleCallbackMutation,
  useSendOTPMutation,
  useStartGithubAuthMutation,
  useStartGoogleAuthMutation,
  useVerifyOTPMutation,
} from '../shared/api/auth-api'
import { persistCredentials } from '../features/auth/auth-slice'
import { useAppDispatch } from '../app/store'
import { getApiErrorMessage } from '../shared/lib/api-error'
import { clearGithubOauthSession, getStoredGithubOauthState, prepareGithubOauthSession } from '../shared/lib/github-oauth'
import { openOAuthBrowserSession } from '../shared/lib/oauth-browser'
import { getGithubOAuthRedirectUri, getGoogleOAuthRedirectUri } from '../shared/lib/oauth-redirect'
import {
  clearGoogleOauthSession,
  getStoredGoogleCodeVerifier,
  getStoredGoogleOauthState,
  prepareGoogleOauthSession,
} from '../shared/lib/oauth'
import { AppButton } from '../shared/ui/button'
import { AppTextInput } from '../shared/ui/form-controls'
import { Card } from '../shared/ui/surfaces'
import { Screen } from '../shared/ui/screen'
import { ThemeToggle } from '../shared/ui/theme-toggle'
import { useTheme } from '../shared/theme/theme-provider'

type Step = 'email' | 'code'

const FEATURES = [
  ['Каталог тестов', 'Фильтры по профессии, модулю, технологии и уровню.'],
  ['Режим прохождения', 'Прогресс по вопросам и проверка ответа после отправки.'],
  ['Аналитика', 'Статистика прохождений и прогресс по времени.'],
] as const

export const SignInScreen = () => {
  const { theme } = useTheme()
  const dispatch = useAppDispatch()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [sendOTP, { isLoading: isSending }] = useSendOTPMutation()
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation()
  const [startGoogleAuth, { isLoading: isGoogleLoading }] = useStartGoogleAuthMutation()
  const [googleCallback] = useGoogleCallbackMutation()
  const [startGithubAuth, { isLoading: isGithubLoading }] = useStartGithubAuthMutation()
  const [githubCallback] = useGithubCallbackMutation()

  const handleSendCode = async () => {
    setErrorMessage(null)
    try {
      await sendOTP({ email: email.trim() }).unwrap()
      setStep('code')
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Не удалось отправить код. Проверьте email и попробуйте снова.'))
    }
  }

  const handleVerifyCode = async () => {
    setErrorMessage(null)
    try {
      const tokens = await verifyOTP({ email: email.trim(), code }).unwrap()
      await dispatch(persistCredentials(tokens))
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 410) {
        setErrorMessage('Код истёк. Запросите новый.')
        setStep('email')
        setCode('')
      } else if (status === 401) {
        setErrorMessage('Неверный код. Попробуйте ещё раз.')
      } else {
        setErrorMessage(getApiErrorMessage(err, 'Произошла ошибка. Попробуйте снова.'))
      }
    }
  }

  const handleGoogleSignIn = async () => {
    setErrorMessage(null)
    const redirectUri = getGoogleOAuthRedirectUri()

    try {
      const oauthSession = await prepareGoogleOauthSession()
      const authUrl = await startGoogleAuth({ ...oauthSession, redirectUri }).unwrap()
      const params = await openOAuthBrowserSession(authUrl, redirectUri)

      if (!params) {
        setErrorMessage('Вход через Google отменён.')
        await clearGoogleOauthSession()
        return
      }

      if (params.error) {
        setErrorMessage('Google вернул ошибку авторизации. Попробуйте снова.')
        await clearGoogleOauthSession()
        return
      }

      const storedState = await getStoredGoogleOauthState()
      const codeVerifier = await getStoredGoogleCodeVerifier()

      if (!params.code || !params.state || !storedState || !codeVerifier) {
        setErrorMessage('Не удалось завершить вход через Google. Не хватает параметров авторизации.')
        await clearGoogleOauthSession()
        return
      }

      if (params.state !== storedState) {
        setErrorMessage('Проверка OAuth state не прошла. Начните вход через Google заново.')
        await clearGoogleOauthSession()
        return
      }

      const tokens = await googleCallback({
        code: params.code,
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
      }).unwrap()
      await clearGoogleOauthSession()
      await dispatch(persistCredentials(tokens))
    } catch (err) {
      await clearGoogleOauthSession()
      setErrorMessage(getApiErrorMessage(err, 'Не удалось завершить вход через Google. Попробуйте снова.'))
    }
  }

  const handleGithubSignIn = async () => {
    setErrorMessage(null)
    const redirectUri = getGithubOAuthRedirectUri()

    try {
      const state = await prepareGithubOauthSession()
      const authUrl = await startGithubAuth({ state, redirectUri }).unwrap()
      const params = await openOAuthBrowserSession(authUrl, redirectUri)

      if (!params) {
        setErrorMessage('Вход через GitHub отменён.')
        await clearGithubOauthSession()
        return
      }

      if (params.error) {
        setErrorMessage('GitHub вернул ошибку авторизации. Попробуйте снова.')
        await clearGithubOauthSession()
        return
      }

      const storedState = await getStoredGithubOauthState()

      if (!params.code || !params.state || !storedState) {
        setErrorMessage('Не удалось завершить вход через GitHub. Не хватает параметров авторизации.')
        await clearGithubOauthSession()
        return
      }

      if (params.state !== storedState) {
        setErrorMessage('Проверка OAuth state не прошла. Начните вход через GitHub заново.')
        await clearGithubOauthSession()
        return
      }

      const tokens = await githubCallback({
        code: params.code,
        state: params.state,
        redirect_uri: redirectUri,
      }).unwrap()
      await clearGithubOauthSession()
      await dispatch(persistCredentials(tokens))
    } catch (err) {
      await clearGithubOauthSession()
      setErrorMessage(getApiErrorMessage(err, 'Не удалось завершить вход через GitHub. Попробуйте снова.'))
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <ThemeToggle />
        </View>

        <View style={styles.hero}>
          <View style={[styles.chip, { backgroundColor: theme.colors.accentSoft }]}>
            <Text style={[styles.chipText, { color: theme.colors.accent }]}>Платформа подготовки</Text>
          </View>
          <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
            Готовься к техническим собеседованиям в одном приложении
          </Text>
          <Text style={[styles.heroDescription, { color: theme.colors.textSecondary }]}>
            Каталог тестов, гибкая фильтрация и поэтапное прохождение с мгновенной проверкой ответов.
          </Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map(([title, description]) => (
            <Card key={title}>
              <Text style={[styles.featureTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>{description}</Text>
            </Card>
          ))}
        </View>

        <Card>
          <View style={styles.section}>
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
              {step === 'email' ? 'Вход' : 'Введите код'}
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>
              {step === 'email'
                ? 'Введите email — мы пришлём одноразовый код для входа.'
                : `Код отправлен на ${email}. Введите его ниже.`}
            </Text>

            {errorMessage ? (
              <View style={[styles.errorBox, { backgroundColor: theme.colors.dangerSoft, borderColor: theme.colors.danger }]}>
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>{errorMessage}</Text>
              </View>
            ) : null}

            {step === 'email' ? (
              <>
                <AppTextInput
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
                <AppButton title="Получить код" variant="primary" loading={isSending} onPress={() => void handleSendCode()} />
              </>
            ) : (
              <>
                <AppTextInput
                  label="Код подтверждения"
                  placeholder="123456"
                  value={code}
                  onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                />
                <AppButton title="Войти" variant="primary" loading={isVerifying} onPress={() => void handleVerifyCode()} />
                <Pressable
                  onPress={() => {
                    setStep('email')
                    setCode('')
                    setErrorMessage(null)
                  }}
                >
                  <Text style={[styles.backLink, { color: theme.colors.textTertiary }]}>← Изменить email</Text>
                </Pressable>
              </>
            )}

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textTertiary }]}>или войти через</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />
            </View>

            <AppButton
              title="Продолжить через Google"
              variant="ghost"
              loading={isGoogleLoading}
              icon={<MaterialCommunityIcons name="google" size={18} color="#4285F4" />}
              onPress={() => void handleGoogleSignIn()}
            />
            <AppButton
              title="Продолжить через GitHub"
              variant="ghost"
              loading={isGithubLoading}
              icon={<MaterialCommunityIcons name="github" size={18} color={theme.colors.textPrimary} />}
              onPress={() => void handleGithubSignIn()}
            />
          </View>
        </Card>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  hero: {
    gap: 12,
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
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  features: {
    gap: 12,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
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
  errorBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  backLink: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
  },
})

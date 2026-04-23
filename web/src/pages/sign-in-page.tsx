import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { setCredentials } from '@/features/auth/auth-slice'
import { useSendOTPMutation, useStartGoogleAuthMutation, useStartGithubAuthMutation, useVerifyOTPMutation } from '@/shared/api/auth-api'
import { prepareGoogleOauthSession } from '@/shared/lib/oauth'
import { prepareGithubOauthSession } from '@/shared/lib/github-oauth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/form-controls'
import { Card } from '@/shared/ui/surfaces'
import { ThemeToggle } from '@/shared/theme/theme-provider'

type Step = 'email' | 'code'

export const SignInPage = () => {
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [sendOTP, { isLoading: isSending }] = useSendOTPMutation()
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation()
  const [startGoogleAuth, { isLoading: isGoogleLoading }] = useStartGoogleAuthMutation()
  const [startGithubAuth, { isLoading: isGithubLoading }] = useStartGithubAuthMutation()

  if (accessToken) return <Navigate to="/" replace />

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    try {
      await sendOTP({ email }).unwrap()
      setStep('code')
    } catch {
      setErrorMessage('Не удалось отправить код. Проверьте email и попробуйте снова.')
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    try {
      const tokens = await verifyOTP({ email, code }).unwrap()
      dispatch(setCredentials(tokens))
      navigate('/')
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 410) {
        setErrorMessage('Код истёк. Запросите новый.')
        setStep('email')
        setCode('')
      } else if (status === 401) {
        setErrorMessage('Неверный код. Попробуйте ещё раз.')
      } else {
        setErrorMessage('Произошла ошибка. Попробуйте снова.')
      }
    }
  }

  const handleGoogleSignIn = async () => {
    setErrorMessage(null)
    try {
      const oauthSession = await prepareGoogleOauthSession()
      const redirectUrl = await startGoogleAuth(oauthSession).unwrap()
      window.location.assign(redirectUrl)
    } catch {
      setErrorMessage('Не удалось начать вход через Google. Попробуйте снова.')
    }
  }

  const handleGithubSignIn = async () => {
    setErrorMessage(null)
    try {
      const state = prepareGithubOauthSession()
      const redirectUrl = await startGithubAuth({ state }).unwrap()
      window.location.assign(redirectUrl)
    } catch {
      setErrorMessage('Не удалось начать вход через GitHub. Попробуйте снова.')
    }
  }

  return (
    <div className="min-h-screen bg-page px-4 py-8">
      <div className="mx-auto flex max-w-6xl justify-end">
        <ThemeToggle />
      </div>
      <div className="mx-auto grid min-h-[80vh] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            Платформа подготовки
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
              Готовься к техническим собеседованиям в одном приложении
            </h1>
            <p className="max-w-xl text-base text-text-secondary sm:text-lg">
              Каталог тестов, гибкая фильтрация и поэтапное прохождение с мгновенной проверкой ответов.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Каталог тестов', 'Фильтры по профессии, модулю, технологии и уровню.'],
              ['Режим прохождения', 'Прогресс по вопросам и проверка ответа после отправки.'],
              ['Аналитика', 'Статистика прохождений и прогресс по времени.'],
            ].map(([title, description]) => (
              <Card key={title} className="space-y-2">
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                <p className="text-sm text-text-secondary">{description}</p>
              </Card>
            ))}
          </div>
        </section>

        <Card className="mx-auto w-full max-w-md space-y-6 p-6 sm:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-text-primary">
              {step === 'email' ? 'Вход' : 'Введите код'}
            </h2>
            <p className="text-sm text-text-secondary">
              {step === 'email'
                ? 'Введите email — мы пришлём одноразовый код для входа.'
                : `Код отправлен на ${email}. Введите его ниже.`}
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
              {errorMessage}
            </div>
          )}

          {step === 'email' ? (
            <form className="space-y-4" onSubmit={handleSendCode}>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <Button type="submit" variant="primary" className="w-full" loading={isSending}>
                Получить код
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleVerifyCode}>
              <Input
                label="Код подтверждения"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                autoFocus
              />
              <Button type="submit" variant="primary" className="w-full" loading={isVerifying}>
                Войти
              </Button>
              <button
                type="button"
                className="w-full text-sm text-text-tertiary hover:text-text-secondary transition"
                onClick={() => { setStep('email'); setCode(''); setErrorMessage(null) }}
              >
                ← Изменить email
              </button>
            </form>
          )}

          <div className="relative flex items-center gap-3">
            <div className="flex-1 border-t border-border-subtle" />
            <span className="text-xs text-text-tertiary">или войти через</span>
            <div className="flex-1 border-t border-border-subtle" />
          </div>

          <div className="space-y-2">
            <Button type="button" variant="ghost" className="w-full" loading={isGoogleLoading} onClick={handleGoogleSignIn}>
              <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Продолжить через Google
            </Button>
            <Button type="button" variant="ghost" className="w-full" loading={isGithubLoading} onClick={handleGithubSignIn}>
              <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              Продолжить через GitHub
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

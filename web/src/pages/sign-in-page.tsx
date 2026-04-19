import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { setCredentials } from '@/features/auth/auth-slice'
import { useSignInMutation, useStartGoogleAuthMutation } from '@/shared/api/auth-api'
import { prepareGoogleOauthSession } from '@/shared/lib/oauth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/form-controls'
import { Card } from '@/shared/ui/surfaces'
import { ThemeToggle } from '@/shared/theme/theme-provider'

export const SignInPage = () => {
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [googleErrorMessage, setGoogleErrorMessage] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    phone_number: '',
    password: '',
  })
  const [signIn, { isLoading, error }] = useSignInMutation()
  const [startGoogleAuth, { isLoading: isGoogleLoading }] = useStartGoogleAuthMutation()

  if (accessToken) {
    return <Navigate to="/" replace />
  }

  const successMessage =
    location.state && typeof location.state === 'object' && 'registered' in location.state
      ? 'Аккаунт создан. Войдите по номеру телефона и паролю.'
      : null

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const tokens = await signIn(formState).unwrap()
    dispatch(setCredentials(tokens))
    navigate('/')
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleErrorMessage(null)
      const oauthSession = await prepareGoogleOauthSession()
      const redirectUrl = await startGoogleAuth(oauthSession).unwrap()
      window.location.assign(redirectUrl)
    } catch {
      setGoogleErrorMessage('Не удалось начать вход через Google. Попробуйте снова.')
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
            Dify-inspired UI
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
              ['Повторное использование UI', 'Токены темы и базовые компоненты для дальнейшего роста.'],
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
            <h2 className="text-2xl font-semibold text-text-primary">Вход</h2>
            <p className="text-sm text-text-secondary">
              Войдите по номеру телефона и паролю или используйте Google-аккаунт.
            </p>
          </div>

          {successMessage ? (
            <div className="rounded-2xl border border-success/20 bg-success-soft px-4 py-3 text-sm text-success">
              {successMessage}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
              Не удалось войти. Проверь номер телефона и пароль.
            </div>
          ) : null}

          {googleErrorMessage ? (
            <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
              {googleErrorMessage}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Номер телефона"
              placeholder="+7 999 123-45-67"
              value={formState.phone_number}
              onChange={(event) =>
                setFormState((currentState) => ({ ...currentState, phone_number: event.target.value }))
              }
              required
            />
            <Input
              label="Пароль"
              type="password"
              placeholder="Введите пароль"
              value={formState.password}
              onChange={(event) =>
                setFormState((currentState) => ({ ...currentState, password: event.target.value }))
              }
              required
            />
            <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
              Войти
            </Button>
          </form>

          <Button type="button" variant="ghost" className="w-full" loading={isGoogleLoading} onClick={handleGoogleSignIn}>
            Продолжить через Google
          </Button>

          <p className="text-sm text-text-secondary">
            Еще нет аккаунта?{' '}
            <Link to="/sign-up" className="font-semibold text-accent hover:text-accent-strong">
              Зарегистрироваться
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

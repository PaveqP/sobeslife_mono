import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/app/store'
import { useSignUpMutation } from '@/shared/api/auth-api'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/form-controls'
import { Card } from '@/shared/ui/surfaces'
import { ThemeToggle } from '@/shared/theme/theme-provider'

export const SignUpPage = () => {
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const navigate = useNavigate()
  const [formState, setFormState] = useState({
    nickname: '',
    email: '',
    phone_number: '',
    password: '',
  })
  const [signUp, { isLoading, error }] = useSignUpMutation()

  if (accessToken) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    await signUp(formState).unwrap()
    navigate('/sign-in', { state: { registered: true } })
  }

  return (
    <div className="min-h-screen bg-page px-4 py-8">
      <div className="mx-auto flex max-w-6xl justify-end">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
        <Card className="w-full max-w-xl space-y-6 p-6 sm:p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-text-primary">Регистрация</h1>
            <p className="text-sm text-text-secondary">
              Создайте аккаунт, чтобы открывать каталог тестов и сохранять свой прогресс.
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
              Не удалось создать пользователя. Проверьте корректность полей и уникальность телефона.
            </div>
          ) : null}

          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <Input
              label="Никнейм"
              placeholder="frontend_dev"
              value={formState.nickname}
              onChange={(event) =>
                setFormState((currentState) => ({ ...currentState, nickname: event.target.value }))
              }
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formState.email}
              onChange={(event) =>
                setFormState((currentState) => ({ ...currentState, email: event.target.value }))
              }
              required
            />
            <Input
              label="Телефон"
              placeholder="+7 999 123-45-67"
              value={formState.phone_number}
              onChange={(event) =>
                setFormState((currentState) => ({ ...currentState, phone_number: event.target.value }))
              }
              className="sm:col-span-2"
              required
            />
            <Input
              label="Пароль"
              type="password"
              placeholder="Минимум 6 символов"
              value={formState.password}
              onChange={(event) =>
                setFormState((currentState) => ({ ...currentState, password: event.target.value }))
              }
              className="sm:col-span-2"
              required
            />
            <Button type="submit" variant="primary" className="sm:col-span-2" loading={isLoading}>
              Создать аккаунт
            </Button>
          </form>

          <p className="text-sm text-text-secondary">
            Уже зарегистрированы?{' '}
            <Link to="/sign-in" className="font-semibold text-accent hover:text-accent-strong">
              Войти
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

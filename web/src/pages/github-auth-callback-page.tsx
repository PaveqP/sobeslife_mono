import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '@/app/store'
import { setCredentials } from '@/features/auth/auth-slice'
import { useGithubCallbackMutation } from '@/shared/api/auth-api'
import { clearGithubOauthSession, getStoredGithubOauthState } from '@/shared/lib/github-oauth'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/surfaces'

export const GithubAuthCallbackPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [githubCallback] = useGithubCallbackMutation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const error = searchParams.get('error')
    if (error) {
      clearGithubOauthSession()
      setErrorMessage('GitHub вернул ошибку авторизации. Попробуйте снова.')
      return
    }

    const code = searchParams.get('code')
    const returnedState = searchParams.get('state')
    const storedState = getStoredGithubOauthState()

    if (!code || !returnedState || !storedState) {
      clearGithubOauthSession()
      setErrorMessage('Не удалось завершить вход через GitHub. Не хватает параметров авторизации.')
      return
    }

    if (returnedState !== storedState) {
      clearGithubOauthSession()
      setErrorMessage('Проверка OAuth state не прошла. Начните вход через GitHub заново.')
      return
    }

    void githubCallback({ code, state: returnedState })
      .unwrap()
      .then((tokens) => {
        clearGithubOauthSession()
        dispatch(setCredentials(tokens))
        navigate('/', { replace: true })
      })
      .catch(() => {
        clearGithubOauthSession()
        setErrorMessage('Не удалось завершить вход через GitHub на сервере.')
      })
  }, [dispatch, githubCallback, navigate, searchParams])

  return (
    <div className="min-h-screen bg-page px-4 py-8">
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center justify-center">
        <Card className="w-full space-y-4 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-text-primary">Авторизация через GitHub</h1>
          {errorMessage ? (
            <>
              <p className="text-sm text-danger">{errorMessage}</p>
              <Button variant="primary" className="w-full" onClick={() => navigate('/sign-in', { replace: true })}>
                Вернуться ко входу
              </Button>
            </>
          ) : (
            <p className="text-sm text-text-secondary">Завершаем вход и создаём сессию приложения.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

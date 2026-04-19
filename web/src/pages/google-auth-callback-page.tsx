import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '@/app/store'
import { setCredentials } from '@/features/auth/auth-slice'
import { useGoogleCallbackMutation } from '@/shared/api/auth-api'
import { clearGoogleOauthSession, getStoredGoogleCodeVerifier, getStoredGoogleOauthState } from '@/shared/lib/oauth'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/surfaces'

export const GoogleAuthCallbackPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [googleCallback] = useGoogleCallbackMutation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) {
      return
    }
    startedRef.current = true

    const error = searchParams.get('error')
    if (error) {
      clearGoogleOauthSession()
      setErrorMessage('Google вернул ошибку авторизации. Попробуйте снова.')
      return
    }

    const code = searchParams.get('code')
    const returnedState = searchParams.get('state')
    const storedState = getStoredGoogleOauthState()
    const codeVerifier = getStoredGoogleCodeVerifier()

    if (!code || !returnedState || !storedState || !codeVerifier) {
      clearGoogleOauthSession()
      setErrorMessage('Не удалось завершить вход через Google. Не хватает параметров авторизации.')
      return
    }

    if (returnedState !== storedState) {
      clearGoogleOauthSession()
      setErrorMessage('Проверка OAuth state не прошла. Начните вход через Google заново.')
      return
    }

    void googleCallback({ code, code_verifier: codeVerifier })
      .unwrap()
      .then((tokens) => {
        clearGoogleOauthSession()
        dispatch(setCredentials(tokens))
        navigate('/', { replace: true })
      })
      .catch(() => {
        clearGoogleOauthSession()
        setErrorMessage('Не удалось завершить вход через Google на сервере.')
      })
  }, [dispatch, googleCallback, navigate, searchParams])

  return (
    <div className="min-h-screen bg-page px-4 py-8">
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center justify-center">
        <Card className="w-full space-y-4 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-text-primary">Авторизация через Google</h1>
          {errorMessage ? (
            <>
              <p className="text-sm text-danger">{errorMessage}</p>
              <Button variant="primary" className="w-full" onClick={() => navigate('/sign-in', { replace: true })}>
                Вернуться ко входу
              </Button>
            </>
          ) : (
            <p className="text-sm text-text-secondary">Завершаем вход и создаем сессию приложения.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { authReducer } from '@/features/auth/auth-slice'
import { baseApi } from '@/shared/api/base-api'
import { SignInPage } from '../sign-in-page'

vi.mock('@/shared/lib/storage', () => ({
  tokenStorage: {
    getAccessToken: vi.fn(() => null),
    getRefreshToken: vi.fn(() => null),
    setTokens: vi.fn(),
    clear: vi.fn(),
  },
}))

vi.mock('@/shared/lib/oauth', () => ({
  prepareGoogleOauthSession: vi.fn().mockResolvedValue({ state: 'state', codeChallenge: 'challenge' }),
}))

vi.mock('@/shared/theme/theme-provider', () => ({
  ThemeToggle: () => <button aria-label="toggle theme">Theme</button>,
}))

const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  })

function renderSignInPage() {
  const store = makeStore()
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/sign-in']}>
        <SignInPage />
      </MemoryRouter>
    </Provider>,
  )
}

describe('SignInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the sign-in heading', () => {
    renderSignInPage()
    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument()
  })

  it('renders phone number input', () => {
    renderSignInPage()
    expect(screen.getByPlaceholderText('+7 999 123-45-67')).toBeInTheDocument()
  })

  it('renders password input', () => {
    renderSignInPage()
    expect(screen.getByPlaceholderText('Введите пароль')).toBeInTheDocument()
  })

  it('renders Google sign-in button', () => {
    renderSignInPage()
    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument()
  })

  it('renders link to sign-up page', () => {
    renderSignInPage()
    expect(screen.getByRole('link', { name: /Зарегистрироваться/i })).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderSignInPage()
    expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument()
  })

  it('updates phone number input on change', () => {
    renderSignInPage()
    const phoneInput = screen.getByPlaceholderText('+7 999 123-45-67')
    fireEvent.change(phoneInput, { target: { value: '+79991234567' } })
    expect((phoneInput as HTMLInputElement).value).toBe('+79991234567')
  })

  it('updates password input on change', () => {
    renderSignInPage()
    const passwordInput = screen.getByPlaceholderText('Введите пароль')
    fireEvent.change(passwordInput, { target: { value: 'mypassword' } })
    expect((passwordInput as HTMLInputElement).value).toBe('mypassword')
  })

  it('shows success message when location state has registered flag', () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: '/sign-in', state: { registered: true } }]}>
          <SignInPage />
        </MemoryRouter>
      </Provider>,
    )
    expect(screen.getByText(/Аккаунт создан/i)).toBeInTheDocument()
  })

  it('google button triggers auth flow on click', async () => {
    const { prepareGoogleOauthSession } = await import('@/shared/lib/oauth')
    ;(prepareGoogleOauthSession as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('fail'))

    renderSignInPage()
    const googleBtn = screen.getByRole('button', { name: /Google/i })
    fireEvent.click(googleBtn)

    await waitFor(() => {
      expect(screen.getByText(/Не удалось начать вход через Google/i)).toBeInTheDocument()
    })
  })
})

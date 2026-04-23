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

vi.mock('@/shared/lib/github-oauth', () => ({
  prepareGithubOauthSession: vi.fn().mockReturnValue('github-state'),
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

  it('renders email input', () => {
    renderSignInPage()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
  })

  it('renders send code button', () => {
    renderSignInPage()
    expect(screen.getByRole('button', { name: /Получить код/i })).toBeInTheDocument()
  })

  it('renders Google sign-in button', () => {
    renderSignInPage()
    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument()
  })

  it('renders GitHub sign-in button', () => {
    renderSignInPage()
    expect(screen.getByRole('button', { name: /GitHub/i })).toBeInTheDocument()
  })

  it('updates email input on change', () => {
    renderSignInPage()
    const emailInput = screen.getByPlaceholderText('you@example.com')
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    expect((emailInput as HTMLInputElement).value).toBe('user@example.com')
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

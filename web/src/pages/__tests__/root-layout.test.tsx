import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { authReducer } from '@/features/auth/auth-slice'
import { baseApi } from '@/shared/api/base-api'
import { RootLayout } from '../root-layout'

vi.mock('@/shared/lib/storage', () => ({
  tokenStorage: {
    getAccessToken: vi.fn(() => 'test-token'),
    getRefreshToken: vi.fn(() => 'test-refresh'),
    setTokens: vi.fn(),
    clear: vi.fn(),
  },
}))

vi.mock('@/shared/theme/theme-provider', () => ({
  ThemeToggle: ({ className }: { className?: string }) => (
    <button className={className} aria-label="toggle theme">Theme</button>
  ),
}))

const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  })

function renderRootLayout() {
  const store = makeStore()
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <RootLayout />
      </MemoryRouter>
    </Provider>,
  )
}

describe('RootLayout', () => {
  it('renders the Sobeslife brand link', () => {
    renderRootLayout()
    const brandLinks = screen.getAllByRole('link', { name: 'Sobeslife' })
    expect(brandLinks.length).toBeGreaterThan(0)
  })

  it('renders Тесты nav link', () => {
    renderRootLayout()
    const links = screen.getAllByRole('link', { name: /Тесты/i })
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders Собеседования nav link', () => {
    renderRootLayout()
    const links = screen.getAllByRole('link', { name: /Собеседования/i })
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders Аналитика nav link', () => {
    renderRootLayout()
    const links = screen.getAllByRole('link', { name: /Аналитика/i })
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders Профиль nav link', () => {
    renderRootLayout()
    const links = screen.getAllByRole('link', { name: /Профиль/i })
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders logout button', () => {
    renderRootLayout()
    expect(screen.getByRole('button', { name: /Выйти/i })).toBeInTheDocument()
  })

  it('renders Outlet (main content area)', () => {
    renderRootLayout()
    // Outlet renders inside <main>; verify the container exists
    const main = document.querySelector('main')
    expect(main).toBeInTheDocument()
  })
})

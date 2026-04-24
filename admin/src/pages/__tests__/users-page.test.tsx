import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { authReducer } from '@/features/auth/auth-slice'
import { baseApi } from '@/shared/api/base-api'
import { UsersPage } from '../users-page'

vi.mock('@/shared/lib/storage', () => ({
  tokenStorage: {
    getAccessToken: vi.fn(() => 'admin-token'),
    setToken: vi.fn(),
    clear: vi.fn(),
  },
}))

vi.mock('@/shared/api/admin-api', () => ({
  useGetWebUsersQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
  useCreateWebUserMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useUpdateWebUserMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useDeleteWebUserMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}))

const makeStore = () =>
  configureStore({
    reducer: {
      adminAuth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  })

function renderUsersPage() {
  return render(
    <Provider store={makeStore()}>
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    </Provider>,
  )
}

describe('UsersPage', () => {
  it('renders page heading', () => {
    renderUsersPage()
    expect(screen.getByRole('heading', { name: /Пользователи/i })).toBeInTheDocument()
  })

  it('renders Создать button', () => {
    renderUsersPage()
    expect(screen.getByRole('button', { name: /Создать/i })).toBeInTheDocument()
  })

  it('shows empty state when no users returned', () => {
    renderUsersPage()
    expect(screen.getByText(/Нет пользователей/i)).toBeInTheDocument()
  })

  it('renders users table when data exists', async () => {
    const { useGetWebUsersQuery } = await import('@/shared/api/admin-api')
    ;(useGetWebUsersQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      data: [
        {
          id: 1,
          nickname: 'john_doe',
          first_name: null,
          last_name: null,
          email: 'john@example.com',
          profession: 'Frontend',
          expertise_level: 'junior',
          years_experience: null,
          github_url: null,
          linkedin_url: null,
          about: null,
          profile_completed: false,
          created_at: '2024-01-15T10:00:00Z',
        },
      ],
      isLoading: false,
    })

    renderUsersPage()
    expect(screen.getByText('john_doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('shows user count in subtitle', async () => {
    const { useGetWebUsersQuery } = await import('@/shared/api/admin-api')
    ;(useGetWebUsersQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      data: [],
      isLoading: false,
    })

    renderUsersPage()
    expect(screen.getByText(/0 из 0 пользователей/i)).toBeInTheDocument()
  })
})

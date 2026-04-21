import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { authReducer } from '@/features/auth/auth-slice'
import { baseApi } from '@/shared/api/base-api'
import { TestsPage } from '../tests-page'

vi.mock('@/shared/lib/storage', () => ({
  tokenStorage: {
    getAccessToken: vi.fn(() => 'admin-token'),
    setToken: vi.fn(),
    clear: vi.fn(),
  },
}))

vi.mock('@/shared/api/admin-api', () => ({
  useGetTestsQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
  useCreateTestMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useDeleteTestMutation: vi.fn(() => [vi.fn(), {}]),
  useGetTestQuestionsQuery: vi.fn(() => ({ data: [], isLoading: false })),
  useAddQuestionToTestMutation: vi.fn(() => [vi.fn(), {}]),
  useRemoveQuestionFromTestMutation: vi.fn(() => [vi.fn(), {}]),
  useGetQuestionsQuery: vi.fn(() => ({ data: [], isLoading: false })),
}))

const makeStore = () =>
  configureStore({
    reducer: {
      adminAuth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  })

function renderTestsPage() {
  return render(
    <Provider store={makeStore()}>
      <MemoryRouter>
        <TestsPage />
      </MemoryRouter>
    </Provider>,
  )
}

describe('TestsPage', () => {
  it('renders page heading', () => {
    renderTestsPage()
    expect(screen.getByRole('heading', { name: /Тесты/i })).toBeInTheDocument()
  })

  it('renders Создать тест button', () => {
    renderTestsPage()
    expect(screen.getByRole('button', { name: /Создать тест/i })).toBeInTheDocument()
  })

  it('shows empty state when no tests returned', () => {
    renderTestsPage()
    expect(screen.getByText(/Нет тестов/i)).toBeInTheDocument()
  })

  it('renders tests table when data exists', async () => {
    const { useGetTestsQuery } = await import('@/shared/api/admin-api')
    ;(useGetTestsQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      data: [
        {
          id: 1,
          title: 'JavaScript Basics',
          profession: 'Frontend',
          chapter: 'Basics',
          technology: null,
          expertise_level: 'junior',
          question_count: 10,
          status: null,
          score: null,
        },
      ],
      isLoading: false,
    })

    renderTestsPage()
    expect(screen.getByText('JavaScript Basics')).toBeInTheDocument()
    expect(screen.getByText('Frontend')).toBeInTheDocument()
  })
})

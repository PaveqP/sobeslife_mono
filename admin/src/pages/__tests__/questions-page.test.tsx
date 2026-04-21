import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { authReducer } from '@/features/auth/auth-slice'
import { baseApi } from '@/shared/api/base-api'
import { QuestionsPage } from '../questions-page'

vi.mock('@/shared/lib/storage', () => ({
  tokenStorage: {
    getAccessToken: vi.fn(() => 'admin-token'),
    setToken: vi.fn(),
    clear: vi.fn(),
  },
}))

// Mock RTK Query hooks used in QuestionsPage
vi.mock('@/shared/api/admin-api', () => ({
  useGetQuestionsQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
  useCreateQuestionMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useUpdateQuestionMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useDeleteQuestionMutation: vi.fn(() => [vi.fn(), {}]),
}))

const makeStore = () =>
  configureStore({
    reducer: {
      adminAuth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  })

function renderQuestionsPage() {
  return render(
    <Provider store={makeStore()}>
      <MemoryRouter>
        <QuestionsPage />
      </MemoryRouter>
    </Provider>,
  )
}

describe('QuestionsPage', () => {
  it('renders page heading', () => {
    renderQuestionsPage()
    expect(screen.getByRole('heading', { name: /Вопросы/i })).toBeInTheDocument()
  })

  it('renders profession filter input', () => {
    renderQuestionsPage()
    expect(screen.getByPlaceholderText('Профессия')).toBeInTheDocument()
  })

  it('renders chapter filter input', () => {
    renderQuestionsPage()
    expect(screen.getByPlaceholderText('Модуль')).toBeInTheDocument()
  })

  it('renders technology filter input', () => {
    renderQuestionsPage()
    expect(screen.getByPlaceholderText('Технология')).toBeInTheDocument()
  })

  it('renders create question button', () => {
    renderQuestionsPage()
    expect(screen.getByRole('button', { name: /Создать вопрос/i })).toBeInTheDocument()
  })

  it('shows empty state when no questions returned', () => {
    renderQuestionsPage()
    expect(screen.getByText(/Нет вопросов/i)).toBeInTheDocument()
  })

  it('renders questions table when data exists', async () => {
    const { useGetQuestionsQuery } = await import('@/shared/api/admin-api')
    ;(useGetQuestionsQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      data: [
        {
          id: 1,
          text: 'What is React?',
          correct_answer: 'A UI library',
          profession: 'Frontend',
          chapter: 'Basics',
          technology: 'React',
          expertise_level: 'junior',
        },
      ],
      isLoading: false,
    })

    renderQuestionsPage()
    expect(screen.getByText('What is React?')).toBeInTheDocument()
    expect(screen.getByText('Frontend')).toBeInTheDocument()
  })
})

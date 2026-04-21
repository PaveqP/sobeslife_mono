import { useState } from 'react'
import {
  useGetTestsQuery,
  useCreateTestMutation,
  useDeleteTestMutation,
  useGetTestQuestionsQuery,
  useAddQuestionToTestMutation,
  useRemoveQuestionFromTestMutation,
  useGetQuestionsQuery,
} from '@/shared/api/admin-api'
import type { TestListItem } from '@/shared/api/types'
import { Badge, EmptyState, Skeleton } from '@/shared/ui/surfaces'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/shared/ui/table'
import { Button } from '@/shared/ui/button'
import { Plus, Trash2, BookOpen, X } from 'lucide-react'

const EXPERTISE_LEVELS = ['trainee', 'junior', 'middle', 'senior']

// ── Create Test Dialog ────────────────────────────────────────────────────────

function CreateTestDialog({ onClose }: { onClose: () => void }) {
  const [createTest, { isLoading }] = useCreateTestMutation()
  const [form, setForm] = useState({
    title: '',
    profession: '',
    chapter: '',
    technology: '',
    expertise_level: 'junior',
  })

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createTest({
      title: form.title,
      profession: form.profession,
      chapter: form.chapter,
      technology: form.technology || null,
      expertise_level: form.expertise_level,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Создать тест</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { key: 'title', label: 'Название', required: true },
            { key: 'profession', label: 'Профессия', required: true },
            { key: 'chapter', label: 'Модуль', required: true },
            { key: 'technology', label: 'Технология', required: false },
          ].map(({ key, label, required }) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium text-text-secondary">{label}</label>
              <input
                className="w-full rounded-lg border border-border-subtle bg-page px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                value={(form as Record<string, string>)[key]}
                onChange={(e) => set(key, e.target.value)}
                required={required}
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Уровень</label>
            <select
              className="w-full rounded-lg border border-border-subtle bg-page px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              value={form.expertise_level}
              onChange={(e) => set('expertise_level', e.target.value)}
            >
              {EXPERTISE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Отмена</Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Manage Questions Modal ────────────────────────────────────────────────────

function ManageQuestionsModal({ test, onClose }: { test: TestListItem; onClose: () => void }) {
  const { data: testQuestionsData, isLoading: loadingQ } = useGetTestQuestionsQuery(test.id)
  const { data: allQuestionsData } = useGetQuestionsQuery({})
  const [addQ] = useAddQuestionToTestMutation()
  const [removeQ] = useRemoveQuestionFromTestMutation()

  const testQuestions = testQuestionsData ?? []
  const allQuestions = allQuestionsData ?? []
  const testQIds = new Set(testQuestions.map((q) => q.question_id))
  const available = allQuestions.filter((q) => !testQIds.has(q.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-[80vh] w-full max-w-3xl flex-col rounded-xl bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Вопросы теста</h2>
            <p className="text-sm text-text-secondary">{test.title}</p>
          </div>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Current questions */}
          <div className="flex flex-1 flex-col overflow-hidden border-r border-border-subtle">
            <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              В тесте ({testQuestions.length})
            </p>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
              {loadingQ ? (
                <p className="text-sm text-text-secondary">Загрузка...</p>
              ) : testQuestions.length === 0 ? (
                <p className="text-sm text-text-secondary">Нет вопросов</p>
              ) : (
                testQuestions.map((q) => (
                  <div key={q.test_question_id} className="flex items-start gap-2 rounded-lg border border-border-subtle p-3">
                    <p className="flex-1 text-sm text-text-primary line-clamp-2">{q.text}</p>
                    <button
                      onClick={() => removeQ({ testId: test.id, questionId: q.question_id })}
                      className="shrink-0 text-red-400 hover:text-red-600"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available questions */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Доступные ({available.length})
            </p>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
              {available.length === 0 ? (
                <p className="text-sm text-text-secondary">Все вопросы добавлены</p>
              ) : (
                available.map((q) => (
                  <div key={q.id} className="flex items-start gap-2 rounded-lg border border-border-subtle p-3">
                    <p className="flex-1 text-sm text-text-primary line-clamp-2">{q.text}</p>
                    <button
                      onClick={() => addQ({ testId: test.id, questionId: q.id })}
                      className="shrink-0 text-accent hover:text-accent/80"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const TestsPage = () => {
  const { data: testsData, isLoading } = useGetTestsQuery()
  const [deleteTest] = useDeleteTestMutation()
  const tests = testsData ?? []

  const [showCreate, setShowCreate] = useState(false)
  const [managingTest, setManagingTest] = useState<TestListItem | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить тест?')) return
    setDeletingId(id)
    await deleteTest(id)
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Тесты</h1>
          <p className="text-sm text-text-secondary">
            {isLoading ? 'Загрузка...' : `${tests.length} тестов в каталоге`}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          Создать тест
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : tests.length === 0 ? (
        <EmptyState title="Нет тестов" description="Тесты ещё не добавлены в каталог." />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeader>ID</TableHeader>
              <TableHeader>Название</TableHeader>
              <TableHeader>Профессия</TableHeader>
              <TableHeader>Модуль</TableHeader>
              <TableHeader>Технология</TableHeader>
              <TableHeader>Уровень</TableHeader>
              <TableHeader>Вопросов</TableHeader>
              <TableHeader></TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {tests.map((test) => (
              <TableRow key={test.id}>
                <TableCell className="text-text-tertiary">{test.id}</TableCell>
                <TableCell className="font-medium">{test.title}</TableCell>
                <TableCell className="text-text-secondary">{test.profession}</TableCell>
                <TableCell className="text-text-secondary">{test.chapter ?? '—'}</TableCell>
                <TableCell className="text-text-secondary">{test.technology ?? '—'}</TableCell>
                <TableCell>
                  <Badge tone="accent">{test.expertise_level}</Badge>
                </TableCell>
                <TableCell className="text-text-secondary">{test.question_count}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setManagingTest(test)}
                      className="text-accent hover:text-accent/80"
                      title="Управление вопросами"
                    >
                      <BookOpen className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(test.id)}
                      disabled={deletingId === test.id}
                      className="text-red-400 hover:text-red-600 disabled:opacity-50"
                      title="Удалить"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {showCreate && <CreateTestDialog onClose={() => setShowCreate(false)} />}
      {managingTest && <ManageQuestionsModal test={managingTest} onClose={() => setManagingTest(null)} />}
    </div>
  )
}

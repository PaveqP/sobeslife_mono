import { useState } from 'react'
import {
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} from '@/shared/api/admin-api'
import type { AdminQuestion, AdminQuestionFilters } from '@/shared/api/types'
import { Badge, EmptyState, Skeleton } from '@/shared/ui/surfaces'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/shared/ui/table'
import { Button } from '@/shared/ui/button'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

const EXPERTISE_LEVELS = ['trainee', 'junior', 'middle', 'senior']

type FormData = {
  text: string
  correct_answer: string
  profession: string
  chapter: string
  technology: string
  expertise_level: string
}

// ── Question Form Dialog ──────────────────────────────────────────────────────

function QuestionDialog({
  initial,
  onSave,
  onClose,
  isLoading,
}: {
  initial?: FormData
  onSave: (data: FormData) => Promise<void>
  onClose: () => void
  isLoading: boolean
}) {
  const [form, setForm] = useState<FormData>(
    initial ?? {
      text: '',
      correct_answer: '',
      profession: '',
      chapter: '',
      technology: '',
      expertise_level: 'junior',
    },
  )

  const set = (key: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            {initial ? 'Редактировать вопрос' : 'Создать вопрос'}
          </h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Вопрос</label>
            <textarea
              className="w-full rounded-lg border border-border-subtle bg-page px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              rows={3}
              value={form.text}
              onChange={(e) => set('text', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Правильный ответ</label>
            <textarea
              className="w-full rounded-lg border border-border-subtle bg-page px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              rows={3}
              value={form.correct_answer}
              onChange={(e) => set('correct_answer', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'profession' as const, label: 'Профессия', required: true },
              { key: 'chapter' as const, label: 'Модуль', required: true },
              { key: 'technology' as const, label: 'Технология', required: false },
            ].map(({ key, label, required }) => (
              <div key={key} className={key === 'technology' ? 'col-span-2' : ''}>
                <label className="mb-1 block text-sm font-medium text-text-secondary">{label}</label>
                <input
                  className="w-full rounded-lg border border-border-subtle bg-page px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  value={form[key]}
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
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Отмена</Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const QuestionsPage = () => {
  const [filters, setFilters] = useState({ profession: '', chapter: '', expertise_level: '' })
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== ''),
  ) as AdminQuestionFilters
  const { data: questionsData, isLoading } = useGetQuestionsQuery(activeFilters)
  const [createQuestion, { isLoading: creating }] = useCreateQuestionMutation()
  const [updateQuestion, { isLoading: updating }] = useUpdateQuestionMutation()
  const [deleteQuestion] = useDeleteQuestionMutation()

  const questions = questionsData ?? []

  const [showCreate, setShowCreate] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleCreate = async (data: FormData) => {
    await createQuestion({
      text: data.text,
      correct_answer: data.correct_answer,
      profession: data.profession,
      chapter: data.chapter,
      technology: data.technology || null,
      expertise_level: data.expertise_level,
    })
  }

  const handleUpdate = async (data: FormData) => {
    if (!editingQuestion) return
    await updateQuestion({
      id: editingQuestion.id,
      body: {
        text: data.text,
        correct_answer: data.correct_answer,
        profession: data.profession,
        chapter: data.chapter,
        technology: data.technology || null,
        expertise_level: data.expertise_level,
      },
    })
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить вопрос?')) return
    setDeletingId(id)
    await deleteQuestion(id)
    setDeletingId(null)
  }

  const setFilter = (key: string, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Вопросы</h1>
          <p className="text-sm text-text-secondary">
            {isLoading ? 'Загрузка...' : `${questions.length} вопросов`}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          Создать вопрос
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: 'profession', placeholder: 'Профессия' },
          { key: 'chapter', placeholder: 'Модуль' },
        ].map(({ key, placeholder }) => (
          <input
            key={key}
            className="rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder={placeholder}
            value={(filters as Record<string, string>)[key]}
            onChange={(e) => setFilter(key, e.target.value)}
          />
        ))}
        <select
          className="rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          value={filters.expertise_level}
          onChange={(e) => setFilter('expertise_level', e.target.value)}
        >
          <option value="">Все уровни</option>
          {EXPERTISE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        {(filters.profession || filters.chapter || filters.expertise_level) && (
          <button
            className="text-sm text-text-secondary hover:text-text-primary underline"
            onClick={() => setFilters({ profession: '', chapter: '', expertise_level: '' })}
          >
            Сбросить
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : questions.length === 0 ? (
        <EmptyState title="Нет вопросов" description="Вопросы ещё не добавлены или не совпадают с фильтрами." />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeader>ID</TableHeader>
              <TableHeader>Вопрос</TableHeader>
              <TableHeader>Профессия</TableHeader>
              <TableHeader>Модуль</TableHeader>
              <TableHeader>Технология</TableHeader>
              <TableHeader>Уровень</TableHeader>
              <TableHeader></TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {questions.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="text-text-tertiary">{q.id}</TableCell>
                <TableCell className="max-w-xs">
                  <p className="truncate font-medium text-text-primary" title={q.text}>{q.text}</p>
                </TableCell>
                <TableCell className="text-text-secondary">{q.profession}</TableCell>
                <TableCell className="text-text-secondary">{q.chapter}</TableCell>
                <TableCell className="text-text-secondary">{q.technology ?? '—'}</TableCell>
                <TableCell>
                  <Badge tone="accent">{q.expertise_level}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingQuestion(q)}
                      className="text-text-secondary hover:text-text-primary"
                      title="Редактировать"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      disabled={deletingId === q.id}
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

      {showCreate && (
        <QuestionDialog
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
          isLoading={creating}
        />
      )}
      {editingQuestion && (
        <QuestionDialog
          initial={{
            text: editingQuestion.text,
            correct_answer: editingQuestion.correct_answer,
            profession: editingQuestion.profession,
            chapter: editingQuestion.chapter,
            technology: editingQuestion.technology ?? '',
            expertise_level: editingQuestion.expertise_level,
          }}
          onSave={handleUpdate}
          onClose={() => setEditingQuestion(null)}
          isLoading={updating}
        />
      )}
    </div>
  )
}

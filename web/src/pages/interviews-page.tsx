import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Plus, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import {
  useGetInterviewHistoryQuery,
  useStartInterviewMutation,
} from '@/shared/api/interviews-api'
import { useGetProfessionsQuery } from '@/shared/api/tests-api'
import type { ExpertiseLevel, InterviewHistoryItem } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { Select, Input } from '@/shared/ui/form-controls'
import { Badge, Card, EmptyState, Skeleton } from '@/shared/ui/surfaces'

const durationOptions = [
  { value: 15, label: '15 минут' },
  { value: 30, label: '30 минут' },
  { value: 45, label: '45 минут' },
  { value: 60, label: '60 минут' },
]

const levelOptions: Array<{ value: ExpertiseLevel; label: string }> = [
  { value: 'trainee', label: 'Trainee' },
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
]

export const InterviewsPage = () => {
  const navigate = useNavigate()
  const { data: historyData, isLoading } = useGetInterviewHistoryQuery()
  const history = historyData ?? []
  const { data: professions = [] } = useGetProfessionsQuery()
  const [startInterview, { isLoading: isStarting }] = useStartInterviewMutation()

  const [form, setForm] = useState({
    profession: '',
    interview_level: 'junior' as ExpertiseLevel,
    duration_minutes: 30,
    candidate_specialization: '',
  })

  const handleStart = async () => {
    if (!form.profession) return
    const result = await startInterview(form).unwrap()
    sessionStorage.setItem(`interview_first_q_${result.id}`, result.first_question)
    navigate(`/interviews/${result.id}`)
  }

  const statusIcon = (item: InterviewHistoryItem) => {
    if (item.status === 'completed') {
      return item.verdict_passed
        ? <CheckCircle2 className="size-4 text-success" />
        : <XCircle className="size-4 text-danger" />
    }
    return <Clock className="size-4 text-accent" />
  }

  const statusBadge = (item: InterviewHistoryItem) => {
    if (item.status === 'in_progress') return <Badge tone="accent">В процессе</Badge>
    if (item.status === 'completed') {
      return item.verdict_passed
        ? <Badge tone="success">Прошёл</Badge>
        : <Badge tone="danger">Не прошёл</Badge>
    }
    return <Badge tone="neutral">Завершено</Badge>
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="space-y-2 bg-gradient-to-br from-accent-soft via-surface to-surface">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-accent w-fit">
            <MessageSquare className="size-3.5" />
            AI-собеседования
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
            Пройди собеседование с AI-интервьюером
          </h1>
          <p className="text-base text-text-secondary">
            Выбери профессию, уровень и продолжительность. AI задаёт вопросы, ты отвечаешь в свободной форме. В конце — детальный анализ.
          </p>
        </Card>

        {/* Start form */}
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Новое собеседование</h2>

          <Select
            label="Профессия"
            value={form.profession}
            onChange={(e) => setForm((s) => ({ ...s, profession: e.target.value }))}
          >
            <option value="">Выберите профессию</option>
            {professions.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </Select>

          <Select
            label="Уровень"
            value={form.interview_level}
            onChange={(e) => setForm((s) => ({ ...s, interview_level: e.target.value as ExpertiseLevel }))}
          >
            {levelOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>

          <Select
            label="Продолжительность"
            value={String(form.duration_minutes)}
            onChange={(e) => setForm((s) => ({ ...s, duration_minutes: Number(e.target.value) }))}
          >
            {durationOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>

          <Input
            label="Специализация (опционально)"
            placeholder="Например, React, Node.js, PostgreSQL"
            value={form.candidate_specialization}
            onChange={(e) => setForm((s) => ({ ...s, candidate_specialization: e.target.value }))}
          />

          <Button
            variant="primary"
            className="w-full"
            loading={isStarting}
            disabled={!form.profession}
            onClick={() => void handleStart()}
          >
            <Plus className="size-4" />
            Начать собеседование
          </Button>
        </Card>
      </section>

      {/* History */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">История собеседований</h2>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : history.length === 0 ? (
          <EmptyState title="Нет собеседований" description="Начните первое AI-собеседование выше." />
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <Card key={item.id} className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-subtle">
                  {statusIcon(item)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-text-primary">{item.profession}</span>
                    <Badge tone="accent">{item.interview_level}</Badge>
                    {statusBadge(item)}
                  </div>
                  <p className="text-sm text-text-tertiary mt-1">
                    {item.duration_minutes} мин · {new Date(item.started_at).toLocaleDateString('ru-RU')}
                    {item.candidate_specialization ? ` · ${item.candidate_specialization}` : ''}
                  </p>
                  {item.summary ? (
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">{item.summary}</p>
                  ) : null}
                </div>
                {item.status === 'in_progress' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/interviews/${item.id}`)}
                  >
                    Продолжить
                    <ChevronRight className="size-4" />
                  </Button>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

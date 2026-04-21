import { useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { useGetInterviewsQuery, useDeleteInterviewMutation } from '@/shared/api/admin-api'
import type { InterviewStatus } from '@/shared/api/types'
import { Badge, EmptyState, Skeleton } from '@/shared/ui/surfaces'
import { Button } from '@/shared/ui/button'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/shared/ui/table'

const statusTone = (status: InterviewStatus): 'accent' | 'success' | 'danger' | 'neutral' => {
  if (status === 'in_progress') return 'accent'
  if (status === 'completed') return 'success'
  return 'danger'
}

const statusLabel: Record<InterviewStatus, string> = {
  in_progress: 'В процессе',
  completed: 'Завершено',
  summary_failed: 'Ошибка',
}

export const InterviewsPage = () => {
  const { data: interviewsData, isLoading } = useGetInterviewsQuery()
  const interviews = interviewsData ?? []
  const [deleteInterview, { isLoading: isDeleting }] = useDeleteInterviewMutation()
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (confirmId !== id) { setConfirmId(id); return }
    await deleteInterview(id)
    setConfirmId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Собеседования</h1>
        <p className="text-sm text-text-secondary">
          {isLoading ? 'Загрузка...' : `${interviews.length} собеседований`}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState title="Нет собеседований" description="Пользователи ещё не проходили AI-собеседования." />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeader>ID</TableHeader>
              <TableHeader>Пользователь</TableHeader>
              <TableHeader>Профессия</TableHeader>
              <TableHeader>Уровень</TableHeader>
              <TableHeader>Длит.</TableHeader>
              <TableHeader>Статус</TableHeader>
              <TableHeader>Вердикт</TableHeader>
              <TableHeader>Начало</TableHeader>
              <TableHeader />
            </tr>
          </TableHead>
          <TableBody>
            {interviews.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-text-tertiary">{item.id}</TableCell>
                <TableCell className="text-text-secondary text-xs">{item.user_email}</TableCell>
                <TableCell className="font-medium">{item.profession}</TableCell>
                <TableCell>
                  <Badge tone="accent">{item.interview_level}</Badge>
                </TableCell>
                <TableCell className="text-text-secondary">{item.duration_minutes} мин</TableCell>
                <TableCell>
                  <Badge tone={statusTone(item.status)}>{statusLabel[item.status]}</Badge>
                </TableCell>
                <TableCell>
                  {item.verdict_passed === null ? (
                    <span className="text-text-tertiary">—</span>
                  ) : (
                    <Badge tone={item.verdict_passed ? 'success' : 'danger'}>
                      {item.verdict_passed ? 'Прошёл' : 'Не прошёл'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-text-tertiary text-xs">
                  {new Date(item.started_at).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant={confirmId === item.id ? 'danger' : 'ghost'}
                      size="sm"
                      loading={isDeleting && confirmId === item.id}
                      onClick={() => void handleDelete(item.id)}
                      title={confirmId === item.id ? 'Подтвердить удаление' : 'Удалить'}
                    >
                      <Trash2 className="size-3.5" />
                      {confirmId === item.id ? 'Удалить?' : ''}
                    </Button>
                    {confirmId === item.id && (
                      <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>
                        <X className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

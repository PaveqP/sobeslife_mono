import { useState, useEffect } from 'react'
import { User, Edit3, Save, X } from 'lucide-react'
import { useGetProfileQuery, useUpdateProfileMutation } from '@/shared/api/users-api'
import { useGetProfessionsQuery } from '@/shared/api/tests-api'
import type { ExpertiseLevel } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { Input, Select } from '@/shared/ui/form-controls'
import { Badge, Card, Skeleton } from '@/shared/ui/surfaces'

const gradeOptions: Array<{ value: ExpertiseLevel; label: string }> = [
  { value: 'trainee', label: 'Trainee' },
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
]

export const ProfilePage = () => {
  const { data: profile, isLoading } = useGetProfileQuery()
  const { data: professions = [] } = useGetProfessionsQuery()
  const [updateProfile, { isLoading: isSaving, isSuccess, error }] = useUpdateProfileMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    nickname: '',
    profession: '',
    grade: '' as ExpertiseLevel | '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        nickname: profile.nickname ?? '',
        profession: profile.profession ?? '',
        grade: profile.grade ?? '',
      })
    }
  }, [profile])

  const handleSave = async () => {
    const payload: Record<string, string> = {}
    if (form.nickname) payload.nickname = form.nickname
    if (form.profession) payload.profession = form.profession
    if (form.grade) payload.grade = form.grade
    await updateProfile(payload).unwrap()
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-2/5" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-accent-soft">
          <User className="size-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Личный кабинет</h1>
          <p className="text-sm text-text-secondary">Настройки профиля и информация об аккаунте</p>
        </div>
      </div>

      <Card className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex size-16 items-center justify-center rounded-full bg-accent-soft text-2xl font-bold text-accent">
              {(profile?.nickname ?? 'U').charAt(0).toUpperCase()}
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-text-primary">
                  {profile?.nickname ?? 'Не указано'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile?.profession && <Badge>{profile.profession}</Badge>}
                  {profile?.grade && <Badge tone="accent">{profile.grade}</Badge>}
                </div>
              </div>
            )}
          </div>
          {!isEditing ? (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              <Edit3 className="size-4" />
              Редактировать
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                <X className="size-4" />
                Отмена
              </Button>
              <Button variant="primary" size="sm" loading={isSaving} onClick={() => void handleSave()}>
                <Save className="size-4" />
                Сохранить
              </Button>
            </div>
          )}
        </div>

        {isSuccess && !isEditing && (
          <div className="rounded-2xl border border-success/20 bg-success-soft px-4 py-3 text-sm text-success">
            Профиль успешно обновлён
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
            Не удалось обновить профиль. Попробуйте ещё раз.
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <Input
              label="Никнейм"
              placeholder="Ваш никнейм"
              value={form.nickname}
              onChange={(e) => setForm((s) => ({ ...s, nickname: e.target.value }))}
            />
            <Select
              label="Профессия"
              value={form.profession}
              onChange={(e) => setForm((s) => ({ ...s, profession: e.target.value }))}
            >
              <option value="">Не выбрана</option>
              {professions.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </Select>
            <Select
              label="Уровень"
              value={form.grade}
              onChange={(e) => setForm((s) => ({ ...s, grade: e.target.value as ExpertiseLevel | '' }))}
            >
              <option value="">Не указан</option>
              {gradeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 border-t border-border-subtle pt-4">
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Никнейм</p>
              <p className="text-sm font-medium text-text-primary">{profile?.nickname ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Профессия</p>
              <p className="text-sm font-medium text-text-primary">{profile?.profession ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Уровень</p>
              <p className="text-sm font-medium text-text-primary">{profile?.grade ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">ID пользователя</p>
              <p className="text-sm font-medium text-text-primary">{profile?.user_id ?? '—'}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

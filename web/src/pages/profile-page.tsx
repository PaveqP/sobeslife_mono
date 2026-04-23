import { useState, useEffect } from 'react'
import { User, Edit3, Save, X, Sparkles } from 'lucide-react'
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

type FormState = {
  nickname: string
  first_name: string
  last_name: string
  profession: string
  grade: ExpertiseLevel | ''
  years_experience: string
  github_url: string
  linkedin_url: string
  about: string
}

export const ProfilePage = () => {
  const { data: profile, isLoading } = useGetProfileQuery()
  const { data: professions = [] } = useGetProfessionsQuery()
  const [updateProfile, { isLoading: isSaving, isSuccess, error }] = useUpdateProfileMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<FormState>({
    nickname: '',
    first_name: '',
    last_name: '',
    profession: '',
    grade: '',
    years_experience: '',
    github_url: '',
    linkedin_url: '',
    about: '',
  })

  // Auto-open edit form on first login
  useEffect(() => {
    if (profile && !profile.profile_completed) {
      setIsEditing(true)
    }
  }, [profile])

  useEffect(() => {
    if (profile) {
      setForm({
        nickname: profile.nickname ?? '',
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        profession: profile.profession ?? '',
        grade: profile.grade ?? '',
        years_experience: profile.years_experience != null ? String(profile.years_experience) : '',
        github_url: profile.github_url ?? '',
        linkedin_url: profile.linkedin_url ?? '',
        about: profile.about ?? '',
      })
    }
  }, [profile])

  const handleSave = async () => {
    const payload: Record<string, string | number | null> = {}
    if (form.nickname) payload.nickname = form.nickname
    if (form.first_name) payload.first_name = form.first_name
    if (form.last_name) payload.last_name = form.last_name
    if (form.profession) payload.profession = form.profession
    if (form.grade) payload.grade = form.grade
    if (form.years_experience) payload.years_experience = parseInt(form.years_experience, 10)
    if (form.github_url) payload.github_url = form.github_url
    if (form.linkedin_url) payload.linkedin_url = form.linkedin_url
    if (form.about) payload.about = form.about
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

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.nickname

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

      {/* First-login welcome banner */}
      {profile && !profile.profile_completed && !isEditing && (
        <div className="rounded-2xl border border-accent/20 bg-accent-soft px-5 py-4 flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 text-accent shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-accent">Добро пожаловать! Заполните профиль</p>
            <p className="text-sm text-text-secondary">
              Укажите свои данные — это поможет подобрать подходящие тесты и собеседования.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
            Заполнить
          </Button>
        </div>
      )}

      <Card className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex size-16 items-center justify-center rounded-full bg-accent-soft text-2xl font-bold text-accent">
              {(displayName ?? 'U').charAt(0).toUpperCase()}
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-text-primary">
                  {displayName ?? 'Не указано'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile?.profession && <Badge>{profile.profession}</Badge>}
                  {profile?.grade && <Badge tone="accent">{profile.grade}</Badge>}
                  {profile?.years_experience != null && (
                    <Badge>{profile.years_experience} лет опыта</Badge>
                  )}
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Имя"
                placeholder="Иван"
                value={form.first_name}
                onChange={(e) => setForm((s) => ({ ...s, first_name: e.target.value }))}
              />
              <Input
                label="Фамилия"
                placeholder="Иванов"
                value={form.last_name}
                onChange={(e) => setForm((s) => ({ ...s, last_name: e.target.value }))}
              />
            </div>
            <Input
              label="Никнейм"
              placeholder="ivan_dev"
              value={form.nickname}
              onChange={(e) => setForm((s) => ({ ...s, nickname: e.target.value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
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
                label="Грейд"
                value={form.grade}
                onChange={(e) => setForm((s) => ({ ...s, grade: e.target.value as ExpertiseLevel | '' }))}
              >
                <option value="">Не указан</option>
                {gradeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </div>
            <Input
              label="Лет опыта"
              type="number"
              min="0"
              max="50"
              placeholder="3"
              value={form.years_experience}
              onChange={(e) => setForm((s) => ({ ...s, years_experience: e.target.value }))}
            />
            <Input
              label="GitHub профиль"
              type="url"
              placeholder="https://github.com/username"
              value={form.github_url}
              onChange={(e) => setForm((s) => ({ ...s, github_url: e.target.value }))}
            />
            <Input
              label="LinkedIn профиль"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={form.linkedin_url}
              onChange={(e) => setForm((s) => ({ ...s, linkedin_url: e.target.value }))}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">О себе</label>
              <textarea
                className="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                rows={3}
                placeholder="Кратко о своём опыте и специализации..."
                value={form.about}
                onChange={(e) => setForm((s) => ({ ...s, about: e.target.value }))}
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 border-t border-border-subtle pt-4">
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Имя</p>
              <p className="text-sm font-medium text-text-primary">
                {[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Никнейм</p>
              <p className="text-sm font-medium text-text-primary">{profile?.nickname ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Профессия</p>
              <p className="text-sm font-medium text-text-primary">{profile?.profession ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Грейд</p>
              <p className="text-sm font-medium text-text-primary">{profile?.grade ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Опыт</p>
              <p className="text-sm font-medium text-text-primary">
                {profile?.years_experience != null ? `${profile.years_experience} лет` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">ID</p>
              <p className="text-sm font-medium text-text-primary">{profile?.user_id ?? '—'}</p>
            </div>
            {profile?.github_url && (
              <div className="sm:col-span-2">
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">GitHub</p>
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-accent hover:text-accent-strong">
                  {profile.github_url}
                </a>
              </div>
            )}
            {profile?.linkedin_url && (
              <div className="sm:col-span-2">
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">LinkedIn</p>
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-accent hover:text-accent-strong">
                  {profile.linkedin_url}
                </a>
              </div>
            )}
            {profile?.about && (
              <div className="sm:col-span-2">
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">О себе</p>
                <p className="text-sm text-text-primary">{profile.about}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

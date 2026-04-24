import { useState, useMemo } from 'react'
import { Trash2, Plus, Edit2, X, Check, ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink, User } from 'lucide-react'
import {
  useGetWebUsersQuery,
  useCreateWebUserMutation,
  useUpdateWebUserMutation,
  useDeleteWebUserMutation,
} from '@/shared/api/admin-api'
import type { WebUser, CreateWebUserRequest, UpdateWebUserRequest } from '@/shared/api/types'
import { Badge, Card, EmptyState, Skeleton } from '@/shared/ui/surfaces'
import { Button } from '@/shared/ui/button'
import { Input, Select } from '@/shared/ui/form-controls'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/shared/ui/table'

const LEVELS = ['trainee', 'junior', 'middle', 'senior']

type SortField = 'id' | 'email' | 'nickname' | 'profession' | 'expertise_level' | 'created_at'
type SortDir = 'asc' | 'desc'

// ── Dialog shell ─────────────────────────────────────────────────────────────

const UserDialog = ({
  title,
  onClose,
  onSave,
  saving,
  children,
}: {
  title: string
  onClose: () => void
  onSave: () => void
  saving: boolean
  children: React.ReactNode
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
    <Card className="w-full max-w-md space-y-5 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
          <X className="size-5" />
        </button>
      </div>
      {children}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>Отмена</Button>
        <Button variant="primary" size="sm" loading={saving} onClick={onSave}>
          <Check className="size-4" />
          Сохранить
        </Button>
      </div>
    </Card>
  </div>
)

// ── Create form ───────────────────────────────────────────────────────────────

const CreateUserForm = ({ onClose }: { onClose: () => void }) => {
  const [createUser, { isLoading }] = useCreateWebUserMutation()
  const [form, setForm] = useState<CreateWebUserRequest>({ email: '' })
  const [error, setError] = useState('')

  const set = (k: keyof CreateWebUserRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((s) => ({ ...s, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.email) { setError('Email обязателен'); return }
    try {
      await createUser({
        email: form.email,
        nickname: form.nickname || null,
        profession: form.profession || null,
        expertise_level: form.expertise_level || null,
      }).unwrap()
      onClose()
    } catch {
      setError('Не удалось создать пользователя')
    }
  }

  return (
    <UserDialog title="Новый пользователь" onClose={onClose} onSave={() => void handleSave()} saving={isLoading}>
      <div className="space-y-3">
        {error && <p className="text-xs text-danger">{error}</p>}
        <Input label="Email *" type="email" value={form.email} onChange={set('email')} placeholder="user@example.com" />
        <Input label="Никнейм" value={form.nickname ?? ''} onChange={set('nickname')} placeholder="username" />
        <Input label="Профессия" value={form.profession ?? ''} onChange={set('profession')} placeholder="Frontend Developer" />
        <Select label="Уровень" value={form.expertise_level ?? ''} onChange={set('expertise_level')}>
          <option value="">Не указан</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
      </div>
    </UserDialog>
  )
}

// ── Edit form ─────────────────────────────────────────────────────────────────

const EditUserForm = ({ user, onClose }: { user: WebUser; onClose: () => void }) => {
  const [updateUser, { isLoading }] = useUpdateWebUserMutation()
  const [form, setForm] = useState<UpdateWebUserRequest>({
    nickname: user.nickname ?? '',
    email: user.email,
    profession: user.profession ?? '',
    expertise_level: user.expertise_level ?? '',
  })
  const [error, setError] = useState('')

  const set = (k: keyof UpdateWebUserRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((s) => ({ ...s, [k]: e.target.value }))

  const handleSave = async () => {
    try {
      await updateUser({
        id: user.id,
        body: {
          nickname: form.nickname || null,
          email: form.email || null,
          profession: form.profession || null,
          expertise_level: form.expertise_level || null,
        },
      }).unwrap()
      onClose()
    } catch {
      setError('Не удалось обновить пользователя')
    }
  }

  return (
    <UserDialog title={`Редактировать #${user.id}`} onClose={onClose} onSave={() => void handleSave()} saving={isLoading}>
      <div className="space-y-3">
        {error && <p className="text-xs text-danger">{error}</p>}
        <Input label="Email" type="email" value={form.email ?? ''} onChange={set('email')} />
        <Input label="Никнейм" value={form.nickname ?? ''} onChange={set('nickname')} />
        <Input label="Профессия" value={form.profession ?? ''} onChange={set('profession')} placeholder="Frontend Developer" />
        <Select label="Уровень" value={form.expertise_level ?? ''} onChange={set('expertise_level')}>
          <option value="">Не указан</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
      </div>
    </UserDialog>
  )
}

// ── User detail panel ─────────────────────────────────────────────────────────

const UserDetailPanel = ({ user, onClose }: { user: WebUser; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm"
    onClick={onClose}>
    <div className="h-full w-full max-w-sm overflow-y-auto bg-surface shadow-xl"
      onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-border-subtle p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-lg font-bold text-accent">
            {(user.first_name ?? user.nickname ?? user.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-text-primary">
              {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.nickname || '—'}
            </p>
            <p className="text-xs text-text-tertiary">#{user.id}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
          <X className="size-5" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          {user.profession && <Badge>{user.profession}</Badge>}
          {user.expertise_level && <Badge tone="accent">{user.expertise_level}</Badge>}
          <Badge tone={user.profile_completed ? 'success' : 'neutral'}>
            {user.profile_completed ? 'Профиль заполнен' : 'Профиль не заполнен'}
          </Badge>
        </div>

        <dl className="space-y-3 text-sm">
          <Row label="Email" value={user.email} />
          <Row label="Никнейм" value={user.nickname} />
          <Row label="Имя" value={user.first_name} />
          <Row label="Фамилия" value={user.last_name} />
          <Row label="Профессия" value={user.profession} />
          <Row label="Грейд" value={user.expertise_level} />
          <Row label="Лет опыта" value={user.years_experience != null ? `${user.years_experience}` : null} />
          <Row label="Дата регистрации" value={new Date(user.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </dl>

        {user.about && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary mb-1">О себе</p>
            <p className="text-sm text-text-primary">{user.about}</p>
          </div>
        )}

        <div className="space-y-2">
          {user.github_url && (
            <a href={user.github_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-accent hover:underline">
              <ExternalLink className="size-3.5" /> GitHub
            </a>
          )}
          {user.linkedin_url && (
            <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-accent hover:underline">
              <ExternalLink className="size-3.5" /> LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  </div>
)

const Row = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex justify-between gap-2">
    <dt className="text-text-tertiary shrink-0">{label}</dt>
    <dd className="text-right font-medium text-text-primary">{value ?? '—'}</dd>
  </div>
)

// ── Sort header ───────────────────────────────────────────────────────────────

const SortHeader = ({
  label, field, sort, onSort,
}: {
  label: string
  field: SortField
  sort: { field: SortField; dir: SortDir }
  onSort: (f: SortField) => void
}) => {
  const active = sort.field === field
  return (
    <TableHeader>
      <button
        className="flex items-center gap-1 hover:text-text-primary"
        onClick={() => onSort(field)}
      >
        {label}
        {active
          ? sort.dir === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
          : <ChevronsUpDown className="size-3 opacity-40" />}
      </button>
    </TableHeader>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export const UsersPage = () => {
  const { data: usersData, isLoading } = useGetWebUsersQuery()
  const allUsers = usersData ?? []
  const [deleteUser, { isLoading: isDeleting }] = useDeleteWebUserMutation()
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<WebUser | null>(null)
  const [detailUser, setDetailUser] = useState<WebUser | null>(null)

  // --- Filters ---
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterProfession, setFilterProfession] = useState('')
  const [filterCompleted, setFilterCompleted] = useState<'' | 'yes' | 'no'>('')

  // --- Sort ---
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'id', dir: 'desc' })

  const handleSort = (field: SortField) => {
    setSort((s) => s.field === field
      ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { field, dir: 'asc' })
  }

  // Unique professions for filter dropdown
  const professions = useMemo(() => {
    const set = new Set(allUsers.map((u) => u.profession).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [allUsers])

  // Filtered + sorted list
  const users = useMemo(() => {
    const q = search.toLowerCase()
    let list = allUsers.filter((u) => {
      if (q && ![u.email, u.nickname, u.first_name, u.last_name]
        .filter(Boolean).some((v) => v!.toLowerCase().includes(q))) return false
      if (filterLevel && u.expertise_level !== filterLevel) return false
      if (filterProfession && u.profession !== filterProfession) return false
      if (filterCompleted === 'yes' && !u.profile_completed) return false
      if (filterCompleted === 'no' && u.profile_completed) return false
      return true
    })

    list = [...list].sort((a, b) => {
      let av: string | number = ''
      let bv: string | number = ''
      switch (sort.field) {
        case 'id': av = a.id; bv = b.id; break
        case 'email': av = a.email; bv = b.email; break
        case 'nickname': av = a.nickname ?? ''; bv = b.nickname ?? ''; break
        case 'profession': av = a.profession ?? ''; bv = b.profession ?? ''; break
        case 'expertise_level': av = a.expertise_level ?? ''; bv = b.expertise_level ?? ''; break
        case 'created_at': av = a.created_at; bv = b.created_at; break
      }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1
      if (av > bv) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [allUsers, search, filterLevel, filterProfession, filterCompleted, sort])

  const handleDelete = async (id: number) => {
    if (confirmId !== id) { setConfirmId(id); return }
    await deleteUser(id)
    setConfirmId(null)
  }

  const hasFilters = search || filterLevel || filterProfession || filterCompleted
  const resetFilters = () => {
    setSearch(''); setFilterLevel(''); setFilterProfession(''); setFilterCompleted('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Пользователи</h1>
          <p className="text-sm text-text-secondary">
            {isLoading ? 'Загрузка...' : `${users.length} из ${allUsers.length} пользователей`}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          Создать
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Поиск"
            placeholder="Email, ник, имя..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select label="Уровень" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
            <option value="">Все уровни</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>
          <Select label="Профессия" value={filterProfession} onChange={(e) => setFilterProfession(e.target.value)}>
            <option value="">Все профессии</option>
            {professions.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Select label="Профиль" value={filterCompleted} onChange={(e) => setFilterCompleted(e.target.value as '' | 'yes' | 'no')}>
            <option value="">Все</option>
            <option value="yes">Заполнен</option>
            <option value="no">Не заполнен</option>
          </Select>
        </div>
        {hasFilters && (
          <button onClick={resetFilters} className="text-xs text-accent hover:underline">
            Сбросить фильтры
          </button>
        )}
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'Ничего не найдено' : 'Нет пользователей'}
          description={hasFilters ? 'Попробуйте изменить фильтры.' : 'Пользователи пока не зарегистрированы.'}
        />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <SortHeader label="ID" field="id" sort={sort} onSort={handleSort} />
              <SortHeader label="Имя / Ник" field="nickname" sort={sort} onSort={handleSort} />
              <SortHeader label="Email" field="email" sort={sort} onSort={handleSort} />
              <SortHeader label="Профессия" field="profession" sort={sort} onSort={handleSort} />
              <SortHeader label="Уровень" field="expertise_level" sort={sort} onSort={handleSort} />
              <TableHeader>Опыт</TableHeader>
              <TableHeader>Профиль</TableHeader>
              <SortHeader label="Дата" field="created_at" sort={sort} onSort={handleSort} />
              <TableHeader />
            </tr>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="cursor-pointer" onClick={() => setDetailUser(user)}>
                <TableCell className="text-text-tertiary">{user.id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-text-primary">
                      {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.nickname || '—'}
                    </p>
                    {user.nickname && (user.first_name || user.last_name) && (
                      <p className="text-xs text-text-tertiary">@{user.nickname}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-text-secondary">{user.email}</TableCell>
                <TableCell className="text-text-secondary">{user.profession ?? '—'}</TableCell>
                <TableCell>
                  {user.expertise_level
                    ? <Badge tone="accent">{user.expertise_level}</Badge>
                    : <span className="text-text-tertiary">—</span>}
                </TableCell>
                <TableCell className="text-text-secondary">
                  {user.years_experience != null ? `${user.years_experience} л` : '—'}
                </TableCell>
                <TableCell>
                  <Badge tone={user.profile_completed ? 'success' : 'neutral'}>
                    {user.profile_completed ? '✓' : '—'}
                  </Badge>
                </TableCell>
                <TableCell className="text-text-tertiary text-xs">
                  {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setDetailUser(user)} title="Подробнее">
                      <User className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditUser(user)} title="Редактировать">
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant={confirmId === user.id ? 'danger' : 'ghost'}
                      size="sm"
                      loading={isDeleting && confirmId === user.id}
                      onClick={() => void handleDelete(user.id)}
                      title={confirmId === user.id ? 'Подтвердить удаление' : 'Удалить'}
                    >
                      <Trash2 className="size-3.5" />
                      {confirmId === user.id ? 'Удалить?' : ''}
                    </Button>
                    {confirmId === user.id && (
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

      {showCreate && <CreateUserForm onClose={() => setShowCreate(false)} />}
      {editUser && <EditUserForm user={editUser} onClose={() => setEditUser(null)} />}
      {detailUser && <UserDetailPanel user={detailUser} onClose={() => setDetailUser(null)} />}
    </div>
  )
}

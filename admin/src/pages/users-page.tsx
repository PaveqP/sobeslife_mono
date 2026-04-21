import { useState } from 'react'
import { Trash2, Plus, Edit2, X, Check } from 'lucide-react'
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

const emptyCreate: CreateWebUserRequest = {
  email: '', password: '', nickname: '', phone_number: '', profession: '', expertise_level: '',
}

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
    <Card className="w-full max-w-md space-y-5">
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

const CreateUserForm = ({ onClose }: { onClose: () => void }) => {
  const [createUser, { isLoading }] = useCreateWebUserMutation()
  const [form, setForm] = useState<CreateWebUserRequest>(emptyCreate)
  const [error, setError] = useState('')

  const set = (k: keyof CreateWebUserRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.email || !form.password) { setError('Email и пароль обязательны'); return }
    try {
      await createUser({
        ...form,
        nickname: form.nickname || null,
        phone_number: form.phone_number || null,
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
        <Input label="Пароль *" type="password" value={form.password} onChange={set('password')} placeholder="Минимум 6 символов" />
        <Input label="Никнейм" value={form.nickname ?? ''} onChange={set('nickname')} placeholder="username" />
        <Input label="Телефон" value={form.phone_number ?? ''} onChange={set('phone_number')} placeholder="+7..." />
        <Input label="Профессия (название)" value={form.profession ?? ''} onChange={set('profession')} placeholder="Frontend Developer" />
        <Select label="Уровень" value={form.expertise_level ?? ''} onChange={set('expertise_level')}>
          <option value="">Не указан</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
      </div>
    </UserDialog>
  )
}

const EditUserForm = ({ user, onClose }: { user: WebUser; onClose: () => void }) => {
  const [updateUser, { isLoading }] = useUpdateWebUserMutation()
  const [form, setForm] = useState<UpdateWebUserRequest>({
    nickname: user.nickname ?? '',
    email: user.email,
    phone_number: user.phone_number ?? '',
    profession: user.profession ?? '',
    expertise_level: user.expertise_level ?? '',
  })
  const [error, setError] = useState('')

  const set = (k: keyof UpdateWebUserRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }))

  const handleSave = async () => {
    try {
      await updateUser({
        id: user.id,
        body: {
          nickname: form.nickname || null,
          email: form.email || null,
          phone_number: form.phone_number || null,
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
        <Input label="Телефон" value={form.phone_number ?? ''} onChange={set('phone_number')} />
        <Input label="Профессия" value={form.profession ?? ''} onChange={set('profession')} placeholder="Frontend Developer" />
        <Select label="Уровень" value={form.expertise_level ?? ''} onChange={set('expertise_level')}>
          <option value="">Не указан</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
      </div>
    </UserDialog>
  )
}

export const UsersPage = () => {
  const { data: usersData, isLoading } = useGetWebUsersQuery()
  const users = usersData ?? []
  const [deleteUser, { isLoading: isDeleting }] = useDeleteWebUserMutation()
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<WebUser | null>(null)

  const handleDelete = async (id: number) => {
    if (confirmId !== id) { setConfirmId(id); return }
    await deleteUser(id)
    setConfirmId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Пользователи</h1>
          <p className="text-sm text-text-secondary">
            {isLoading ? 'Загрузка...' : `${users.length} пользователей в системе`}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          Создать
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="Нет пользователей" description="Пользователи пока не зарегистрированы." />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeader>ID</TableHeader>
              <TableHeader>Ник</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Телефон</TableHeader>
              <TableHeader>Профессия</TableHeader>
              <TableHeader>Уровень</TableHeader>
              <TableHeader>Дата</TableHeader>
              <TableHeader />
            </tr>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-text-tertiary">{user.id}</TableCell>
                <TableCell className="font-medium">{user.nickname ?? '—'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-text-secondary">{user.phone_number ?? '—'}</TableCell>
                <TableCell className="text-text-secondary">{user.profession ?? '—'}</TableCell>
                <TableCell>
                  {user.expertise_level ? (
                    <Badge tone="accent">{user.expertise_level}</Badge>
                  ) : (
                    <span className="text-text-tertiary">—</span>
                  )}
                </TableCell>
                <TableCell className="text-text-tertiary text-xs">
                  {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditUser(user)}
                      title="Редактировать"
                    >
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
    </div>
  )
}

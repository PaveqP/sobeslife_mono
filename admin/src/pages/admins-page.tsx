import { useState } from 'react'
import { Trash2, Plus, X, Check, Shield } from 'lucide-react'
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useDeleteAdminMutation,
} from '@/shared/api/admin-api'
import { Badge, Card, EmptyState, Skeleton } from '@/shared/ui/surfaces'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/form-controls'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/shared/ui/table'

const CreateAdminDialog = ({ onClose }: { onClose: () => void }) => {
  const [createAdmin, { isLoading }] = useCreateAdminMutation()
  const [form, setForm] = useState({ name: '', login: '', password: '' })
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name || !form.login || !form.password) {
      setError('Все поля обязательны')
      return
    }
    try {
      await createAdmin(form).unwrap()
      onClose()
    } catch {
      setError('Не удалось создать администратора (логин уже занят?)')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Новый администратор</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-3">
          {error && <p className="text-xs text-danger">{error}</p>}
          <Input label="Имя *" value={form.name} onChange={set('name')} placeholder="Иван Иванов" />
          <Input label="Логин *" value={form.login} onChange={set('login')} placeholder="admin_ivan" />
          <Input label="Пароль *" type="password" value={form.password} onChange={set('password')} placeholder="Минимум 6 символов" />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Отмена</Button>
          <Button variant="primary" size="sm" loading={isLoading} onClick={() => void handleSave()}>
            <Check className="size-4" />
            Создать
          </Button>
        </div>
      </Card>
    </div>
  )
}

export const AdminsPage = () => {
  const { data: adminsData, isLoading } = useGetAdminsQuery()
  const admins = adminsData ?? []
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation()
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const handleDelete = async (id: number) => {
    if (confirmId !== id) { setConfirmId(id); return }
    await deleteAdmin(id)
    setConfirmId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Администраторы</h1>
          <p className="text-sm text-text-secondary">
            {isLoading ? 'Загрузка...' : `${admins.length} администраторов`}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          Добавить
        </Button>
      </div>

      <div className="rounded-2xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm text-accent">
        <div className="flex items-start gap-2">
          <Shield className="size-4 mt-0.5 shrink-0" />
          <span>Администраторы имеют полный доступ к панели управления. Создавайте только доверенным лицам.</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : admins.length === 0 ? (
        <EmptyState title="Нет администраторов" description="Добавьте первого администратора." />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeader>ID</TableHeader>
              <TableHeader>Имя</TableHeader>
              <TableHeader>Логин</TableHeader>
              <TableHeader>Роль</TableHeader>
              <TableHeader>Создан</TableHeader>
              <TableHeader />
            </tr>
          </TableHead>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="text-text-tertiary">{admin.id}</TableCell>
                <TableCell className="font-medium">{admin.name}</TableCell>
                <TableCell className="text-text-secondary">{admin.login}</TableCell>
                <TableCell>
                  <Badge tone="accent">Admin</Badge>
                </TableCell>
                <TableCell className="text-text-tertiary text-xs">
                  {new Date(admin.created_at).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant={confirmId === admin.id ? 'danger' : 'ghost'}
                      size="sm"
                      loading={isDeleting && confirmId === admin.id}
                      onClick={() => void handleDelete(admin.id)}
                      title={confirmId === admin.id ? 'Подтвердить удаление' : 'Удалить'}
                    >
                      <Trash2 className="size-3.5" />
                      {confirmId === admin.id ? 'Удалить?' : ''}
                    </Button>
                    {confirmId === admin.id && (
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

      {showCreate && <CreateAdminDialog onClose={() => setShowCreate(false)} />}
    </div>
  )
}

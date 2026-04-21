import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useSignInMutation } from '@/shared/api/admin-api'
import { setCredentials } from '@/features/auth/auth-slice'
import { useAppDispatch } from '@/app/store'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/form-controls'
import { Card } from '@/shared/ui/surfaces'

export const SignInPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [signIn, { isLoading, error }] = useSignInMutation()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await signIn(form).unwrap()
      dispatch(setCredentials(result))
      navigate('/')
    } catch {
      // error shown below
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft">
            <Shield className="size-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Sobeslife Admin</h1>
          <p className="text-sm text-text-secondary">Войдите в панель администратора</p>
        </div>

        <Card>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              required
            />
            <Input
              label="Пароль"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              required
            />
            {error && (
              <p className="text-xs text-danger">Неверный email или пароль</p>
            )}
            <Button variant="primary" className="w-full" loading={isLoading} type="submit">
              Войти
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

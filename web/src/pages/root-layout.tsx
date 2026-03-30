import { LogOut } from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/app/store'
import { clearCredentials } from '@/features/auth/auth-slice'
import { ThemeToggle } from '@/shared/theme/theme-provider'
import { Button } from '@/shared/ui/button'

export const RootLayout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(clearCredentials())
    navigate('/sign-in')
  }

  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-border-subtle bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link to="/" className="text-lg font-semibold text-text-primary">
              Sobeslife
            </Link>
            <p className="text-sm text-text-tertiary">Тренажер для подготовки к собеседованиям</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="size-4" />
              Выйти
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}

import { LogOut, BarChart3, BookOpen, MessageSquare, User } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/app/store'
import { clearCredentials } from '@/features/auth/auth-slice'
import { ThemeToggle } from '@/shared/theme/theme-provider'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'

const navItems = [
  { to: '/', label: 'Тесты', icon: BookOpen, end: true },
  { to: '/interviews', label: 'Собеседования', icon: MessageSquare, end: false },
  { to: '/analytics', label: 'Аналитика', icon: BarChart3, end: false },
  { to: '/profile', label: 'Профиль', icon: User, end: false },
]

export const RootLayout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(clearCredentials())
    navigate('/sign-in')
  }

  return (
    <div className="flex min-h-screen bg-page">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border-subtle bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-border-subtle px-5">
          <Link to="/" className="text-lg font-semibold text-text-primary">
            Sobeslife
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border-subtle p-3 space-y-2">
          <ThemeToggle className="w-full" />
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="size-4" />
            Выйти
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border-subtle bg-surface/95 px-4 backdrop-blur lg:hidden">
          <Link to="/" className="text-lg font-semibold text-text-primary">
            Sobeslife
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border-subtle bg-surface/95 backdrop-blur lg:hidden">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition',
                  isActive ? 'text-accent' : 'text-text-tertiary',
                )
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-6">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
